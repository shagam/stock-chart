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
    if (LOG_FLAG) {
      console.log ('arr org', arrIn)
      console.log ('arr clipped ', arrOut)
    }
    return arrOut;
  }



  function buildOneChart (stockChartXValues, stockChartYValues, symbol) {
    var yAfterLog = [];
 
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
    var highest = 0;
    var i_highest = -1;
    for (let i = 0; i < dat.length; i++) {
      if (highest < dat[i].y[0]) {
        highest = dat[i].y[0];
        i_highest = i;
      }
    }

    if (false) {// calc scale
      var scale = [];
      var len = [];
      var lenHigh = 0;
      var lenShort = 0;
      for (let i = 0; i < dat.length; i++) {
        scale[i] = (highest / dat[i].y[0]).toFixed(2);
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
          console.log (dat[i].name, 'start: ' + dat[i].y[0].toFixed(2))
      }
  }
    // console.log (dat)
    return dat;
  }

  var gainChart;
  const chartData_ = buildGainChartData();

  var title = 'symbol (gain)'
  if (chartData_.length > 1) {  // multiChart
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
    if (LOG_FLAG) {
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

        <div style={{color: 'black'}}  > 
          <div  style={{display:'flex', }} > &nbsp; <input  type="checkbox" checked={logarithmic}  onChange={() => setLogarithmic (! logarithmic)} /> &nbsp; Logarithemic &nbsp;&nbsp; &nbsp; &nbsp; </div>
          <div> <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={chartDate} onChange={(date) => setChartDate(date)} />  </div>

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