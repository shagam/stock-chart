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
  const [scaleFlag, setScaleFlag] = useState(false);

  const [chartDate, setChartDate] = useState (new Date(2002, 9, 15));

  const LOG_FLAG = props.logFlags.includes('chart');
  const LOG_CHART_1 = props.logFlags.includes('chart1');

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

  function minMax (arr, symbol) {
    var min = 1000000;
    var max = 0;
    var minIndex = -1;
    var maxIndex = -1;

    for (let i = 0; i < arr.length; i++) {
      const val = Number (arr[i])
      if (min > val) {
        min = val;
        minIndex = i;
      }
      if (max < val) {
        max = val
        maxIndex = i;
      }   
    }
    const  results = {
      sym: symbol,
      len: arr.length,
      min_: min,
      max_: max,
      minIndex_: minIndex,
      maxIndex_: maxIndex,
      first: arr[0],
      last: arr[arr.length - 1]
    }
    return results;
  }



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
    // if (LOG_FLAG) {
    //   console.log ('arr org', arrIn)
    //   console.log ('arr clipped ', arrOut)
    // }
    return arrOut;
  }



  function buildOneChart (stockChartXValues, stockChartYValues, symbol) {
    var yAfterLog = [];

    var res = minMax(stockChartYValues, symbol)
    if (LOG_CHART_1)
      console.log ('buildOne minMax', res)
 
     // clip older part of array
    var xAfterClip = [];
    var yAfterClip = [];
  
    const chartIndex = searchDateInArray (stockChartXValues, chartDateArr, props.StockSymbol, props.logFlags);
    if (chartIndex > 0) {
      xAfterClip = clipOldEntries(stockChartXValues, chartIndex); 
      yAfterClip = clipOldEntries(stockChartYValues, chartIndex); 
    }
    else { // short history
      xAfterClip = stockChartXValues; 
      yAfterClip = stockChartYValues; 
    }

    // calc log
    for (let i = 0; i < yAfterClip.length; i++){
      if (logarithmic)
        yAfterLog[i] = Math.log (yAfterClip[i])
      else
        yAfterLog[i] = yAfterClip[i]
    }

    const newest = yAfterClip[0];
    const oldest = yAfterClip[yAfterClip.length - 1] 
    const weeksDiff = yAfterClip.length
    const gainSingle = newest / oldest;
    const yearlyGain_ = yearlyGain (gainSingle, weeksDiff);
    title = symbol + ' (' + gainSingle.toFixed(2) + ', yearly: ' + yearlyGain_ + ') ';


    // chart of a single ticker
    const singleChart =
      {
        x: xAfterClip,
        y: yAfterLog,
        type: 'scatter',
        mode: 'lines+markers',
        //    marker: { color: 'green' },
        name: title
      }
  
    return singleChart;
  }
  
  const singleChart = [buildOneChart (props.stockChartXValues, props.stockChartYValues, props.StockSymbol)];

 
  function yearlyGain (gain, weeksDiff) {
    if (! props.weekly)
      return -1
    // const weeksDiff = indexOldest - indexNewest
    // const gain = Number (stockChartYValues[indexNewest] / stockChartYValues[indexOldest]).toFixed (3)
    const yearsDiff = Number (weeksDiff/52).toFixed (2)
    const yearlyGain = Number (gain ** (1 / yearsDiff)).toFixed(3)
    return yearlyGain;
  }

    // build multiChart
  function buildGainChartData () {

    var formattedDate = format(chartDate, "yyyy-MM-dd");
    var dateArr = formattedDate.split('-');
    // var dateBackSplit = monthsBack(dateArr, 60);
      // if (! gainMap)
      //   return;
    const dat = []; // build ticker gain array
    props.selectedFlatRows.forEach ((sel) => {

      const symm = sel.values.symbol;
      const gainMapSym = props.gainMap[symm];

      var chart;
      if (gainMapSym) {
          chart = buildOneChart (props.gainMap[symm].x, props.gainMap[symm].y, symm);
          dat.push (chart)
      }
    })

    // find highest
    
    var first = [];
    var last = [];
    var firstHigh = 0;
    var lastHigh = 0;
    for (let i = 0; i < dat.length; i++) {
      first [i] = dat[i].y[0];
      last[i] = dat[i].y[dat[i].y.length - 1]
      if (first[i] > firstHigh)
        firstHigh = first[i];
      if (last[i] > lastHigh)
        lastHigh = last[i];
      last[i] = dat[i].y[dat[i].length - 1];

    }

    if (scaleFlag) {// calc scale
      var scale = [];
      var len = [];
      var lenHigh = 0;
      var lenShort = 0;

      for (let i = 0; i < dat.length; i++) {
        scale[i] = (lastHigh / dat[i].y[dat[i].y.length - 1]);
        len[i] = dat[i].y.length;
      }
      if (LOG_FLAG)
        console.log (scale, '  ', len)

      // apply scale
      for (let i = 0; i < dat.length; i++) {
        if (dat[i].y.length < lenHigh)
          continue;
        for (let j = 0; j < dat[i].y.length; j++)
          dat[i].y[j] *= scale[i];
        if (LOG_FLAG)
          console.log (dat[i].name, 'start: ' + dat[i].y[0])
      }

      // FIND MIN MAX AFTER SCALE

      for (let i = 0; i < dat.length; i++) { // loop on symbols
        const res = minMax (dat[i].y, dat[i].name)
        console.log (dat[i].name, 'end:', res)
      }
      // if (LOG_FLAG)
      // console.log (dat)
    }
    // console.log (dat)
    return dat;
  }

  var gainChart;
  var chartData_
  // if (props.gainMap.length > 0)
    chartData_ = buildGainChartData();

  var title = 'symbol (gain)'
  if (chartData_ && chartData_.length > 1) {  // multiChart
    // setChartData (props.gainChart)
    gainChart = chartData_// props.gainChart;
    if (LOG_FLAG)
      console.log (props.chartDate)
  }
  else { // singleChart
    gainChart = singleChart;
    title = singleChart[0].name;
    singleChart[0].marker = { 'color': 'green' }
    // console.log (title)
    if (LOG_CHART_1) {
      console.log (props.stockChartXValues)
      console.log (props.stockChartYValues)
    }
  }
  if (logarithmic)  
    title += ' [logarithmic]';



  return (
    <div>
      <div>
          <input
            type="checkbox" checked={chartFlag}
            onChange={ chartFlagChange}
          /> chart
      </div>

      {chartFlag && <div>

        <div style={{color: 'black', display:'flex',}}  > 
          <div style={{display:'flex',}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={chartDate} onChange={(date) => setChartDate(date)} /> &nbsp; &nbsp; </div>
          <div>  <input  type="checkbox" checked={logarithmic}  onChange={() => setLogarithmic (! logarithmic)} />  Logarithemic &nbsp;&nbsp; &nbsp; &nbsp; </div>
          <div>  <input  type="checkbox" checked={scaleFlag}  onChange={() => setScaleFlag (! scaleFlag)} /> scale &nbsp;&nbsp; &nbsp; &nbsp; </div>    
        </div>

        <div id = 'chart_id'>
        {/* yaxis={'title': 'x-axis','fixedrange':True, 'autorange': false},
       yaxis={'title': 'y-axis','fixedrange':True}) */}
          {props.isMobile && <Plot  data={gainChart} 
            layout={{ width: 800, height: 500, title: title, yaxis: {fixedrange: false}  }}
             config={{'modeBarButtonsToRemove': ['zoom','zoomOut','zoomIn','pan']}} />}
          {! props.isMobile && <Plot  data={gainChart} 
            layout={{ width: 1000, height: 600, title: title, yaxis: {autorange: true, }}}
             config={{'modeBarButtonsToRemove': []}} />}
        </div>

      </div>}
    </div>
  );
}


export default StockChart;