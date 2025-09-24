
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
// import {IpContext} from '../contexts/IpContext';
import GetInt from '../utils/GetInt'
import {format, set} from "date-fns"
import {todayDate, getDate_YYYY_mm_dd__, getDate} from '../utils/Date';

import { el } from 'date-fns/locale';
import StockOptionsConfig from './StockOptionsConfig';
// 
// Zuberi Moshe

// 

// 


function OptionQuote (props) {

  // const [quote, setQuote] = useState(null);
  // const optionSymbol = 'AAPL'+'250817C00' + '150000'; // Jan 2025 $150 AAPL Call
  const TOKEN = process.env.REACT_APP_MARKETDATA;
  var url = 'https://marketdata.app/api/v1/marketdata?token=' + TOKEN;

  const [log, setLog] = useState (props.eliHome); // default to true if eliHome is true
  const [logExtra, setLogExtra] = useState (false);
  const [ignoreSaved, setIgnoreSaved] = useState (false);
  const [expirationsArray, setExpirationsArray] = useState([]); 

  const [strikeArray, setStrikeArray] = useState([]);

  const [strikeNumCalc,setStrikeNumCalc] = useState(-1) // for display only
  
  const [estimatedYearlyGain, setEstimatedYearlyGain] = useState(props.yearlyGain); // estimated yearly gain

  const [lineNumberArr, setLineNumberArr] = useState([]); // each line corespond to one strike-price

  const [optionQuote, setOptionQuote] = useState({});
  const [optionKeys, setOptionKeys] = useState([]);

  const [bestYearlyYield, setBestYearlyYield] = useState(0); // max yearly yield for all options
  const [bestYearlyYieldIndex, setBestYearlyYieldIndex] = useState(-1); // index of max yearly yield

  const [columnHideFlag, setColumnHideFlag] = useState(false);
  const [columnShow, setColumnShow] = useState([]);
  const [err, setErr] = useState();
  const [latency, setLatency] = useState();


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
  var columnShow_= useMemo(() => JSON.parse (localStorage.getItem(COLUMNS )), []);
  if (! columnShow_  ) {
    columnShow_ = columnsAll;
    localStorage.setItem(COLUMNS, JSON.stringify(columnShow_)); // set default columnShow
    if (logExtra)
      console.log ('columnShow init', columnShow_.length, columnShow_)
  }


  //* config persistant storage */
  const CONFIG_KEY = 'stockOptionsConfig';
  const [config, setConfig_] = useState(() => {
    const stored = localStorage.getItem(CONFIG_KEY);
    return stored ? JSON.parse(stored) : {expirationCount: 3, expirationNum:250, strikeCount: 3, strikeNum: 3,
      side: 'call', percent: true, compoundYield: false, yieldGoal: 'buy'}
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
 
  useEffect (() => { 
    localStorage.setItem(COLUMNS, JSON.stringify(columnShow));
    if (logExtra) {
      console.log ('save columnShow', columnShow) 
    }

  }, [columnShow, log, logExtra, props.eliHome, props.symbol, props.errorAdd]); 


        
  //** Get option premium for selected expiration and strike */
  const optionPremium = useCallback ((expirationsArray, strikeArray) => {
    console.log ('ptionPremiumGet', expirationsArray, strikeArray)
    //** clear */
    // setOptionQuote({})

    setLineNumberArr([]);
    //** create expiration group */

    var expirationGroup =  '/?expiration=' + expirationsArray[config.expirationNum]

    if (config.expirationCount > 1 && (config.expirationNum + config.expirationCount < expirationsArray.length)) {
      expirationGroup =  '/?from=' + expirationsArray[config.expirationNum] + '&to=' + expirationsArray[config.expirationNum + config.expirationCount -1]
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
      var lineArr = []
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
            if (key === 'expiration')
              lineArr.push (i) 
          }
        } )
      console.log ('filtered', OptionQuoteFiltered)
      setLineNumberArr(lineArr);
      if (logExtra)
        console.log ('lineNumberArr', lineArr)

      
      //** calc yearly yield */
      const miliNow = Date.now()
      OptionQuoteFiltered.yield_ = OptionQuoteFiltered.yield_ || [];
      OptionQuoteFiltered.yearlyYield = OptionQuoteFiltered.yearlyYield || [];
      OptionQuoteFiltered.breakEven = OptionQuoteFiltered.breakEven || [];
      for (let i = 0; i < rows; i++) {
        const mid = OptionQuoteFiltered.mid[i];
        const dte = OptionQuoteFiltered.dte[i];

        const breakEven = (OptionQuote.strike[i] + OptionQuote.mid[i]);

        var  yield_;
        if (config.yieldGoal === 'sell')
          yield_ = (mid / props.stockPrice);
        else {
          const expirationDateValue = props.stockPrice * (estimatedYearlyGain) ** (dte / 365); 
          yield_ = (expirationDateValue -  optionQuote.strike[i]) / mid; //  - props.stockPrice
          const a = 1 // for breakpoint debug
        }

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
          // if (log)
          //   console.log ('i=', i, 'yearlyYield=', OptionQuoteFiltered.yearlyYield[i], 'maxYearlyYield_',  maxYearlyYield_)  
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

  }, [props, TOKEN, log, // strikeArray, expirationsArray,
      config.side, config.percent, config.compoundYield, columnShow, columnShow_.length, 
       setColumnShow, setOptionKeys, setLineNumberArr, estimatedYearlyGain,
       setBestYearlyYield, setBestYearlyYieldIndex, config.strikeNum, config.strikeCount, config.expirationNum,
       config.yieldGoal, config.expirationCount, logExtra]); // add side to dependencies




  const strikePricesGet = useCallback ((expirationsArray) => {
    const url = 'https://api.marketdata.app/v1/options/strikes/' + props.symbol + '/?expiration=' 
        + expirationsArray[config.expirationNum] + '&token=' + TOKEN
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

      const arr = result.data[expirationsArray[config.expirationNum]]
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
  }, [props, config.expirationNum, TOKEN, log])// , optionPremium]);
 


  const expirationsGet = useCallback (() => {
    const url = 'https://api.marketdata.app/v1/options/expirations/' + props.symbol + '/?token=' + TOKEN
    if (log)
      console.log (url)
    setErr()
    setDat()
    setLatency('request sent ...')

    axios.get (getDate(), props.symbol, url)
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
        console.log(err.message)
        props.errorAdd ([props.symbol, 'expiration error', err.message])
      })

  }, [props, TOKEN, log, strikePricesGet]);



  function expirationRowClick(rowId)  { 
    config.expirationNum = rowId;
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


  //** get from coirsServer */
  const  getOptionsInfoFromServer  = useCallback (() => {

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

    setErr()
    setDat()
    setLatency('request sent ...')

    const mili = Date.now()
    setLatency('request sent to server ...')

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {

      if (result.status !== 200) {
        console.log (props.chartSymbol, 'status=', result)
        return;
      }
      // setDat(result.data)
      if (log)
        console.log ('option-raw-from-server', props.symbol, result.data)

      const latency = Date.now() - mili
      setLatency ('getStockOptions done,  Latency(msec)=' + latency)    

      if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
        setErr(getDate() + '  ' + result.data)
        // err_ = result.data
        props.errorAdd ([props.symbol,result.data])
        console.log (props.symbol, result.data)
        return;
      }

      if (result.data.strikeNum ) {
        setStrikeNumCalc (result.data.strikeNum)   // from server
      }

      if (result.data.compareStatus && props.eliHome) {
        console.log ('compareStatus=', result.data.compareStatus)
      }

      setExpirationsArray(result.data.expirationArray)

      setStrikeArray(result.data.strikeArray)
      // setSelectedStrike(result.data.strikeNum)

      const optionQuote = result.data.premiumArray;
      delete  optionQuote.s // remove diffent key from server
      setOptionQuote(optionQuote)
      setOptionKeys(Object.keys(optionQuote))



      // if (result.data.s !== 'ok') {
      //   props.errorAdd ([props.symbol, 'option-fee error', result.data.s])
      //   console.log (props.symbol, 'option-fee error', result.data.s)
      //   return
      // }

      //** copy and convert date format of result.data */
      var lineArr = []
      var OptionQuoteFiltered = {}
      OptionQuoteFiltered.expiration = [] 
      OptionQuoteFiltered.firstTraded = []
      OptionQuoteFiltered.updated = []
      const rows = optionQuote.expiration.length;  // row count

      Object.keys(optionQuote).forEach((key) => {

        // delete result.data.optionSymbol
        // delete result.data.s
        if (key === 's' || key === 'optionSymbol')
          return; // skip these two keys

          // convert date to YYYY-mm-dd format
          OptionQuoteFiltered[key] = []
          for (let i = 0; i < rows; i++) {
            if (key === 'expiration' || key === 'firstTraded' || key === 'updated') {
              OptionQuoteFiltered.expiration[i] = getDate_YYYY_mm_dd__(new Date(optionQuote.expiration[i] * 1000))
              OptionQuoteFiltered.firstTraded[i] = getDate_YYYY_mm_dd__(new Date(optionQuote.firstTraded[i] * 1000))
              OptionQuoteFiltered.updated[i] = getDate_YYYY_mm_dd__(new Date(optionQuote.updated[i] * 1000))
            }
            else {
              OptionQuoteFiltered[key][i] = optionQuote[key][i]; // all other just copy
            }
            if (key === 'expiration')
              lineArr.push (i) 
          }
        } )
      if (logExtra)
        console.log ('filtered', OptionQuoteFiltered)
      setLineNumberArr(lineArr);
      if (logExtra)
        console.log ('lineNumberArr', lineArr)

      
      //** calc yearly yield */
      const miliNow = Date.now()
      OptionQuoteFiltered.yield_ = OptionQuoteFiltered.yield_ || [];
      OptionQuoteFiltered.yearlyYield = OptionQuoteFiltered.yearlyYield || [];
      OptionQuoteFiltered.breakEven = OptionQuoteFiltered.breakEven || [];
      for (let i = 0; i < rows; i++) {
        const mid = optionQuote.mid[i];
        const dte = optionQuote.dte[i];

        const breakEven = (optionQuote.strike[i] + optionQuote.mid[i]);

        var  yield_;
        if (config.yieldGoal === 'sell')
          yield_ = (mid / props.stockPrice);
        else {
          const expirationDateValue = props.stockPrice * (estimatedYearlyGain) ** (dte / 365); 
          yield_ = (expirationDateValue -  optionQuote.strike[i]) / mid; //  - props.stockPrice
          const a = 1 // for breakpoint debug
        }

        const yearlyYield = config.compoundYield ? ((yield_) ** (365 / dte)).toFixed(4) : ((yield_ ) * (365 / dte)).toFixed(4);


        if (log)
          console.log ('i=', i, 'mid=' + mid, 'strike=' + optionQuote.strike[i], 'breakEven=' + breakEven.toFixed(2), 'yield_=' + yield_.toFixed(2), 'yearlyYield=' + yearlyYield)

        OptionQuoteFiltered.yield_[i] = ! config.percent ? yield_.toFixed(2) : (yield_ * 100).toFixed(2);  
        OptionQuoteFiltered.yearlyYield[i] = ! config.percent ? yearlyYield : Number(yearlyYield * 100).toFixed(3);
        OptionQuoteFiltered.breakEven[i] = breakEven.toFixed(); // add breakEven to OptionQuoteFiltered

        if (logExtra)
          console.log ('expiration=', OptionQuoteFiltered.expiration[i], 'strike', OptionQuoteFiltered.strike[i], 
            'dte(days)=', optionQuote.dte[i], 'yield', yield_.toFixed(3), 'yearlyYield=', yearlyYield,
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
         OptionQuoteFiltered.yearlyYield[i] = Number(OptionQuoteFiltered.yearlyYield[i])

         if (OptionQuoteFiltered.yearlyYield[i] > bestYearlyYield_) 
         {
          // if (log)
          //   console.log ('i=', i, 'yearlyYield=', OptionQuoteFiltered.yearlyYield[i], 'maxYearlyYield_',  maxYearlyYield_)  
          bestYearlyYield_ = OptionQuoteFiltered.yearlyYield[i];
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
        console.log ('keys', Object.keys(optionQuote))


         
    } )
    // .catch ((err) => {
    //   setErr(err.message)
    //   console.log(err.message)
    //   props.errorAdd ([props.symbol, ' getStockOptions', err.message])
    // })

  }, [props, config, columnShow, columnShow_, log, logExtra, ignoreSaved, estimatedYearlyGain])


  useEffect (() => { 
    console.log ('useEffect symbol change', props.symbol)
    setStrikeArray([]);
    setExpirationsArray([]);
    setLineNumberArr([]);
    setOptionQuote({});

    // setOptionKeys([]);
    // if (! err)
    //  getOptionsInfoFromServer () 
  }, [props.symbol, log, logExtra, err, props.eliHome, props.errorAdd]); 



  function handleColumnCheckboxChange (item) {
    setColumnShow((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };
  
  function saveColumnChecked (item) {
    localStorage.setItem(COLUMNS, JSON.stringify(columnShow_)); // set default columnShow
  }

  function cellColor (line, attrib) {
    if (attrib === 'expiration') {
      if (line === 0 || optionQuote.expiration[line] !== optionQuote.expiration[line - 1]) {
        // console.log ('expiration changed', line, optionQuote.expiration[line])
        return {backgroundColor: '#d3e5ff', color: 'black', fontWeight: 'bold'};
      } else {
        return {backgroundColor: 'white', color: 'black', fontWeight: 'normal'};
      } 
    }

    if (attrib === 'yearlyYield') {
      if (line==='0' || optionQuote.yearlyYield === undefined) {
        return {backgroundColor: '#d3e533', color: 'red', fontWeight: 'bold'};        
      }
      if (optionQuote.yearlyYield[line] !== 'Infinity' && bestYearlyYield === optionQuote.yearlyYield[line]) {
        return {backgroundColor: '#d3e533', color: 'black', fontWeight: 'bold'};
      } else {
        return {backgroundColor: 'white', color: 'black', fontWeight: 'normal'};
      }          
    }
  }

  // const ROW_SPACING = {padding: "0px 10px 0px 10px", margin: '0px'}
  //  top, right, bottom, left 
  const ROW_SPACING = {padding: "0px 7px 0px 7px", margin: 0}

  return (
    <div style = {{ border: '2px solid blue'}} >
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}>Option Quote (under development) </h6>  &nbsp; &nbsp;
        </div>

        {props.eliHome && <div style = {{display: 'flex'}}>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={log}  onChange={()=>setLog (! log)}  />&nbsp;log &nbsp; &nbsp; </div>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={logExtra}  onChange={()=>setLogExtra (! logExtra)}  />&nbsp;logExtra &nbsp; &nbsp; </div>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={ignoreSaved}  onChange={()=>setIgnoreSaved (! ignoreSaved)}  />&nbsp;ignore-saved &nbsp; &nbsp; </div>
        </div>}

        {err && <div style={{color: 'red'}}>Error: {err} </div>}
        {latency && <div style={{color: 'green'}}> {latency} </div>}
        {/* {props.eliHome && logExtra && compareStatus && <div style={{color: 'orange'}}> compareStatus={compareStatus} </div>} */}

        {props.eliHome &&
        <div>
          <button style={{background: 'aqua'}} type="button" onClick={()=>getOptionsInfoFromServer()}>  get-stock-option-data   </button> &nbsp;&nbsp;
          {/* {dat && Object.keys(dat).length > 0 && <div>options from corsServer: {JSON.stringify(dat)} </div> } */}
          {/* <hr/>  */}
        </div>}

        <div style = {{display: 'flex'}}> <input type="checkbox" checked={configShow}  onChange={()=>setConfigShow (! configShow)}  />&nbsp;<strong>config-show</strong> &nbsp; &nbsp; </div>
        {configShow && <StockOptionsConfig config={config} setConfig={setConfig} logExtra={logExtra} yearlyGain={props.yearlyGain}/>}


        <div style = {{display: 'flex'}}>
          <input type="checkbox" checked={expirationShow}  onChange={()=>setExpirationShow (! expirationShow)}  />&nbsp;<strong>expiration-show</strong> &nbsp; &nbsp;
          <div > (count={expirationsArray.length} &nbsp; selected={config.expirationNum}) </div>  &nbsp; &nbsp; 
        </div>
        {expirationShow && <div>
 
          <div style = {{display: 'flex'}}>
            <button style={{background: 'aqua'}} type="button" onClick={()=>expirationsGet()}>  expirations   </button> &nbsp;&nbsp;
          </div>

          
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
                            backgroundColor: config.expirationNum === index ? '#d3e5ff' : 'white',
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
          {config.expirationNum >= 0  && <div style = {{display: 'flex'}}>
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
            <button style={{background: 'aqua'}} type="button" onClick={()=>optionPremium(expirationsArray, strikeArray)}>  option-primium   </button>  &nbsp; &nbsp;  &nbsp;
               {optionQuote && optionQuote.expiration && <h6> count={optionQuote.expiration.length} &nbsp;</h6>}  &nbsp; &nbsp;&nbsp;  
          </div>}
          </div>}



          {/* select columns */}
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={columnHideFlag} 
                onChange={()=>setColumnHideFlag (! columnHideFlag)}  />&nbsp;<strong>column-select</strong></div>  

          {/* {config.strikeNum !== -1 && <div style = {{display: 'flex'}}>

          </div>} */}

          {columnHideFlag && <div >    
            <hr/> 
            {/* columnShow  */}
            <div style={{hight: '400px', color:'#119933', fontWeight: 'bold', fontStyle: "italic"}}> column-select  </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '700px'}}>
              {optionKeys.map((item) => (
                  <div key={item}>
                      <input
                        type="checkbox"
                        checked={columnShow.includes(item)}
                        onChange={() => handleColumnCheckboxChange(item)}
                      />
                      &nbsp;{item}
                  </div>
                ))}
              </div>
              {/* <button style={{background: 'aqua'}} type="button" onClick={()=>saveColumnChecked()}>  save    </button> &nbsp;&nbsp; */}

            {/* {log && <p>Selected: {columnShow.join(", ")}</p>}   */}
             {/* {log && <p>Selected: {optionKeys.join(", ")}</p>}   */}
            </div>}

            <hr/> 

          {props.symbol} &nbsp; &nbsp; count={lineNumberArr.length} &nbsp; &nbsp;
          stockPrice={props.stockPrice} &nbsp; &nbsp;
          bestYearlyYieldIndex={bestYearlyYieldIndex} &nbsp; &nbsp;

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
                  {lineNumberArr.map((quote, index) =>{
                    return (
                    <tr key={index} style={ROW_SPACING}>
                      <td style={{...ROW_SPACING, width: '20px'}}> {index}</td>
                      {optionKeys.map((key, keyI) => {
                      return columnShow.includes (key) &&  (
                        <td key={keyI} style={{...ROW_SPACING, ...cellColor(index, key)}}> {optionQuote[key] ? optionQuote[key][quote] : 'err='+ key}</td>
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