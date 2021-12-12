import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import "./StockChart.css";
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const Stock_chart = (props) => { 
  const StockSymbol = props.StockSymbol;
  const chartData = props.dat;
  var splitsFlag = props.splitsFlag;
  if (splitsFlag !== '')
    splitsFlag =  ' ' + splitsFlag + ' distort graph and table';

  //console.log (`Stock-chart props ${StockSymbol}`);
  
  console.log ('chartData', chartData);
  if (chartData === '' || chartData == null) {
    console.log (`chartData empty (${chartData})`);
    return "chartData empty"
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

  let stockChartXValues = [];
  let stockChartYValues = [];

  const fetchStock = () => {
      //let periodTag = 'Time Series (Daily)';
    let periodTag = 'Weekly Adjusted Time Series';
    //let periodTag = 'Monthly Adjusted Time Series';
    let i = 0;
    var splitArray = [];
    for (var key in chartData[`${periodTag}`]) {
        stockChartXValues.push(key);
        stockChartYValues.push(chartData[`${periodTag}`][key]['1. open']);
        if (i > 0) {
          let ratio = stockChartYValues[i] / stockChartYValues[i-1];
          if (ratio > 1.8) {
            ratio = ratio.toFixed(2);
            //splits += `date=${key}  ratio=${ratio} week=${i}, `;
            const  split = {ratio1: ratio, date: key, week: i};
            splitArray.push(split); 
          }                        
        }
        i++;
    }
  }      

  fetchStock();

  var graphColor;
  if (splitsFlag === '')
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