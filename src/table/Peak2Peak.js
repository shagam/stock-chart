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
    const [bubbleBaseline, setBubbleBaseline] = useState (false);

    const LOG_FLAG = props.logFlags && props.logFlags.includes('peak2Peak');

    useEffect(() => {
      setResults();
    },[props.symbol]) 
   
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}
  
  // results['indexFirst'] = indexFirst;
  // results['indxEnd'] = indexEnd;
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
    var xBaseLine = [];
    var yBaseLine = [];
    yBaseLine[0] = YValues[results.indexFirst]
    xBaseLine[0] = XValues[results.indexFirst]
    const loopCount = results.indexFirst - results.indxEnd;
    for (let i = 1; i < loopCount; i ++) {
      xBaseLine[i] = XValues[results.indexFirst + i]
      yBaseLine[i] = yBaseLine[i-1] * results.weeklyGain
    }
    // console.log (yBaseLine[results.indxEnd -1], xBaseLine[results.indxEnd -1] )
    console.log (xBaseLine[loopCount - 1], XValues[results.indxEnd - 1])
    console.log (yBaseLine[loopCount - 1], YValues[results.indxEnd - 1])
    console.log (XValues, YValues, xBaseLine, yBaseLine);
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
               props.weekly, props.logFlags, props.searchPeak, startDate, endDate, null, setResults)}>Calc peak2peak gain </button> &nbsp;

              {results && <button type="button"  onClick={() => {calcBaseLine (props.stockChartXValues, props.stockChartYValues)}}>  Bubble baseLine </button>}

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