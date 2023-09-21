import React, {useState, } from 'react'
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
    const [searchPeak, setSearchPeak] = useState (true);

    const LOG_FLAG = props.logFlags && props.logFlags.includes('peak2Peak');

   

  
 
  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid green'
  };
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

  return (
    <div style = {style} id='deepRecovery_id' >
      <div>
        <input
            type="checkbox" checked={displayFlag}
            onChange={displayFlagChange}
        /> Peak2Peak
      </div>

      {displayFlag && 
        <div> 
            {props.symbol && <div  style={{color: 'magenta' }}> {props.symbol} </div>}
            
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
               props.weekly, props.logFlags, props.searchPeak, startDate, endDate, null, setCalcResults, setCalcInfo)}>Calc peak2peak gain </button>           
           </div>
           
           {calcResults && <div   style={{ color: 'green'}} >  <hr/> &nbsp; {calcResults}  </div>}
           {calcInfo &&  <div style={{ color: 'black'}} > &nbsp; {calcInfo} </div>}
        </div>
      }
    </div>
  )
}

export {Peak2PeakGui}