import React, {useState} from 'react';
import Plot from 'react-plotly.js';

const Stock_chart = (StockSymbol, API_KEY, callBack) => { 

//   const StockSymbol = props.StockSymbol;
//   const callBack = props.callBack;
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [histStr, setHistStr] = useState("");

  const isEmpty = (str) => {
    if (str == null)
        return true;
    if (str === "")
        return true;
    return false;
  }

  console.log (JSON.stringify(`${StockSymbol}`));
  if (isEmpty (`${StockSymbol}`))
    alert ("symbol Udef");


  //fetchStock() {
    //const pointerToThis = this;

    const API_KEY_ = 'BC9UV9YUBWM3KQGF';


    const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  


    let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${StockSymbol}&outputsize=compact&apikey=${API_KEY_}`;

    if (isEmpty (StockSymbol)) {
        console.log (`undef symbol  (${StockSymbol})  `);
        return null;            
    }

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
                //stocksChartHistory[StockSymbol] = data;
                // const stocksHistoryStr = JSON.stringify(this.state.stocksChartHistory); 
                // localStorage.setItem ('stocksChartHistory', stocksHistoryStr);
                // too frequent AlphaVantage api calls
                if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                    alert (`${dataStr} (${StockSymbol}) ${API_Call} `);
                    return;
                } 
                console.log (dataStr.substr(0, 230), {API_Call});
  
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
                setHistStr ("");
                var num;
                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[1];
                num = num.toFixed(2);
                setHistStr (histStr + " 1w (" + num + ")  ");
                histArray.push (num);
                
                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[2];
                num = num.toFixed(2);
                setHistStr (histStr + " 2w (" + num + ")  ");
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[4];
                num = num.toFixed(2);
                setHistStr (histStr + " m (" + num + ")  ");
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[13];
                num = num.toFixed(2);
                setHistStr (histStr + " 3m (" + num + ")  ");
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[26];
                num = num.toFixed(2);
                setHistStr (histStr + " 6m (" + num + ")  ");
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[52];
                num = num.toFixed(2);
                if (num !== 'NaN')                    
                setHistStr (histStr + " y (" + num + ")  ");
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[104];
                num = num.toFixed(2);
                if (num !== 'NaN')
                setHistStr (histStr + " 2y (" + num + ")  ");
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[260];
                num = num.toFixed(2);
                if (num !== 'NaN')                    
                setHistStr (histStr + " 5y (" + num + ")  ");
                histArray.push (num);

                num = stockChartYValuesFunction[0] / stockChartYValuesFunction[520];
                num = num.toFixed(2);
                if (num !== 'NaN')
                setHistStr (histStr + " 10y (" + num + ")");
                histArray.push (num);

                // send historical value back to caller
                //callBack (histArray, StockSymbol);
                //console.log (histArray);
            }
        )


        return (
          <div>
            <h4>  historical_gain({StockSymbol}): {histStr}  </h4>
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