import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
//import { useSticky } from 'react-table-sticky'
//import styled from 'styled-components';
//import{ Styles } from './TableStyles'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'
import GAIN_VALIDATION from './GainValidate.json'
import './table.css'
import GlobalFilter from './GlobalFilter'
import CheckBox from './CheckBox'
import StockChart from '../Stock-chart'
import Splits from './Splits'
import MarketStackApi from './MarketStackApi'
import StockRecoveryCalc from './DropRecovery'

import StockInfo from './StockInfo'
import GainValidate from './GainValidate'
import Manual from '../Manual'
import Firebase from './Firebase'
import Config from './Config'

import {nanoid} from 'nanoid';
import {format} from "date-fns"
//import cloneDeep from 'lodash/cloneDeep';
import axios from 'axios'

import {db} from './firebase-config'
import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom'

import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
//import {} from "https:///www.gstatc"
import {todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, getDate} from './Date'

export const BasicTable = (props) => {

  const [chartSymbol, setChartSymbol] = useState("");
  //const [chartData, setChartData] = useState("");
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);

  const [apiKeyIndex, setApiKeyIndex] = useState (0);
  const [API_KEY, setAPI_KEY] = useState('');
  const [splitsFlag, setSplitsFlag] = useState('');
  
  const [splitsCalcFlag, setSplitsCalcFlag] = useState(true);
  const [stockInfo, setStockInfo] = useState ('');
  // const [ipStockSymbol, setIpStockSymbol] = useState(undefined);
  // const [firebaseFillMili, setFirebaseFillMili] = useState(0);

  const gainRef = collection(db, "stock-gain_")
  const infoRef = collection(db, "stock-info")
  const ipRef = collection(db, "ipList")
  const ipStockRef = collection(db, "stockIp")
  const [flex, setFlex] = useState ();
  const [admin, setAdmin] = useState(false);
  const [columnHideFlag, setColumnHideFlag] = useState(true);

  const LOG_FLAG = false;

  var  gain_validation_json = useMemo(() => GAIN_VALIDATION, []);
  const columns = useMemo(() => GROUPED_COLUMNS, []);
  var  data;// = useMemo(() => MOCK_DATA, []);
  var stocksFromLocalStorage = localStorage.getItem("stocks");
  var mmmmm = useMemo; 
  if (! stocksFromLocalStorage) 
  {
      data = mmmmm(() => MOCK_DATA, []);
  }
  else 
      data = mmmmm(() => JSON.parse (localStorage.getItem("stocks")), []);

      // const cafeList = document.querySelector("#gain-history")

  const [localIp, setLocalIP] = useState('');
  const [localIpv4, setLocalIPv4] = useState('');
  const [userAgent, setUserAgent] = useState("");
  const [userAgentMobile, setUserAgentMobile] = useState(false);
  
  //creating function to load ip address from the API
  const getIp = async () => {
    if (localIp !== '' && localIp !== undefined) {
      //console.log('ip ', ip)
      return;
    }

    // const os = require('os');
    // const cpu=os.cpus();
    // const hostName = os.hostname()
    // const platform = os.platform();
    // const type = os.type();
    // const arch = os.arch();
    // const uptime = os.uptime();
    // var path = require('path');
    //var userInfo_ = process.env['USERPROFILE']//.split(path.sep)[2];
    // const username = require('username')
   // const userInfo = os.userInfo('buffer');
  
    // userAgent
    const userAgent = navigator.userAgent;
    setUserAgent(navigator.userAgent)
    //if (/Android/i.test(navigator.userAgent))
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
      setUserAgentMobile(true);
    } else {
      setUserAgentMobile(false);
      console.log("not mobile device");
    }

    const res = await axios.get('https://geolocation-db.com/json/')
    // if (LOG_FLAG)
    console.log('ip ', res.data);
    if (res.data !== '') {
      setLocalIP(res.data);
      setAdmin (res.data.IPv4 === '84.228.164.64');
      setLocalIPv4 (res.data.IPv4);
    }
    else
      console.log ('no ip');

    // admin password
    const admin_index = rows.findIndex((row)=> row.values.symbol === '_ADMIN_');
    if (admin_index !== -1)
    setAdmin (true);

    // save ip
    var ipQuery = query (ipRef, where('_ipv4', '==', (res.data.IPv4)));
    const ipInfo = await getDocs(ipQuery);

    // add new entry
    await addDoc (ipRef, {_ipv4: res.data.IPv4, update: getDate(), country_name: res.data.country_name,
      city: res.data.city, state: res.data.state, postal: res.data.postal,
       longitude: res.data.longitude, latitude: res.data.latitude, userAgent: userAgent })

    // delete old entries
    if (ipInfo.docs.length > 0 && LOG_FLAG)
      console.log (res, 'ipList', ipInfo.docs.length);
    for (let i = 0; i < ipInfo.docs.length; i++) {
      //const id = ipInfo.docs[i].id;
      var ipDoc = doc(db, "ipList", ipInfo.docs[i].id);
      await deleteDoc (ipDoc);    
    }
  } 
  
  useEffect (() => { 
    //getGain();
    getIp();
     //getInfo();

  })
 
  
  // send stock gain to firebase, delete old and add new one (No woory about format change)

  const firebaseGainAdd = async (symbol, updateDate, updateMili, splits, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price, GOOGCompare, drop, recoverWeek, dropDate, priceDivHigh) => {
    // read old entries
    var userQuery = query (gainRef, where('__symbol', '==', symbol));
    const gain = await getDocs(userQuery);

    if (GOOGCompare === undefined)
      GOOGCompare = -1;
    // add new entry
    try {
    await addDoc (gainRef, {__symbol: symbol, _ip: localIpv4, _updateDate: updateDate, _updateMili: updateMili, splits: splits, wk: wk, wk2: wk2, mon: mon, mon3: mon3, mon6: mon6, year: year, year2: year2, year5: year5, year10: year10, year20: year20, price: price, GOOGCompare: GOOGCompare, drop: drop, recoverWeek: recoverWeek, dropDate: dropDate, priceDivHigh: priceDivHigh})
    } catch (e) {console.log (e)}
    // delete old entries
    if (gain.docs.length > 0 && LOG_FLAG)
      console.log (symbol, 'gain-send', gain.docs.length);
    for (let i = 0; i < gain.docs.length; i++) {
      //const id = gain.docs[i].id;
      var gainDoc = doc(db, "stock-gain_", gain.docs[i].id);
      await deleteDoc (gainDoc);    
    }               
  }

  // send stock info to firebase, delete old and add new one (No woory about format change)
  const firebaseInfoAdd = async (symbol, updateDate, updateMili, newInfo) => {
    // get old entries
    var userQuery = query (infoRef, where('__symbol', '==', symbol));
    const info = await getDocs(userQuery);

    // send new entry
    await addDoc (infoRef, {__symbol: symbol, _ip: localIpv4, _updateDate: updateDate, _updateMili: updateMili, data: newInfo })

    // delete old entries 
    if (info.docs.length > 0 && LOG_FLAG)
      console.log (symbol, 'info-send', info.docs.length); 
    for (let i = 0; i < info.docs.length; i++) {
      //const id = info.docs[i].id;
      var infoDoc = doc(db, "stock-info", info.docs[i].id);
      await deleteDoc (infoDoc);    
    }
  }

  const alphaCallBack = (key) => {
    setAPI_KEY (key);
  }      
  const API_KEY_array=['C542IZRPH683PFNZ','BC9UV9YUBWM3KQGF','QMV6KTIDIPRAQ9R0','Q6A0J5VH5720QBGR'];  
  const getAPI_KEY = () => {
    if (API_KEY !== '')
      return API_KEY;

    const key = localStorage.getItem("alphaVantage");
    if (key !== undefined && key !== '')
      setAPI_KEY (key);

    setApiKeyIndex  ((apiKeyIndex + 1) % API_KEY_array.length);
    //console.log ('API_KEY: ' + API_KEY_array[apiKeyIndex]); 
    return API_KEY_array[apiKeyIndex];
  }

  //const [rows, setRows] = useState (data);

  const [addFormData, setAddFormData] = useState({    })

    // get stock overview
  const handleInfoClick = (symbol) => {

    //callBack ("tableCallBack");
    localStorage.setItem ('infoSymbol', symbol); 
    console.log(`symbol: ${symbol} infoSymbol: ${symbol}`);
    if (symbol === '' || symbol === undefined) {
      alert (`bug, info sym vanished (${symbol})`);
      return;
    }
    
    var API_KEY =  getAPI_KEY(); // 'C542IZRPH683PFNZ';
    let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}` 

    //console.log(`Overview info (${symbol})`);
    console.log (`${API_Call}`);            
    fetch(API_Call)
        .then(
            function(response) {
                if (response != null) {
                  const respStr = JSON.stringify (response);
                  if (respStr.indexOf('redirected: false, status: 200, ok:') !== -1)
                    console.log(response);
                  return response.json();
                }
            }
        )
        .then(
            function (data) {
              if (data != null) {
                  const dataStr = JSON.stringify(data);
                  if (dataStr === '{}') {
                    alert (`etf or invalid symbol (no info) symbol=${symbol} data="${dataStr}"`);
                    return;
                  }
                  const index =  (dataStr.search('API call frequency is 5 calls per minute'))
                  if (index !== -1) {
                    alert (dataStr + `\n\n${API_Call}`);
                    //alert (dataStr);
                    return;
                  }
                      
                  const updateMili = Date.now();
                  const updateDate = getDate();
                  updateTableInfo (data, updateDate, updateMili);
                  setStockInfo (JSON.stringify(data));
                }
            }
        )
  }

  const updateTableGain = (sym, splits, updateDate, updateMili, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price) => {
    //console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
    const row_index = rows.findIndex((row)=> row.values.symbol === sym);            
    if (row_index === -1) {
      alert (`stock-table, history call back, invalid chartSymbol (${sym}) trying to updatehistory values` );
      return;
    }

    if (Date.now() - rows[row_index].values.gain_mili < 1000)
      return "duplicate";

    firebase_stockSymbol_ip_pair(sym);

    rows[row_index].values.gain_mili = updateMili;
    rows[row_index].values.gain_date = updateDate;

    rows[row_index].values.wk = wk; 
    rows[row_index].values.wk2 = wk2; 
    rows[row_index].values.mon = mon; 
    rows[row_index].values.mon3 = mon3;
    rows[row_index].values.mon6 = mon6; 
    rows[row_index].values.year = year; 
    rows[row_index].values.year2 = year2; 
    rows[row_index].values.year5 = year5; 
    rows[row_index].values.year10 = year10;
    rows[row_index].values.year20 = year20;
    rows[row_index].values.price = price;

    if (rows[row_index].values.splits_calc !== 'table') {
      rows[row_index].values.splits_list = splits;
      if (splits === '')
        rows[row_index].values.splits_calc = '';
      else if (splitsCalcFlag)
        rows[row_index].values.splits_calc = 'calc';
      else
        rows[row_index].values.splits_calc = 'raw';
    }
    //rows[index].values.splits_calc = splits === '' ? '' : splitsCalc ? 'smooth' : 'raw';
    saveTable();
    props.refreshCallBack(-1); // force refresh
    if (splits === '' || splits.length === 0)
      setSplitsFlag('');
    else
      setSplitsFlag(' splits ??');

    if (rows[row_index].values.target_raw !== undefined && rows[row_index].values.price !== 0)
      rows[row_index].values.target = (rows[row_index].values.target_raw/rows[row_index].values.price).toFixed(2)

    firebaseGainAdd (sym, updateDate, updateMili, splits,
      wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price, rows[row_index].values.GOOGCompare, rows[row_index].values.drop, rows[row_index].values.recoverWeek, rows[row_index].values.dropDate, rows[row_index].values.priceDivHigh);  // save in firestore
  }

  const updateTableInfo = (childData, updateDate, updateMili)  => {
    if (childData === null || childData === {} || childData["Exchange"] == null) {
      console.log ('ChildData missing');
      return;
    }
    //console.log (JSON.stringify(childData).substring(0,100));
    const symbol = childData["Symbol"];
    const index = rows.findIndex((row)=> row.values.symbol === symbol);

    rows[index].values.Exchange = childData["Exchange"].substring(0,4);
    rows[index].values.Industry = childData["Industry"];

    rows[index].values.PE = Number (childData["PERatio"]);
    rows[index].values.PEG = Number (childData["PEGRatio"]); 
    rows[index].values.TrailPE = Number (childData["TrailingPE"]);
    rows[index].values.ForwPE = Number (childData["ForwardPE"]);
    rows[index].values.Div = Number (childData["DividendYield"]);
    rows[index].values.BETA = Number (childData["Beta"]);
    rows[index].values.EVToEBITDA = Number (childData["EVToEBITDA"]);
    rows[index].values.EVToRevenue = Number (childData["EVToRevenue"]);
    rows[index].values.target_raw = Number (childData["AnalystTargetPrice"]);

    rows[index].values.PriceToBookRatio = Number (childData["PriceToBookRatio"]);
    //Sector         

    rows[index].values.info_mili = updateMili;
    rows[index].values.info_date = updateDate;

    if (rows[index].values.price !== undefined)
      rows[index].values.target = (rows[index].values.target_raw/rows[index].values.price).toFixed(2)
    
    saveTable();
    props.refreshCallBack(-1);
    childData.Address = '';   // Clear some data to decrese traffic
    childData.Description = '';
    firebaseInfoAdd (symbol, getDate(), Date.now(), childData);  // save in firestore
    // save overview per symbol
    // stocksOverview[symbol] = childData;
    // const stocksOverviewStr = JSON.stringify(stocksOverview);
    // localStorage.setItem('stocksOverview', stocksOverviewStr);
  }
            
  // save pair (stockSymbol ip)
  const firebase_stockSymbol_ip_pair = async (chartSymbol) => {
    if (localIp === '' || localIp === undefined)
      return;
    var ipSymbolQuery = query (ipStockRef, where('ip', '==', localIpv4), where
    ('stockSymbol', '==', chartSymbol ));
    const ipSymbolPair = await getDocs(ipSymbolQuery);
    if (ipSymbolPair.docs.length > 0)
      return;
    // add new entry
    await addDoc (ipStockRef, {ip: localIpv4, update: getDate(), stockSymbol: chartSymbol});

    // // delete duplicate entries
    // for (let i = 0; i < ipSymbolPair.docs.length; i++) {
    //   const id = ipSymbolPair.docs[i].id;
    //   var ipDoc = doc(db, "stockIp", ipSymbolPair.docs[i].id);
    //   await deleteDoc (ipDoc);    
    // }               
  }


  const handleGainClick = (sym) => {
    setChartSymbol (sym);
    localStorage.setItem ('chartSymbol', sym);
    console.log(`symbol: ${sym}`); 
    if (sym === '' || sym === undefined) {
      alert (`bug, chart sym vanished (${sym})`);
      return;
    }

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);

    const API_KEY_ = getAPI_KEY(); //'BC9UV9YUBWM3KQGF';
    const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  

    const weekly = false;
    let API_Call;
    if (weekly)
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${sym}&outputsize=compact&apikey=${API_KEY_}`;
    else
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${sym}&outputsize=full&apikey=${API_KEY_}`;
    
    fetch(API_Call)
        .then(
            function(response) {
                const respStr = JSON.stringify (response);
                if (respStr.indexOf (' status: 200, ok: true') !== -1)
                    console.log(response);
                return response.json();
            }
        )
        .then(
            (chartData) => {
              const dataStr = JSON.stringify(chartData);
              if (dataStr === "{}") {
                alert (`Invalid symbol: (${sym})`)
                return;
              }
              console.log(API_Call);
              console.log (dataStr.substring(0,150));
              // stocksChartHistory[StockSymbol] = data;
              // const stocksHistoryStr = JSON.stringify(stocksChartHistory); 
              // localStorage.setItem ('stocksChartHistory', stocksHistoryStr);
              
              // too frequent AlphaVantage api calls
              if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                  alert (`${dataStr} (${sym}) \n\n${API_Call} `);
                  //setChartData ('');
                  return;
              }
              if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
                alert (dataStr.substring(0, 35) + ` symbol(${sym}) \n\n${API_Call}`);
                //setChartData ('');
                return;
              }

              var stockChartXValuesFunction = [];              
              var stockChartYValuesFunction = [];
              let periodTag;
              if (weekly)
                periodTag = 'Weekly Adjusted Time Series';
              else
                periodTag = "Time Series (Daily)"

              // prepare historical data for plotly chart
              let i = 0;

              var splits = "";
              var splitArray = [];
              if (rows[row_index].values.splits_calc === 'table' && rows[row_index].values.splits_list_table !== undefined)
                splitArray = rows[row_index].values.splits_list_table;
              else {
                for (var key in chartData[`${periodTag}`]) {
                  stockChartXValuesFunction.push(key);
                  stockChartYValuesFunction.push(Number (chartData[`${periodTag}`][key]['1. open']));
                  // if (i > 1140)
                  //   continue;  //ignore splits before 22 years
                  if (i > 0) {
                    let jump = stockChartYValuesFunction[i] / stockChartYValuesFunction[i-1];
                    if (jump > 1.4 && jump < 1.6) {
                      jump = (jump * 2).toFixed(2);
                      jump /= 2;
                      const  split = {ratio: jump, date: key};
                      splitArray.push(split);                       
                    }
                    if (jump > 1.8 || jump < 0.6) {
                      jump = jump.toFixed(2);
                      //splits += `date=${key}  ratio=${ratio} week=${i}, `;
                      const  split = {ratio: jump, date: key};
                      splitArray.push(split); 
                    }                        
                  }
                  i++;
                }
              }
              console.log (sym, rows[row_index].values.splits_calc, splitArray);
              
              // compensate for splits
              if (splitArray.length > 0 && splitsCalcFlag) {
                for (let i = 0; i < splitArray.length; i++) {
                  var jump = splitArray[i].ratio;

                  if (rows[row_index].values.splits_calc !== 'table') {
                    if (jump > 1)
                      jump = Math.round (jump);
                    else
                      jump = 1 / Math.round (1/jump);
                  }
                  const splitDate = splitArray[i].date.split('-');
                  var chartIndex = searchDateInArray (stockChartXValuesFunction, splitDate)  
                  for ( let j = chartIndex; j < stockChartYValuesFunction.length; j++) {
                      stockChartYValuesFunction[j] /= jump;
                  }
                }
              }

              if (stockChartXValuesFunction.length === 0) {
                console.log ('stockChartXValuesFunction  empty')
                return;
              }
              setStockChartXValues (stockChartXValuesFunction);  // save for plotly chart
              setStockChartYValues (stockChartYValuesFunction);
        
              // var  GOOGCompare = GainValidate (chartSymbol, rows, stockChartXValuesFunction, stockChartYValuesFunction, gain_validation_json, props.refreshCallBack);

              if (splitArray.length > 0)
                splits = JSON.stringify(splitArray);
              else
                splits = '';  

              const updateMili = Date.now();
              const updateDate = getDate();
              var date;
              const todaySplit = todayDateSplit();

              var wk = -1;
              var dateBackSplit = daysBack (todaySplit, 7);
              var chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex === undefined)
                wk = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);
              
              var wk2 = -1;
              dateBackSplit = daysBack (todaySplit, 14);
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined) 
                wk2 = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);
  
              var mon = -1;
              dateBackSplit = monthsBack (todaySplit, 1);
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined)
                mon = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);
  
              var mon3 = -1;
              dateBackSplit = monthsBack (todaySplit, 3);
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined)
                mon3 = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);            
  
              var mon6 = -1;
              dateBackSplit = monthsBack (todaySplit, 6);
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined)
                mon6 = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);            

              var year = -1;
              dateBackSplit = monthsBack (todaySplit, 12);
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined)
                year = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);            

              var year2 = -1;
              dateBackSplit = monthsBack (todaySplit, 24); 
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined)
                year2 = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);            

              var year5 = -1;
              dateBackSplit = monthsBack (todaySplit, 60); // 5 years
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined)
                year5 = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);            

              var year10 = -1;
              dateBackSplit = monthsBack (todaySplit, 120); // 10 years
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined) 
                year10 = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);            

              var year20 = -1;
              dateBackSplit = monthsBack (todaySplit, 240); // 20 years
              chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
              if (chartIndex !== undefined)
                year20 = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);            
  
              var price = stockChartYValuesFunction[0];
              if (price === undefined)
                price = -1;
              updateTableGain (sym, splits, updateDate, updateMili, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price, undefined);        
           }
        )
  }
  

  const handleDeleteClick = (symbol) => {
    try {
      const index = rows.findIndex((row)=> row.values.symbol === symbol);
      if (index === -1) {
        alert ('symbol not found ', symbol);
        return;
      } 
      rows.splice(index, 1);
      saveTable();
      props.refreshCallBack(-1); // force refresh
      //window.location.reload();
    } catch (e) {console.log(e)}
  }

  // two handlers for adding new symbol
  const handleAddFormChange = (event) => {
    event.preventDefault();
    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value.toUpperCase();

    const newFormData = { ...addFormData};
    newFormData[fieldName] = fieldValue;
    setAddFormData(newFormData);
  }

  const handleAddFormSubmit = (event) => {
    event.preventDefault();
  
    //console.log (addFormData.symbol)
    const re = new RegExp('^[a-zA-Z0-9^._=-]*$');  // Verify valid symbol in englis letters
    if (! re.test (addFormData.symbol)) {
      alert (`Invalid letters: ${addFormData.symbol}`);
      return;
    }

    // check for duplicate symbol
    const index = rows.findIndex((row)=> row.values.symbol.toUpperCase() === addFormData.symbol.toUpperCase());
    if (index !== -1) {
      alert ('Trying to add duplicate symbol: (' + addFormData.symbol + ')');
      return;
    }

    var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    prepareRow(newStock);

    newStock.id = nanoid();
    newStock.values.symbol = addFormData.symbol.toUpperCase();
    newStock.original.symbol = addFormData.symbol.toUpperCase();
    newStock.cells = null;
    newStock.allCells = [];
    
    rows.push (newStock);
    //firebaseGetAndFill();      
    saveTable();
    props.refreshCallBack(-1);
    //window.location.reload();
  }

  const {
    // clearSelectedRows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
    // selectedFlatRows,
    allColumns, getToggleHideAllColumnsProps,
  } = useTable ({
    columns,
    data,
    initialState: {
      hiddenColumns: ["Exchange","Industry","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio","EVToEBITDA","EVToRevenue","wk","wk2","mon6","year20","splits_list","alphaPrice","alphaDate","googDate","googPrice","info_date","gain_date","drop","recoverWeek","dropDate"]
    } // "gap",

  },
  useGlobalFilter, useSortBy, useRowSelect, //useSticky, useBlockLayout, useFlexLayout, useAbsoluteLayout
  //  (hooks) => {
  //   hooks.visibleColumns.push((columns) => {
  //     return [
  //       {
  //         id: 'selection',
  //         Header: ({getToggleAllRowsSelectedProps}) => (
  //           null
  //           // <CheckBox {...getToggleAllRowsSelectedProps()} />
  //         ),
  //         Cell: ({row}) => (
  //           //<CheckBox {...row.getToggleRowSelectedProps()} />
  //           // <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button>
  //           <div>   
  //           <button type="button" onClick={()=>handleGainClick(row.values.symbol)}>gain</button> 
  //           <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button> 
  //           {/* <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button> */}
  //           </div> 
  //         )
  //       }, 
  //       ...columns
  //     ]
  //   })
  // }  
  )

  function toggleGoogCompareColumns ()  {
    var ind = allColumns.findIndex((column)=> column.Header === 'alphaPrice');
    allColumns[ind].toggleHidden();
    ind = allColumns.findIndex((column)=> column.Header === 'alphaDate');
    allColumns[ind].toggleHidden();
    ind = allColumns.findIndex((column)=> column.Header === 'googDate');
    allColumns[ind].toggleHidden();
    ind = allColumns.findIndex((column)=> column.Header === 'googPrice');
    allColumns[ind].toggleHidden();
  }

  const saveTable = () => {
    const stocks = [];
    for (let i = 0; i < rows.length; i++) {
      stocks.push(rows[i].values);
    }
    const stocksStr = JSON.stringify(stocks);
    if (stocks.length > 0)
      localStorage.setItem ('stocks', stocksStr);
    else
      localStorage.removeItem ('stocks'); // reading empty array cause a bug
    localStorage.setItem ('state', JSON.stringify(state));
  }
  const flexCallBack = (flex) => {
    console.log (flex);
    setFlex (flex);
  }

  const dropCallBack = (stockSymbol, drop, deepWeek, recoverWeek, dropDate, priceDivHigh) => {
    //console.log (stockSymbol, drop, deepWeek, recoverWeek);
    const index = rows.findIndex((row)=> row.values.symbol === stockSymbol);
    if (index === -1) {
      alert (`crash recovery symbol not found (${stockSymbol})`);
      return;
    } 
    // rows[index]values.
    rows[index].values.drop = drop;
    rows[index].values.recoverWeek = recoverWeek;
    rows[index].values.dropDate = dropDate;
    rows[index].values.priceDivHigh = priceDivHigh;
  }

  // css inline style="margin:-10 padding: -10 height: 13px overflow:hidden display:block float:left"
  const { globalFilter } = state

  const handleChange = () => {setSplitsCalcFlag(! splitsCalcFlag)}
  const columnHideFlagChange = () => {setColumnHideFlag (! columnHideFlag)}
  
  const style = {
    padding: '0px',
    margin: '0px'
    //background: 'blue',
    // color: 'red',
    // fontSize: 200,
    //border: '2px solid green'
  };

  return (
    <>

        <script type="text/javascript"> 
            var WinNetwork = new ActiveXObject("WScript.Network"); 
            alert(WinNetwork.UserName);  
        </script> 
        <label id="calc_splits_label_id">
          <input
            type="checkbox" checked={splitsCalcFlag}
            onChange={handleChange}
          /> 
          calc_splits
        </label>

        <button type="button" className="CompareColumns" onClick={()=>toggleGoogCompareColumns()}>googCompareColumns </button>        
        <button type="button" className="stock_button_class" onClick={()=>saveTable()}>saveTable    </button>

          <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter}  />
        
          <CheckBox {...getToggleHideAllColumnsProps()} />   Toggle All

        <div>
          <input
            type="checkbox" checked={columnHideFlag}
            onChange={ columnHideFlagChange}
        /> columnHide
        </div>

      {columnHideFlag && 
        <div id="columnToggle">
          {
          allColumns.map(column => (
            <div id="columnToggle_id" key={column.id}>
              <label id="column_Label_id">
                <input type='checkbox' {...column.getToggleHiddenProps()} />
                {column.Header}
              </label>
            </div>
          ))
          }
        </div>
      }

      <div id="add_stock_id">
      <form  onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="required"
            placeholder="Add stock symbol ..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add  ({rows.length})  </button>
      </form>
      
      </div>

      <table id="stockTable" {...getTableProps()}>
      <thead>
        {headerGroups.map ((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')} 
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? <FaArrowUp color='blue'/> : <FaArrowDown color='red'/>) : ''} 
                  </span>
                  </th>
              ))}
            </tr>
        ))}
      </thead>
    
      <tbody id="tableBodyId" {...getTableBodyProps()}>
        {
          rows.map(row => {
            // {style: (row.GOOGCompare > 1.1 || row.GOOGCompare < 0.9) ? {background: red}}
            prepareRow(row)
            return (
              <tr id='stock_row_id'
                {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
                  <div>
                  <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button>
                  <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button>     
                  <button type="button" onClick={()=>handleGainClick(row.values.symbol)}>gain</button> 
                  </div>
              </tr>
            )
          })}
      </tbody>
    </table>
       
    <div>
     {/* {console.log (chartSymbol)} */}

      <StockChart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}    splitsFlag = {splitsFlag} />

      <GainValidate symbol ={chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues} gain_validation_json={gain_validation_json} refreshCallBack = {props.refreshCallBack} />
      
      <div>
        <Firebase localIp={localIp} ipStockRef = {ipStockRef} gainRef = {gainRef} infoRef = {infoRef} rows={rows} prepareRow={prepareRow} db = {db} admin = {admin} saveTable = {saveTable} refreshCallBack = {props.refreshCallBack} updateTableGain ={updateTableGain} updateTableInfo  = {updateTableInfo} allColumns={allColumns} />
      </div>
     
        <div className='w-100 text-left mt-2'>  <Link to="/dashboard" > Login Dashboard </Link> </div>
        <StockRecoveryCalc StockSymbol = {chartSymbol} rows = {rows} dropCallBack = {dropCallBack} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues} allColumns={allColumns}  />

      <div id='manual_id'>    
        <Splits symbol ={chartSymbol} rows = {rows} admin = {admin} localIpv4 = {localIpv4}  saveTable = {saveTable}refreshCallBack = {props.refreshCallBack}/>

        {admin && <MarketStackApi symbol={chartSymbol} admin = {admin} />}
        
        <Config flexCallBack = {flexCallBack} alphaCallBack = {alphaCallBack}/>

        <Manual userAgent={userAgent}/>
        
        <StockInfo stockInfo = {stockInfo} />
      </div>
    </div> 
    </>
  )
}
