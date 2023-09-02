import React, {useState} from 'react';
import Plot from 'react-plotly.js';
import {format} from "date-fns"
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import "./StockChart.css";

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './table/Date';
// import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'

const StockChart = (props) => { 
  const [chartFlag, setChartFlag] = useState(false); // hide / show page
  const [logarithmic, setLogarithmic] = useState(false);
 
  const [chartDate, setChartDate] = useState (new Date(2007, 9, 15));

  const LOG_FLAG = props.logFlags.includes('chart');

   const chartYear = chartDate.getFullYear();
   const chartMon = chartDate.getMonth() + 1; // [1..12]
   const chartDay = chartDate.getDate(); // [1..31]
   const chartDateArr = [chartYear,chartMon, chartDay]

  // props.gainMap
  // props.selectedFlatRows

  const [oldestPrice, setOldestPrice] = useState()

  if (props.stockChartYValues === undefined || props.stockChartYValues.length === 0)
    return null;

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


  // clip arr according to date
  function clipOldEntries (arrIn, chartIndex) {

    if (chartIndex < 0) {
      console.log ('clipFail,', chartDateArr, arrIn)
      return arrIn;
    }

    var arrOut = [];
    if (arrIn.length <= chartIndex)
      return arrIn;

    for (let i = 0; i < chartIndex; i++)
      arrOut[i] = arrIn[i];
    if (LOG_FLAG)
      console.log ('arrClipped ', arrIn, arrOut)
    return arrOut;
  }




  // calc logarith if required
  var yAfterLog = [];
  for (let i = 0; i < props.stockChartYValues.length; i++){
    if (logarithmic)
      yAfterLog[i] = Math.log (props.stockChartYValues[i])
    else
      yAfterLog[i] = props.stockChartYValues[i]
  }

 
  // clip older part of array
  var xAfterClip = [];
  var yAfterClip = [];
 
  const chartIndex = searchDateInArray (props.stockChartXValues, chartDateArr, props.StockSymbol, props.logFlags);
  if (chartIndex > 0) {
    xAfterClip = clipOldEntries(props.stockChartXValues, chartIndex); 
    yAfterClip = clipOldEntries(yAfterLog, chartIndex); 
  }

 // chart of a single ticker
 const singleChart = [
  {
    x: xAfterClip,
    y: yAfterClip,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: 'green' },
    name: props.StockSymbol
  },
]


  function buildGainChartData () {

    var formattedDate = format(chartDate, "yyyy-MM-dd");
    var dateArr = formattedDate.split('-');
    // var dateBackSplit = monthsBack(dateArr, 60);
      // if (! gainMap)
      //   return;
    const dat = []; // build ticker gain array
    props.selectedFlatRows.forEach ((sel) => {

      const symm = sel.values.symbol;

      // normalize y to 100
      const gainMapSym = props.gainMap[symm];

      // const chartIndex = searchDateInArray (gainMapSym.x, dateArr, symm, props.logFlags)
    
      // normalize y to 100
      if (gainMapSym) { //map of more than one symbol
        var y = [];

        //find min max
        var max = gainMapSym.y[0];
        var min = gainMapSym.y[0];
        for (let i = 0; i < gainMapSym.y.length; i++) {
          if (max < gainMapSym.y[i])
            max = gainMapSym.y[i]
          if (min > gainMapSym.y[i])
            min = gainMapSym.y[i]
        } 

        // newest val / old value
        const gain = gainMapSym.y[0] / gainMapSym.y[gainMapSym.y.length - 1]

        for (let i = 0; i < gainMapSym.y.length; i++) {
          if (logarithmic)
            y[i] =  Math.log (gainMapSym.y[i])
          else
            y[i] =  gainMapSym.y[i];
        }

        // console.log (symm, min.toFixed(2), max.toFixed(2))
        dat.push ({
          'x': gainMapSym.x,
          'y': y,
          type: 'scatter',
          'name': symm + ' (' + gain.toFixed(2) + ')',
          'mode': 'lines+markers',
          // 'marker': { color: 'red' },
        })
      }
    })
    return dat;
  }

  var gainChart;
  const chartData_ = buildGainChartData();

  var title = 'symbol (gain)'
  if (chartData_.length > 1) {
    // setChartData (props.gainChart)
    gainChart = chartData_// props.gainChart;

    if (logarithmic)
      title += ' [logarithmic]';

    if (LOG_FLAG)
      console.log (props.chartDate)
  }
  else {
    gainChart = singleChart;
    const max = singleChart[0].y[0];
    const min = singleChart[0].y[singleChart[0].y.length - 1] 
    const minMax = max / min;
    title = props.StockSymbol + ' (gain ' + minMax.toFixed(2) + ') ';
    if (LOG_FLAG)
      console.log(props.stockChartXValues, props.stockChartYValues)
  }


  return (
    <div>
      <div>
          <input
            type="checkbox" checked={chartFlag}
            onChange={ chartFlagChange}
          /> chart
      </div>

      {chartFlag && <div>

        <div style={{color: 'black'}}  > 
          <div  style={{display:'flex', }} > &nbsp; <input  type="checkbox" checked={logarithmic}  onChange={() => setLogarithmic (! logarithmic)} /> &nbsp; Logarithemic &nbsp;&nbsp; &nbsp; &nbsp; </div>
          <div> <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={chartDate} onChange={(date) => setChartDate(date)} />  </div>

        </div>

        <div id = 'chart_id'>
          {props.isMobile && <Plot  data={gainChart} layout={{ width: 800, height: 500, title: title,  }}
             config={{'modeBarButtonsToRemove': ['zoom','zoomOut','zoomIn','pan']}} />}
          {! props.isMobile && <Plot  data={gainChart} layout={{ width: 800, height: 500, title: title,  }}
             config={{'modeBarButtonsToRemove': []}} />}
        </div>

      </div>}
    </div>
  );
}


export default StockChart;