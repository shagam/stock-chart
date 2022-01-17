import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect, useBlockLayout } from 'react-table'
import { useSticky } from 'react-table-sticky'
import styled from 'styled-components';
import{ Styles } from './TableStyles'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'
import './table.css'
import GlobalFilter from './GlobalFilter'
import CheckBox from './CheckBox'
import Stock_chart from '../Stock-chart'
import StockRecoveryCalc from './DropRecovery'
import AlphaVantage from '../AlphaVantage'
import Manual from '../Manual'
import FirebaseManage from './FirebaseManage'

import {nanoid} from 'nanoid';
import {format} from "date-fns"
//import cloneDeep from 'lodash/cloneDeep';
import axios from 'axios'

import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where, orderByChild, firestore} from "firebase/firestore";
import { validateArgCount } from '@firebase/util'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
//import {} from "https:///www.gstatc"


export const BasicTable = (props) => {

  const [chartSymbol, setChartSymbol] = useState("");
  //const [chartData, setChartData] = useState("");
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);

  const [apiKeyIndex, setApiKeyIndex] = useState (0);
  const [API_KEY, setAPI_KEY] = useState('');
  const [splitsFlag, setSplitsFlag] = useState('');
  const [splitsCalc, setSplitsCalc] = useState(true);

  // const [ipStockSymbol, setIpStockSymbol] = useState(undefined);
  // const [firebaseFillMili, setFirebaseFillMili] = useState(0);

  const gainRef = collection(db, "stock-gain")
  const infoRef = collection(db, "stock-info")
  const ipRef = collection(db, "ipList")
  const ipStockRef = collection(db, "stockIp")

  const [admin, setAdmin] = useState(false);

  const LOG_FLAG = false;

  const columns = useMemo(() => COLUMNS, []);
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
  const [userAgent, setUserAgent] = useState("");
  const [userAgentType, setUserAgentType] = useState("");
  
  //creating function to load ip address from the API
  const getIp = async () => {
    if (localIp !== '' && localIp !== undefined) {
      //console.log('ip ', ip)
      return;
    }

    const os = require('os');
    const cpu=os.cpus();
    const hostName = os.hostname()
    const platform = os.platform();
    const type = os.type();
    const arch = os.arch();
    const uptime = os.uptime();
    var path = require('path');
    //var userInfo_ = process.env['USERPROFILE']//.split(path.sep)[2];
    // const username = require('username')
   // const userInfo = os.userInfo('buffer');
  
    // userAgent
    const userAgent = navigator.userAgent;
    setUserAgent(navigator.userAgent)
    //if (/Android/i.test(navigator.userAgent))
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
      setUserAgentType("mobil");
    } else 
      console.log("not mobile device");

    const res = await axios.get('https://geolocation-db.com/json/')
    if (LOG_FLAG)
    console.log('ip ', res.data);
    setLocalIP(res.data);
    setAdmin (res.data.IPv4 === '84.228.164.65');

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
    if (ipInfo.docs.length > 0)
      console.log (res, 'ipList', ipInfo.docs.length);
    for (let i = 0; i < ipInfo.docs.length; i++) {
      const id = ipInfo.docs[i].id;
      var ipDoc = doc(db, "ipList", ipInfo.docs[i].id);
      await deleteDoc (ipDoc);    
    }
  } 

    // get one symbol GAIN from firebase  and clean duplicates
  const firebaseGainGetOne = async (symbol) => {
    try {
      // get one symbol gain from firebase
      var userQuery = query (gainRef, where('__symbol', '==', symbol));
      const gain = await getDocs(userQuery);

      const rowIndex = rows.findIndex((row)=> row.values.symbol === symbol);            
      if (rowIndex !== -1 && gain !== undefined) {
        const gain_ = gain.docs[0].data()
        console.log (rows[rowIndex].values.gain_mili, gain_._updateMili)
        if (rows[rowIndex].values.gain_date === undefined ||
           rows[rowIndex].values.gain_mili < gain_._updateMili)
        handleCallBackForHistory (gain_.__symbol, gain_.splits, gain_._updateDate, gain_._updateMili, gain_.wk, gain_.wk2, gain_.mon, gain_.mon3, gain_.mon6, gain_.year, gain_.year2, gain_.year5, gain_.year10, gain_.year20, gain_.price);
      }
 
      if (gain.docs.length > 0) {
        var latestIndex = 0;
        if (gain.docs.length > 1) {
          console.log ('duplicates ', gain.docs.length, gain.docs[0].data()); 
          var updateMili = 0;
          // search for latest
          for (let i = 0; i < gain.docs.length; i++) {
            if (gain.docs[i].data()._updateMili > updateMili) {
              updateMili = gain.docs[i].data()._updateMili;
              latestIndex = i;
            }
          }
          // delete all dups except latest
          for (let i = 0; i < gain.docs.length; i++) {
            if (i === latestIndex)
              continue;
            const id = gain.docs[i].id;
            var gainDoc = doc(db, "stock-gain", gain.docs[i].id);
            await deleteDoc (gainDoc);    
          }               
        }
      }
    } catch(e) { console.log (e); alert (e)}
  }

  // get one symbol INFO from firebase  and clean duplicates
  const firebaseInfoGetOne = async (symbol) => {
    try {
      var userQuery = query (infoRef, where('__symbol', '==', symbol));
      const info = await getDocs(userQuery);
      if (info.docs.length > 0) {
        const rowIndex = rows.findIndex((row)=> row.values.symbol === symbol);            
        if (rowIndex !== -1 && info !== undefined) {
          const info_ = info.docs[0].data();
          if (rows[rowIndex].values.info_date === undefined ||
            rows[rowIndex].values.info_mili < info_._updateMili)
            handleOverview (info_.data, info_._updateDate, info_._updateMili)
        }

        var latestIndex = 0;
        if (info.docs.length > 1) {
          console.log ('duplicates', info.docs.length, info.docs[0].data());
          var updateMili = 0;
          // search for latest
          for (let i = 0; i < info.docs.length; i++) {
            if (info.docs[i].data()._updateMili > updateMili) {
              updateMili = info.docs[i].data()._updateMili;
              latestIndex = i;
            }
          }
          // delete all dups except latest
          for (let i = 0; i < info.docs.length; i++) {
            if (i === latestIndex)
              continue;
            const id = info.docs[i].id;
            var infoDoc = doc(db, "stock-info", info.docs[i].id);
            await deleteDoc (infoDoc);    
          }
        }
       }
    } catch(e) {console.log (e); alert (e)}
  }

  useEffect (() => { 
    //getGain();
    getIp();
     //getInfo();

  })
 
  // send stock gain to firebase, delete old and add new one (No woory about format change)
  const firebaseGainAdd = async (symbol, updateDate, updateMili, splits, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price) => {
    // read old entries
    var userQuery = query (gainRef, where('__symbol', '==', symbol));
    const gain = await getDocs(userQuery);

    // add new entry
    await addDoc (gainRef, {__symbol: symbol, _ip: localIp.IPv4, _updateDate: updateDate, _updateMili: updateMili, splits: splits, wk: wk, wk2: wk2, mon: mon, mon3: mon3, mon6: mon6, year: year, year2: year2, year5: year5, year10: year10, year20: year20, price: price })

    // delete old entries
    if (gain.docs.length > 0)
      console.log (symbol, 'gain-send', gain.docs.length);
    for (let i = 0; i < gain.docs.length; i++) {
      const id = gain.docs[i].id;
      var gainDoc = doc(db, "stock-gain", gain.docs[i].id);
      await deleteDoc (gainDoc);    
    }               
  }

  // send stock info to firebase, delete old and add new one (No woory about format change)
  const firebaseInfoAdd = async (symbol, updateDate, updateMili, newInfo) => {
    // get old entries
    var userQuery = query (infoRef, where('__symbol', '==', symbol));
    const info = await getDocs(userQuery);

    // send new entry
    await addDoc (infoRef, {__symbol: symbol, _ip: localIp.IPv4, _updateDate: updateDate, _updateMili: updateMili, data: newInfo })

    // delete old entries 
    if (info.docs.length > 0)
      console.log (symbol, 'info-send', info.docs.length); 
    for (let i = 0; i < info.docs.length; i++) {
      const id = info.docs[i].id;
      var infoDoc = doc(db, "stock-info", info.docs[i].id);
      await deleteDoc (infoDoc);    
    }
  }

  const firebaseGetAndFill = () => {
    // allow reads once a minute
    // if (Date.now() - firebaseFillMili < 1000*60)
    //   return;
    // setFirebaseFillMili(Date.now());

    // console.log (stocksInfoOne);
    // console.log (stocksGainOne);     
    // fill in table missing values
    
    // turn on columns so used can decide if up to date
    var ind = allColumns.findIndex((column)=> column.Header === 'info_date');
    allColumns[ind].toggleHidden();
    ind = allColumns.findIndex((column)=> column.Header === 'gain_date');
    allColumns[ind].toggleHidden();

    // fill missing data
    for (let i = 0; i < rows.length; i++) {
      // get from firebase 
      if (rows[i].values.info_date === undefined) {
        firebaseInfoGetOne((rows[i].values.symbol));
      }
      if (rows[i].values.gain_date === undefined) {
        firebaseGainGetOne((rows[i].values.symbol));
      }
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

  function getDate() {
    const date = new Date();
    var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
    return formattedDate;    
  }

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
                  handleOverview (data, updateDate, updateMili);
                }
            }
        )
  }

  const handleCallBackForHistory = (sym, splits, updateDate, updateMili, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price) => {
    //console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
    const index = rows.findIndex((row)=> row.values.symbol === sym);            
    if (index === -1) {
      alert (`stock-table, history call back, invalid chartSymbol (${sym}) trying to updatehistory values` );
      return;
    }

    if (Date.now() - rows[index].values.gain_mili < 1000)
      return "duplicate";

    firebase_stockSymbol_ip_pair(sym);

    rows[index].values.gain_mili = updateMili;
    rows[index].values.gain_date = updateDate;

    rows[index].values.wk = wk; //stocks[index].wk;
    rows[index].values.wk2 = wk2; //stocks[index].wk2;
    rows[index].values.mon = mon; //stocks[index].mon;
    rows[index].values.mon3 = mon3; //stocks[index].mon3;
    rows[index].values.mon6 = mon6; //stocks[index].mon6;
    rows[index].values.year = year; //stocks[index].year;
    rows[index].values.year2 = year2; //stocks[index].year2;
    rows[index].values.year5 = year5; //stocks[index].year5;
    rows[index].values.year10 = year10; //stocks[index].year10;
    rows[index].values.year20 = year20; //stocks[index].year20;
    rows[index].values.price = price;

    rows[index].values.splits_list = splits;
    if (splits === '')
      rows[index].values.splits_calc = '';
    else if (splitsCalc)
      rows[index].values.splits_calc = 'calc';
    else
      rows[index].values.splits_calc = 'raw';
    //rows[index].values.splits_calc = splits === '' ? '' : splitsCalc ? 'smooth' : 'raw';
    saveTable();
    props.callBack(-1); // force refresh
    if (splits === '' || splits.length === 0)
      setSplitsFlag('');
    else
      setSplitsFlag(' splits ??');

      if (rows[index].values.target_raw !== undefined)
        rows[index].values.target = (rows[index].values.target_raw/rows[index].values.price).toFixed(2)

  }

  const handleOverview = (childData, updateDate, updateMili)  => {
    if (childData === null || childData === {} || childData["Exchange"] == null) {
      console.log ('ChildData missing');
      return;
    }
    console.log (JSON.stringify(childData).substring(0,100));
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
    props.callBack(-1);
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
    const ip = localIp.IPv4;
    var ipSymbolQuery = query (ipStockRef, where('ip', '==', ip), where
    ('stockSymbol', '==', chartSymbol ));
    const ipSymbolPair = await getDocs(ipSymbolQuery);
    if (ipSymbolPair.docs.length > 0)
      return;
    // add new entry
    await addDoc (ipStockRef, {ip: ip, update: getDate(), stockSymbol: chartSymbol});

    // // delete duplicate entries
    // for (let i = 0; i < ipSymbolPair.docs.length; i++) {
    //   const id = ipSymbolPair.docs[i].id;
    //   var ipDoc = doc(db, "stockIp", ipSymbolPair.docs[i].id);
    //   await deleteDoc (ipDoc);    
    // }               
  }


  const handleChartClick = (sym) => {
    setChartSymbol (sym);
    localStorage.setItem ('chartSymbol', sym);
    console.log(`symbol: ${sym} chartSymbol: ${chartSymbol}`); 
    if (sym === '' || sym === undefined) {
      alert (`bug, chart sym vanished (${sym})`);
      return;
    }

    const API_KEY_ = getAPI_KEY(); //'BC9UV9YUBWM3KQGF';
    const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  

    let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${sym}&outputsize=compact&apikey=${API_KEY_}`;

    
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
              let periodTag = 'Weekly Adjusted Time Series';

              // prepare historical data for plotly chart
              let i = 0;
              var splits = "";
              var splitArray = [];
              for (var key in chartData[`${periodTag}`]) {
                  stockChartXValuesFunction.push(key);
                  stockChartYValuesFunction.push(chartData[`${periodTag}`][key]['1. open']);
                  if (i > 1140)
                    continue;  //ignore splis before 22 years
                  if (i > 0) {
                    let ratio = stockChartYValuesFunction[i] / stockChartYValuesFunction[i-1];
                    if (ratio > 1.8 || ratio < 0.6) {
                      ratio = ratio.toFixed(2);
                      //splits += `date=${key}  ratio=${ratio} week=${i}, `;
                      const  split = {ratio: ratio, date: key, week: i};
                      splitArray.push(split); 
                    }                        
                  }
                  i++;
              }

              // compensate for splis
              if (splitArray.length > 0 && splitsCalc) {
                for (let i = 0; i < splitArray.length; i++) {
                  var ratio = splitArray[i].ratio;
                  if (ratio > 1)
                    ratio = Math.round (ratio);
                  else
                    ratio = 1 / Math.round (1/ratio);                  
                  for ( let j = splitArray[i].week; j < stockChartYValuesFunction.length; j++) {
                      stockChartYValuesFunction[j] /= ratio;
                      chartData[`${periodTag}`][key]['1. open'] /= ratio;
                  }
                }
              }
              setStockChartXValues (stockChartXValuesFunction);  // save for plotly chart
              setStockChartYValues (stockChartYValuesFunction);


              if (splitArray.length > 0)
                splits = JSON.stringify(splitArray);
              else
                splits = '';  
              if (splitArray.length > 1 && (splitArray[splitArray.length - 1].week - splitArray[0].week) < 208)
                splits = '';


              const updateMili = Date.now();
              const updateDate = getDate();
              const wk =Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[1]).toFixed(2));
              const wk2 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[2]).toFixed(2));
              const mon = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[4]).toFixed(2));
              const mon3 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[13]).toFixed(2));
              const mon6 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[26]).toFixed(2));
              const year = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[52]).toFixed(2));
              const year2 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[104]).toFixed(2));
              const year5 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[260]).toFixed(2));
              const year10 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[520]).toFixed(2));
              const year20 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[1040]).toFixed(2));
              const price = stockChartYValuesFunction[0];
              if (price === undefined)
                price = -1;
              handleCallBackForHistory (sym, splits, updateDate, updateMili, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price);        

              firebaseGainAdd (sym, updateDate, updateMili, splits,
                 wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price);  // save in firestore
            }
        )
  }
  

  const handleDeleteClick = (row, symbol) => {
    const index = rows.findIndex((row)=> row.values.symbol === symbol);
    if (index === -1) {
      alert ('symbol not found ', symbol);
      return;
    } 
    rows.splice(index, 1);
    saveTable();
    props.callBack(-1); // force refresh
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
    const re = new RegExp('^[a-zA-Z0-9\._=-]*$');  // Verify valid symbol in englis letters
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
    props.callBack(-1);
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
      hiddenColumns: ["Exchange","Industry","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio","EVToEBITDA","EVToRevenue","wk","wk2","mon6","year20","splits_list","info_date","gain_date","drop","recoverWeek","dropDate"]
    }

  },
  useGlobalFilter, useSortBy, useRowSelect, useBlockLayout, useSticky
  //  (hooks) => {
  //   hooks.visibleColumns.push((columns) => {
  //     return [
  //       {
  //         id: 'selection',
  //         Header: ({getToggleAllRowsSelectedProps}) => (
  //           <CheckBox {...getToggleAllRowsSelectedProps()} />
  //         ),
  //         Cell: ({row}) => (
  //           <CheckBox {...row.getToggleRowSelectedProps()} />
  //         )
  //       }, 
  //       ...columns
  //     ]
  //   })
  // }  
  )

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

  const dropCallBack = (stockSymbol, drop, deepWeek, recoverWeek, dropDate) => {
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
  }

  // css inline style="margin:-10 padding: -10 height: 13px overflow:hidden display:block float:left"
  const { globalFilter } = state

  const handleChange = () => {setSplitsCalc(! splitsCalc)}

  return (
    <>

        <script type="text/javascript"> 
            var WinNetwork = new ActiveXObject("WScript.Network"); 
            alert(WinNetwork.UserName);  
        </script> 
        <label id="calc_splits_label_id">
          <input
            type="checkbox" checked={splitsCalc}
            onChange={handleChange}
          /> 
          calc_splits
        </label>

        <button type="button" className="stock_button_class" onClick={()=>firebaseGetAndFill()}>Fill_gain_info    </button>

        <button type="button" className="stock_button_class" onClick={()=>saveTable()}>saveTable    </button>
             
        <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter}  />
          
        <CheckBox {...getToggleHideAllColumnsProps()} />   Toggle All  



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

      <Styles>
      <div {...getTableProps()} className="table sticky" style={{ width: 1000, height: 500 }}>
        <div className="header">
          {headerGroups.map((headerGroup) => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')} 
                <span>
                  {column.isSorted ? (column.isSortedDesc ? <FaArrowUp color='blue'/> : <FaArrowDown color='red'/>) : ''} 
                </span>
              </th>
              ))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()} className="body">
          {rows.map((row) => {
            prepareRow(row);
            return (
              <div {...row.getRowProps()} className="tr">
                {row.cells.map((cell) => (
                  <div {...cell.getCellProps()} className="td">
                    {cell.render('Cell')}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Styles>     
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

            prepareRow(row)
            return (
              <tr id='stock_row_id'
                {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
                  <div>
                  <button type="button" onClick={()=>handleDeleteClick(row, row.values.symbol)}>del</button>
                  <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button>     
                  <button type="button" onClick={()=>handleChartClick(row.values.symbol)}>gain</button> 
                  </div>
              </tr>
            )
          })}
      </tbody>
    </table>
  
   <div>
     {/* {console.log (chartSymbol)} */}

    <Stock_chart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}    splitsFlag = {splitsFlag} />

      <StockRecoveryCalc StockSymbol = {chartSymbol} rows = {rows} callBack = {dropCallBack} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}  />

      <div>
        <FirebaseManage localIp={localIp} ipStockRef = {ipStockRef} gainRef = {gainRef} infoRef = {infoRef} rows={rows} prepareRow={prepareRow} firebaseGainGetOne={firebaseGainGetOne} firebaseInfoGetOne={firebaseInfoGetOne} db = {db} admin = {admin} />
      </div>
      
      {AlphaVantage (alphaCallBack)}
      <div id='manual_id'>
        <Manual userAgent={userAgent}/>
      </div>
    </div> 
    </>
  )
}
