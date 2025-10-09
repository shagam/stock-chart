
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
// import {IpContext} from '../contexts/IpContext';
import GetInt from '../utils/GetInt'
import {format, set} from "date-fns"
import {todayDate, getDate_YYYY_mm_dd__, getDate} from '../utils/Date';
import {beep2} from '../utils/ErrorList'
import { el } from 'date-fns/locale';
import StockOptionsConfig from './StockOptionsConfig';
import { FaCheckSquare } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa';
// 
// Zuberi Moshe

// 

// 


function OptionQuote (props) {

  // const [quote, setQuote] = useState(null);
  // const optionSymbol = 'AAPL'+'250817C00' + '150000'; // Jan 2025 $150 AAPL Call
  const TOKEN = process.env.REACT_APP_MARKETDATA;
  // var url = 'https://marketdata.app/api/v1/marketdata?token=' + TOKEN;

  const [log, setLog] = useState (props.eliHome); // default to true if eliHome is true
  const [logExtra, setLogExtra] = useState (false);
  const [ignoreSaved, setIgnoreSaved] = useState (false);
  const [hideNegativeYield, setHideNegativeYield] = useState (true);

  const [expirationsArray, setExpirationsArray] = useState([]); 
  const [expirationSelected, setExpirationSelected] = useState(-1) // for display only
  const [premiumSelected, setPremiumSelected] = useState(-1) // index of selected premium

  const [strikeArray, setStrikeArray] = useState([]);

  const [strikeNumCalc,setStrikeNumCalc] = useState(-1) // for display only
  
  const [row_index, setRow_index] = useState(props.rows.findIndex((row)=> row.values.symbol === props.symbol)) // index of the stock in props.rows

  // var yearlyGain = props.rows[row_index].values.peak2Peak;
  // if (! yearlyGain)
  //   yearlyGain = props.rows[row_index].values.short
  const priceDivHigh = props.rows[row_index].values.priceDivHigh;
  const bubblePrice  = props.rows[row_index].values.bubblePrice ;
  const [belowBubble, setBelowBubble] = useState(-1) // stock price is below bubble line
  const [estimatedYearlyGain, setEstimatedYearlyGain] = useState((Number(props.yearlyGain) - 1) * 100); // estimated yearly gain


  const [optionQuote, setOptionQuote] = useState({});
  const [optionKeys, setOptionKeys] = useState([]);

  const [bestYearlyYield, setBestYearlyYield] = useState(0); // max yearly yield for all options
  const [bestYearlyYieldIndex, setBestYearlyYieldIndex] = useState(-1); // index of max yearly yield

  const [columnHideFlag, setColumnHideFlag] = useState(false);
  const [columnShow, setColumnShow] = useState([]);
  const [err, setErr] = useState();
  const [latency, setLatency] = useState();
  const [compareStatus, setCompareStatus] = useState();

  const [expirationShow, setExpirationShow] = useState(false);
  const [strikeShow, setStrikeShow] = useState(false);
  const [configShow, setConfigShow] = useState(false);

  // const [useOptionServer, setUseOptionServer] = useState(props.eliHome);
  // const [arr, setArr] = useState([]);
  const [dat, setDat] = useState({});

  const COLUMNS = 'stockOptionColumns';
  const columnsAll = [
    "expiration","firstTraded","updated","underlying","side","strike","dte","bid","bidSize","mid","ask",
    "askSize","last","openInterest","volume","inTheMoney","intrinsicValue","extrinsicValue",
    "underlyingPrice","iv","delta","gamma","theta","vega"]
 const columnsDefault = [
    "expiration","underlying","side","strike","dte","ask","yield_", "yearlyYield", "expectedPrice","profit"]


  var columnShow_= useMemo(() => JSON.parse (localStorage.getItem(COLUMNS )), []);
  if (! columnShow_  ) {
    columnShow_ = columnsDefault;
    localStorage.setItem(COLUMNS, JSON.stringify(columnShow_)); // set default columnShow
    if (logExtra)
      console.log ('columnShow init', columnShow_.length, columnShow_)
  }

  function columnsSetDefault () {
    setColumnShow(columnsDefault)
    localStorage.setItem(COLUMNS, JSON.stringify(columnsDefault)); // set default columnShow
  }


  //* config persistant storage */
  const CONFIG_KEY = 'stockOptionsConfig';
  const [config, setConfig_] = useState(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : {expirationCount: 3, expirationNum:250, strikeCount: 3, strikeNum: 3,
      side: 'call', percent: true, compoundYield: false, action: 'buy'}
  });

  function setConfig (newConfig) {
    setConfig_(newConfig)
    localStorage.setItem( CONFIG_KEY, JSON.stringify(newConfig));
  }




  if (columnShow.length === 0) {// if columnShow is empty, restore from localStorage
    console.log ('columnShow from localStorage ', columnShow_)
    setColumnShow (columnShow_)
  }
// (26) ['s', 'optionSymbol', 'underlying', 'expiration', 'side', 'strike', 'firstTraded', 'dte', 'updated', 'bid', 'bidSize', 'mid', 'ask', 'askSize', 'last', 'openInterest', 'volume', 'inTheMoney', 'intrinsicValue', 'extrinsicValue', 'underlyingPrice', 'iv', 'delta', 'gamma', 'theta', 'vega']
 
  // useEffect (() => { 
  //   localStorage.setItem(COLUMNS, JSON.stringify(columnShow));
  //   if (logExtra) {
  //     console.log ('save columnShow', columnShow) 
  //   }

  // }, [columnShow, log, logExtra, props.eliHome, props.symbol, props.errorAdd]); 




  //** check if there is irregular premium, e.g. higher strike with lower mis premium */
  // strikes are ordered from low to high
  function irregularPremium () {
    var irregularCount = 0;
    // console.log (optionQuote.length, optionQuote)
    var expiration = optionQuote.expiration[0];
    for (let i = 1; i < optionQuote.expiration.length; i++) {
      if (optionQuote.expiration[i] !== optionQuote.expiration[i-1])
        continue; // different expiration, skip
        
        if (optionQuote.ask[i] > optionQuote.ask[i-1]) {
          props.errorAdd ([props.symbol, 'irregular premium', 'indx=' + i, 'strike/ask=', optionQuote.strike[i-1], optionQuote.ask[i-1], 'strike/ask=' , optionQuote.strike[i],  optionQuote.ask[i]])
          irregularCount++;
      }   
    }
    console.log (props.symbol, 'irregular premium count=' + irregularCount)
  }



  function getExpirationDayIndex (expirationsArray) {
    var expirationDayIndex = -1;
    const todayDays = new Date().getTime() / 1000 / 3600 / 24
    // console.log ('today=' + todayDays)
    for (let i = 0; i < expirationsArray.length; i++) {
      const expirationDays = new Date(expirationsArray[i]).getTime() / 1000 / 3600 / 24
      if (logExtra)
        console.log (i, 'today=' + todayDays.toFixed(2), expirationsArray[i],  'expirationDays=' + expirationDays)
      if (expirationDays > todayDays + Number(config.expirationNum)) {
        expirationDayIndex = i;  // found requre expiration
        setExpirationSelected(i) // for display only
        return i;
      }
    }
    return -1  // not found
  }

        
  //** Get option premium for selected expiration and strike */
  function optionPremium (expirationsArray, strikeArray) {
    console.log ('ptionPremiumGet', expirationsArray, strikeArray)
    //** clear */
    // setOptionQuote({})
    const expirationDayIndex = getExpirationDayIndex (expirationsArray)
    if (expirationDayIndex === -1) { // expirationIndex not found
      console.log ('fail, expirationDayIndex not found')
      setErr('fail, expirationDayIndex not found')
      beep2()
      return;
    }

    //** create expiration group */

    var expirationGroup
    if (config.expirationCount <= 1)
     expirationGroup =  '/?expiration=' + expirationsArray[expirationDayIndex]
    else {
      if (expirationDayIndex + config.expirationCount < expirationsArray.length)
        expirationGroup =  '/?from=' + expirationsArray[expirationDayIndex] + '&to=' + expirationsArray[expirationDayIndex+ config.expirationCount -1]
      else {
        console.log ('expirationCount too big, reduce it')
        return
      }
    }

 
    //** Create strike-group  (list) */

    var strikeGroup = strikeArray[config.strikeNum];
    
    for (let i = 1; i < config.strikeCount; i++) {
      if (config.strikeNum + i >= strikeArray.length)
        break;
      strikeGroup += ',' + strikeArray[config.strikeNum + i]
    }
    if (log) {
      console.log ('strikeGroup=', strikeGroup) 
      console.log ('expirationGroup=', expirationGroup)
    }
    
    // url = 'https://api.marketdata.app/v1/options/quotes/' + props.symbol
    const url = 'https://api.marketdata.app/v1/options/chain/'+ props.symbol 
        + expirationGroup
        + '&side=' + config.side + '&strike=' + strikeGroup + '&token=' + TOKEN
        // + '?human=true';

    // console.log(props.symbol , 'expirations=', expirationGroup, '&side=' + side + '&strike=' + strikeGroup)
    // const TEST = 'https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25'
    // url = TEST;
    if (log)
      console.log (getDate(), props.symbol, url)
    setErr()
    setDat()
    setLatency('request sent ...')

    axios.get (url)
    .then ((result) => {
      if (log)
        console.log ('primium', result.data)

      if (result.data.s !== 'ok') {
        props.errorAdd ([props.symbol, 'option-fee error', result.data.s])
        console.log (props.symbol, 'option-fee error', result.data.s)
        return
      }

      //** copy and convert date format of result.data */

      var OptionQuoteFiltered = {}
      OptionQuoteFiltered.expiration = [] 
      OptionQuoteFiltered.firstTraded = []
      OptionQuoteFiltered.updated = []
      const rows = result.data.expiration.length;  // row count
      Object.keys(result.data).forEach((key) => {

        // delete result.data.optionSymbol
        // delete result.data.s
        if (key === 's' || key === 'optionSymbol')
          return;

          // convert date to YYYY-mm-dd format
          OptionQuoteFiltered[key] = []
          for (let i = 0; i < rows; i++) {
            if (key === 'expiration' || key === 'firstTraded' || key === 'updated') {
              OptionQuoteFiltered.expiration[i] = getDate_YYYY_mm_dd__(new Date(result.data.expiration[i] * 1000))
              OptionQuoteFiltered.firstTraded[i] = getDate_YYYY_mm_dd__(new Date(result.data.firstTraded[i] * 1000))
              OptionQuoteFiltered.updated[i] = getDate_YYYY_mm_dd__(new Date(result.data.updated[i] * 1000))
            }
            else {
              OptionQuoteFiltered[key][i] = result.data[key][i]; // all other just copy
            }

          }
        } )
      console.log ('filtered', OptionQuoteFiltered)

 
      //** calc yearly yield */
      const miliNow = Date.now()
      OptionQuoteFiltered.yield_ = OptionQuoteFiltered.yield_ || [];
      OptionQuoteFiltered.yearlyYield = OptionQuoteFiltered.yearlyYield || [];
      OptionQuoteFiltered.breakEven = OptionQuoteFiltered.breakEven || [];
      for (let i = 0; i < rows; i++) {
        const ask = OptionQuoteFiltered.ask[i];
        const dte = OptionQuoteFiltered.dte[i];

        const breakEven = (strikeArray[i] + ask);

        const yield_ =  yieldCalc (optionQuote.strike[i], dte, ask)  
        const yearlyYield = config.compoundYield ? ((yield_) ** (365 / dte)).toFixed(4) : ((yield_ ) * (365 / dte)).toFixed(4);



        OptionQuoteFiltered.yield_[i] = ! config.percent ? yield_.toFixed(4) : (yield_ * 100).toFixed(3);  
        OptionQuoteFiltered.yearlyYield[i] = ! config.percent ? yearlyYield : Number(yearlyYield * 100).toFixed(3);
        OptionQuoteFiltered.breakEven[i] = breakEven.toFixed(4); // add breakEven to OptionQuoteFiltered

        if (log)
          console.log ('expiration=', OptionQuoteFiltered.expiration[i], 'strike', OptionQuoteFiltered.strike[i], 
            'dte(days)=', result.data.dte[i], 'yield', yield_.toFixed(3), 'yearlyYield=', yearlyYield,
          )  
      }
      if (!columnShow.includes('yield_')) // if gain is not in columnShow, add it
        columnShow.push('yield_')
      if (!columnShow.includes('yearlyYield')) // if yearlyGain is not in columnShow, add it
        columnShow.push ('yearlyYield'); // add yearlyGain to columnShow_  
      if (!columnShow.includes('breakEven')) // if breakEven is not in columnShow, add it
        columnShow.push ('breakEven');   



      const keys = Object.keys(OptionQuoteFiltered);

      //** find highest yearlyYield */
      var bestYearlyYield_ = 0;
     for (let i = 0; i < rows; i++) {
        if (OptionQuoteFiltered.yearlyYield[i] === 'Infinity')
          continue
         OptionQuoteFiltered.yearlyYield[i] = Number(OptionQuoteFiltered.yearlyYield[i])
         if (OptionQuoteFiltered.yearlyYield[i] > bestYearlyYield_) {
          if (logExtra)
            console.log ('i=', i, 'yearlyYield=', OptionQuoteFiltered.yearlyYield[i], 'maxYearlyYield_',  bestYearlyYield_)  
          bestYearlyYield_ = OptionQuoteFiltered.yearlyYield[i];
          setBestYearlyYieldIndex(i); // save index of max yearly yield
         }
      }
      setBestYearlyYield(bestYearlyYield_); // set maxYearlyYield
      setOptionQuote(OptionQuoteFiltered); // take the first one, there could be more
      if (log)
        console.log ('maxYearlyYield=', bestYearlyYield_)


      if(log)
        console.log ('columnShow set to all keys', keys)
      
      // if columnShow is empty, set it to all keys
      if (columnShow_.length === 0) {
        setColumnShow(keys)
        localStorage.setItem('COLUMNS', JSON.stringify(keys));
      }

      setOptionKeys(keys)
      if (columnShow.length === 0) {
        setColumnShow(keys) // if columnShow is empty, set it to all keys
        // columnShow__= keys; // update the columnShow_ to all keys
        // localStorage.setItem(COLUMNS, JSON.stringify(keys));
        console.log ('columnShow set to all keys', keys)
      }

      if (log)
        console.log ('keys', Object.keys(result.data))

     })
    .catch ((err) => {
      console.log(err.message)
      props.errorAdd ([props.symbol, 'expiration error', err.message])
    })

  }




 function strikePricesGet (expirationsArray_) {

    // get expiration
    // var expirationSelect = "";
    // const strikePrice = props.stockPrice * (1 + config.strikeNum / 100); // e.g. 150/10 = 15
    var expirationSelect = "";
    var mili = new Date().getTime()
    mili += config.expirationNum * 24 * 3600 * 1000; // now + expirationNum days
    for (let i = 0; i < expirationsArray.length; i++) { 
      if (new Date(expirationsArray[i]).getTime() > mili) {
        expirationSelect = expirationsArray[i];
        break;
      }
    }


    const url = 'https://api.marketdata.app/v1/options/strikes/' + props.symbol + '/?expiration=' 
        + expirationSelect + '&token=' + TOKEN
        // + '?token=' + TOKEN;
    if (log)
      console.log (getDate(), props.symbol, url)
    setErr()
    setDat()
    setLatency('request sent ...')

    axios.get (url)
    .then ((result) => {
      if (log)
        console.log ('strike-prices', result.data)
      const mili = result.data.updated

      if (result.data.s !== 'ok') {
        props.errorAdd ([props.symbol, 'strike-price error', result.data.s])
        console.log (props.symbol, 'strike-price error', result.data.s)
      }

      const arr = result.data[expirationSelect]
      if(log)
        console.log ('strike-array', arr)

      setStrikeArray(arr);
      // setSelectedStrike(-1); // clear selected strike
      var selectedStrike_ = -1; // for local use, during computation
      //** default select just above current price*/
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] > props.stockPrice) {
          // setSelectedStrike(i);
          selectedStrike_ = i
          setStrikeNumCalc (i)
          if (log)
            console.log ('default strike selected', i, 'price=', arr[i])
          break;
        }
      }
      // console.log ('ptionPremiumGet', selectedExpiration, expirationsArray, selectedStrike_, arr)
      // optionPremium (expirationsArray, selectedExpiration, selectedStrike_, arr)
    })
    .catch ((err) => {
      console.log(err.message)
      props.errorAdd ([props.symbol, 'expiration error', err.message])
    })
  }
 


  function expirationsGet () {
    const url = 'https://api.marketdata.app/v1/options/expirations/' + props.symbol + '/?token=' + TOKEN
    if (log)
      console.log (getDate(), props.symbol, url)
    setErr()
    setDat()
    setLatency('request sent ...')

    axios.get (url)
      .then ((result) => {
        if (log)
          console.log ('expirations', result.data)
        const mili = result.data.updated
        const status = result.data.s

        if (result.data.s !== 'ok') {
          props.errorAdd ([props.symbol, 'expiration error', result.data.s])
          console.log (props.symbol, 'expiration error', result.data.s)
        }
        
        setExpirationsArray(result.data.expirations);


        strikePricesGet (result.data.expirations) 

      })
      .catch ((err) => {
        console.log(err.message, url)
        props.errorAdd ([props.symbol, 'expiration error', err.message])
      })

  }



  function expirationRowClick(rowId)  { 
    setExpirationSelected(rowId)
    if (log)
      console.log('Expiration Row clicked:', rowId);
    // strikePrices ();
  }

 function strikeRowClick(rowId)  { 
    setStrikeNumCalc(rowId)
    // config.strikeNum = rowId;
    if (log)
      console.log('Strike Row clicked:', rowId);
  }


  function premiumRowClick(rowId)  { 
    setPremiumSelected(rowId)
    if (log)
      console.log('premium Row clicked:', rowId);
    // strikePrices ();
  }


  
  function yieldCalc (strike, dte, ask, breakEven, expirationDateValue) {
    var  yield_;
      if (config.action === 'sell') {
        yield_ = (ask / props.stockPrice);
      }
      else {  // buy call or put
        yield_ = (expirationDateValue - breakEven) / ask; //  - props.stockPrice
        const a = 1 // for breakpoint debug
        if (log)
          console.log('strike=' + strike, 'dte=' + dte, 'ask=' + ask, 'breakEven=' + breakEven.toFixed(2),
          'expirationDateValue=' + expirationDateValue.toFixed(2), 'yield=' + yield_.toFixed(2), 'profit=' + (expirationDateValue - breakEven).toFixed(2))
      }

      return yield_;
  }




  //** get from coirsServer */
  function  getOptionsInfoFromServer () {
    setErr()
    if (config.expirationNum < 0 || config.expirationCount < 0 ||  config.strikeNum < 0 || config.strikeCount < 0) {
      setErr('config error, negative number')
      beep2()
      return;
    }

    if (isNaN(estimatedYearlyGain)){
      props.errorAdd ([props.symbol, 'warning. config.YearlyGain is required for calculationg expected yield'])
      beep2()
    }


    var corsUrl;
    if (props.ssl)
      corsUrl = "https://";
    else
      corsUrl = "http://";

    corsUrl += props.corsServer + ":" + props.PORT + "/stockOptions?stock=" + props.symbol;
    corsUrl += "&expirationNum=" + config.expirationNum
    corsUrl += "&strikeNum=" + config.strikeNum
    corsUrl += '&expirationCount=' + config.expirationCount
    corsUrl += '&strikeCount=' + config.strikeCount
    corsUrl += "&side=" + config.side
    // corsUrl += "&percent=" + (percent ? 1 : 0)
    // corsUrl += "&compoundYield=" + (compoundYield ? 1 : 0)
    corsUrl += "&stockPrice=" + props.stockPrice
    // corsUrl += "&func=" + "expirations" // expirations, strikes, optionPremium


    // corsUrl += "&token=" + TOKEN
    if (log)
      corsUrl += "&log=1"
    if (logExtra)
      corsUrl += "&logExtra=1"
    if (ignoreSaved)
      corsUrl += "&ignoreSaved=1"

    if (log)
      console.log (getDate(), props.symbol, 'getOptionsInfoFromServer', corsUrl)

    setDat()
    setLatency('request sent ...')

    const mili = Date.now()
    setLatency('request sent to server ...')

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {

      if (result.status !== 200) {
        console.log (props.chartSymbol, ' ', result)
        return;
      }
      // setDat(result.data)
      if (log)
        console.log ('option-raw-from-server', props.symbol, result.data)

      const latency = Date.now() - mili
      setLatency ('getStockOptions done,  Latency(msec)=' + latency)    

      if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
        setErr(getDate() + ' status from server:  ' + result.data)
        beep2()
        console.log (props.symbol, result.data)
        return;
      }

      if (result.data.strikeNum ) {
        setStrikeNumCalc (result.data.strikeNum)   // from server
      }

      if (result.data.compareStatus && props.eliHome) {
        console.log ('compareStatus=', result.data.compareStatus)
        setCompareStatus (result.data.compareStatus)
      }

      setExpirationsArray(result.data.expirationArray)

      setStrikeArray(result.data.strikeArray)
      // setSelectedStrike(result.data.strikeNum)

      const premiumArray = result.data.premiumArray;
      delete  premiumArray.s // remove diffent key from server
      // setOptionQuote(premiumArray)
      setOptionKeys(Object.keys(premiumArray))

      var expirationDayIndex = getExpirationDayIndex (result.data.expirationArray)
      if (expirationDayIndex === -1) { // expirationIndex not found
        console.log ('fail, expirationDayIndex not found')
        setErr('fail, expirationDayIndex not found')
        beep2()
        return;
      }

      // if (result.data.s !== 'ok') {
      //   props.errorAdd ([props.symbol, 'option-fee error', result.data.s])
      //   console.log (props.symbol, 'option-fee error', result.data.s)
      //   return
      // }

      //** copy and convert date format of result.data */
      var OptionQuoteFiltered = {}
      OptionQuoteFiltered.expiration = [] 
      OptionQuoteFiltered.firstTraded = []
      OptionQuoteFiltered.updated = []
      const rows = premiumArray.expiration.length;  // row count

      //** Loop on attributes */
      Object.keys(premiumArray).forEach((key) => {

        // delete result.data.optionSymbol
        // delete result.data.s
        if (key === 's')
          return; // skip these two keys

          // convert date to YYYY-mm-dd format
          OptionQuoteFiltered[key] = []

          // Loop on rows
          for (let i = 0; i < rows; i++) {
            if (key === 'expiration') {
              OptionQuoteFiltered.expiration[i] = getDate_YYYY_mm_dd__(new Date(premiumArray.expiration[i] * 1000))
            }
            else if (key === 'firstTraded')
              OptionQuoteFiltered.firstTraded[i] = getDate_YYYY_mm_dd__(new Date(premiumArray.firstTraded[i] * 1000))
            else if (key === 'updated') 
              OptionQuoteFiltered.updated[i] = getDate_YYYY_mm_dd__(new Date(premiumArray.updated[i] * 1000))
            else
              OptionQuoteFiltered[key][i] = premiumArray[key][i]; // all other just copy
          }
        } )
      if (logExtra)
        console.log ('filtered', OptionQuoteFiltered)

      
      //** calc yearly yield */
      const miliNow = Date.now()
      OptionQuoteFiltered.yield_ = [];
      OptionQuoteFiltered.yearlyYield =  [];
      OptionQuoteFiltered.breakEven = [];
      OptionQuoteFiltered.expectedPrice =  [];
      OptionQuoteFiltered.profit = [];
      OptionQuoteFiltered.askDivPrice = [];

      //* only calculate yield for call or buy put, sell put is too risky */  
      if (config.action === 'sell') { // sell put is risky, do not calculate yield
        setErr('Sell put or call option is very aggressive and risky')
        beep2()
      }

      //** calc yield */
      for (let i = 0; i < rows; i++) {
        const ask = premiumArray.ask[i];
        const dte = premiumArray.dte[i];

        const breakEven = (premiumArray.strike[i] + premiumArray.ask[i]);
        const expirationDateValue = props.stockPrice * ((estimatedYearlyGain) / 100 + 1) ** (dte / 365); 

        var  yield_ =  yieldCalc (premiumArray.strike[i], dte, ask, breakEven, expirationDateValue)
        // if (yield_ < 0)
        //   props.errorAdd ([props.symbol, 'negative yield=' + yield_.toFixed(3), 'indx=' + i, 'strike/ask=', optionQuote.strike[i], '  ', ask])
        var yearlyYield = -1
        if (yield_ > 0) {
          if (config.compoundYield)
            yearlyYield = ((yield_ + 1) ** (365 / dte) - 1).toFixed(3);
          else {
            yearlyYield = ((yield_ ) * (365 / dte)).toFixed(2);
          }
        }

        if (logExtra)
          console.log ('i=', i, 'ask=' + ask, 'strike=' + premiumArray.strike[i], 'breakEven=' + breakEven.toFixed(2),
          'yield_=' + yield_.toFixed(2), 'yearlyYield=' + yearlyYield, 'expiration=' + OptionQuoteFiltered.expiration[i])

        OptionQuoteFiltered.yield_[i] = ! config.percent ? yield_.toFixed(2) : ((yield_) * 100).toFixed(2); 
        if (yearlyYield !== -1)
          OptionQuoteFiltered.yearlyYield[i] =! config.percent ? Number(yearlyYield).toFixed(2) : ((Number(yearlyYield)) * 100).toFixed(2);
        else
          OptionQuoteFiltered.yearlyYield[i] = 0;
        OptionQuoteFiltered.breakEven[i] = breakEven.toFixed(); // add breakEven to OptionQuoteFiltered
        OptionQuoteFiltered.expectedPrice[i] = expirationDateValue.toFixed(2); // expected price at expiration date
        OptionQuoteFiltered.profit[i] = (expirationDateValue - breakEven).toFixed(2); // expected profit at expiration date
        OptionQuoteFiltered.askDivPrice[i] = (ask / props.stockPrice).toFixed(3); // ask divided by priceDivHigh

        if (logExtra)
          console.log ('expiration=', OptionQuoteFiltered.expiration[i], 'strike', OptionQuoteFiltered.strike[i], 
            'dte(days)=', premiumArray.dte[i], 'yield', yield_.toFixed(3), 'yearlyYield=', yearlyYield,
          )  
      }
      if (!columnShow.includes('yield_')) // if gain is not in columnShow, add it
        columnShow.push('yield_')
      if (!columnShow.includes('yearlyYield')) // if yearlyGain is not in columnShow, add it
        columnShow.push ('yearlyYield'); // add yearlyGain to columnShow_  
      if (!columnShow.includes('breakEven')) // if breakEven is not in columnShow, add it
        columnShow.push ('breakEven');   



      const keys = Object.keys(OptionQuoteFiltered);

      //** find highest yearlyYield */
      var bestYearlyYield_ = 0
      for (let i = 0; i < rows; i++) {
        if (OptionQuoteFiltered.yearlyYield[i] === 'Infinity')
          continue
        //  OptionQuoteFiltered.yearlyYield[i] = Number(OptionQuoteFiltered.yearlyYield[i])

         if (Number(OptionQuoteFiltered.yearlyYield[i]) > bestYearlyYield_) {
          // if (log)
          //   console.log ('i=', i, 'yearlyYield=', OptionQuoteFiltered.yearlyYield[i], 'maxYearlyYield_',  maxYearlyYield_)  
          bestYearlyYield_ = Number(OptionQuoteFiltered.yearlyYield[i]);
          setBestYearlyYieldIndex(i); // save index of max yearly yield
         }
      }

      setBestYearlyYield(bestYearlyYield_); // set maxYearlyYield
      setOptionQuote(OptionQuoteFiltered); // take the first one, there could be more
      if (logExtra)
        console.log ('maxYearlyYield=', bestYearlyYield_)


      if(logExtra)
        console.log ('columnShow set to all keys', keys)
      
      // if columnShow is empty, set it to all keys
      if (columnShow_.length === 0) {
        setColumnShow(keys)
        localStorage.setItem('columnShow (keys)', JSON.stringify(keys));
      }

      setOptionKeys(keys)
      if (columnShow.length === 0) {
        setColumnShow(keys) // if columnShow is empty, set it to all keys
        // columnShow__= keys; // update the columnShow_ to all keys
        localStorage.setItem(COLUMNS, JSON.stringify(keys));
        console.log ('columnShow set to all keys', keys)
      }

      if (logExtra)
        console.log ('keys', Object.keys(premiumArray))


         
    } )
    // .catch ((err) => {
    //   setErr(err.message)
    //   console.log(err.message)
    //   props.errorAdd ([props.symbol, ' getStockOptions', err.message])
    // })

  }


  useEffect (() => { 
    console.log ('useEffect symbol change', props.symbol)
    setStrikeArray([]);
    setExpirationsArray([]);
    setOptionQuote({});
    setExpirationSelected(-1)
    setStrikeNumCalc(-1)

    const row_index_ = props.rows.findIndex((row)=> row.values.symbol === props.symbol) // nsymbol change
    if (row_index_ === -1) {
      console.log ('error, symbol not found in rows', props.symbol)
    } 
    else {
      setRow_index(row_index_)
      setBelowBubble (props.stockPrice / props.rows[row_index_].values.bubblePrice) ;
      setEstimatedYearlyGain (((props.rows[row_index_].values.peak2Peak - 1) * 100).toFixed(2))
    }

    // setOptionKeys([]);
    // if (! err)
    //  getOptionsInfoFromServer () 
  }, [props.symbol, props.rows, props.stockPrice]); 



  function handleColumnCheckboxChange (item) {
    setColumnShow((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };
  
  function saveColumnChecked (item) {
    localStorage.setItem(COLUMNS, JSON.stringify(columnShow)); // set default columnShow
  }

  function cellColor (line, attrib) {
    if (line === '0' || attrib === '0' || attrib === undefined || optionQuote[attrib] === undefined) {
      setErr ("cellColor  line='0' string", attrib)
      line = 0
      return {backgroundColor: 'white', color: 'orange', fontWeight: 'normal'};
    }
    // if (logExtra)
    //   console.log ('cellColor', line, attrib)
    if (attrib === 'expiration') {
      if (line === 0 || optionQuote.expiration[line] !== optionQuote.expiration[line - 1]) {
        // console.log ('expiration changed', line, optionQuote.expiration[line])
        return {backgroundColor: '#ffd3fbff', color: 'black', fontWeight: 'bold'};
      }
    }

    else if (attrib === 'yearlyYield') {
      if (optionQuote.yearlyYield === undefined) {
        return {backgroundColor: '#d3e533', color: 'red', fontWeight: 'bold'};        
      }
      if (bestYearlyYieldIndex === line) {
        return {backgroundColor: '#e5d333ff', color: 'black', fontWeight: 'bold'};
      }
    }

    else if (attrib === 'yield_' && optionQuote.yield_[line].startsWith('-')) {
      const a = 1
      return { color: 'red', fontWeight: 'bold'};        
    }

    else if (attrib === 'ask' || attrib === 'bid' || attrib === 'mid') {
      if (line > 0 && optionQuote.expiration[line] === optionQuote.expiration[line - 1] ) {
        if (optionQuote.ask[line] > optionQuote.ask[line - 1]) 
          return { color: 'blue', fontWeight: 'bold'};
      }
      return {backgroundColor: '#c9e0a7ff'};
    }

    else if (attrib === 'profit') {
      if (optionQuote.profit[line] < 0)
        return { color: 'red', fontWeight: 'bold'};
      else
        return {backgroundColor: '#c9e0a7ff'};
    }
    if (premiumSelected === line)
      return {background: '#d3e5ff'}
    
    return {backgroundColor: 'white', color: 'black', fontWeight: 'normal'};
    
  }

  function percentSign (attrib) {
    if (attrib === 'yield_' || attrib === 'yearlyYield') {
      return config.percent ? '_%' : ''
    }
    else {
      return ''
    }
  }

  // const ROW_SPACING = {padding: "0px 10px 0px 10px", margin: '0px'}
  //  top, right, bottom, left 
  const ROW_SPACING = {padding: "0px 7px 0px 7px", margin: 0}

  return (
    <div style = {{ border: '2px solid blue'}} >
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}>Option primium (under development) </h6>  &nbsp; &nbsp;
        </div>

        {/* flags checkboxes */}
        {props.eliHome && <div style = {{display: 'flex'}}>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={log}  onChange={()=>setLog (! log)}  />&nbsp;log &nbsp; &nbsp; </div>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={logExtra}  onChange={()=>setLogExtra (! logExtra)}  />&nbsp;logExtra &nbsp; &nbsp; </div>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={ignoreSaved}  onChange={()=>setIgnoreSaved (! ignoreSaved)}  />&nbsp;ignore-saved &nbsp; &nbsp; </div>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={hideNegativeYield}  onChange={()=>setHideNegativeYield (! hideNegativeYield)}  />&nbsp;hide-negative-yield &nbsp; &nbsp; </div>
        </div>}


        {err && <div style={{color: 'red'}}>Error: {err} </div>}
        {latency && <div style={{color: 'green'}}> {latency} </div>}
        {props.eliHome && logExtra && compareStatus && <div style={{color: 'orange'}}> compareStatus={compareStatus} </div>}

        <div>&nbsp;</div>


        {/* <link rel="icon" href="%PUBLIC_URL%/favicon.ico" /> */}
       <div style = {{display: 'flex'}}> <input type="checkbox" checked={configShow}  onChange={()=>setConfigShow (! configShow)} 
        />&nbsp;<strong> config <FaCog style={{ fontSize: '24px', color: '#0078D4' }} /> </strong> &nbsp; &nbsp; </div>
        {configShow && 
        <StockOptionsConfig config={config} setConfig={setConfig} logExtra={logExtra} estimatedYearlyGain={estimatedYearlyGain} setEstimatedYearlyGain={setEstimatedYearlyGain}/>}
        <div>&nbsp;</div>
        {/* <hr/> */}

        {/*  buttons  */}
        <div>
          <button style={{background: 'aqua'}} type="button" onClick={()=>getOptionsInfoFromServer()}>  get-option-premium   </button> &nbsp;&nbsp;
          {props.eliHome && <button style={{background: 'lightblue'}} type="button" onClick={()=>irregularPremium()}>  verify-descending-premium   </button>} &nbsp;&nbsp;
          {/* {dat && Object.keys(dat).length > 0 && <div>options from corsServer: {JSON.stringify(dat)} </div> } */}
          {/* <hr/>  */}
        </div>

        <div style = {{display: 'flex'}}>
          <input type="checkbox" checked={expirationShow}  onChange={()=>setExpirationShow (! expirationShow)}  />&nbsp;<strong>expiration-show</strong> &nbsp; &nbsp;
          <div > (count={expirationsArray.length} &nbsp; selected={expirationSelected}) </div>  &nbsp; &nbsp; 
        </div>
        {expirationShow && <div>
 
          {props.eliHome && <div style = {{display: 'flex'}}>
            <button style={{background: 'aqua'}} type="button" onClick={()=>expirationsGet()}>  expirations   </button> &nbsp;&nbsp;
          </div>}

          
          {/* Expiration table */}
          {expirationsArray.length > 0  && <div style={{maxHeight:'250px', width: '300px', overflow:'auto'}}>
              <table>
                  <thead>
                    <tr>
                      <th style={{...ROW_SPACING, width: '20px'}}>N</th>
                      <th style={{...ROW_SPACING, width: '100px'}} >expiration-date</th>                    
                    </tr>
                  </thead>
                  <tbody>
                    {expirationsArray.map((date, index) =>{
                      return (
                      <tr key={index}
                        onClick={() => expirationRowClick(index)}
                        style={{
                            backgroundColor: expirationSelected === index ? '#d3e5ff' : 'white',
                            cursor: 'pointer',
                          }}                      
                        >
                        <td style={{...ROW_SPACING, width: '20px'}}>{index}  </td>
                        <td style={{...ROW_SPACING, width: '100px'}}>{date}  </td> 
                      </tr>
                      )
                    })}
                  </tbody>
              </table>
          </div>}
          <hr/> 
        </div>}
        
        {/* strikes */}

        <div style = {{display: 'flex'}}> <input type="checkbox" checked={strikeShow}  onChange={()=>setStrikeShow(! strikeShow)}  />&nbsp;<strong>strike-show </strong>
           &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;
            <div> (count={strikeArray.length} &nbsp; selected={strikeNumCalc})</div>   &nbsp; &nbsp; 
        </div>
        
        {strikeShow && expirationsArray.length > 0 && <div>

          {config.expirationNum === -1 && <div style={{color: 'red'}}>Please select an expiration date first</div>}
          {props.eliHome && config.expirationNum >= 0  && <div style = {{display: 'flex'}}>
            <button style={{background: 'aqua'}} type="button" onClick={()=>strikePricesGet(config.expirationNum)}>  strike-price   </button> &nbsp; &nbsp;

          </div>}


          {/* Strike-list table */}
          {strikeArray.length > 0 && <div style={{maxHeight:'250px', width: '400px', overflow:'auto'}}>
            <table>
                <thead>
                  <tr>
                    <th style={{...ROW_SPACING, width: '20px'}}>N</th>
                    <th style={{...ROW_SPACING, width: '100px'}}>strike-price</th>
                    <th style={{...ROW_SPACING, width: '100px'}}>strike-price/price</th>
                  </tr>
                </thead>
                <tbody>
                  {strikeArray.map((strike, index) =>{
                    return (
                    <tr key={index}
                      onClick={() => strikeRowClick(index)}
                      style={{
                          ...ROW_SPACING, backgroundColor: strikeNumCalc === index ? '#d3e5ff' : 'white',
                          cursor: 'pointer',
                        }}                      
                      >
                      <td style={{...ROW_SPACING, width: '20px'}}>{index}  </td>
                      <td style={{...ROW_SPACING, width: '100px'}}>{strike.toFixed(3)}  </td> 
                      <td style={{...ROW_SPACING, width: '100px'}}>{(strike/props.stockPrice).toFixed(3)}  </td> 
                    </tr>
                    )
                  })}
                </tbody>
            </table>
          </div>} 
          <hr/>  

          {config.expirationBum !== -1 && strikeNumCalc ===-1 && strikeArray.length > 0 && <div style={{color: 'red'}}>Please select a strike-price first</div>}

          {strikeNumCalc !== -1 && <div style = {{display: 'flex'}}>
            {props.eliHome && <button style={{background: 'aqua'}} type="button" onClick={()=>optionPremium(expirationsArray, strikeArray)}>  option-primium   </button>}  &nbsp; &nbsp;  &nbsp;
               {optionQuote && optionQuote.expiration && <h6> count={optionQuote.expiration.length} &nbsp;</h6>}  &nbsp; &nbsp;&nbsp;  
          </div>}
          </div>}



          {/* select columns */}
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={columnHideFlag} 
                onChange={()=>setColumnHideFlag (! columnHideFlag)}  />&nbsp;<strong>column-select</strong>  &nbsp; &nbsp; &nbsp; &nbsp; 
             <button type="button" onClick={()=>columnsSetDefault ()}>default-columns </button> 
          </div>  
          {/* {config.strikeNum !== -1 && <div style = {{display: 'flex'}}>

          </div>} */}

          {columnHideFlag && <div >    
            <hr/> 
            {/* columnShow  */}
            {/* <div style={{hight: '400px', color:'#119933', fontWeight: 'bold', fontStyle: "italic"}}> column-select  </div> */}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '700px'}}>
              {optionKeys.map((item) => (
                  <div key={item}>
                      <input style = {{'accentColor':'pink'}}
                        type="checkbox"
                        checked={columnShow.includes(item)}
                        onChange={() => handleColumnCheckboxChange(item)}
                      />
                      &nbsp;{item}
                  </div>
                ))}
            </div>
            <button style={{background: 'aqua'}} type="button" onClick={()=>saveColumnChecked()}>  save    </button> &nbsp;&nbsp;

            {/* {log && <p>Selected: {columnShow.join(", ")}</p>}   */}
             {/* {log && <p>Selected: {optionKeys.join(", ")}</p>}   */}
            </div>}

            <hr/> 

          {optionQuote && optionQuote.expiration && <div>{props.symbol} &nbsp; &nbsp; count={optionQuote.expiration.length} &nbsp; &nbsp;
          stockPrice={props.stockPrice} &nbsp; &nbsp; &nbsp; price/bubblePrice={belowBubble.toFixed(3)} &nbsp; &nbsp;
          bestYearlyYieldIndex={bestYearlyYieldIndex} &nbsp; &nbsp; </div>}

          {/* premium quote table */}
          {optionKeys.length > 0 && <div style={{height:'500px', maxWidth: '1400px', overflow:'auto'}}>
            <table>
                <thead>
                  <tr style={ROW_SPACING}>
                    <th style={{...ROW_SPACING, width: '20px'}}> N</th>
                    {optionKeys.map((key, keyI) => {
                      return columnShow.includes (key) && (
                        <th style={ROW_SPACING} key={keyI}>{key}</th>
                      )
                    })}
                  </tr> 
                </thead>
                  
                  {/* top, right, bottom, left */} 

                <tbody>
                  {optionQuote && optionQuote.expiration && optionQuote.expiration.map((quote, index) => {
                    return (
                    (! hideNegativeYield || optionQuote.yield_[index] >= 0) &&
                      <tr key={index} style={ROW_SPACING} onClick={() => premiumRowClick(index)}>
                      <td style={{...ROW_SPACING, width: '20px'}}> {index}</td>
                      {optionKeys.map((key, keyI) => {
                      return columnShow.includes (key) &&  (
                        <td key={keyI} style={{...ROW_SPACING, ...cellColor(index, key)}}> {(optionQuote[key] ? optionQuote[key][index] : 'err='+ key) + percentSign(key)}</td>
                      )
                    })}

                    </tr>
                    )
                  })}
                </tbody>
            </table>

        </div>}

    </div>
  )
}





// https://www.marketdata.app/docs/api/

// https://api.marketdata.app/v1/options/strikes/{symbol}/?expiration=YYYY-MM-DD

// https://api.marketdata.app/v1/options/expirations/AAPL
// https://api.marketdata.app/v1/options/expirations/QQQ/?token=

// https://api.marketdata.app/v1/options/quotes/AAPL250817C00150000/
// https://api.marketdata.app/v1/options/chaiside=call
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2025-01-17&side=call
// https://api.marketdata.app/v1/options/strikes/AAPL
// https://api.marketdata.app/v1/options/strikes/AAPL/?expiration=2026-02-20
// https://api.marketdata.app/v1/options/strikes/AAPL/?expiration=2025-01-17

// https://api.marketdata.app/v1/options/quotes/AAPL250117C00150000/?human=true
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-02-20&side=call
// https://api.marketdata.app/v1/options/quotes/AAPL260220C00150000/?human=true
// https://api.marketdata.app/v1/options/chain/AAPL/?from=2027-01-01&to=2027-06-30.

// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2025-08-15&side=call&strike=25



export {OptionQuote};