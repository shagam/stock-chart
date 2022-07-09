import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect, useBlockLayout, useFlexLayout, useAbsoluteLayout } from 'react-table'
import { useSticky } from 'react-table-sticky'
//import styled from 'styled-components';
//import{ Styles } from './TableStyles'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'
import GAIN_VALIDATION from './GainValidate.json'
import './table.css'
import GlobalFilter from './GlobalFilter'
import CheckBox from './CheckBox'
import StockChart from '../Stock-chart'
import Splits from '../splits/Splits'
import MarketStackApi from './MarketStackApi'
import DropRecovery from './DropRecovery'
import PriceCompare from './PriceCompare'

import StockInfo from './StockInfo'
import GainValidate from './GainValidate'
import Manual from '../manual/Manual'
import Firebase from './Firebase'
import Config from './Config'

import {nanoid} from 'nanoid';

//import cloneDeep from 'lodash/cloneDeep';


import {db} from '../firebaseConfig'
import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom'

import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
//import {} from "https:///www.gstatc"
import {todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, getDate} from './Date'
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import IpContext from './IpContext';

import StockSplitsGet from '../splits/StockSplitsGet'

export const BasicTable = (props) => {

  const [chartSymbol, setChartSymbol] = useState("");
  //const [chartData, setChartData] = useState("");
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);

  const [apiKeyIndex, setApiKeyIndex] = useState (0);
  const [API_KEY, setAPI_KEY] = useState('');
  const [splitsFlag, setSplitsFlag] = useState('');
  
  const [splitsCalcFlag, setSplitsCalcFlag] = useState(true);
  const [openMarketFlag, setOpenMaretFlag] = useState(true);
  const [marketwatch, setMarketwatch] = useState (true);
  const [stockInfo, setStockInfo] = useState ('');
  // const [ipStockSymbol, setIpStockSymbol] = useState(undefined);
  // const [firebaseFillMili, setFirebaseFillMili] = useState(0);

  const gainRef = collection(db, "stock-gain_")
  const infoRef = collection(db, "stock-info")

  const ipStockRef = collection(db, "stockIp")
  const [flex, setFlex] = useState ();

  const [columnHideFlag, setColumnHideFlag] = useState(true);

  const LOG_FLAG = false;
  const LOG_SPLITS = true;

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


  const { login, currentUser, admin } = useAuth();
  const {localIp, localIpv4} = IpContext();
 
  
  // send stock gain to firebase, delete old and add new one (No woory about format change)

  const firebaseGainAdd = async (symbol, updateDate, updateMili, splits, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price, GOOGCompare, drop, recoverWeek, dropDate, priceDivHigh) => {
    // read old entries
    if (drop === undefined)
      drop = -1;
    if (splits == undefined)
      splits = '';
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
    // monthsBackTest ();
    // daysBackTest()
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

    rows[row_index].values.sym = sym; // added field
    rows[row_index].values.splits_list = splits;
    // console.log (splits)
    if (splits !== '') {
      const splitsParse = JSON.parse(splits);
      const splits_calc = splits.length;
    }

    saveTable();
    props.refreshCallBack(-1); // force refresh
    if (! splits || splits === '' || splits.length === 0 || splits[0].jump === 0)
      setSplitsFlag('');
    else
      setSplitsFlag('(splits)');

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

  const openOrCloseText = openMarketFlag ? '1. open' : '4. close';

  const handleGainClick = (sym) => {
    setChartSymbol (sym);

    localStorage.setItem ('chartSymbol', sym);
    console.log(`symbol: ${sym}`); 
    if (sym === '' || sym === undefined) {
      alert (`bug, chart sym vanished (${sym})`);
      return;
    }

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    StockSplitsGet(sym, rows, saveTable, props.refreshCallBack)

    const API_KEY_ = getAPI_KEY(); //'BC9UV9YUBWM3KQGF';
    const period = [['DAILY', 'Daily'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  

    const weekly = true;
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
              if (LOG_FLAG) {
                console.log (API_Call);
                console.log (dataStr.substring(0,150));
              }
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
              // let i = 0;

              var splitArray = rows[row_index].values.splits_list;
              if (LOG_SPLITS && splitArray && splitArray.length > 0)
              console.dir (splitArray);
              var splitArrayList = [];
              if (splitArray && splitArray.length > 0)
                splitArrayList = JSON.parse(splitArray)
              
              if (splitArrayList.lenght  > 0 && LOG_SPLITS)
                console.dir (splitArrayList)

              // get chart arrays from data
              for (var key in chartData[`${periodTag}`]) {
                stockChartXValuesFunction.push(key);
                const yValue = Number (Number (chartData[`${periodTag}`][key][`${openOrCloseText}`]).toFixed(3))
                stockChartYValuesFunction.push(yValue);
              }
           
              // collect compensation vars
              var splitsIndexArray = [];

              // compensate for splits
              if (splitArrayList.length > 0) {
                for (let splitNum = 0; splitNum < splitArrayList.length; splitNum++) { 
                  var jump = splitArrayList[splitNum].ratio;
                  console.log (JSON.stringify (splitArrayList[splitNum]));
                  const splitDate = dateSplit (splitArrayList[splitNum].date);
                  var chartIndex = searchDateInArray (stockChartXValuesFunction, splitDate, sym)
                  
                  // find max jump of split index
                  if (chartIndex > 2 && chartIndex < stockChartXValuesFunction.length - 5) {
                    var splitIndex = chartIndex - 4;
                    var maxJump = 1;
                    var weekNum = chartIndex;
                    for (; splitIndex <  chartIndex + 4; splitIndex ++) {
                      var jump = Math.abs (stockChartYValuesFunction[chartIndex] / stockChartYValuesFunction[chartIndex + 1]);
                      if (jump > maxJump ) {
                        maxJump = jump;
                        weekNum = chartIndex;
                        chartIndex = splitIndex + 1;
                      }
                    }
                    if (chartIndex !== weekNum) {
                      var txt='';
                      for (var j = chartIndex - 5; j < chartIndex + 5; j++) {
                        txt += stockChartYValuesFunction[j] + ' '
                      }
                      console.log ('SplitIndex corrected=', weekNum, 'uncorrected=', chartIndex, stockChartYValuesFunction[weekNum])
                      console.log('hist=', txt);
                      chartIndex = weekNum - 1;
                    }
                  }
                  splitsIndexArray.push (chartIndex);
                  // compensation calc
                  if (splitsCalcFlag) {  // if flag is off do not compensate
                    for ( let j = chartIndex; j < stockChartYValuesFunction.length; j++) {
                        (stockChartYValuesFunction[j] = Number (Number (stockChartYValuesFunction[j] / jump).toFixed(2)));
                    }
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

              if (marketwatch)
                PriceCompare (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction);
              else
                GainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, gain_validation_json)

              const updateMili = Date.now();
              const updateDate = getDate();
              // var date;
              const todaySplit = todayDateSplit();

              var wk = Number(-1);
              var wk2 = Number(-1);
              var wk2 = Number(-1);
              var mon = Number(-1);
              var mon3 = Number(-1);
              var mon6 = Number(-1);
              var year = Number(-1);
              var year2 = Number(-1);
              var year5 = Number(-1);
              var year10 = Number(-1);
              var year20 = Number(-1);

              if (weekly) {
                wk =Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[1]).toFixed(2));
                if (stockChartYValuesFunction.length > 2)
                  wk2 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[2]).toFixed(2));
                if (stockChartYValuesFunction.length > 4)
                  mon = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[4]).toFixed(2));
                if (stockChartYValuesFunction.length > 13)
                  mon3 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[13]).toFixed(2));
                if (stockChartYValuesFunction.length > 26)
                  mon6 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[26]).toFixed(2));
                if (stockChartYValuesFunction.length > 52)
                  year = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[52]).toFixed(2));
                if (stockChartYValuesFunction.length > 104)
                  year2 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[104]).toFixed(2));
                if (stockChartYValuesFunction.length > 260)
                  year5 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[260]).toFixed(2));
                if (stockChartYValuesFunction.length > 520)
                  year10 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[520]).toFixed(2));
                if (stockChartYValuesFunction.length > 1024)
                  year20 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[1040]).toFixed(2));
              }
              else {
                var dateBackSplit = daysBack (todaySplit, 7);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex === undefined)
                  wk = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2))
          
                dateBackSplit = daysBack (todaySplit, 14);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined) 
                  wk2 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));

                dateBackSplit = monthsBack (todaySplit, 1, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined)
                  mon = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));
    
                dateBackSplit = monthsBack (todaySplit, 3, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined)
                  mon3 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            
          
                dateBackSplit = monthsBack (todaySplit, 6, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined)
                  mon6 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 12, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined)
                  year = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 24, sym); 
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined)
                  year2 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 60, sym); // 5 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined)
                  year5 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 120, sym); // 10 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined) 
                  year10 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 240, sym); // 20 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym)
                if (chartIndex !== undefined)
                  year20 = Number((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            
              }

              var price = stockChartYValuesFunction[0];
              if (price === undefined)
                price = -1;
              // if (LOG_SPLITS)
              // console.log (splitArray);  
              updateTableGain (sym, splitArray, updateDate, updateMili, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price, undefined);        
           }
        )
        saveTable();
        props.refreshCallBack(-1); 
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
      // window.location.reload();
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
    newStock.values.sym = addFormData.symbol.toUpperCase();
    newStock.original.sym = addFormData.symbol.toUpperCase();
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
      // hiddenColumns: ["Exchange","Industry","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio","EVToEBITDA","EVToRevenue","wk","wk2","mon", "mon6", "year", "year20","alphaPrice","alphaDate","googDate","googPrice","info_date","gain_date","drop","recoverWeek","dropDate"]

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
  //           <div style={{display:'flex'}}>   
  //           <button type="button" onClick={()=>handleGainClick(row.values.symbol)}>gain</button> 
  //           <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button> 
  //           <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button>
  //           </div> 
  //         )
  //       }, 
  //       ...columns
  //     ]
  //   })
  // }  
  )

  // swap first, and force others columns in group to follow
  function toggleGoogCompareColumns ()  {
    var ind = allColumns.findIndex((column)=> column.Header === 'alphaDate');
    const isInvisible_ = allColumns[ind].isVisible;
    allColumns[ind].toggleHidden();

    ind = allColumns.findIndex((column)=> column.Header === 'alphaPrice');
    var isInvisible = allColumns[ind].isVisible;
    if (isInvisible === isInvisible_)
      allColumns[ind].toggleHidden();

    ind = allColumns.findIndex((column)=> column.Header === 'googDate');
    isInvisible = allColumns[ind].isVisible;
    if (isInvisible === isInvisible_)
      allColumns[ind].toggleHidden();

    ind = allColumns.findIndex((column)=> column.Header === 'googPrice');
    isInvisible = allColumns[ind].isVisible;
    if (isInvisible === isInvisible_)
      allColumns[ind].toggleHidden();
  }

  const saveTable = () => {
    const stocks = [];
    for (let i = 0; i < rows.length; i++) {
      rows[i].values.sym = rows[i].values.symbol;  //align added field sym
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

  // checkboxes 
  const calcChange = () => {setSplitsCalcFlag(! splitsCalcFlag)}
  const openMaretFlagChange = () => {setOpenMaretFlag ( ! openMarketFlag)}
  const columnHideFlagChange = () => {setColumnHideFlag (! columnHideFlag)}
  const marketwatchToggle = () => {setMarketwatch (! marketwatch)}
  
  // const style = {
  //   padding: '0px',
  //   margin: '0px'
  //   //background: 'blue',
  //   // color: 'red',
  //   // fontSize: 200,
  //   //border: '2px solid green'
  // };

  return (
    <>
        <div className='w-100 text-left mt-2 d-flex '>   
          {currentUser && <div><strong>   </strong> {currentUser.email}   &nbsp;  </div> }  
          {admin && <div> <strong>(admin)</strong>  &nbsp; </div>}
          {/* <div style={{display:'flex'}}>
          {currentUser && <div><strong>Email:  </strong> {currentUser.email}</div> } */}
        {/* </div> */}
  
          <div> <Link to="/dashboard" > Login Dashboard </Link>  </div> 
        </div>

        {/* <script type="text/javascript"> 
            var WinNetwork = new ActiveXObject("WScript.Network"); 
            alert(WinNetwork.UserName);  
        </script>  */}

        <div id="buttons_id" style={{display:'flex'}}> 
          <div> <input  type="checkbox" checked={marketwatch}  onChange={marketwatchToggle} /> marketwatch </div>
          &nbsp; &nbsp;

          <div> <input  type="checkbox" checked={splitsCalcFlag}  onChange={calcChange} /> calc_splits </div>
          &nbsp; &nbsp;
          <div> <input  type="checkbox" checked={openMarketFlag}  onChange={openMaretFlagChange} /> open_market </div>
          &nbsp; &nbsp;
          <button type="button" className="CompareColumns" onClick={()=>toggleGoogCompareColumns()}>googCompareColumns </button> 
          &nbsp; &nbsp;       
          <button type="button" className="stock_button_class" onClick={()=>saveTable()}>saveTable    </button>
          &nbsp; &nbsp;   
          <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter}  />
          &nbsp;&nbsp;
          <CheckBox {...getToggleHideAllColumnsProps()} />   Toggle All
          &nbsp;&nbsp;       
          <div> <input type="checkbox" checked={columnHideFlag}  onChange={ columnHideFlagChange} /> columnHide  </div>
        </div>

      {columnHideFlag && 
        <div id="columnToggle">
          {
          allColumns.map(column => (
            <div key={column.id}>
              <label id="column_Label_id">
                <input type='checkbox' {...column.getToggleHiddenProps()}  />
                &nbsp;{column.Header}   &nbsp; &nbsp;
              </label>
            </div>
          ))
          }
        </div>
      }
       
      <div id="add_stock_id">
        <form className='w-100 text-left mt-2 d-flex ' onSubmit = {handleAddFormSubmit}>
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
                  <div style={{display:'flex'}}>
                    <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button>
                    <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button>     
                    <button type="button" onClick={()=>handleGainClick(row.values.symbol)}>gain</button> 
                    {/* {admin && <button type="button" onClick={()=>StockSplitsGet(row.values.symbol, rows)}>splits</button>} */}
                  </div>
              </tr>
            )
          })}
      </tbody>
    </table>
       
    <div>
     {/* {console.log (chartSymbol)} */}

      <StockChart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}    splitsFlag = {splitsFlag} />

      {/* { marketwatch && <GainValidate symbol ={chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues} gain_validation_json={gain_validation_json} refreshCallBack = {props.refreshCallBack} />} */}
      
      <div>
        <Firebase localIp={localIp} ipStockRef = {ipStockRef} gainRef = {gainRef} infoRef = {infoRef} rows={rows} prepareRow={prepareRow} db = {db} admin = {admin} saveTable = {saveTable} refreshCallBack = {props.refreshCallBack} updateTableGain ={updateTableGain} updateTableInfo  = {updateTableInfo} allColumns={allColumns} />
      </div>
     
        <DropRecovery StockSymbol = {chartSymbol} rows = {rows} dropCallBack = {dropCallBack} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues} allColumns={allColumns}  />

      <div id='manual_id'>    
        {/* <Splits symbol ={chartSymbol} rows = {rows} admin = {admin} localIpv4 = {localIpv4}  saveTable = {saveTable}refreshCallBack = {props.refreshCallBack}/> */}

        {admin && <MarketStackApi symbol={chartSymbol} admin = {admin} />}
        
        <Config flexCallBack = {flexCallBack} alphaCallBack = {alphaCallBack}/>

        <Manual />
        
        <StockInfo stockInfo = {stockInfo} />
      </div>
    </div> 
    </>
  )
}
