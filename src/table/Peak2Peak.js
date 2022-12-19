import React, {useState, } from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'
import { columnIsLastLeftSticky } from 'react-table-sticky';
import LogFlags from '../LogFlags'

function Peak2PeakCalc (rows, StockSymbol, stockChartXValues, stockChartYValues, startDate, endDate, logFlags) {



    if (StockSymbol === undefined || StockSymbol === '' || stockChartXValues === undefined) {
      alert ('Need to click <gain> for a symbol before calc peak2peak')
      return;
    }


    const startYear = startDate.getFullYear();
    const startMon = startDate.getMonth() + 1;
    const startDay = startDate.getDay() + 1;

    const endYear = startDate.getFullYear();
    const endMon = startDate.getMonth() + 1;
    const endDay = startDate.getDay() + 1;

    // var startBeforeDropWeek = (todayYear - startYear) * 52 + (todayMon - startMon) * 4.34 + (todayDay - startDay) / 4.34;
    // startBeforeDropWeek = Math.round(startBeforeDropWeek);

    const startDateArray = [startYear, startMon, startDay]
 
    // if (LOG_FLAG)
    //   console.log (StockSymbol, 'startDate:', startDateArray, 'startIndex:', startBeforeDropIndex, 'deepPrice:', deepPrice)

    // search for deepPrice after start date
 
    // search for higest befor deep
     // check for recovery price after deep
    var recoverDate = ''

         // avoid multiple cals of deep
      const index = rows.findIndex((row)=> row.values.symbol === StockSymbol);
      if (index === -1) {
        alert (`crash recovery symbol not found (${StockSymbol})`);
        return;
      } 
      // if (rows[index].values.deep === deep)
      //   return;

}



const Peak2PeakGui = (props) => {


  // props.symbol
  // props.rows
  // props.startDate
  // props.setStartDate
  // props.endDate
  // props.setEndDate
  // stockChartXValues
  // stockChartYValues

    const [startDate, setStartDate] =  useState(new Date(2007, 10, 1)); // 2007 dec 1
    const [endDate, setEndDate] =   useState(new Date(2021, 11, 1)); // 2021 dec 1

    const [displayFlag, setDisplayFlag] = useState (false); 
    const [calcResults, setCalcResults] = useState ();
 
    const LOG_FLAG = props.logFlags.includes('eak2Peak');

    function peak2PeakCalc () {
        console.log ('calc')
        if (props.symbol === ''  || props.stockChartXValues.length === 0) {
          alert ('Need to click <gain> for a symbol before calc peak2peak -')
          setCalcResults('symbol Undefined. click <gain> for some symbol')
          return;
        }

    
        const startYear = startDate.getFullYear();
        const startMon = startDate.getMonth() + 1;
        const startDay = startDate.getDay() + 1;
    
        const endYear = endDate.getFullYear();
        const endMon = endDate.getMonth() + 1;
        const endDay = endDate.getDay() + 1;
    }    

    function swap_period_8_mon() {
        var date = new Date();
        var formattedDate = format(date, "yyyy-MM-dd");
        var dateArray = formattedDate.split('-');

        // date = date.split('T')[0];
        const dateArray1 = monthsBack (dateArray, 8);
        const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
        props.setDropStartDate (new Date(dateStr));
        // setEndDate (new Date());
    }

  //  skip analysis if no symbol
  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.StockSymbol);
  // if (row_index !== -1 && props.StockSymbol !== '' && props.StockSymbol !== undefined  
  // && props.stockChartYValues.length !== 0)
  //   searchDeepValue (); 

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
            {props.symbol && <div> Symbol: {props.symbol}</div>}
           <div  style={{display:'flex' }}> 
            <div style={{ color: 'magenta'}}  >Start_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
           </div>
      
           <div  style={{display:'flex' }}> 
            <div style={{ color: 'magenta'}}  > End_date:   </div>
            &nbsp; &nbsp;  <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />
           </div>

            {calcResults && <div>calcResults: {calcResults}</div>}
            <button type="button" onClick={()=>peak2PeakCalc ()}>Calc peak2peak </button>
        </div>
      }
    </div>
  )
}

export {Peak2PeakGui, Peak2PeakCalc}