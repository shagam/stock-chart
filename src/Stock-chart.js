import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import "./StockChart.css";
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const Stock_chart = (props) => { 
  const StockSymbol = props.StockSymbol;
  //const chartData = props.dat;
  var splitsFlag = props.splitsFlag;
  if (splitsFlag !== '')
    splitsFlag =  ' ' + splitsFlag + ' distort graph and table';

  //console.log (`Stock-chart props ${StockSymbol}`);
  

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
    return "Stock-chart: Missing chartSymbol"; //<error "(Stock-chart.js) symbol Udef"/>;
  }

 
  var graphColor;
  if (splitsFlag === '')
    graphColor = 'green';
  else
    graphColor = 'purple';

  return (
    <div>
      {/* <h4>  historical_gain({StockSymbol}): {histString}  </h4> */}
      <Plot
        data={[
          {
            x: props.stockChartXValues,
            y: props.stockChartYValues,
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