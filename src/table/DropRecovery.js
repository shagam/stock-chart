import React, {useState, } from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'

//import './DropRecovery.css'


const DropRecovery = (props) => {

  // props.StockSymbol
  // props.callBack 
  // props.stockChartYValues
  // props.stockChartXValues
  // props.rows

  // const [startDate, setStartDate] = useState(new Date(2020, 1, 5)); // feb 5 2020
  const [startDate, setStartDate] = useState(new Date(2022, 0, 1)); // jan 1 2022
  // const [endDate, setEndDate] = useState(new Date(2020, 4, 15)); // may 15 2020
  const [displayFlag, setDisplayFlag] = useState (false); 
 //  2007, 11, 1  2008 deep

  
  const searchDeepValue = () => {

    const LOG_FLAG = false;

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMon = today.getMonth() + 1;
    const todayDay = today.getDay() + 1;

    const startYear = startDate.getFullYear();
    const startMon = startDate.getMonth() + 1;
    const startDay = startDate.getDay() + 1;

      

    // var startBeforeDropWeek = (todayYear - startYear) * 52 + (todayMon - startMon) * 4.34 + (todayDay - startDay) / 4.34;
    // startBeforeDropWeek = Math.round(startBeforeDropWeek);

    const startDateArray = [startYear, startMon, startDay]
    var startBeforeDropIndex = searchDateInArray (props.stockChartXValues, startDateArray, props.StockSymbol)  

    //console.log (startDate.getFullYear(), startDate.getMonth(), startDate.getDay())    
    //console.log (props.StockSymbol, props.stockChartXValues[beforeDropWeek]);

    // if (startBeforeDropWeek < 10 && startBeforeDropWeek > 52*20) {
    //   alert ('Not allowed before 20 years, and not less than 10 weeks');
    //   return -1;
    // }
    var highPriceBeforeDeep = 0;
    var highPriceBeforeDeepIndex = 0;

    var dropPrice = Number(props.stockChartYValues[startBeforeDropIndex]);
    var dropIndex = -1;
    var dropDate = '';
    var highPriceAfterDeep = -1;
    var recoverIndex = -1;
    var recoverPeriod = -1
    var drop = -1;

    // search for deepPrice after start date
    const deep = () => {
      dropPrice = Number(props.stockChartYValues[startBeforeDropIndex]);
      dropDate = props.stockChartXValues[startBeforeDropIndex];
      for (var i = startBeforeDropIndex; i > 0; i--) {
        // search for lowestPrrice 
        const price = Number(props.stockChartYValues[i] );
        if (dropPrice > price) {
          dropPrice = price;
          dropIndex = i;
          dropDate = props.stockChartXValues[i];
        }
      }
      if (LOG_FLAG) {
        console.log ('StockSymbol: ', props.StockSymbol, ' startDate_X_Array',  props.stockChartXValues[startBeforeDropIndex]);
        console.log ('startPrice: ', props.stockChartYValues[startBeforeDropIndex], 'beforeDropIndex:', startBeforeDropIndex);
        console.log ('dropPrice: ', dropPrice, ' dropIndex: ', dropIndex, ' dropDate:', dropDate);
      }
    }

    // search for higest befor deep
    const highistBeforeDeep = () => {
      for (let i = dropIndex; i <= startBeforeDropIndex * 4; i++) { 
        const price = Number(props.stockChartYValues[i]);
        if (highPriceBeforeDeep < price) {  // at least weeks to recover
          highPriceBeforeDeep  = price;
          highPriceBeforeDeepIndex = i;
        }
      }
    }

    // check for recovery price after drop
    const recoveryWeeks = () => {
      for (let i = dropIndex; i > 0; i--) {      
        const price = Number(props.stockChartYValues[i]);
        //if (highPriceAfterDeep < price) {
          if (price > Number (props.stockChartYValues[highPriceBeforeDeepIndex])) {
            highPriceAfterDeep = price;
            recoverIndex = i;
            break; // recovery found
          }
        //}
      }
      drop = Math.round (dropPrice / highPriceBeforeDeep * 1000, 3) / 1000;
      console.log (props.StockSymbol, 'drop', drop)

      // avoid multiple cals of drop
      const index = props.rows.findIndex((row)=> row.values.symbol === props.StockSymbol);
      if (index === -1) {
        alert (`crash recovery symbol not found (${props.StockSymbol})`);
        return;
      } 
      if (props.rows[index].values.drop === drop)
        return;

      if (LOG_FLAG) {
        console.log ('highPriceBeforeDeep: ', highPriceBeforeDeep, ' highPriceBeforeDeepIndex: ',  highPriceBeforeDeepIndex)
        console.log ('highPriceAfterDeep', highPriceAfterDeep, ' recoverIndex: ', recoverIndex);
      }
  
      recoverPeriod = dropIndex - recoverIndex;
      if (recoverIndex === -1)
        recoverPeriod = -1;
    }


    const startDateSplit = [startYear, startMon, startDay];
    const todayDateSplit = dateSplit( todayDate());
    const todayDaysSince1970 = daysFrom1970 (todayDateSplit);
    const startDaysSince1970 = daysFrom1970 (startDateSplit);
    if (Math.abs (daysFrom1970 (todayDateSplit) - daysFrom1970(startDateSplit)) > 250) {  // more than 6 months
    // drop-recovery
      deep();
      highistBeforeDeep();
      recoveryWeeks();
    } 
    else {
      deep()
      highistBeforeDeep();
      recoveryWeeks();
    }
    const priceDivHigh = Number((props.stockChartYValues[0] / highPriceBeforeDeep).toFixed(3));
    console.log (props.StockSymbol, 'priceDivHigh', priceDivHigh)
    // fill columns in stock table
    props.dropCallBack (props.StockSymbol, drop, dropIndex, recoverPeriod, dropDate, priceDivHigh); //format(startDate, "yyyy-MMM-dd"));
  }

  function swap_period_2008() {
      setStartDate (new Date(2007, 9, 15));
      // setEndDate (new Date(2009, 1, 1));
  }

  function swap_period_2020() {
    setStartDate (new Date(2020, 1, 5));
    // setEndDate (new Date(2020, 4, 15));
  }

  
  function swap_period_8_mon() {
    var date = new Date();
    var formattedDate = format(date, "yyyy-MM-dd");
    var dateArray = formattedDate.split('-');

    // date = date.split('T')[0];
    const dateArray1 = monthsBack (dateArray, 8);
    const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
    setStartDate (new Date(dateStr));
    // setEndDate (new Date());
  }

  function toggleDropRecoveryColumns ()  {
    var ind = props.allColumns.findIndex((column)=> column.Header === 'drop');
    props.allColumns[ind].toggleHidden();
    ind = props.allColumns.findIndex((column)=> column.Header === 'dropDate');
    props.allColumns[ind].toggleHidden();
    ind = props.allColumns.findIndex((column)=> column.Header === 'recoverWeek');
    props.allColumns[ind].toggleHidden();
    // ind = props.allColumns.findIndex((column)=> column.Header === 'priceDivHigh');
    // props.allColumns[ind].toggleHidden();
  }

  //  skip analysis if no symbol
  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.StockSymbol);
  if (row_index !== -1 && props.StockSymbol !== '' && props.StockSymbol !== undefined  
  && props.stockChartYValues.length !== 0)
    searchDeepValue (); 




  //   const styleObj = {
  //     border: '2px',
  //     //fontSize: 14,
  //     // color: "#4a54f1",
  //     // display: "grid",
  //     position: 'relative',
  //     // gridTemplateColumns: "1fr 1fr" 
  //     //textAlign: "center",
  //     //paddingTop: "100px",
  // }

  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid magenta'
  };

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

  return (
    <div style = {style} id='dropRecovery_id' >
      <div>
            <input
              type="checkbox" checked={displayFlag}
              onChange={displayFlagChange}
            /> Drop-Recovery
      </div>
      {displayFlag && 
        <div>     
          <button type="button" onClick={()=>toggleDropRecoveryColumns()}>Drop_recovery_columns    </button>
          <div color='yellow' > Start date (click gain on few stocks) </div>
          <DatePicker dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
            
          {/* <DatePicker dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />  */}
          <button type="button" onClick={()=>swap_period_2008()}>  2008   </button>
          <button type="button" onClick={()=>swap_period_2020()}>  2020   </button>
          <button type="button" onClick={()=>swap_period_8_mon()}>  last_8_Months    </button>
        </div>
      }
    </div>
  )
}

export default DropRecovery;