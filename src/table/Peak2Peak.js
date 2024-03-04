import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// import { toDate } from "date-fns";
// import {format} from "date-fns"
// import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'
// import { columnIsLastLeftSticky } from 'react-table-sticky';
import peak2PeakCalc from './Peak2PeakCalc'

import LogFlags from '../LogFlags'



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
    const [results, setResults] = useState ();
    const [searchPeak, setSearchPeak] = useState (true);
    const [bubbleLineFlag, setBubbleLineFlag] = useState (false); // show that bubleLine calculated

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
    const loopCount = results.indexFirst - results.indexEnd;
    var xBubbleLine = [];
    var yBubbleLine = [];
    yBubbleLine[results.indexFirst] = YValues[results.indexFirst]
    xBubbleLine[results.indexFirst] = XValues[results.indexFirst]

    for (let i = 1; i < results.indexFirst; i ++) {
      xBubbleLine[results.indexFirst - i] = XValues[results.indexFirst - i]
      yBubbleLine[results.indexFirst - i] = yBubbleLine[ results.indexFirst - i + 1] * results.weeklyGain // calc fro previos
    }
    // console.log (yBaseLine[results.indxEnd -1], xBaseLine[results.indxEnd -1] )
    console.log ('xVal', XValues[results.indexEnd - 1], xBubbleLine[loopCount - 1])
    console.log ('yVal', YValues[results.indexEnd - 1], yBubbleLine[loopCount - 1])
    // console.log (XValues, YValues, xBaseLine, yBaseLine);
    props.setBubbleLine ({x: xBubbleLine, y: yBubbleLine})
    setBubbleLineFlag(true)
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
           
           <div> &nbsp; 
              <input  type="checkbox" checked={searchPeak}  onChange={() => {setSearchPeak (! searchPeak)}} />  searchPeak &nbsp;&nbsp;
           
              <button type="button" onClick={()=>peak2PeakCalc (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues,
               props.weekly, props.logFlags, props.searchPeak, startDate, endDate, props.errorAdd, setResults, props.saveTable)}>Calc peak2peak gain </button> &nbsp;

              {results && <button type="button"  onClick={() => {calcBaseLine (props.stockChartXValues, props.stockChartYValues)}}>  Bubble baseLine </button>}
              {bubbleLineFlag && <div style={{color: 'magenta'}} >bubbleLine </div>}
           </div>
           
           {results && <div>
             <div   style={{ color: 'green'}} >  <hr/> &nbsp;yearlyGain: {results.yearlyGain} &nbsp;&nbsp; ({results.yearlyGainPercent}%) </div>
             <div> gain={results.gain} &nbsp;yearsDiff={results.yearsDiff}  &nbsp; from={results.from} ({results.fromValue}) &nbsp; to={results.to} ({results.toValue}) </div>
           </div>}

        </div>

    </div>
  )
}

export {Peak2PeakGui}