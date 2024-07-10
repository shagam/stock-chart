import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from '../utils/Date'

//import './DropRecovery.css'



function searchDeepValue (rows, StockSymbol, stockChartXValues, stockChartYValues, deepCallBack, startDate, logFlags, weekly, gainObj, errorAdd) {

    const LOG_FLAG = logFlags && logFlags.includes('drop');

    if (StockSymbol === undefined || StockSymbol === '' || stockChartXValues === undefined) {
      alert ('Need to click <gain> for a symbol before calc deep recover')
      return;
    }

    function gainClose(i) {return Number(gainObj[stockChartXValues[i]]['5. adjusted close'])}
   
    // console.log (gainObj[stockChartXValues[0]]['2. high'], gainObj[stockChartXValues[0]]['3. low'])
    
    // if(LOG_FLAG) 
    //   console.log (gainHigh(0), gainLow(0), gainObj[stockChartXValues[0]])

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMon = today.getMonth() + 1;
    const todayDay = today.getDate();

    const startYear = startDate.getFullYear();
    const startMon = startDate.getMonth() + 1;
    const startDay = startDate.getDate();

      

    // var startBeforeDropWeek = (todayYear - startYear) * 52 + (todayMon - startMon) * 4.34 + (todayDay - startDay) / 4.34;
    // startBeforeDropWeek = Math.round(startBeforeDropWeek);

    const startDateArray = [startYear, startMon, startDay]
    var startBeforeDropIndex = searchDateInArray (stockChartXValues, startDateArray, StockSymbol, logFlags)  
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
    const deep_ = (errorAdd) => {
      // deepPrice = Number(stockChartYValues[startBeforeDropIndex]);
      if (startBeforeDropIndex === -1) {
        console.log (StockSymbol, 'DropRecovery: Fail to calc deep date')
        // errorAdd([StockSymbol,'DropRecovery: Fail to calc deep date'])
        return;
      }
      const startBeforeDropValue = gainClose(startBeforeDropIndex) // gainObj[stockChartXValues[startBeforeDropIndex]]['3. low']
      deepPrice = startBeforeDropValue;
      deepDate = stockChartXValues[startBeforeDropIndex];
      for (var i = startBeforeDropIndex; i >= 0; i--) {
        // search for lowestPrrice 
        const price = gainClose(i) // [i]]['3. low'])
        if (deepPrice > price) {
          deepPrice = price;
          deepIndex = i;
          deepDate = stockChartXValues[i];
        }
      }
      if (LOG_FLAG) {
        console.log (StockSymbol, 'deep search start', startBeforeDropValue, '(' + stockChartXValues[startBeforeDropIndex] +'}', 
        'index:', startBeforeDropIndex);
        // console.log (StockSymbol, 'deepPrice:', deepPrice, '('+ deepDate + ')', 'deepIndex:', deepIndex );
      }
    }

    const recoverFactor = 0.97; // recover criteria when close enough
    // search for higest befor deep
    const highistBeforeDeep = (errorAdd) => {
      if (startBeforeDropIndex < 0 || deepIndex < 0) {
        console.log (StockSymbol, 'DroRecovery: Fail to calc highistBeforeDeep ')
        // errorAdd([StockSymbol,'DroRecovery: Fail to calc highistBeforeDeep '])
        return;
      }
      for (let i = deepIndex; i <= startBeforeDropIndex; i++) { 
        const price = gainClose(i)
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

    const recoveryWeeks = (errorAdd) => {
      for (let i = deepIndex; i >= 0; i--) {      
        const price = gainClose(i)
        // console.log (price)
        if (i === 0) { // for debug of last iteration
          const a = 1;
          const b = 1;
        }
        if (highPriceBeforeDeep * recoverFactor < price) {
            highPriceAfterDeep = price;
            recoverIndex = i;
            recoverDate = stockChartXValues[i];
            break; // recovery found
        }
      }
      recoverPeriod = (highPriceAfterDeep > (highPriceBeforeDeep * recoverFactor)) ? highPriceBeforeDeepIndex - recoverIndex : -1;

      // avoid multiple cals of deep
      const index = rows.findIndex((row)=> row.values.symbol === StockSymbol);
      if (index === -1) {
        alert (`crash recovery symbol not found recoveryWeeks (${StockSymbol})`);
        // errorAdd([StockSymbol,'crash recovery symbol not found recoveryWeeks'])
        return;
      } 
      // if (rows[index].values.deep === deep)
      //   return;

      if (LOG_FLAG) {
        console.log (StockSymbol, 'deepPrice:', deepPrice, '('+ deepDate + ')', ' deep:', deep, 'index:', deepIndex );
        const recoverText = weekly ? 'recoveryWeeks' : 'recoveryDays'
        console.log (StockSymbol, 'highBeforeDeep:', highPriceBeforeDeep, '('+ highPriceDateBeforeDeep +')', ' index: ',  highPriceBeforeDeepIndex)
        console.log (StockSymbol, 'highAfterDeep:', highPriceAfterDeep, '('+ recoverDate +')', ' recoverIndex:', recoverIndex,  recoverText + '(since high):', recoverPeriod);
      }  
    }


    const startDateSplit = [startYear, startMon, startDay];
    const todayDateSplit = dateSplit( todayDate());
    const todayDaysSince1970 = daysFrom1970 (todayDateSplit);
    const startDaysSince1970 = daysFrom1970 (startDateSplit);
    // if (Math.abs (daysFrom1970 (todayDateSplit) - daysFrom1970(startDateSplit)) > 250) {  // more than 6 months
    // deep-recovery
    deep_(errorAdd);
    if (startBeforeDropIndex === -1) { // start date out of range
      return;
    }
    highistBeforeDeep(errorAdd);
    recoveryWeeks(errorAdd);
    const lastPriceHigh = gainClose(0);
    const priceDivHigh = Number(lastPriceHigh / highPriceBeforeDeep).toFixed(3);
    if (LOG_FLAG)
      console.log (StockSymbol, 'latestPrice:', stockChartYValues[0], '(' + stockChartXValues[0] +')', 'price/highBeforeDrop=', priceDivHigh)
    // fill columns in stock table
    // if (recoverPeriod === undefined)
    //   alert (StockSymbol + ' recoverWeek undef')
    deepCallBack (StockSymbol, deep, deepIndex, recoverPeriod, deepDate, priceDivHigh); //format(startDate, "yyyy-MMM-dd"));
    const index = rows.findIndex((row)=> row.values.symbol === StockSymbol);  
    if (index === -1) {
      alert ('crash recovery symbol not found deep ' + StockSymbol);
      return;
    } 

    // rows[index].values.deep = Number(deep);
    // rows[index].values.recoverWeek = Number(recoverPeriod);
    // rows[index].values.deepDate = deepDate;
    // rows[index].values.priceDivHigh = Number(priceDivHigh);
    // rows[index].values.deepUpdateMili = Date.now();
  }



// visible part
const DropRecoveryButtons = (props) => {
  // props.StockSymbol
  // props.rows
  // props.allColumhs
  // props.deepStartDate
  // props.setDropStartDate
  // 

   // const [startDate, setStartDate] = useState(new Date(2020, 1, 5)); // feb 5 2020

   // const [endDate, setEndDate] = useState(new Date(2020, 4, 15)); // may 15 2020
   //  2007, 11, 1  2008 deep

  function swap_period_2008() {

    props.setDropStartDate (new Date(2008, 9, 15)); // 2007 Oct 15  
      // setEndDate (new Date(2009, 1, 1));
  }

  function swap_period_2020() {
    props.setDropStartDate (new Date(2020, 1, 5));  // 2020 Feb 5
    // setEndDate (new Date(2020, 4, 15));
  }

  function swap_period_2022() {
    props.setDropStartDate (new Date(2021, 8, 1));  // 2022 sep 1 
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

   // style={{display:'flex'}}


  function closeDates(deepDate, startDate, errorAdd) {

    const deepDateSplit = dateSplit (deepDate)
    const dateDeep = new Date(deepDateSplit[0], deepDateSplit[1], deepDateSplit[2])
    const deepDateMili = dateDeep.getTime()


    const startYear = startDate.getFullYear();
    const startMon = startDate.getMonth();
    const startDay = startDate.getDate();
    const date = new Date (startYear, startMon, startDay); // mon 0..11
    // console.log (date)
    const startMili = date.getTime();

    const sixMonthsMili = 1000 * 60 * 60 * 24 * 30 * 16;

    const absDiff = Math.abs (startMili - deepDateMili);
    if (absDiff < sixMonthsMili)
      return true;
    else {
      console.log ('big date diff', 'deepDate', deepDate, 'startDate', startDate)
      // errorAdd ([props.StockSymbol, 'big date diff, deepDate' + deepDate + 'startDate'+ startDate])
      return false;
    }
  }

  return (
    <div style = {{border: '2px solid blue'}} id='deepRecovery_id' > 
        <div>
          <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {props.StockSymbol} </div>  &nbsp; &nbsp;
            <h6 style={{color: 'blue'}}> DropRecovery  </h6>
          </div>
        
          {/* <button type="button" onClick={()=>searchDeepValue()}>Drop_recovery    </button>     */}


          <div  style={{display:'flex', }}> 
            <div style={{color: 'black'}}  > Start_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={props.deepStartDate} onChange={(date) => props.setDropStartDate(date)} /> 

          </div>

          {/* <DatePicker dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />  */}
          <div style={{display:'flex', }}> 
            <div style={{color: 'black'}}>Main Drop period: &nbsp; </div>
            <button type="button" onClick={()=>swap_period_2008()}>  2008   </button> &nbsp;
            <button type="button" onClick={()=>swap_period_2020()}>  2020   </button> &nbsp;
            <button type="button" onClick={()=>swap_period_2022()}>  2022   </button> &nbsp; &nbsp;
            <button type="button" onClick={()=>toggleDropRecoveryColumns()}>Drop_recovery_columns    </button>
          </div>
          {/* <button type="button" onClick={()=>swap_period_8_mon()}>  last_8_Months    </button> */}
   

          <br></br>  
          {props.StockSymbol && row_index >= 0 &&
            <div style={{display:'flex'}} >
              &nbsp;  deepDate: <div style={{ color: 'green'}}>  &nbsp; {props.rows[row_index].values.deepDate} </div>
              &nbsp;&nbsp;&nbsp;&nbsp; deep:  <div style={{ color: 'green'}}> &nbsp; {props.rows[row_index].values.deep}</div>
              &nbsp;&nbsp;&nbsp;&nbsp; recoverWeek:  <div style={{ color: 'green'}}> &nbsp; {props.rows[row_index].values.recoverWeek} </div>
            </div>
          }
          {! closeDates(props.rows[row_index].values.deepDate, props.deepStartDate,props.errorAdd) && 
            <h5 style={{color:'red'}}>Date mismatch, Press Gain for a stock </h5>}
          
        </div>

    </div>
  )
}

export {DropRecoveryButtons, searchDeepValue}