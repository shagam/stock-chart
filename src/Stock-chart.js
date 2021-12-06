import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import "./StockChart.css";
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const Stock_chart = (props) => { 
  //StockSymbol, /*c_API_KEY,*/ c_callBack
  const StockSymbol = props.StockSymbol;
  // const API_KEY = props.API_KEY;
  const callBack = props.callBack;
  const lastTime = props.lastTime;
  const chartData = props.dat;

  //console.log (`Stock-chart props ${StockSymbol}`);

  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [histString, setHistString] = useState ("");
  const [stocksChartHistory, setStocksChartHistory] = useState ({});
  const [privSymbol, setPrevSymbol] = useState ("");
  

  if (chartData === '' || chartData == null)
    return null;

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

                // build histArray to be sent to table, and hist to be displayed with chart
                var histArray = [];
                //histArray.push (splits);

                var histStr = "";
                var num;
                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[1];
                num = num.toFixed(2);
                histStr += " 1w (" + num + ")  ";
                histArray.push (num);
                
                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[2];
                num = num.toFixed(2);
                histStr += " 2w (" + num + ")  ";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[4];
                num = num.toFixed(2);
                histStr += " m (" + num + ")  ";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[13];
                num = num.toFixed(2);
                histStr += " 3m (" + num + ")  ";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[26];
                num = num.toFixed(2);
                histStr += " 6m (" + num + ")  ";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[52];
                num = num.toFixed(2);
                if (num !== 'NaN')                    
                histStr += " y (" + num + ")  ";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[104];
                num = num.toFixed(2);
                if (num !== 'NaN')
                histStr += " 2y (" + num + ")  ";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[260];
                num = num.toFixed(2);
                if (num !== 'NaN')                    
                histStr += " 5y (" + num + ")  ";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[520];
                num = num.toFixed(2);
                if (num !== 'NaN')
                histStr += " 10y (" + num + ")";
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[1040];
                num = num.toFixed(2);
                if (num !== 'NaN')
                histStr += " 20y (" + num + ")";
                histArray.push (num);

                //setHistString (histStr);

                // send historical value back to caller
                callBack (histArray, StockSymbol, splits);
                //console.log (histArray);
            }
        
          // }
          // else console.log (' skip api for ', StockSymbol);
        

        if (StockSymbol !== privSymbol) {
          console.log ('priv chart', StockSymbol, privSymbol);
          setPrevSymbol (StockSymbol);
          //setTimeout (fetchStock(), 0);
          fetchStock();
        }
      
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
                  marker: { color: 'red' },
                 },

              ]}
              layout={{ width: 720, height: 400, title: 'stock_symbol:   ' + StockSymbol }}
            />
          </div>
        );
}


export default Stock_chart;