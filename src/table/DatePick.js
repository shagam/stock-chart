import React, {useState, } from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'

//import './DropRecovery.css'



// function DatePicker_ () {

//     const LOG_FLAG = logFlags.includes('drop');

  

//     const today = new Date();
//     const todayYear = today.getFullYear();
//     const todayMon = today.getMonth() + 1;
//     const todayDay = today.getDay() + 1;

//     const startYear = startDate.getFullYear();
//     const startMon = startDate.getMonth() + 1;
//     const startDay = startDate.getDay() + 1;

//     const startDateSplit = [startYear, startMon, startDay];
//     const todayDateSplit = dateSplit( todayDate());
//     const todayDaysSince1970 = daysFrom1970 (todayDateSplit);
//     const startDaysSince1970 = daysFrom1970 (startDateSplit);
//     if (Math.abs (daysFrom1970 (todayDateSplit) - daysFrom1970(startDateSplit)) > 250) {  // more than 6 months
//     // deep-recovery

//     }
//   }

const DatePick = (props) => {
  // props.chartDate

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMon = today.getMonth() + 1;
    const todayDay = today.getDay() + 1;


   // const [startDate, setStartDate] = useState(new Date(2020, 1, 5)); // feb 5 2020

   // const [endDate, setEndDate] = useState(new Date(2020, 4, 15)); // may 15 2020
   const [displayFlag, setDisplayFlag] = useState (false); 
   const [logarithmic, setLogarithmic] = useState (true); 
   //  2007, 11, 1  2008 deep
 
  function swap_period_2008() {
    props.setChartDate (new Date(2007, 9, 15)); // 2007 Oct 15
      // setEndDate (new Date(2009, 1, 1));
  }

  function swap_period_2020() {
    props.setChartDate (new Date(2020, 1, 5));  // 2020 Feb 5
    // setEndDate (new Date(2020, 4, 15));
  }

  function swap_period_2022() {
    props.setChartDate (new Date(2021, 11, 1));  // 2021 dec 1 
    // setEndDate (new Date(2020, 4, 15));
  }
  
  function swap_period_8_mon() {
    var date = new Date();
    var formattedDate = format(date, "yyyy-MM-dd");
    var dateArray = formattedDate.split('-');

    // date = date.split('T')[0];
    const dateArray1 = monthsBack (dateArray, 8);
    const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
    props.setChartDate (new Date(dateStr));
    // setEndDate (new Date());
  }


  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid magenta'
  };
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

  return (
    <div style = {style} id='deepRecovery_id' >
      <div>
            <input
              type="checkbox" checked={displayFlag}
              onChange={displayFlagChange}
            /> ChartDate
      </div>
      {displayFlag && 
        <div> 
          {/* <button type="button" onClick={()=>searchDeepValue()}>Drop_recovery    </button>     */}


          <div  style={{display:'flex', }}>

          <div>
            {/* <input
              type="checkbox" checked={logarithmic}
              onChange={setLogarithmic (! logarithmic)}
            /> Logarithmic Chart  */}
          </div>

          <div style={{color: 'magenta'}}  > Start_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={props.chartDate} onChange={(date) => props.setCartDate(date)} /> 

          </div>

          {/* <DatePicker dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />  */}
          <div style={{display:'flex', }}> 
            <div style={{color: 'magenta'}}>Date &nbsp; </div>
            <button type="button" onClick={()=>swap_period_2008()}>  2008   </button>
            <button type="button" onClick={()=>swap_period_2020()}>  2020   </button>
            <button type="button" onClick={()=>swap_period_2022()}>  2022   </button>
          </div>
          {/* <button type="button" onClick={()=>swap_period_8_mon()}>  last_8_Months    </button> */}

        </div>
      }
    </div>
  )
}

export default DatePick;