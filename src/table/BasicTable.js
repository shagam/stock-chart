import React, {useState, useMemo} from 'react'
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
import {searchDeepValue, DropRecoveryButtons} from './DropRecovery'
import {marketwatchGainValidate, polygon} from './GainValidateMarketwatch'

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
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, getDate, dateStr} from './Date'
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import IpContext from './IpContext';

import StockSplitsGet from '../splits/StockSplitsGet'

export const BasicTable = (props) => {

  const [error, setError] = useState()
  const [chartSymbol, setChartSymbol] = useState("");
  //const [chartData, setChartData] = useState("");
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [verifyDateOffset, setVerifyDateOffset ] = useState(Number(-1));  // last entry by default
  const [apiKeyIndex, setApiKeyIndex] = useState (0);
  const [API_KEY, setAPI_KEY] = useState('');
  const [splitsFlag, setSplitsFlag] = useState('');
  
  const [splitsCalcFlag, setSplitsCalcFlag] = useState(true);
  const [openMarketFlag, setOpenMaretFlag] = useState(true);
  const [marketwatch, setMarketwatch] = useState (true);
  const [stockInfo, setStockInfo] = useState ('');

  const gainRef = collection(db, "stock-gain_")
  const infoRef = collection(db, "stock-info")

  const ipStockRef = collection(db, "stockIp")
  const [flex, setFlex] = useState ();

  const [columnHideFlag, setColumnHideFlag] = useState(true);
  const [searchDeepDate, setSearchDeepDate] = useState()
  const [lastgain, setLastGain] = useState() 

  const [deepStartDate, setDropStartDate] = useState(new Date(2022, 0, 1)); // jan 1 2022


  const LOG_FLAG = false;
  const LOG_SPLITS = false;
  const LOG_FIREBASE = true;

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
 
  function refreshByToggleColumns ()  {
    var ind = allColumns.findIndex((column)=> column.Header === 'symbol');
    const isInvisible_ = allColumns[ind].isVisible;
    allColumns[ind].toggleHidden();  // toggle twice force render refresh
    allColumns[ind].toggleHidden();
  }
  
  // send stock gain to firebase, delete old and add new one (No woory about format change)
  const firebaseGainAdd = async (symbol, src) => {
    const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
    if (row_index === -1) {
      console.log (symbol, 'missing symbol')
      return;
    }
    const oneDayMili = 1000 * 3600 + 24;

    if (rows[row_index].values.gain_mili === undefined || Date.now() - rows[row_index].values.gain_mili > oneDayMili) {
      console.log (symbol, 'Abort firebase gain update, missing gain. src:', src)
      return; // write only if fresh gain info
    }

    if (rows[row_index].values.splitsUpdateMili === undefined || Date.now() - rows[row_index].values.splitsUpdateMili > oneDayMili){
      console.log (symbol, 'Abort firebase gain update, missing splits. src:', src)
      return; // write only if fresh splits info
    }

    if (rows[row_index].values.verifyUpdateMili === undefined || Date.now() - rows[row_index].values.verifyUpdateMili > oneDayMili) {
      console.log (symbol, 'Abort firebase gain update, missing verify. src:', src)
      return; // write only if fresh verify info
    }
 
    if (rows[row_index].values.deepUpdateMili === undefined || Date.now() - rows[row_index].values.deepUpdateMili > oneDayMili) {
      console.log (symbol, 'Abort firebase gain update, missing deep. src:', src)
      return; // write only if fresh deep info     
    }


    // read old entries, to avoid duplicates
    var userQuery = query (gainRef, where('__symbol', '==', symbol));
    const gain = await getDocs(userQuery);

    // add new entry
    try {
    await addDoc (gainRef, {__symbol: rows[row_index].values.symbol,
      _ip: localIpv4,
      _updateDate: rows[row_index].values.gain_date,
      _updateMili:rows[row_index].values.gain_mili,
      splits: rows[row_index].values.splits_list, wk: rows[row_index].values.wk, wk2: rows[row_index].values.wk2,
      mon: rows[row_index].values.mon, mon3: rows[row_index].values.mon3, mon6: rows[row_index].values.mon6,
      year: rows[row_index].values.year, year2: rows[row_index].values.year2, year5: rows[row_index].values.year5,
      year10: rows[row_index].values.year10, year20: rows[row_index].values.year20, price: rows[row_index].values.price,
      verify_1: rows[row_index].values.verify_1, deep: rows[row_index].values.deep, recoverWeek: rows[row_index].values.recoverWeek,
      deepDate: rows[row_index].values.deepDate, priceDivHigh: rows[row_index].values.priceDivHigh})
      if (LOG_FIREBASE)
        console.log (symbol, 'gain-send to firebase. src:', src);
      saveTable(symbol);
    } catch (e) {console.log (symbol, e)}

    // delete old entries
    // if (LOG_FIREBASE && gain.docs.length > 0)
    //   console.log (symbol, 'delete old entries:', gain.docs.length)  
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

  const   updateTableGain = (sym, splits, updateDate, updateMili, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price) => {
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
    try {
    if (splits !== '') {
      if (splits.startsWith('u')) {
        alert ('bad splits json ' + splits + ' ' + sym)
      }
      const splitsParse = JSON.parse(splits);
      const splitsCount = splits.length;
    }
    } catch (e) {console.log('Bad splits', e, sym.splits) }
    if (! splits || splits === '' || splits.length === 0 || splits[0].jump === 0)
      setSplitsFlag('');
    else
      setSplitsFlag('(splits)');

    if (rows[row_index].values.target_raw !== undefined && rows[row_index].values.price !== 0)
      rows[row_index].values.target = Number((rows[row_index].values.target_raw/rows[row_index].values.price).toFixed(2))
    if (LOG_FLAG)
      console.log(sym,'to firebase deep:', rows[row_index].values.deep, 'recoverIndex:', rows[row_index].values.recoverWeek,
      rows[row_index].values.deepDate, rows[row_index].values.priceDivHigh)

    firebaseGainAdd (sym, 'gain');  // save in firestore
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
      rows[index].values.target = Number((rows[index].values.target_raw/rows[index].values.price).toFixed(2))
    
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
    console.log('gain/chart symbol:', sym); 
    if (sym === '' || sym === undefined) {
      alert (`bug, chart sym vanished (${sym})`);
      return;
    }

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    StockSplitsGet(sym, rows, setError)

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
              // if (LOG_SPLITS && splitArray && splitArray.length > 0)
              //   console.dir (splitArray);
              var splitArrayList = [];
              if (splitArray && splitArray.length > 0)
                splitArrayList = JSON.parse(splitArray)
              
              // if (splitArrayList.lenght  > 0 && LOG_SPLITS)
              //   console.dir (splitArrayList)

              // get chart arrays from data
              for (var key in chartData[`${periodTag}`]) {
                stockChartXValuesFunction.push(key);
                const yValue = Number (Number (chartData[`${periodTag}`][key][`${openOrCloseText}`]).toFixed(3))
                stockChartYValuesFunction.push(yValue);
              }

              // save last gain for compare and avoid dowble split compensation
              setLastGain (stockChartYValuesFunction[stockChartYValuesFunction.length - 1])
                
              // collect compensation vars
              var splitsIndexArray = [];

              // compensate for splits
                for (let splitNum = 0; splitNum < splitArrayList.length; splitNum++) { 
                  var jump = splitArrayList[splitNum].ratio;
                  // console.log (JSON.stringify (splitArrayList[splitNum]));
                  const splitDate = dateSplit (splitArrayList[splitNum].date);
                  if (splitArrayList[splitNum].date == null)
                    alert (sym, 'wrong split info', splitNum)
                  var chartIndex = searchDateInArray (stockChartXValuesFunction, splitDate, sym)
                  if (chartIndex < 1) {// error not fount
                    if (LOG_SPLITS)
                      console.log ("Split out of range", sym, JSON.stringify (splitArrayList[splitNum]), chartIndex)
                    continue;
                  }
                  // find max jump of split index
                  if (true || chartIndex < stockChartXValuesFunction.length - 5) {
                    var maxJump = 1;
                    var maxJumpWeekNum = chartIndex;
                    const chartIndexOrg = chartIndex;
                    var m = chartIndex >= 4 ?  chartIndex - 4 : 0;
                    const maxEnd = chartIndex + 5 < stockChartYValuesFunction.length - 2 ? chartIndex + 5 : stockChartYValuesFunction.length - 2
                    for (; m <  chartIndex + 5; m ++) {
                      var jump_ = Math.abs (stockChartYValuesFunction[m] / stockChartYValuesFunction[m + 1]);
                      if (jump_ > maxJump) {
                        maxJump = jump_;
                        maxJumpWeekNum = m + 1; // adjust maxJumpWeekNum (add 1 for the first need to change)
                      }
                      if (1 / jump_ > maxJump ) {
                        maxJump = 1 / jump_;
                        maxJumpWeekNum = m + 1;
                      }
                    }

                    if (chartIndexOrg !== maxJumpWeekNum && LOG_SPLITS)
                      console.log ('index corrected org=', chartIndexOrg, ' changed to=', maxJumpWeekNum);

                    var valuesBefore='';
                    for (var j = chartIndex - 3; j < chartIndex + 3; j++) {
                      valuesBefore += stockChartYValuesFunction[j] + ' '
                    }
                    // console.log ('SplitIndex corrected=', weekNum, 'uncorrected=', chartIndex, stockChartYValuesFunction[weekNum])
                    if (LOG_SPLITS) {
                      console.log('Max Jump weekMum=', maxJumpWeekNum, 'dateAtJmp=', stockChartXValuesFunction[maxJumpWeekNum], 'priceAtJmp=', stockChartYValuesFunction[maxJumpWeekNum])
                      console.log(sym, 'before compensation (' + chartIndex + ', ' + stockChartYValuesFunction[chartIndex] + ') ' + valuesBefore);
                    }

                  }
                  else
                    console.log ('wrong dislay index, split close to end', chartIndex, stockChartXValuesFunction.length)
                  splitsIndexArray.push (chartIndex);

                  // compensation calc
                  if (LOG_SPLITS)
                    console.log (sym, 'compensate split', splitArrayList[splitNum])
                  if (splitsCalcFlag) {  // if flag is off do not compensate
                    for ( let k = maxJumpWeekNum; k < stockChartYValuesFunction.length; k++) {
                        (stockChartYValuesFunction[k] = Number (Number (Number (stockChartYValuesFunction[k]) / jump).toFixed(2)));
                    }
                  } else
                     if (LOG_SPLITS) console.log ('no compensation')
                  // print after compensation
                  var valuesAfter='';
                  for (var l = chartIndex - 3; l < chartIndex + 3; l++) {
                    valuesAfter += stockChartYValuesFunction[l] + ' '
                  }
                  if (LOG_SPLITS)
                    console.log (sym, 'after compensation (', chartIndex + ', ' + stockChartYValuesFunction[chartIndex] + ') ' + valuesAfter)
                  // console.log ('loop end ', splitNum);
                }            

              if (stockChartXValuesFunction.length === 0) {
                console.log ('stockChartXValuesFunction  empty')
                return;
              }
              setStockChartXValues (stockChartXValuesFunction);  // save for plotly chart
              setStockChartYValues (stockChartYValuesFunction);

              if (marketwatch)
                marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, verifyDateOffset, props.refreshCallBack, firebaseGainAdd);
              else
                GainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, gain_validation_json) // static table

              const updateMili = Date.now();
              const updateDate = getDate();
              // var date;
              const todaySplit = todayDateSplit();

              var wk = Number(-1);
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
              searchDeepValue (rows, sym, stockChartXValuesFunction, stockChartYValuesFunction, deepCallBack, deepStartDate)
              updateTableGain (sym, splitArray, updateDate, updateMili, wk, wk2, mon, mon3, mon6, year, year2, year5, year10, year20, price, undefined);                      
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
      saveTable(symbol);
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
    saveTable(newStock.values.symbol);
    //window.location.reload();
    event.target.reset(); // clear input field
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
      hiddenColumns: ["Exchange","Industry","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio","EVToEBITDA","EVToRevenue","wk","wk2","mon6","year20","splits_list","alphaPrice","alphaDate","verifyDate","verifyPrice","info_date","gain_date","deep","recoverWeek","deepDate"]
      // hiddenColumns: ["Exchange","Industry","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio","EVToEBITDA","EVToRevenue","wk","wk2","mon", "mon6", "year", "year20","alphaPrice","alphaDate","verifyDate","verifyPrice","info_date","gain_date","deep","recoverWeek","deepDate"]

    } // "gap",

  },
  useGlobalFilter, useSortBy, useRowSelect, //useSticky, useBlockLayout, useFlexLayout, useAbsoluteLayout
   (hooks) => {
    hooks.visibleColumns.push((columns) => {
      return [
        {
          id: 'selection',
          Header: ({getToggleAllRowsSelectedProps}) => (
            null
            // <CheckBox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({row}) => (
            //<CheckBox {...row.getToggleRowSelectedProps()} />
            <div style={{display:'flex'}}>   
            <button type="button" onClick={()=>handleGainClick(row.values.symbol)}>gain</button> 
            <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button> 
            <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button>
            </div> 
          )
        }, 
        ...columns
      ]
    })
  }  
  )

  // swap first, and force others columns in group to follow
  function toggleverifyColumns ()  {
    var ind = allColumns.findIndex((column)=> column.Header === 'alphaDate');
    const isInvisible_ = allColumns[ind].isVisible;
    allColumns[ind].toggleHidden();

    ind = allColumns.findIndex((column)=> column.Header === 'alphaPrice');
    var isInvisible = allColumns[ind].isVisible;
    if (isInvisible === isInvisible_)
      allColumns[ind].toggleHidden();

    // ind = allColumns.findIndex((column)=> column.Header === 'verifyDate');
    // isInvisible = allColumns[ind].isVisible;
    // if (isInvisible === isInvisible_)
    //   allColumns[ind].toggleHidden();

    ind = allColumns.findIndex((column)=> column.Header === 'verifyPrice');
    isInvisible = allColumns[ind].isVisible;
    if (isInvisible === isInvisible_)
      allColumns[ind].toggleHidden();
  }

  const saveTable = (sym) => {
    const stocks = [];
    for (let i = 0; i < rows.length; i++) {
      rows[i].values.sym = rows[i].values.symbol;  //align added field sym
      stocks.push(rows[i].values);
    }
    const stocksStr = JSON.stringify(stocks);
    if (stocks.length > 0) {
      localStorage.setItem ('stocks', stocksStr);
      console.log ('stocks saveTable, length:', stocks.length, sym)
    }
    else
      localStorage.removeItem ('stocks'); // reading empty array cause a bug
    localStorage.setItem ('state', JSON.stringify(state));
    refreshByToggleColumns ();
  }

  const flexCallBack = (flex) => {
    console.log (flex);
    setFlex (flex);
  }

  const deepCallBack = (stockSymbol, deep, deepWeek, recoverWeek, deepDate, priceDivHigh) => {
    //console.log (stockSymbol, deep, deepWeek, recoverWeek);
    const index = rows.findIndex((row)=> row.values.symbol === stockSymbol);
    if (index === -1) {
      alert (`crash recovery symbol not found (${stockSymbol})`);
      return;
    } 
    // rows[index]values.
    rows[index].values.deep = Number(deep);
    rows[index].values.recoverWeek = Number(recoverWeek);
    rows[index].values.deepDate = deepDate;
    rows[index].values.priceDivHigh = Number(priceDivHigh);
    rows[index].values.deepUpdateMili = Date.now();
    if (LOG_FLAG) {
      console.log(stockSymbol, 'old deep:', rows[index].values.deep, 'recoverIndx:', rows[index].values.recoverWeek,
      'deep date/val:', rows[index].values.deepDate, rows[index].values.priceDivHigh)

      console.log (stockSymbol, 'new deep:', deep, deepWeek, recoverWeek, deepDate, priceDivHigh)
    }
  }

  // css inline style="margin:-10 padding: -10 height: 13px overflow:hidden display:block float:left"
  const { globalFilter } = state

  // checkboxes 
  const calcChange = () => {setSplitsCalcFlag(! splitsCalcFlag)}
  const openMaretFlagChange = () => {setOpenMaretFlag ( ! openMarketFlag)}
  const columnHideFlagChange = () => {setColumnHideFlag (! columnHideFlag)}
  const marketwatchToggle = () => {setMarketwatch (! marketwatch)}

  const freq = 'week'
  const limit = 1500;
  function polygonCompare () {
    // e.preventDefault();
    //console.log('You clicked submit.');
    if (chartSymbol) {
      const date1Split = monthsBack(todayDateSplit(), 24);
      const date1 = dateStr (date1Split)
      const date2 = todayDate();
      const polygonData = polygon(chartSymbol, rows, date1, date2, freq, limit)
      console.dir (polygonData)
    }
    else
      alert ('Need to click gain for a symbol')
  }

  function marketStackCompare () {
    if (chartSymbol) {
      const date1Split = monthsBack(todayDateSplit(), 24);
      const date1 = dateStr (date1Split)
      const date2 = todayDate();
      if (admin)
        MarketStackApi (chartSymbol, admin) 
    }
    else
      alert ('Need to click gain for a symbol')
  }
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
          <div> <Link to="/dashboard" > Login Dashboard </Link>  </div> 
          {error && <div>  &nbsp; &nbsp; {error} </div>}
        </div>

        {/* <script type="text/javascript"> 
            var WinNetwork = new ActiveXObject("WScript.Network"); 
            alert(WinNetwork.UserName);  
        </script>  */}

        <div id="buttons_id" style={{display:'flex'}}>
          {admin && <div> <input  type="checkbox" checked={marketwatch}  onChange={marketwatchToggle} />  marketwatchVerify &nbsp;</div>}
          {admin && <GlobalFilter className="stock_button_class" filter={verifyDateOffset} setFilter={setVerifyDateOffset} name='VerifyDateOffset'  />}
          {admin && <div> &nbsp; <button onClick={polygonCompare} > polygonCompare </button> &nbsp; </div>}
          {admin && <div> <button onClick={marketStackCompare} > marketStack </button> &nbsp; </div>} 
        </div>

        <div id="buttons_id" style={{display:'flex'}}>
          {admin && <div> <input  type="checkbox" checked={splitsCalcFlag}  onChange={calcChange} /> calc_splits &nbsp; &nbsp;</div>}     
          <div> <input  type="checkbox" checked={openMarketFlag}  onChange={openMaretFlagChange} /> open_market &nbsp; &nbsp;</div>      
          <button type="button" className="CompareColumns" onClick={()=>toggleverifyColumns()}>verifyColumns </button> 
          &nbsp; &nbsp;       
          <button type="button" className="stock_button_class" onClick={()=>saveTable()}>saveTable    </button>
          &nbsp; &nbsp;   
          <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter} name='Search' />
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
            // {style: (row.verify_1 > 1.1 || row.verify_1 < 0.9) ? {background: red}}
            prepareRow(row)
            return (
              <tr id='stock_row_id'
                {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
                  {/* <div style={{display:'flex'}}>
                    <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button>
                    <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button>     
                    <button type="button" onClick={()=>handleGainClick(row.values.symbol)}>gain</button> 
                  </div> */}
              </tr>
            )
          })}
      </tbody>
    </table>
       
    <div>
     {/* {console.log (chartSymbol)} */}

      <StockChart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}    splitsFlag = {splitsFlag} />
      
      <div>
        <Firebase localIp={localIp} ipStockRef = {ipStockRef} gainRef = {gainRef} infoRef = {infoRef} rows={rows} prepareRow={prepareRow} db = {db} admin = {admin} saveTable = {saveTable} refreshCallBack = {props.refreshCallBack} updateTableGain ={updateTableGain} updateTableInfo  = {updateTableInfo} allColumns={allColumns} />
      </div>
        <DropRecoveryButtons StockSymbol = {chartSymbol} rows = {rows} allColumns={allColumns} deepStartDate={deepStartDate} setDropStartDate={setDropStartDate} />
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
