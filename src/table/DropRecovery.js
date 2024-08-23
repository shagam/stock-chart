import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from '../utils/Date'
// https://www.bing.com/images/search?view=detailV2&ccid=aFW4cHZW&id=6D049FD8DC50EB783F293095F4D2034FE7D10B27&thid=OIP.aFW4cHZWMQwqN8QwIHsY7gHaHa&mediaurl=https%3A%2F%2Fplay-lh.googleusercontent.com%2FR16wfSDOBRBrq_PqUU5QEpXRqolgkz7_uA1AfWHlwSf_YAtXmCZzJ2r_0gtoPAUQid0&cdnurl=https%3A%2F%2Fth.bing.com%2Fth%2Fid%2FR.6855b8707656310c2a37c430207b18ee%3Frik%3DJwvR508D0vSVMA%26pid%3DImgRaw%26r%3D0&exph=512&expw=512&q=javascript+color+palette&form=IRPRST&ck=BBE11C15A669D97D75821C870360A6A3&selectedindex=1&itb=0&ajaxhist=0&ajaxserp=0&vt=0&sim=11&pivotparams=insightsToken%3Dccid_CMIgOlHf*cp_AEE83D7224698DFA21F17F4EDB502DD7*mid_8754ECD265B6FA7F97B04B7FE5180D010BCA1E43*simid_608019528560619377*thid_OIP.CMIgOlHfVZ-tTBbH9y8bGgHaGJ&iss=VSI&ajaxhist=0&ajaxserp=0
//import './DropRecovery.css'

// visible part
const DropRecoveryButtons = (props) => {
  // props.StockSymbol
  // props.rows
  // props.allColumhs
  // props.deepStartDate
  // props.setDropStartDate
  // 
  const [gainLostWeeks, setGainLostWeeks] = useState()
  const [dateOfEqualVal, setDateOfEqualVal] = useState()
  const [dropStartDate, setDropStartDate] = useState(new Date(2024, 6, 1));  // 2024 jul 1  // new Date(2021, 8, 1 2021 sep 1  
   // const [startDate, setStartDate] = useState(new Date(2020, 1, 5)); // feb 5 2020

   const [dropRecoveryInfo, setDropRecoveryInfo] = useState()

  //** used by dropRecovery */
  const weekly = true;
  var periodTag;
  if (weekly)
    periodTag = 'Weekly Adjusted Time Series';
  else
    periodTag = "Time Series (Daily)"

   useEffect (() => { 
    setDropRecoveryInfo()
    setGainLostWeeks()
    setDateOfEqualVal()
  }, [props.StockSymbol, dropStartDate]) 



function dropRecovery (rows, StockSymbol, stockChartXValues, stockChartYValues, startDate, logFlags, weekly, gainObj, errorAdd) {

  const LOG_DROP = logFlags && logFlags.includes('drop_');

  const deepCallBack = (stockSymbol, deep, deepWeek, recoverWeek, deepDate, priceDivHigh) => {
    //console.log (stockSymbol, deep, deepWeek, recoverWeek);
    const index = rows.findIndex((row)=> row.values.symbol === stockSymbol);
    if (index === -1) {
      alert (`crash recovery symbol not found, deep (${stockSymbol})`);
      return;
    } 
    // rows[index]values.
    rows[index].values.deep = Number(deep);
    rows[index].values.recoverWeek = Number(recoverWeek);
    rows[index].values.deepDate = deepDate;
    rows[index].values.priceDivHigh = Number(priceDivHigh);
    rows[index].values.deepUpdateMili = Date.now();
    if (LOG_DROP) {
      console.log(stockSymbol, 'old deep:', rows[index].values.deep, 'recoverIndx:', rows[index].values.recoverWeek,
      'deep date/val:', rows[index].values.deepDate, rows[index].values.priceDivHigh)

      console.log (stockSymbol, 'new deep:', deep, deepWeek, recoverWeek, deepDate, priceDivHigh)
    }
  }


    const LOG_FLAG = logFlags && logFlags.includes('drop');

    if (StockSymbol === undefined || StockSymbol === '' || stockChartXValues === undefined) {
      alert ('Need to click <gain> for a symbol before calc deep recover')
      return;
    }

    const END_OF_DAY = false; // ignore in week high low

    function gainHigh(i) {
      if (END_OF_DAY)
        return  Number(gainObj[stockChartXValues[i]]['5. adjusted close'])
      const high = Number(gainObj[stockChartXValues[i]]['2. high']) * 
        Number(gainObj[stockChartXValues[i]]['5. adjusted close']) / 
        Number(gainObj[stockChartXValues[i]]['4. close']) 
      return high.toFixed(3);
    }

    function gainLow(i) {
      if (END_OF_DAY)
        return  Number(gainObj[stockChartXValues[i]]['5. adjusted close'])
      const low = Number(gainObj[stockChartXValues[i]]['3. low']) * 
        Number(gainObj[stockChartXValues[i]]['5. adjusted close']) / 
        Number(gainObj[stockChartXValues[i]]['4. close']) 
      return low.toFixed(3);
    }

    function gainClose(i) {return Number(gainObj[stockChartXValues[i]]['5. adjusted close'])}
    if (LOG_DROP) {
      console.log (gainObj[stockChartXValues[stockChartXValues.length-1]])
      console.log ('high=', gainHigh(stockChartXValues.length-1), 'low=', gainLow(stockChartXValues.length-1), 'close=', gainClose(stockChartXValues.length-1))
    }
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

    //** Search for value like deep before deep */
    function gainLostWeeksIfSoldOnDeep (StockSymbol, stockChartYValues, deepIndex, deepPrice ) {
      if (stockChartYValues.length < deepIndex - 10)
        return -1;
      for (let i = deepIndex + 10; i < stockChartYValues.length; i++) {
        if (stockChartYValues[i] < deepPrice)
          return i - deepIndex;
      }
    }

    // search for deepPrice after start date
    const deep_ = (errorAdd) => {
      // deepPrice = Number(stockChartYValues[startBeforeDropIndex]);
      if (startBeforeDropIndex === -1) {
        console.log (StockSymbol, 'DropRecovery: Fail to calc deep date')
        // errorAdd([StockSymbol,'DropRecovery: Fail to calc deep date'])
        return;
      }
      const startBeforeDropValue = Number(gainLow(startBeforeDropIndex)) // gainObj[stockChartXValues[startBeforeDropIndex]]['3. low']
      deepPrice = startBeforeDropValue;
      deepDate = stockChartXValues[startBeforeDropIndex];
      for (var i = startBeforeDropIndex; i >= 0; i--) {
        // search for lowestPrrice 
        const price = Number(gainLow(i)) // [i]]['3. low'])
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
        const price = Number(gainHigh(i))
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
        const price = Number(gainHigh(i))
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
        console.log (StockSymbol + ' deepPrice=' + deepPrice + ' ('+ deepDate + ')' + '%c deep=' + deep , 'background: #fff; color: #f53df3' , 'index=' + deepIndex );
        const recoverText = weekly ? 'recoveryWeeks' : 'recoveryDays'
        console.log (StockSymbol, 'highBeforeDeep=' + highPriceBeforeDeep.toFixed(2) + ' ('+ highPriceDateBeforeDeep +')', ' index=' +  highPriceBeforeDeepIndex)
        console.log (StockSymbol + ' highAfterDeep=' + highPriceAfterDeep.toFixed(2) + ' ('+ recoverDate +') %c' + recoverText + '=' + recoverPeriod , 'background: #fff; color: #f53df3', ' index=' + recoverIndex);
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

    const gainLostWeeks = gainLostWeeksIfSoldOnDeep (StockSymbol, stockChartYValues, deepIndex, deepPrice, )
    console.log (StockSymbol, 'gainLostWeeks-IfSoldOnDeep=', gainLostWeeks)

    highistBeforeDeep(errorAdd);
    recoveryWeeks(errorAdd);
    const lastPriceHigh = Number(gainClose(0));

    var highestPrice = -1; // highest price
    for (let i = 0; i < stockChartYValues.length; i++) {
      if (stockChartYValues[i] > highestPrice)
        highestPrice = stockChartYValues[i];
    }

    const priceDivHigh = Number(lastPriceHigh / highestPrice).toFixed(3);
    if (LOG_FLAG)
      console.log (StockSymbol + ' latestPrice=' + stockChartYValues[0] + ' (' + stockChartXValues[0] +') ' + ' %cprice/highBeforeDrop=' + priceDivHigh, 'background: #fff; color: #f53df3')
    // fill columns in stock table
    // if (recoverPeriod === undefined)
    //   alert (StockSymbol + ' recoverWeek undef')
    deepCallBack (StockSymbol, deep, deepIndex, recoverPeriod, deepDate, priceDivHigh); //format(startDate, "yyyy-MMM-dd"));
    const index = rows.findIndex((row)=> row.values.symbol === StockSymbol);  
    if (index === -1) {
      alert ('crash recovery symbol not found deep ' + StockSymbol);
      return;
    } 

    setDropRecoveryInfo ({
      symbol: StockSymbol,
      deep: deep,
      recoverPeriod: recoverPeriod,
      deepDate:    deepDate,
      priceDivHigh: priceDivHigh,
      gainLostWeeks: gainLostWeeks,
      deepIndex: deepIndex,
    })
    // rows[index].values.deep = Number(deep);
    // rows[index].values.recoverWeek = Number(recoverPeriod);
    // rows[index].values.deepDate = deepDate;
    // rows[index].values.priceDivHigh = Number(priceDivHigh);
    // rows[index].values.deepUpdateMili = Date.now();
  }

   // const [endDate, setEndDate] = useState(new Date(2020, 4, 15)); // may 15 2020
   //  2007, 11, 1  2008 deep

  function swap_period_2008() {
    var startBeforeDropIndex = searchDateInArray (props.stockChartXValues, [2008, 0, 1], props.StockSymbol, props.logFlags)  
    if (startBeforeDropIndex === -1 || props.stockChartYValues.length <= startBeforeDropIndex) {
      props.errorAdd([props.StockSymbol, '[2008, 0, 1]', 'Date before available data'])
      return;
    }

    setDropStartDate (new Date(2008, 1, 15)); // 2007 Oct 15  
      // setEndDate (new Date(2009, 1, 1));
  }

  function swap_period_2020() {
    var startBeforeDropIndex = searchDateInArray (props.stockChartXValues, [2020, 0, 1], props.StockSymbol, props.logFlags)  
    if (startBeforeDropIndex === -1 || props.stockChartYValues.length <= startBeforeDropIndex) {
      props.errorAdd([props.StockSymbol, '[2020, 0, 1]', 'Date before available data'])
      return;
    }
    setDropStartDate (new Date(2020, 0, 1));  // 2020 jan 1
    // setEndDate (new Date(2020, 4, 15));
  }

  function swap_period_2022() {
    setDropStartDate (new Date(2021, 8, 1));  // 2022 sep 1 
    // setEndDate (new Date(2020, 4, 15));
  }
  
  function swap_period_2024() {
    setDropStartDate (new Date(2024, 6, 1));  // 2024 jul 1 
    // setEndDate (new Date(2020, 4, 15));
  }

  function swap_period_8_mon() {
    var date = new Date();
    var formattedDate = format(date, "yyyy-MM-dd");
    var dateArray = formattedDate.split('-');

    // date = date.split('T')[0];
    const dateArray1 = monthsBack (dateArray, 8);
    const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
    setDropStartDate (new Date(dateStr));
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
      console.log ('date mismatch. need to gain click', 'deepDate', deepDate, 'startDate', startDate)
      // errorAdd ([props.StockSymbol, 'big date diff, deepDate' + deepDate + 'startDate'+ startDate])
      return false;
    }
  }

  function gainLostWeeksCalc () {
      // find highest index
      var highValue = props.stockChartYValues[0]
      var highIndex = 0;
      for (let i = 0; i < props.stockChartXValues.length; i++) {
        if (props.stockChartYValues[i] > highValue) {
          highValue = props.stockChartYValues[i];
          highIndex = i;
          break;
        }
      }
      
      // search for value lower than today.
      setGainLostWeeks(-1)
      for (let i = highIndex; i < props.stockChartXValues.length; i++) {
        if (props.stockChartYValues[i] < props.stockChartYValues[0]) {
          setGainLostWeeks(i)
          setDateOfEqualVal(props.stockChartXValues[i])
          return;
        }
      }
  }


  return (
    <div style = {{border: '2px solid blue'}} id='deepRecovery_id' > 
        <div>
          <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {props.StockSymbol} </div>  &nbsp; &nbsp;
            <h6 style={{color: 'blue'}}> DropRecovery  </h6>
          </div>
        
          <div  style={{display:'flex', }}> 
            <div style={{color: 'black'}}  > Date of High-before-drop:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={dropStartDate} onChange={(date) => setDropStartDate(date)} /> 

          </div>

          {/* <DatePicker dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />  */}
          <div style={{display:'flex', }}> 
            <div style={{color: 'black'}}>Drop period: &nbsp; </div>
            <button type="button" onClick={()=>swap_period_2008()}>  2008   </button> &nbsp;
            <button type="button" onClick={()=>swap_period_2020()}>  2020   </button> &nbsp;
            <button type="button" onClick={()=>swap_period_2022()}>  2022   </button> &nbsp;
            <button type="button" onClick={()=>swap_period_2024()}>  2024   </button> &nbsp; &nbsp;
            <button type="button" onClick={()=>toggleDropRecoveryColumns()}>Drop_recovery_columns    </button>
          </div>

          <button type="button" onClick={()=>dropRecovery(props.rows, props.StockSymbol, props.stockChartXValues, props.stockChartYValues, 
            dropStartDate, props.logFlags, props.weekly, props.chartData[`${periodTag}`], props.errorAdd)}>  DropRecoveryCalc    </button>
   
          <pre>{JSON.stringify(dropRecoveryInfo, null, 2)}</pre>

          {/* <br></br>   */}
          <hr/> 

          <h5>TodayGainWeeksLost</h5>
          <button type="button" onClick={()=>gainLostWeeksCalc()}>  calc   </button> &nbsp;         
          <h6>price/high={props.rows[row_index].values.priceDivHigh}  &nbsp; &nbsp;  GainWeeksLost={gainLostWeeks}  &nbsp;  dateWithTodayVal={dateOfEqualVal}</h6>
        </div>
    </div>
  )
}

export {DropRecoveryButtons}
