import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// import { toDate } from "date-fns";
// import {format} from "date-fns"
// import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'
// import { columnIsLastLeftSticky } from 'react-table-sticky';
import peak2PeakCalc from './Peak2PeakCalc'

import LogFlags from '../utils/LogFlags'



const Peak2PeakGui = (props) => {


  // props.symbol
  // props.rows
  // props.startDate
  // props.setStartDate
  // props.endDate
  // props.setEndDate
  // stockChartXValues
  // stockChartYValues
  // logFlags
  // weekly

    const [startDate, setStartDate] =  useState(new Date(2007, 10, 1)); // 2007 dec 1  base 0
    const [endDate, setEndDate] =   useState(new Date(2021, 11, 1)); // 2021 dec 1

    const [displayFlag, setDisplayFlag] = useState (false); 
    // const [calcResults, setCalcResults] = useState ();
    // const [calcInfo, setCalcInfo] = useState ();

    const [searchPeak, setSearchPeak] = useState (true);
    const [bubbleLineFlag, setBubbleLineFlag] = useState (false); // show that bubleLine calculated
    const [startFromPeakFlag, setStartFromPeakFlag] = useState (true); // start from oldestPeak


    const [results, setResults] = useState ();
    const [bubbleLineRatio, setBubbleLineRatio] = useState ();

    const LOG_FLAG = props.logFlags && props.logFlags.includes('peak2Peak');

    useEffect(() => {
      setResults();
      setBubbleLineFlag(false)
    },[props.symbol]) 
   
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}
  
  // results['indexFirst'] = indexFirst;
  // results['indexEnd'] = indexEnd;
  // results['yearlyGain'] = yearlyGain;
  // results['yearlyGainPercent'] = ((yearlyGain - 1) * 100).toFixed(2);
  // results['weeklyGain'] = weeklyGain;
  // results['gain'] = gain;
  // results['yearsDiff'] = yearsDiff;
  // results['from'] = stockChartXValues[indexFirst];
  // results['to'] = stockChartXValues[indexEnd];
  // results['fromValue'] = stockChartYValues[indexFirst];
  // results['toValue'] = stockChartYValues[indexEnd];

  // temp save bubble crash baseline
  function calcBaseLine (XValues, YValues) {  

    var yBubbleLine = []

    //** extrapolate value of today */
    yBubbleLine[0] = results.toValue * results.weeklyGain ** results.indexEnd // weekCount 

    const startDateMili = startDate.getTime()

    for (let i = 0; i < YValues.length - 1; i ++) {
      if (startFromPeakFlag) {
        const chartDateSplit = XValues[i].split('-')
        const date = (new Date([chartDateSplit[0], chartDateSplit[1], chartDateSplit[2]])); 
        const mili = date.getTime()

        if (Math.abs(startDateMili - mili)  < 1000 * 3600 * 24 * 8) { 
          break; // stop loop within 8 days of startDate (oldest bubble point)
        }
      }
      yBubbleLine.push(yBubbleLine[i] / results.weeklyGain);
    }  

    props.setBubbleLine ({x: XValues, y: yBubbleLine})
    setBubbleLineFlag(true)

    if (Object.keys(props.gainMap).length > 1) {
      props.errorAdd(['Bubble-line only for sinle stock. <reloadPage> and try again'])
    }
  
    //** calc ratio latestValue/bubbleline */
    const bubbleLineOver = (YValues[0] / yBubbleLine[0]).toFixed(3)
    setBubbleLineRatio(bubbleLineOver)
    if (results)
      results['CurrentPrice/bubbleLine'] = bubbleLineOver;
    console.log (props.symbol, ' / bubbleLine  =', bubbleLineOver, ';  sym_val=', YValues[0], 'bubbleLine_val=', yBubbleLine[0].toFixed(2))
    // console.log  (props.symbol, ' / bubbleLine ',  '  ', bubbleLineOver)

  }

  return (
    <div style = {{border: '2px solid blue'}} id='deepRecovery_id' >
          <div> 

            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h6 style={{color: 'blue'}}> Peak2Peak (long term gain) &nbsp;  </h6>
            </div>

            <div  style={{display:'flex' }}> 
            <div style={{ color: 'black'}}  >Start_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
           </div>
      
           <div  style={{display:'flex' }}> 
            <div style={{ color: 'black'}}  > End_date:   </div>
            &nbsp; &nbsp;  <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />
           </div>
           
           <div style={{display:'flex'}}> &nbsp; 
              {!  results && <div> <input  type="checkbox" checked={searchPeak}  onChange={() => {setSearchPeak (! searchPeak)}} />  searchPeak &nbsp;&nbsp; </div>}
              {! bubbleLineFlag && <div> <input  type="checkbox" checked={startFromPeakFlag}  onChange={() => {setStartFromPeakFlag (! startFromPeakFlag)}} />  startFromPeak  &nbsp;&nbsp; </div>}

              {! results && <div><button style={{background: 'aqua'}} type="button" onClick={()=>peak2PeakCalc (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues,
               props.weekly, props.logFlags, props.searchPeak, startDate, endDate, props.errorAdd, setResults, props.saveTable)}>Calc peak2peak gain </button> &nbsp; &nbsp;</div>}

              {results && ! props.gainMap.yBubbleLine && ! props.bubleLine && <button style={{background: 'aqua'}} type="button"  onClick={() => {calcBaseLine (props.stockChartXValues, props.stockChartYValues)}}> calc Bubble-Line </button>}
              {bubbleLineFlag && <div style={{color: 'magenta'}} >{props.symbol} currentPrice / bubbleLine = {bubbleLineRatio} </div>}
              {/* <div> Click </div> &nbsp;&nbsp;
              <div style={{color: 'magenta', fontWeight: "bold"}}> chart </div> */}
           </div>
           
           {results && <div>
             <div   style={{ color: 'green'}} >  <hr/> &nbsp;yearlyGain: {results.yearlyGain} &nbsp;&nbsp; ({results.yearlyGainPercent}%) </div>
             {/* <div> gain={results.gain} &nbsp;yearsDiff={results.yearsDiff}  &nbsp; from={results.from} ({results.fromValue}) &nbsp; to={results.to} ({results.toValue}) </div> */}
           </div>}

           <pre>{JSON.stringify(results, null, 2)}</pre>
           <hr/> 

        </div>

    </div>
  )
}

export {Peak2PeakGui}