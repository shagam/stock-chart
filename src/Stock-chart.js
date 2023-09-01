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
  const [modeBarRemove, setModeBarRemove] = useState(['zoom', 'zoomIn', 'zoomOut', 'pan']);

  const LOG_FLAG = props.logFlags.includes('chart');


  // var date = new Date();
   // console.log (props.dateArr)

  // // date = date.split('T')[0];
  // const dateArray1 = monthsBack (dateArray, 8);
  // const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
  // props.setChartDate (new Date(dateStr));


  // const [chartData, setChartData] = useState("");
  // const [gainChart, setGainChart] = useState ([]);

  //const chartData = props.dat;

  // props.gainMap
  // props.selectedFlatRows

  const [oldestPrice, setOldestPrice] = useState()

  if (props.stockChartXValues === undefined || props.stockChartXValues.length === 0)
    return null;


  // if (props.isMobile) 
    // console.log ('isMobile: ', props.isMobile)
    // setModeBarRemove(['zoom', 'zoomIn', 'zoomOut', 'pan'])
    // setModeBarRemove(['zoom','zoomOut','zoomIn','pan'])

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

  // calc log if required
  var y = [];
  for (let i = 0; i < props.stockChartYValues.length; i++){
    if (logarithmic)
      y[i] = Math.log (props.stockChartYValues[i])
    else
      y[i] = props.stockChartYValues[i]
  }

  // chart of a single ticker
  const singleChart = [
    {
      x: props.stockChartXValues,
      y: y,
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'green' },
      name: props.StockSymbol
    },
  ]

  function buildGainCharData () {

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
  const chartData_ = buildGainCharData();

  var title = 'symbol (newest/oldest)'
  if (chartData_.length > 1) {
    // setChartData (props.gainChart)
    gainChart = chartData_// props.gainChart;

    if (logarithmic)
      title += ' [logarithmic]';

    if (LOG_FLAG)
      console.log (props.chartDate)
  }
  else {
    // setChartData (singleChart)
    gainChart = singleChart;
    title = props.StockSymbol;
    if (LOG_FLAG)
      console.log(props.stockChartXValues, props.stockChartYValues)
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

      {chartFlag && <div>

        <div style={{color: 'magenta'}}  > 
          <div  style={{display:'flex', color: 'magenta'}} > &nbsp; <input  type="checkbox" checked={logarithmic}  onChange={() => setLogarithmic (! logarithmic)} />  Logarithem &nbsp;&nbsp; &nbsp; &nbsp; </div>
          <div> <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={chartDate} onChange={(date) => setChartDate(date)} />  </div>

        </div>

        <div id = 'chart_id'>
          <Plot  data={gainChart} layout={{ width: 800, height: 500, title: title,  }} config={{'modeBarButtonsToRemove': modeBarRemove}} />
        </div>

      </div>}
    </div>
  );
}


export default StockChart;