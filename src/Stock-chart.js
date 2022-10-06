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
  if (props.stockChartXValues === undefined || props.stockChartXValues.length === 0)
    return null;
 
  var graphColor;
  if (splitsFlag === '')
    graphColor = 'green';
  else
    graphColor = 'purple';

  const chartFlagChange = () => {setChartFlag (! chartFlag)}

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
        data={[
          {
            x: props.stockChartXValues,
            y: props.stockChartYValues,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: graphColor },
            },
        ]}
        layout={{ width: 720, height: 400, title: 'stock_symbol:   ' + StockSymbol + ' ' + splitsFlag,
      }}
      />

    }
      </div>
    </div>
  );
}


export default StockChart;