import React, {useState, } from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'
import { columnIsLastLeftSticky } from 'react-table-sticky';
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

    const [startDate, setStartDate] =  useState(new Date(2007, 10, 1)); // 2007 dec 1
    const [endDate, setEndDate] =   useState(new Date(2021, 11, 1)); // 2021 dec 1

    const [displayFlag, setDisplayFlag] = useState (false); 
    const [calcResults, setCalcResults] = useState ();
 
    const LOG_FLAG = props.logFlags.includes('eak2Peak');

    const quasiTop = (initDate) => {
      var dateIndex = searchDateInArray (props.stockChartXValues, initDate, props.symbol)
      console.log (dateIndex)
      const range = 20;
      var priceIndex = -1;
      var startIndex = dateIndex - range > 0 ? dateIndex -= range : 0
      var endIndex = dateIndex + range*2 < props.stockChartYValues.length ? dateIndex + range*2 : dateIndex;
      var highPrice = props.stockChartYValues[dateIndex];
      for (let i = startIndex; i <= endIndex; i++) { 
        const price = Number(props.stockChartYValues[i]);
        if (highPrice < price) {  // at least weeks to recover
          highPrice  = price;
          priceIndex = i;
          console.log ('index=', i, price, 'highPrice=', highPrice)
        }
      }
      return priceIndex;

    }



    function peak2PeakCalc () {
        setCalcResults(); 
        // console.log ('calc')
        if (props.symbol === ''  || props.stockChartXValues.length === 0) {
          // alert ('Need to click <gain> for a symbol before calc peak2peak -')
          setCalcResults('symbol Undefined. click <gain> for some symbol')
          return;
        }
        if (! props.weekly) {
          setCalcResults('calc only for weekly mode ')
          alert('calc only for weekly mode ')
          return;
        }

        const startYear = startDate.getFullYear();
        const startMon = startDate.getMonth() + 1;
        const startDay = startDate.getDay() + 1;
    
        const endYear = endDate.getFullYear();
        const endMon = endDate.getMonth() + 1;
        const endDay = endDate.getDay() + 1;

        const startDateArray = [startYear, startMon, startDay]
        const endDateArray =[endYear, endMon, endDay]
        const indexFirst = quasiTop (startDateArray)
        const indexEnd = quasiTop (endDateArray)
        const diff = indexFirst - indexEnd
        console.log ('weeks:', diff)

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
            {calcResults && <div style={{ color: 'red'}} > calcResults: {calcResults}</div>}

           <div  style={{display:'flex' }}> 
            <div style={{ color: 'magenta'}}  >Start_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
           </div>
      
           <div  style={{display:'flex' }}> 
            <div style={{ color: 'magenta'}}  > End_date:   </div>
            &nbsp; &nbsp;  <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />
           </div>


            <button type="button" onClick={()=>peak2PeakCalc ()}>Calc peak2peak </button>
        </div>
      }
    </div>
  )
}

export {Peak2PeakGui}