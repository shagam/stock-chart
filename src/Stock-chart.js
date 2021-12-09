import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import "./StockChart.css";
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const Stock_chart = (props) => { 
  //StockSymbol, /*c_API_KEY,*/ c_callBack
  const StockSymbol = props.StockSymbol;
  // const API_KEY = props.API_KEY;
  //const callBack = props.callBack;
  const lastTime = props.lastTime;
  const chartData = props.dat;
  var splitsFlag = props.splitsFlag;
  if (splitsFlag !== '')
    splitsFlag =  ' ' + splitsFlag + ' distort graph and table';

  //console.log (`Stock-chart props ${StockSymbol}`);

  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  //const [histString, setHistString] = useState ("");
  const [stocksChartHistory, setStocksChartHistory] = useState ({});
  const [privSymbol, setPrevSymbol] = useState ("");
  
  if (chartData === '' || chartData == null) {
    alert (`chartData empty (${chartData}.stringify())`);
    return "empty cartData";
  }

  const isEmpty = (str) => {
    if (str == null)
        return true;
    if (str === "")
        return true;
    return false;
  }

  //console.log (JSON.stringify(`${StockSymbol}`));
  if (isEmpty (`${StockSymbol}`)) {
    console.log ("(Stock-chart.js) symbol Udef");
    return "err"; //<error "(Stock-chart.js) symbol Udef"/>;
  }
  const fetchStock = () => {
    //const pointerToThis = this;

    let stockChartXValuesFunction = [];
    let stockChartYValuesFunction = [];

    const dat = stocksChartHistory[StockSymbol];
    const timeDiff = Date.now() - lastTime;

    if (dat != null)
      console.log ('found history ', timeDiff); // 10 minutes

    // if (dat == null || timeDiff < 1000 * 60 * 10) {
   
                 //let periodTag = 'Time Series (Daily)';
                let periodTag = 'Weekly Adjusted Time Series';
                //let periodTag = 'Monthly Adjusted Time Series';
                let i = 0;
                var splits = "";
                var splitArray = [];
                for (var key in chartData[`${periodTag}`]) {
                    stockChartXValuesFunction.push(key);
                    stockChartYValuesFunction.push(chartData[`${periodTag}`][key]['1. open']);
                    if (i > 0) {
                      let ratio = stockChartYValuesFunction[i] / stockChartYValuesFunction[i-1];
                      if (ratio > 1.8) {
                        ratio = ratio.toFixed(2);
                        splits += `date=${key}  ratio=${ratio} week=${i}, `;
                        const  split = {ratio1: ratio, date: key, week: i};
                        splitArray.push(split); 
                      }                        
                    }
                    i++;
                }
                // if (splitArray.length > 0)
                //   console.log (splitArray); 

                setStockChartXValues (stockChartXValuesFunction);
                setStockChartYValues (stockChartYValuesFunction);

             }
        

        if (StockSymbol !== privSymbol) {
          console.log ('priv chart', StockSymbol, privSymbol);
          setPrevSymbol (StockSymbol);
          //setTimeout (fetchStock(), 0);
          fetchStock();
        }
        var graphColor;
        if (splitsFlag == '')
          graphColor = 'green';
        else
          graphColor = 'red';

        return (
          <div>
            {/* <h4>  historical_gain({StockSymbol}): {histString}  </h4> */}
            <Plot
              data={[
                {
                  x: stockChartXValues,
                  y: stockChartYValues,
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: graphColor },
                 },

              ]}
              layout={{ width: 720, height: 400, title: 'stock_symbol:   ' + StockSymbol + splitsFlag,
            }}
            />
          </div>
        );
}


export default Stock_chart;