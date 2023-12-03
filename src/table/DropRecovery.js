import React, {useState, } from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'

//import './DropRecovery.css'



function searchDeepValue (rows, StockSymbol, stockChartXValues, stockChartYValues, deepCallBack, startDate, logFlags, weekly, gainObj) {

    const LOG_FLAG = logFlags && logFlags.includes('drop');

    if (StockSymbol === undefined || StockSymbol === '' || stockChartXValues === undefined) {
      alert ('Need to click <gain> for a symbol before calc deep recover')
      return;
    }

    function gainHigh(i) {return Number(gainObj[stockChartXValues[i]]['2. high'])}
    function gainLow(i) {return Number(gainObj[stockChartXValues[i]]['3. low'])}
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
    const deep_ = () => {
      // deepPrice = Number(stockChartYValues[startBeforeDropIndex]);
      const startBeforeDropValue = gainLow(startBeforeDropIndex) // gainObj[stockChartXValues[startBeforeDropIndex]]['3. low']
      deepPrice = startBeforeDropValue;
      deepDate = stockChartXValues[startBeforeDropIndex];
      for (var i = startBeforeDropIndex; i >= 0; i--) {
        // search for lowestPrrice 
        const price = gainLow(i) // [i]]['3. low'])
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

    const recoverFactor = 1//0.94; // recover criteria when close enough
    // search for higest befor deep
    const highistBeforeDeep = () => {
      for (let i = deepIndex; i <= startBeforeDropIndex; i++) { 
        const price = gainHigh(i)
        if (highPriceBeforeDeep * recoverFactor < price) {  // at least weeks to recover
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
        const price = gainHigh(i)
        // console.log (price)
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
        alert (`crash recovery symbol not found (${StockSymbol})`);
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
    const lastPriceHigh = gainHigh(0);
    const priceDivHigh = Number(lastPriceHigh / highPriceBeforeDeep).toFixed(3);
    if (LOG_FLAG)
      console.log (StockSymbol, 'latestPrice:', stockChartYValues[0], '(' + stockChartXValues[0] +')', 'price/highBeforeDrop=', priceDivHigh)
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
    props.setDropStartDate (new Date(2021, 11, 1));  // 2021 dec 1 
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
          <div  style={{color: 'magenta' }}>  {props.StockSymbol} </div>
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
          {props.StockSymbol && row_index>0 && 
            <div style={{display:'flex'}} >
             &nbsp;  deepDate:  {props.rows[row_index].values.deepDate} 
              <div style={{ color: 'green'}}>
                &nbsp;&nbsp; deep:  {props.rows[row_index].values.deep}
                &nbsp;&nbsp; recoverWeek:  {props.rows[row_index].values.recoverWeek} 
              </div>
            </div>
          }
          
        </div>
      }
    </div>
  )
}

export {DropRecoveryButtons, searchDeepValue}