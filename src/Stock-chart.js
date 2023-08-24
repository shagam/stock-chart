import React, {useState} from 'react';
import Plot from 'react-plotly.js';
import "./StockChart.css";
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const StockChart = (props) => { 
  const [chartFlag, setChartFlag] = useState(false); // hide / show page
  const LOG_FLAG = props.logFlags.includes('chart');


  // const [chartData, setChartData] = useState("");
  // const [gainChart, setGainChart] = useState ([]);

  //const chartData = props.dat;

  // props.gainMap
  // props.selectedFlatRows

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
  if (isEmpty (`${props.StockSymbol}`)) {
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

  function buildGainCharData () {
    const dat = [];
    props.selectedFlatRows.forEach ((sel) => {

      const symm = sel.values.symbol;

      // normalize y to 100
      const gainMapSym = props.gainMap[symm];
      if (props.gainMap[symm]) {
        var y = [];
        var max = gainMapSym.y[0];
        var min = gainMapSym.y[0];
        for (let i = 0; i < gainMapSym.y.length; i++) {
          if (max < gainMapSym.y[i])
            max = gainMapSym.y[i]
          if (min > gainMapSym.y[i])
            min = gainMapSym.y[i]
        } 
        for (let i = 0; i < gainMapSym.y.length; i++) {
          // y[i] = gainMap[symm].y[i]
          y[i] =  Math.log (gainMapSym.y[i]  * 10000 / max)
        }

        // console.log (symm, min.toFixed(2), max.toFixed(2))
        dat.push ({
          'x': gainMapSym.x,
          'y': y,
          type: 'scatter',
          'name': symm + ' (' + (max/min).toFixed(2) + ')',
          'mode': 'lines+markers',
          // 'marker': { color: 'red' },
        })
      }
    })
    return dat;
  }

  var gainChart;
  const chartData_ = buildGainCharData();
  // console.log (chartData_)

  var title;
  if (chartData_.length > 1) {
    // setChartData (props.gainChart)
    gainChart = chartData_// props.gainChart;
    title = 'normalized log graph: symbol (max/min)';
  }
  else {
    // setChartData (singleChart)
    gainChart = singleChart;
    title = props.StockSymbol
  }

  // if (chartData.length > 1)
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