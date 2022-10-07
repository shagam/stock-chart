import React, {useState, } from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'

//import './DropRecovery.css'



function searchDeepValue (rows, StockSymbol, stockChartXValues, stockChartYValues, deepCallBack, startDate, logFlags) {

    const LOG_FLAG = logFlags.includes('drop');

    if (StockSymbol === undefined || StockSymbol === '' || stockChartXValues === undefined) {
      alert ('Need to click <gain> for a symbol before calc deep recover')
      return;
    }

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
    var startBeforeDropIndex = searchDateInArray (stockChartXValues, startDateArray, StockSymbol)  
    var highPriceBeforeDeep = 0;
    var highPriceDateBeforeDeep = '';
    var highPriceBeforeDeepIndex = 0;

    var deepPrice = Number(stockChartYValues[startBeforeDropIndex]);
    // if (LOG_FLAG)
    //   console.log (StockSymbol, 'startDate:', startDateArray, 'startIndex:', startBeforeDropIndex, 'deepPrice:', deepPrice)
    var deepIndex = -1;
    var deepDate = '';
    var highPriceAfterDeep = -1;
    var recoverIndex = -1;
    var recoverPeriod = -1
    var deep = -1;

    // search for deepPrice after start date
    const deep_ = () => {
      deepPrice = Number(stockChartYValues[startBeforeDropIndex]);
      deepDate = stockChartXValues[startBeforeDropIndex];
      for (var i = startBeforeDropIndex; i > 0; i--) {
        // search for lowestPrrice 
        const price = Number(stockChartYValues[i] );
        if (deepPrice > price) {
          deepPrice = price;
          deepIndex = i;
          deepDate = stockChartXValues[i];
        }
      }
      if (LOG_FLAG) {
        console.log (StockSymbol, 'startDate', stockChartXValues[startBeforeDropIndex], 
          'startPrice:', stockChartYValues[startBeforeDropIndex], 'startIndex:', startBeforeDropIndex);
        console.log (StockSymbol, 'deepDate:', deepDate, 'deepPrice:', deepPrice, ' deepIndex:', deepIndex );
      }
    }

    // search for higest befor deep
    const highistBeforeDeep = () => {
      for (let i = deepIndex; i <= startBeforeDropIndex; i++) { 
        const price = Number(stockChartYValues[i]);
        if (highPriceBeforeDeep < price) {  // at least weeks to recover
          highPriceBeforeDeep  = price;
          highPriceDateBeforeDeep = stockChartXValues[i]
          highPriceBeforeDeepIndex = i;
        }
      }
      deep = Math.round (deepPrice / highPriceBeforeDeep * 1000, 3) / 1000;
    }

    // check for recovery price after deep
    var recoverDate = ''

    const recoveryWeeks = () => {
      for (let i = deepIndex; i > 0; i--) {      
        const price = Number(stockChartYValues[i]);
        if (highPriceBeforeDeep < price) {
            highPriceAfterDeep = price;
            recoverIndex = i;
            recoverDate = stockChartXValues[i];
            break; // recovery found
        }
      }

      // avoid multiple cals of deep
      const index = rows.findIndex((row)=> row.values.symbol === StockSymbol);
      if (index === -1) {
        alert (`crash recovery symbol not found (${StockSymbol})`);
        return;
      } 
      // if (rows[index].values.deep === deep)
      //   return;

      if (LOG_FLAG) {
        console.log (StockSymbol, 'highBeforeDeep:', highPriceDateBeforeDeep, highPriceBeforeDeep, ' Index: ',  highPriceBeforeDeepIndex, 'lowestDrop=', deep)
        console.log (StockSymbol, 'highAfterDeep:', recoverDate, highPriceAfterDeep, ' recoverIndex:', recoverIndex, 'recoveryWeeks:', deepIndex - recoverIndex);
      }
  
      recoverPeriod = deepIndex - recoverIndex;
      if (recoverIndex === -1)
        recoverPeriod = -1;
    }


    const startDateSplit = [startYear, startMon, startDay];
    const todayDateSplit = dateSplit( todayDate());
    const todayDaysSince1970 = daysFrom1970 (todayDateSplit);
    const startDaysSince1970 = daysFrom1970 (startDateSplit);
    if (Math.abs (daysFrom1970 (todayDateSplit) - daysFrom1970(startDateSplit)) > 250) {  // more than 6 months
    // deep-recovery
      deep_();
      highistBeforeDeep();
      recoveryWeeks();
    } 
    else {
      deep_()
      highistBeforeDeep();
      recoveryWeeks();
    }
    const priceDivHigh = Number((stockChartYValues[0] / highPriceBeforeDeep).toFixed(3));
    if (LOG_FLAG)
      console.log (StockSymbol, 'todayPrice/highBeforeDrop=', priceDivHigh)
    // fill columns in stock table
    // if (recoverPeriod === undefined)
    //   alert (StockSymbol + ' recoverWeek undef')
    deepCallBack (StockSymbol, deep, deepIndex, recoverPeriod, deepDate, priceDivHigh); //format(startDate, "yyyy-MMM-dd"));
  }


const DropRecoveryButtons = (props) => {
  // props.StockSymbol
  // props.rows
  // props.allColumhs
  // props.deepStartDate
  // props.setDropStartDate
  // 

   // const [startDate, setStartDate] = useState(new Date(2020, 1, 5)); // feb 5 2020

   // const [endDate, setEndDate] = useState(new Date(2020, 4, 15)); // may 15 2020
   const [displayFlag, setDisplayFlag] = useState (false); 
   //  2007, 11, 1  2008 deep
 
  function swap_period_2008() {
    props.setDropStartDate (new Date(2007, 9, 15)); // 2007 Oct 15
      // setEndDate (new Date(2009, 1, 1));
  }

  function swap_period_2020() {
    props.setDropStartDate (new Date(2020, 1, 5));  // 2020 Feb 5
    // setEndDate (new Date(2020, 4, 15));
  }

  function swap_period_2022() {
    props.setDropStartDate (new Date(2022, 0, 1));  // 2022 Jan 1 
    // setEndDate (new Date(2020, 4, 15));
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

  function toggleDropRecoveryColumns ()  {
    var ind = props.allColumns.findIndex((column)=> column.Header === 'deep');
    if (ind === -1) {
      alert ('column deep invalid')
      return
    }
    props.allColumns[ind].toggleHidden();
    ind = props.allColumns.findIndex((column)=> column.Header === 'deepDate');
    if (ind === -1) {
      alert ('column deepDate invalid')
      return
    }
    props.allColumns[ind].toggleHidden();
    ind = props.allColumns.findIndex((column)=> column.Header === 'recoverWeek');
    if (ind === -1) {
      alert ('column recoverWeek invalid')
      return
    }
    props.allColumns[ind].toggleHidden();
    // ind = props.allColumns.findIndex((column)=> column.Header === 'priceDivHigh');
    // props.allColumns[ind].toggleHidden();
  }

  //  skip analysis if no symbol
  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.StockSymbol);
  // if (row_index !== -1 && props.StockSymbol !== '' && props.StockSymbol !== undefined  
  // && props.stockChartYValues.length !== 0)
  //   searchDeepValue (); 




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
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

  return (
    <div style = {style} id='deepRecovery_id' >
      <div>
            <input
              type="checkbox" checked={displayFlag}
              onChange={displayFlagChange}
            /> Drop-Recovery
      </div>
      {displayFlag && 
        <div> 
          {/* <button type="button" onClick={()=>searchDeepValue()}>Drop_recovery    </button>     */}


          <div  style={{display:'flex', }}> 
            <div style={{color: 'magenta'}}  > Start_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={props.deepStartDate} onChange={(date) => props.setDropStartDate(date)} /> 

          </div>

          {/* <DatePicker dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />  */}
          <div style={{display:'flex', }}> 
            <div style={{color: 'magenta'}}>Main Drop period: &nbsp; </div>
            <button type="button" onClick={()=>swap_period_2008()}>  2008   </button>
            <button type="button" onClick={()=>swap_period_2020()}>  2020   </button>
            <button type="button" onClick={()=>swap_period_2022()}>  2022   </button>
          </div>
          {/* <button type="button" onClick={()=>swap_period_8_mon()}>  last_8_Months    </button> */}
          <button type="button" onClick={()=>toggleDropRecoveryColumns()}>Drop_recovery_columns    </button>

        </div>
      }
    </div>
  )
}

export {DropRecoveryButtons, searchDeepValue}