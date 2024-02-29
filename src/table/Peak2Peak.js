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
    const [calcResults, setCalcResults] = useState ();
    const [calcInfo, setCalcInfo] = useState ();
    const [results, setResults] = useState ();
    const [searchPeak, setSearchPeak] = useState (true);

    const LOG_FLAG = props.logFlags && props.logFlags.includes('peak2Peak');

    useEffect(() => {
      setCalcResults();
      setCalcInfo();
    },[props.symbol]) 
   
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}
  
  // const textResults = 'yearlyGain=' + yearlyGain + ' \xa0\xa0' + ((yearlyGain - 1) * 100).toFixed(2) + '%'
  // const textInfo =  `(gain= ${gain}  \xa0  years= ${yearsDiff} \xa0 from= ${stockChartXValues[indexFirst]} \xa0 to= ${stockChartXValues[indexEnd]}  )`;
  // const results = {
  //   yearlyGain: yearlyGain,
  //   yearlyGainPercent: ((yearlyGain - 1) * 100).toFixed(2),
  //   gain: gain,
  //   yearsDiff: yearsDiff,
  //   from: stockChartXValues[indexFirst],
  //   to: stockChartXValues[indexEnd],
  //   fromValue: stockChartYValues[indexFirst],
  //   toValue: stockChartYValues[indexEnd],
  // }


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
               props.weekly, props.logFlags, props.searchPeak, startDate, endDate, null, setResults)}>Calc peak2peak gain </button>           
           </div>
           
           {results && <div>
             <div   style={{ color: 'green'}} >  <hr/> &nbsp;yearlyGain: {results.yearlyGain} &nbsp;&nbsp; ({results.yearlyGainPercent}%) </div>
             <div> gain= {results.gain} yearsDiff={results.yearsDiff}   from={results.from} ({results.fromValue})  to {results.to} ({results.toValue}) </div>
           </div>}

        </div>

    </div>
  )
}

export {Peak2PeakGui}