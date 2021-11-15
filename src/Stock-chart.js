import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import "./StockChart.css";
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const Stock_chart = (props) => { 
  //StockSymbol, /*c_API_KEY,*/ c_callBack
  const StockSymbol = props.StockSymbol;
  const API_KEY = props.API_KEY;
  const callBack = props.callBack;
  const lastTime = props.lastTime;
  
  //console.log (`Stock-chart props ${StockSymbol}`);

  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [histString, setHistString] = useState ("");
  const [stocksChartHistory, setStocksChartHistory] = useState ({});
  const [privSymbol, setPrevSymbol] = useState ("");
  
  const isEmpty = (str) => {
    if (str == null)
        return true;
    if (str === "")
        return true;
    return false;
  }

  //console.log (JSON.stringify(`${StockSymbol}`));
  if (isEmpty (`${StockSymbol}`))
    alert ("symbol Udef");

  const fetchStock = () => {
    //const pointerToThis = this;

    const dat = stocksChartHistory[StockSymbol];
    const timeDiff = Date.now() - lastTime;

    if (dat != null)
      console.log ('found history ', timeDiff); // 10 minutes

    // if (dat == null || timeDiff < 1000 * 60 * 10) {

    const API_KEY_ = 'BC9UV9YUBWM3KQGF';
    const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  

    let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${StockSymbol}&outputsize=compact&apikey=${API_KEY_}`;


    let stockChartXValuesFunction = [];
    let stockChartYValuesFunction = [];
    
    fetch(API_Call)
        .then(
            function(response) {
                const respStr = JSON.stringify (response);
                if (respStr.indexOf (' status: 200, ok: true') !== -1)
                    console.log(response);
                return response.json();
            }
        )
        .then(
            (data) => {
                const dataStr = JSON.stringify(data);
                stocksChartHistory[StockSymbol] = data;
                const stocksHistoryStr = JSON.stringify(stocksChartHistory); 
                localStorage.setItem ('stocksChartHistory', stocksHistoryStr);
                //console.log ('history ' + stocksHistoryStr);

                // too frequent AlphaVantage api calls
                if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                  alert (`${dataStr} (${StockSymbol}) \n\n${API_Call} `);
                  return;
                }
                if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
                  alert (dataStr.substr(0, 35) + ` symbol(${StockSymbol}) \n\n${API_Call}`);
                  return;
                }
  
                //let periodTag = 'Time Series (Daily)';
                let periodTag = 'Weekly Adjusted Time Series';
                //let periodTag = 'Monthly Adjusted Time Series';
                for (var key in data[`${periodTag}`]) {
                    stockChartXValuesFunction.push(key);
                    stockChartYValuesFunction.push(data[`${periodTag}`][key]['1. open']);
                }

                setStockChartXValues (stockChartXValuesFunction);
                setStockChartYValues (stockChartYValuesFunction);


                // build histArray to be sent to table, and hist to be displayed with chart
                var histArray = [];
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
                setHistString (histStr);

                // send historical value back to caller
                callBack (histArray, StockSymbol);
                //console.log (histArray);
            }
        )
          // }
          // else console.log (' skip api for ', StockSymbol);
        }

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