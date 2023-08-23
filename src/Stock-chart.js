import React, {useState} from 'react';
import Plot from 'react-plotly.js';
import "./StockChart.css";
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const StockChart = (props) => { 
  const [chartFlag, setChartFlag] = useState(false);
  const LOG_FLAG = props.logFlags.includes('chart');
  const StockSymbol = props.StockSymbol;
  //const chartData = props.dat;
  var splitsFlag = props.splitsFlag;


  const [oldestPrice, setOldestPrice] = useState()

  if (props.stockChartXValues === undefined || props.stockChartXValues.length === 0)
    return null;

  // if (! props.stockChartYValues || props.stockChartYValues[props.stockChartYValues.length - 1] === oldestPrice)
  //   return null;
  // else
  //   setOldestPrice (props.stockChartYValues[props.stockChartYValues.length - 1])

  if (LOG_FLAG)
    console.log(props.stockChartXValues, props.stockChartYValues)

  const isEmpty = (str) => {
    if (str == null)
        return true;
    if (str === "")
        return true;
    return false;
  }

  //console.log (JSON.stringify(`${StockSymbol}`));
  if (isEmpty (`${StockSymbol}`)) {
    if (LOG_FLAG)
    console.log ("(Stock-chart.js) symbol Udef");
    return null; //"Stock-chart: Missing chartSymbol"; //<error "(Stock-chart.js) symbol Udef"/>;
  }
  
  const chartFlagChange = () => {setChartFlag (! chartFlag)}

  const singleChart = [
    {
      x: props.stockChartXValues,
      y: props.stockChartYValues,
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'green' },
      name: props.StockSymbol
    },
  ]

  var title = props.gainChart.length > 1 ? 'normalized graph: symbol (max/min)' : props.StockSymbol
  var gainChart = props.gainChart.length > 1 ? props.gainChart : singleChart;
  // gainChart = singleChart;

  // if (props.gainChart.length > 1)
  // console.log (props.gainChart )

  return (
    <div>
        <div>
          <input
            type="checkbox" checked={chartFlag}
            onChange={ chartFlagChange}
          /> chart
    </div>

      {/* <h4>  historical_gain({StockSymbol}): {histString}  </h4> */}
      <div id = 'chart_id'>
      {chartFlag && <Plot
        data={gainChart}
        layout={{ width: 1000, height: 600, title: title }}
      />

    }
      </div>
    </div>
  );
}


export default StockChart;