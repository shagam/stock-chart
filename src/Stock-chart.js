import React, {useState, Suspense, lazy} from 'react';

import {format} from "date-fns"
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import "./StockChart.css";

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './table/Date';
import { keys } from '@material-ui/core/styles/createBreakpoints';

import Plot from 'react-plotly.js';
// const Plot = lazy(() => import('react-plotly.js').then((module) => ({default: module.Plot})))


const StockChart = (props) => { 
  const [chartFlag, setChartFlag] = useState(false); // hide / show page
  const [multi, setMulti] = useState(true);
  const [logarithmic, setLogarithmic] = useState(false);
  const [scaleFlag, setScaleFlag] = useState(props.gainMap['bubbleLine']);

  const [chartDate, setChartDate] = useState (new Date(2002, 9, 15));
  const [endDate, setEndDate] = useState (new Date())
  const [months, setMonths] = useState();

  const LOG_FLAG = props.logFlags && props.logFlags.includes('chart');
  const LOG_CHART_1 = props.logFlags && props.logFlags.includes('chart1');

   const chartYear = chartDate.getFullYear();
   const chartMon = chartDate.getMonth() + 1; // [1..12]
   const chartDay = chartDate.getDate(); // [1..31]
   const chartDateArr = [chartYear,chartMon, chartDay]

   const endYear = endDate.getFullYear();
   const endMon = endDate.getMonth() + 1; // [1..12]
   const endDay = endDate.getDate(); // [1..31]
   const endDateArr = [endYear,endMon, endDay]

  // props.gainMap

  const [oldestPrice, setOldestPrice] = useState()

  if (props.stockChartYValues === undefined || props.stockChartYValues.length === 0)
    return null;

  if (props.bubbleLine && Object.keys (props.gainMap).length === 1 && ! props.gainMap['bubbleLine']) {
    // console.log (props.bubbleLine, props.gainMap)
    props.gainMap['bubbleLine'] = props.bubbleLine;
  }
  if (Object.keys (props.gainMap).length > 2) {
    delete props.gainMap.bubbleLine
  }

  if(LOG_FLAG)
    console.log (Object.keys (props.gainMap))

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

  // find min max of an array of numbers
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
  function clipOldEntries (arrIn, chartIndex, symbol) {
    if (chartIndex < 0) {
      console.log (symbol, 'clipFail,', chartDateArr)
      return arrIn;
    }

    var arrOut = [];
    if (arrIn.length <= chartIndex)
      return arrIn;

    for (let i = 0; i < chartIndex; i++)
      arrOut[i] = arrIn[i];
    return arrOut;
  }

  // clip newest entries
  function clipTrailingEntries (arrIn, endIndex, symbol) {
    if (endIndex < 0 || endIndex >= arrIn.length) {
      console.log (symbol, 'ClipTrailFail,', endDateArr)
      return arrIn;
    }
    var arrOut = [];
    if (arrIn.length <= endIndex)
      return arrIn;
    for (let i = 0; i < arrIn.length - endIndex; i++)
      arrOut[i] = arrIn[i + endIndex];
    return arrOut;
  }

  var oldestValArray = {};
  function buildOneChart (stockChartXValues, stockChartYValues, symbol) {
    var yAfterLog = [];

    var res = minMax(stockChartYValues, symbol)
    if (LOG_CHART_1)
      console.log ('buildOne minMax', res)
 
     // clip older part of array
    var xAfterClip_ = [];
    var yAfterClip_ = [];
    var xAfterClip = [];
    var yAfterClip = [];

    const chartIndex = searchDateInArray (stockChartXValues, chartDateArr, props.StockSymbol, props.logFlags);
    if (chartIndex > 0) {
      xAfterClip_ = clipOldEntries(stockChartXValues, chartIndex, symbol); 
      yAfterClip_ = clipOldEntries(stockChartYValues, chartIndex, symbol);
    }
    else { // short history
      xAfterClip_ = stockChartXValues; 
      yAfterClip_ = stockChartYValues; 
    }
    const endIndex = searchDateInArray (stockChartXValues, endDateArr, props.StockSymbol, props.logFlags);
    if (endIndex > 0) {
      xAfterClip = clipTrailingEntries(xAfterClip_, endIndex, symbol); 
      yAfterClip = clipTrailingEntries(yAfterClip_, endIndex, symbol);      
    }
    else {
      xAfterClip = xAfterClip_; 
      yAfterClip = yAfterClip_; 
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
    oldestValArray[symbol] = oldest;

    const weeksDiff = yAfterClip.length
    const gainSingle = newest / oldest;
    const yearlyGain_ = yearlyGain (gainSingle, weeksDiff);
    title = symbol + ' (' + gainSingle.toFixed(2) + ', yearly: ' + yearlyGain_ + ') ';
    const titleSingle = symbol + ' (gain: ' + gainSingle.toFixed(2) + ', yearly: ' + yearlyGain_ + ') ';

    // chart of a single ticker
    const singleChart =
      {
        name: title,
        nameSingle: titleSingle,
        x: xAfterClip,
        y: yAfterLog,
        type: 'scatter',
        mode: 'lines+markers',
        //    marker: { color: 'green' },
      }
  
    return singleChart;
  }
  
  const singleChart = [buildOneChart (props.stockChartXValues, props.stockChartYValues, props.StockSymbol)];

 
  function yearlyGain (gain, weeksDiff) {
    if (! props.weekly)
      return -1
    const yearsDiff = Number (weeksDiff/52).toFixed (2)
    const yearlyGain = Number (gain ** (1 / yearsDiff)).toFixed(3)
    return yearlyGain;
  }

    // build multiChart
  function buildGainChartMutiple () {

    var formattedDate = format(chartDate, "yyyy-MM-dd");
    var dateArr = formattedDate.split('-');
      // if (! gainMap)
      //   return;
    const dat = []; // build ticker gain array

    for (var symm in props.gainMap) {
      const gainMapSym = props.gainMap[symm];
      if (! gainMapSym)
        continue;
        const chart = buildOneChart (gainMapSym.x, gainMapSym.y, symm);
        dat.push (chart)
    }

    // find highest
 
    var last = [];
    var lastHigh = 0;
    for (let i = 0; i < dat.length; i++) { // loop on all stocks
      last[i] = dat[i].y[dat[i].y.length - 1]  // find last index
      if (last[i] > lastHigh) {
        lastHigh = last[i];
      }
    }

    // values below 1 prevents scale and logarithmic
    const keys = Object.keys (oldestValArray)
    var allAboveOne = true;
    for (let i = 0; i < keys.length; i++) {
      if (oldestValArray[keys[i]] < 1) {
        allAboveOne = false;
      }
    }

    if (! allAboveOne) {
      if (logarithmic && scaleFlag) {
        setScaleFlag (false) //
        console.log ('A value below one, cannot use logarithmic && scale, so scale turned off ')
        props.errorAdd (['A value below one, cannot use logarithmic && scale, so scale turned off '])
        // setLogarithmic (false)
      }
    }

    if (scaleFlag) {// calc scale
      var scale = [];
      var len = [];
      var lenHigh = 0;
      // var lenShort = 0;

      for (let i = 0; i < dat.length; i++) {
        scale[i] = (lastHigh / dat[i].y[dat[i].y.length - 1]).toFixed(5);
        len[i] = dat[i].y.length;
        if (scale[i] < 0 && LOG_FLAG) {
          console.log (scale)
        }
      }
      if (LOG_FLAG)
        console.log ('scaleArray: ', scale, '  ', len)

      // apply scale, connect oldestedges
      if (LOG_FLAG)
        console.log ('before scale: ', dat)
      for (let i = 0; i < dat.length; i++) {
        if (dat[i].y.length < lenHigh)
          continue;
        for (let j = 0; j < dat[i].y.length; j++)
          dat[i].y[j] *= scale[i];
        // if (LOG_FLAG)
        //   console.log ('chart headers: ', dat[i].name, 'start: ' + dat[i].y[0].toFixed(3))
      }
      if (LOG_FLAG)
        console.log ('after scale: ', dat)
    }
    // if (LOG_FLAG)
    //  console.log (dat)
    return dat;
  }

  var gainChart;
  var title
  if (multi && Object.keys(props.gainMap).length > 1) {
    gainChart = buildGainChartMutiple();
    title = 'symbol (gain, yearlyGain) count=' + gainChart.length
    if (LOG_FLAG)
      console.log (props.chartDate)
  }
  else { // singleChart
    gainChart = singleChart;
    title = singleChart[0].nameSingle;
    if (LOG_CHART_1) {
      console.log ('singleChart: ', {title: title,  x: props.stockChartXValues, y: props.stockChartYValues})
    }
  }
  if (logarithmic)  
    title += ' [logarithmic]';    


  function setChartDate_ (d) {
    setMonths(0); // turn off radio buttons
    setChartDate(d)
  }

  const onOptionChange = e => {
    const mon = e.target.value;
    setMonths(mon)

    var date = new Date();
    var formattedDate = format(date, "yyyy-MM-dd");
    var dateArray = formattedDate.split('-');
    const dateArray1 = monthsBack (dateArray, Number(mon));
    // setMonthsBack (months);
    const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
    setChartDate (new Date(dateStr));
  }


  return (
    <div>
      <div>
          <input
            type="checkbox" checked={chartFlag}
            onChange={ chartFlagChange}
          /> Chart
      </div>

      {chartFlag && <div>

        <div style={{color: 'black', display:'flex',}}  > 

          <div style={{display:'flex'}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"lg"}} 
          dateFormat="yyyy-LLL-dd" selected={chartDate} onChange={(date) => setChartDate_(date)} /> &nbsp; &nbsp; </div>
          
          <input style={{marginLeft: '3px', marginRight: '3px', width: '20px'}}  type="radio" name="mon" value='6' id='6' checked={months==='6'} onChange={onOptionChange}/>
            <label style={{marginRight:'10px', paddingRight: '1px'}}> 6_mon</label>
          <input style={{marginRight: '2px', width: '20px'}}  type="radio" name="mon" value='12' id='12' checked={months==='12'} onChange={onOptionChange}/>
            <label style={{marginRight:'10px', paddingRight: '1px'}}> 1_Year</label>  
          <input style={{marginRight: '2px', width: '20px'}} type="radio" name="mon" value='24' id='24' checked={months==='24'} onChange={onOptionChange}/>
            <label style={{marginRight:'10px', paddingRight: '1px'}}> 2_year </label> 
          <input style={{marginRight: '2px', width: '20px'}} type="radio" name="mon" value='60' id='60' checked={months==='60'} onChange={onOptionChange}/> 
            <label style={{marginRight:'10px', paddingRight: '1px'}}> 5_year </label> 
          <input style={{marginRight: '2px', width: '20px'}} type="radio" name="mon" value='120' id='120' checked={months==='120'}onChange={onOptionChange} />
             <label style={{marginRight:'10px', paddingRight: '1px'}}> 10_year </label>
          <input style={{marginRight: '2px', width: '20px'}} type="radio" name="mon" value='264' id='264' checked={months==='264'} onChange={onOptionChange}/>
             <label style={{marginRight:'10px', paddingRight: '25px'}}> 22_Year </label>

        </div>
          <div style={{display:'flex'}} > EndDate:&nbsp;&nbsp; <DatePicker style={{ margin: '0px', size:"lg"}} 
            dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} /> &nbsp; &nbsp; </div>

        <div style={{display:'flex'}}>
          <div> <input  type="checkbox" checked={multi}  onChange={() => setMulti (! multi)} />  multi </div>
          <div> &nbsp;&nbsp;&nbsp; <input  type="checkbox" checked={logarithmic}  onChange={() => setLogarithmic (! logarithmic)} />  Logarithemic &nbsp;&nbsp; &nbsp;  </div>
          {gainChart.length > 1 && <div>  <input  type="checkbox" checked={scaleFlag}  onChange={() => setScaleFlag (! scaleFlag)} /> scale  </div>    }
        </div>

        <div id = 'chart_id'>
        {/* yaxis={'title': 'x-axis','fixedrange':True, 'autorange': false},
       yaxis={'title': 'y-axis','fixedrange':True}) */}
          {props.isMobile && <Plot  data={gainChart} 
            layout={{ width: 700, height: 350, title: title, staticPlot: true, yaxis: {fixedrange: false}  }}
             config={{staticPlot: true, 'modeBarButtonsToRemove': ['zoom','zoomOut','zoomIn','pan']}} />}
          {! props.isMobile && <Plot  data={gainChart} 
            layout={{ width: 850, height: 500, title: title, yaxis: {autorange: true, }, xaxis:{tickformat: '%Y-%b-%d'} }}
             config={{'modeBarButtonsToRemove': []}} />}
        </div>

      </div>}
    </div>
  );
}


export default StockChart;