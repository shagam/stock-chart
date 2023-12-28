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
// import Splits from '../splits/Splits'
import MarketStackApi from './MarketStackApi'
import {searchDeepValue, DropRecoveryButtons} from './DropRecovery'
import {Peak2PeakGui} from './Peak2Peak'
import {marketwatchGainValidate} from './GainValidateMarketwatch'
import {polygon} from './Polygon'
import GetInt from '../utils/GetInt'
import StockInfo from './StockInfo'
import StockGain from './StockGain'
import GainValidate from './GainValidate'
import Manual from '../manual/Manual'
import Firebase from './Firebase'
import Config from './Config'
import LogFlags from '../LogFlags'
import peak2PeakCalc from './Peak2PeakCalc'
import Verify from './Verify'
import {spikesSmooth, spikesGet} from './Spikes'
import {nanoid} from 'nanoid';
import {format} from "date-fns"

//import cloneDeep from 'lodash/cloneDeep';


import {db} from '../firebaseConfig'
import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom'

import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
//import {} from "https:///www.gstatc"
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import IpContext from './IpContext';
import MobileContext from '../contexts/MobileContext'

import StockSplitsGet from '../splits/StockSplitsGet'
import '../GlobalVar'
import { ServerSelect } from './ServerSelect'
import ErrorList from './ErrorList'
import CookieConsent from 'react-cookie-consent'

export const BasicTable = (props) => {

  const [errors, setErrors] = useState([]);
  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");
  const [gainMap, setGainMap] = useState([]);

  const servList = ['dinagold.org', '62.90.44.227', 'localhost', ];
  const [ssl, setSsl] = useState(true)
  const [servSelect, setServSelect] = useState(servList[0]);

  const tblHightList = ['25vh', '35vh', '45vh', '55vh'];
  const [tblHight, setTblHight] = useState(tblHightList[2]);

  //const [chartData, setChartData] = useState("");
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [gainData, setGainData] = useState();
  const [verifyDateOffset, setVerifyDateOffset ] = useState(Number(-1));  // last entry by default
  
  const [logFlags, setLogFlags] = useState([]);
  const LOG_FLAG = logFlags && logFlags.includes('aux');
  const LOG_API = logFlags && logFlags.includes('api');
  const LOG_SPLITS = logFlags && logFlags.includes('splits');
  const LOG_FIREBASE = logFlags && logFlags.includes('firebase');
  const LOG_alpha = logFlags && logFlags.includes('alpha');
  const LOG_DROP = logFlags && logFlags.includes('drop_');


  // ,'C542IZRPH683PFNZ','BC9UV9YUBWM3KQGF','QMV6KTIDIPRAQ9R0','Q6A0J5VH5720QBGR'
  const HIGH_LIMIT_KEY = '71CKKX7NZI1G1FRK'

  var aleph = localStorage.getItem('alphaVantage');
  const [API_KEY, setAPI_KEY] = useState(aleph);
  if (API_KEY === null)
    setAPI_KEY(HIGH_LIMIT_KEY)
  if (LOG_alpha)
    console.log (API_KEY)

  
  const [splitsCalcFlag, setSplitsCalcFlag] = useState(true);
  const [openMarketFlag, setOpenMaretFlag] = useState(false);
  const [smoothSpikes, setSmoothSpikes] = useState(true);
  const [marketwatch, setMarketwatch] = useState (true);
  const [stockInfo, setStockInfo] = useState ('');

  const [weekly, setWeekly] = useState (true);

  // const homeUrl = '84.95.84.236'
  // const [corsServer, setCorsServer] = useState (homeUrl);
  const gainRef = collection(db, "stock-gain_")
  const infoRef = collection(db, "stock-info")

  const ipStockRef = collection(db, "stockIp")
    // var flexConfig = localStorage.getItem('flex');


  const [columnHideFlag, setColumnHideFlag] = useState(false);
  // const [searchDeepDate, setSearchDeepDate] = useState()

  const [deepStartDate, setDropStartDate] = useState(new Date(2021, 9, 1)); // 2021 oct 1   Mon 0-11
  
  const useData = false;

  const hiddenColsDefault = ["Exchange","Industry","Cap","PEG","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio",
  "EVToEBITDA","EVToRevenue","mon3","mon6","year20","splits_list","splits","alphaPrice","alphaDate","verifyDate","verifyPrice",
  "info_date","gain_date","deep","recoverWeek","deepDate","priceDivHigh","verify_1"] // ,"target"

  var hiddenCols = JSON.parse(localStorage.getItem('columnsHidden'))
  if (! hiddenCols) {
    hiddenCols = hiddenColsDefault;
    if (LOG_FLAG)
      console.log ('hiddenColumns', hiddenCols)
  }

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
  function errorAdd (err) {
    errors.unshift ([getDateSec(), ...err])
    refreshByToggleColumns()
  }

  const { login, currentUser, admin } = useAuth();
  const {localIp, localIpv4} = IpContext();
  const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();

  async function refreshByToggleColumns ()  {
    var ind = allColumns.findIndex((column)=> column.Header === 'symbol');
    const isInvisible_ = allColumns[ind].isVisible;
     
    // toggle twice force render refresh
    // setTimeout(() => console.log(), 50); 

    allColumns[ind].toggleHidden(); 
    allColumns[ind].toggleHidden(); 
  }

  function hiddenColumnsSave () {
    var hiddenArray = [];
    for (let ind = 0; ind < allColumns.length; ind++) {
      if (! allColumns[ind].isVisible) {
        hiddenArray.push (allColumns[ind].id)
      }
    }
    localStorage.setItem ('columnsHidden', JSON.stringify(hiddenArray))
    if (logFlags && logFlags.includes('hiddenCols'))
      console.log ('hiddenColumnsSave', JSON.stringify(hiddenArray))
  }


  // send stock gain to firebase, delete old and add new one (No woory about format change)
  const firebaseGainAdd = async (symbol, src) => {
    const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
    if (row_index === -1) {
      console.log (symbol, 'missing symbol')
      return;
    }
    const oneDayMili = 1000 * 3600 + 24;
    var diff = Date.now() - rows[row_index].values.gain_mili;
    if (rows[row_index].values.gain_mili === undefined || diff > oneDayMili) {
      let date = new Date(rows[row_index].values.gain_mili);
      console.log (symbol, 'Abort firebase gain update, missing gain. src:', src, 'diff:', diff / 1000, date.toString())
      return; // write only if fresh gain info
    }

    if (! isAdjusted()) {
      diff = Date.now() - rows[row_index].values.splitsUpdateMili;
      if (rows[row_index].values.splitsUpdateMili === undefined || Date.now() - rows[row_index].values.splitsUpdateMili > oneDayMili){
        if (LOG_FIREBASE)
          console.log (symbol, 'Abort firebase gain update, missing splits. src:', src, 'diff:', diff)
        return; // write only if fresh splits info
      }

      diff = Date.now() - rows[row_index].values.verifyUpdateMili;
      if (rows[row_index].values.verifyUpdateMili === undefined || Date.now() - rows[row_index].values.verifyUpdateMili > oneDayMili) {
        if (LOG_FIREBASE)
          console.log (symbol, 'Abort firebase gain update, missing verify. src:', src, 'diff:', diff)
        return; // write only if fresh verify info
      }
    }

    diff = Date.now() - rows[row_index].values.deepUpdateMili;
    if (rows[row_index].values.deepUpdateMili === undefined || Date.now() - rows[row_index].values.deepUpdateMili > oneDayMili) {
      console.log (symbol, 'Abort firebase gain update, missing deep. src:', src, 'diff:', diff)
      return; // write only if fresh deep info     
    }


    // read old entries, to avoid duplicates
    var userQuery = query (gainRef, where('__symbol', '==', symbol));
    const gain = await getDocs(userQuery);
    if (rows[row_index].values.splits_list === undefined)
        rows[row_index].values.splits_list = '[]';
    if (rows[row_index].values.splits === undefined)
      rows[row_index].values.splits = -1;
      if (rows[row_index].values.verify_1 === undefined)
      rows[row_index].values.verify_1 = -1;
    rows[row_index].values.gain_date = getDate();
    // add new entry
    try {
    await addDoc (gainRef, {__symbol: rows[row_index].values.symbol,
      _ip: localIpv4,
      _updateDate: rows[row_index].values.gain_date,
      _updateMili:rows[row_index].values.gain_mili,
      splits: rows[row_index].values.splits_list,
      mon3: rows[row_index].values.mon3, mon6: rows[row_index].values.mon6,
      year: rows[row_index].values.year, year2: rows[row_index].values.year2, year5: rows[row_index].values.year5,
      year10: rows[row_index].values.year10, year20: rows[row_index].values.year20,
      peak2Peak: rows[row_index].values.peak2Peak, price: rows[row_index].values.price,
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

  function setSer (serv) {
    console.log ('setServer new:', serv, 'old:', servSelect)
    setServSelect(serv)
  }
  // function setTblHight_ (serv) {
  //   console.log ('setServer new:', serv, 'old:', servSelect)
  //   setTblHight(serv)
  // }

  const alphaCallBack = (key) => {
    if (LOG_alpha)
      console.log ('setState new', key, 'old state', API_KEY) 
    setAPI_KEY (key);
  } 

  function isAdjusted () {
    return (API_KEY === HIGH_LIMIT_KEY) 
  }

  //const [rows, setRows] = useState (data);

  const [addFormData, setAddFormData] = useState({    })

// get stock overview
  const handleInfoClick = (symbol) => {
    // monthsBackTest ();
    // daysBackTest()
    //callBack ("tableCallBack");

    localStorage.setItem ('infoSymbol', symbol); 
    console.log(symbol, '(info)');
    if (symbol === '' || symbol === undefined) {
      alert (`bug, info sym vanished (${symbol})`); 
      return;
    }
    
    let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}` 

    //console.log(`Overview info (${symbol})`);
    if (LOG_API)
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
                  if (LOG_API)
                    console.dir(data)
                  if (dataStr === '{}') {
                    const index = rows.findIndex((row)=> row.values.symbol === symbol);
                    rows[index].values.PE = -2  // flag non valid
                    // alert (`etf or invalid symbol (no info) symbol=${symbol} data="${dataStr}"`);
                    errorAdd([` ${symbol} etf or invalid symbol (has no info) data="${dataStr}" PE=-2 `])
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
                  setInfoSymbol(symbol)
                  setStockInfo (JSON.stringify(data));
                  updateTableInfo (data, updateDate, updateMili);
                  saveTable(symbol);
                }
            }
        )
    
  }

  const   updateTableGain = (sym, splits, updateDate, updateMili, mon3, mon6, year, year2, year5, year10, year20, price) => {
    //console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
    const row_index = rows.findIndex((row)=> row.values.symbol === sym);            
    if (row_index === -1) {
      alert (`stock-table, history call back, invalid chartSymbol (${sym}) trying to updatehistory values` );
      return;
    }

    firebase_stockSymbol_ip_pair(sym);

    rows[row_index].values.gain_mili = updateMili;
    // rows[row_index].values.gain_date = updateDate;
    rows[row_index].values.mon3 = mon3;
    rows[row_index].values.mon6 = mon6; 
    rows[row_index].values.year = year; 
    rows[row_index].values.year2 = year2; 
    rows[row_index].values.year5 = year5; 
    rows[row_index].values.year10 = year10;
    rows[row_index].values.year20 = year20;
    // rows[row_index].values.peak2Peak = peak2Peak;
    rows[row_index].values.price = price;

    rows[row_index].values.sym = sym; // added field
    rows[row_index].values.splits_list = splits;
    // console.log (splits)
    try {
    if (splits) {
      if (splits.startsWith('u')) {
        alert ('bad splits json ' + splits + ' ' + sym)
      }
      const splitsParse = JSON.parse(splits);
      const splitsCount = splits.length;
    }
    } catch (e) {console.log('Bad splits', e, sym.splits) }

    if (LOG_API)
    console.dir (rows[row_index].values)
    if (rows[row_index].values.target_raw !== undefined && rows[row_index].values.price !== undefined)
      rows[row_index].values.target = Number((rows[row_index].values.target_raw/rows[row_index].values.price).toFixed(2))
    if (LOG_DROP)
      console.log(sym,'to firebase deep:', rows[row_index].values.deep, 'recoverIndex:', rows[row_index].values.recoverWeek,
      rows[row_index].values.deepDate, rows[row_index].values.priceDivHigh)

    firebaseGainAdd (sym, 'gain');  // save in firestore
    saveTable(sym);
  }
  const updateTableInfo = (childData, updateDate, updateMili)  => {
    if (childData === null || childData["Exchange"] == null) {
      console.log ('ChildData missing');
      return;
    }
    //console.log (JSON.stringify(childData).substring(0,100));
    const symbol = childData["Symbol"];
    const index = rows.findIndex((row)=> row.values.symbol === symbol);

    rows[index].values.Exchange = childData["Exchange"].substring(0,4);
    rows[index].values.Industry = childData["Industry"];
    const PE = childData["PERatio"];
    // if (PE === 'None') {
    //   console.log (symbol)
    // }
    rows[index].values.PE = (PE === 'None' || PE === undefined) ? -1 : Number(PE);
    const PEG = childData["PEGRatio"];
    rows[index].values.PEG = (PEG === 'None' || PEG === undefined) ? -1 : Number (PEG); 
    rows[index].values.TrailPE = Number (childData["TrailingPE"]);
    rows[index].values.ForwPE = Number (childData["ForwardPE"]);
    rows[index].values.Div = Number (childData["DividendYield"]);
    rows[index].values.BETA = Number (childData["Beta"]);
    rows[index].values.EVToEBITDA = Number (childData["EVToEBITDA"]);
    rows[index].values.EVToRevenue = Number (childData["EVToRevenue"]);
    rows[index].values.target_raw = Number (childData["AnalystTargetPrice"]);
    rows[index].values.Cap = Number (childData["MarketCapitalization"] / 1000 / 1000 / 1000).toFixed(2);
    rows[index].values.PriceToBookRatio = Number (childData["PriceToBookRatio"]);
    //Sector         

    rows[index].values.info_mili = updateMili;
    rows[index].values.info_date = updateDate;

    if (rows[index].values.price !== undefined && rows[index].values.target_raw !== undefined)
      rows[index].values.target = Number((rows[index].values.target_raw/rows[index].values.price).toFixed(2))
    
    childData.Address = '';   // Clear some data to decrese traffic
    childData.Description = '';
    
    // calc Graham price
    const EPS = Number (childData["EPS"]);
    const BookValue = Number (childData["BookValue"]);
    const graham = Math.sqrt(22.5 * EPS * BookValue).toFixed(2)

    var grahamTxt =`grahamPrice=${graham}`
    const price=rows[index].values.price
    if (price) 
      grahamTxt += '  CurrentPrice=' + price;
    grahamTxt  +=  `   ( EPS=${EPS}  BookValue=${BookValue} )`
    if (LOG_FLAG)
      console.log (symbol, grahamTxt)
    setStockInfo (JSON.stringify(childData) + "\n\n" + grahamTxt);
    
    firebaseInfoAdd (symbol, getDate(), Date.now(), childData);  // save in firestore
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

  // 1. open: '87.7500'
  // 2. high: '97.7300'
  // 3. low:  '86.7500'
  // 4. close: '90.6200'
  // 5. adjusted close: '0.6867'
  // 6. volume: '25776200'
  // 7. dividend amount:'0.0000'

  // const openOrCloseText = openMarketFlag ? '1. open' : '4. close';
  let periodTag;
  if (weekly)
    periodTag = 'Weekly Adjusted Time Series';
  else
    periodTag = "Time Series (Daily)"

  function getYValue (chartData, key, openMarketFlag) {
    const openVal = Number (Number (chartData[`${periodTag}`][key]['1. open']).toFixed(3))
    const closeVal = Number (Number (chartData[`${periodTag}`][key]['4. close']).toFixed(3))
    var yValue;
    if (isAdjusted()) {
      const adjustedCloseValue = Number (Number (chartData[`${periodTag}`][key]['5. adjusted close']).toFixed(3))
      if (openMarketFlag)
        yValue = adjustedCloseValue / closeVal * openVal;
      else
        yValue = adjustedCloseValue
    } else { // not adjusted
      if (openMarketFlag)
        yValue = openVal;
      else
        yValue = closeVal;
    }
    return yValue;
  }

  const handleGainClick = (sym) => {
    setChartSymbol (sym);
    localStorage.setItem ('chartSymbol', sym);
    if (LOG_FLAG)
      console.log(sym, 'gain/chart (symbol)'); 
    if (sym === '' || sym === undefined) {
      alert (`bug, chart sym vanished (${sym})`);
      return;
    }

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);

    const ind = allColumns.findIndex((column)=> column.Header === 'splits_list');
    if (allColumns[ind].isVisible || ! isAdjusted ())  // high limit no need for compensation
      StockSplitsGet(sym, rows, errorAdd, servSelect, ssl, logFlags, null) // no need for return value

    const period = [['DAILY', 'Daily'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  

    let API_Call;
    if (weekly)
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${sym}&outputsize=compact&apikey=${API_KEY}`;
    else
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${sym}&outputsize=full&apikey=${API_KEY}`;
    
    fetch(API_Call)
        .then(
            function(response) {
                const respStr = JSON.stringify (response);
                if (response.status !== 200 || ! response.ok)
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
              if (LOG_API) {
                console.log (API_Call);
                console.dir (chartData)
                // console.log (dataStr.substring(0,150));
              }
              
              // too frequent AlphaVantage api calls
              if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                  alert (`${dataStr} (${sym}) \n\n${API_Call} ${API_KEY}  `);
                  //setChartData ('');
                  return;
              }
              const limit_100_PerDay = 'You have reached the 100 requests/day limit for your free API key'
              if (dataStr.indexOf (limit_100_PerDay) !== -1) {
                alert (`${limit_100_PerDay} (${sym}) \n\n${API_Call}  ${API_KEY} ` );
                return;
              }              
              if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
                alert (dataStr.substring(0, 35) + ` symbol(${sym}) \n\n${API_Call}`);
                //setChartData ('');
                return;
              }

              var stockChartXValuesFunction = [];              
              var stockChartYValuesFunction = [];
      
              var gainArrayTxt = "";
              // prepare historical data for plotly chart
              let i = 0; // line number
              var splitArray = rows[row_index].values.splits_list;
              // if (LOG_SPLITS && splitArray && splitArray.length > 0)
              //   console.dir (splitArray);
              var splitArrayList = [];
              if (splitArray && splitArray.length > 0)
                splitArrayList = JSON.parse(splitArray)

              // get chart arrays from data
              for (var key in chartData[`${periodTag}`]) {
                var str = JSON.stringify(chartData[periodTag][key])
                str = str.replace (/,"6. volume":"\d*","7. dividend amount":"\d*\.?\d*"/, '')
                // str = str.replace (/00"/g, '')
                gainArrayTxt += key + '  ' + i + ' ' + str + '\n' // prepare for gain display

                i++
                stockChartXValuesFunction.push(key);
                const yValue = Number(getYValue (chartData, key, openMarketFlag))

                if (yValue > 0.1)
                  stockChartYValuesFunction.push(yValue.toFixed(2));
                else
                  stockChartYValuesFunction.push(yValue.toFixed(4));
              }
              setGainData(gainArrayTxt)
              if (smoothSpikes)
                spikesSmooth (sym, stockChartXValuesFunction, stockChartYValuesFunction, logFlags)


              // collect compensation vars
              var splitsIndexArray = [];

              // compensate for splits
              if (! isAdjusted ()) {// high limit no need for compensation
                console.log ('adjustSplits')
                for (let splitNum = 0; splitNum < splitArrayList.length; splitNum++) {
                  var jump = splitArrayList[splitNum].ratio;
                  // console.log (JSON.stringify (splitArrayList[splitNum]));
                  const splitDate = dateSplit (splitArrayList[splitNum].date);
                  if (splitArrayList[splitNum].date == null)
                    alert (sym, 'wrong split info', splitNum)
                  var chartIndex = searchDateInArray (stockChartXValuesFunction, splitDate, sym, logFlags)
                  if (chartIndex < 1) {// error not fount
                    if (LOG_SPLITS)
                      console.log (sym, "Split drop/jump date not found", splitNum, JSON.stringify (splitArrayList[splitNum]), chartIndex)
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
                      console.log (sym, 'index corrected org=', chartIndexOrg, ' changed to=', maxJumpWeekNum);

                    var valuesBefore='';
                    for (var j = chartIndex - 3; j < chartIndex + 3; j++) {
                      valuesBefore += stockChartYValuesFunction[j] + ' '
                    }
                    // console.log ('SplitIndex corrected=', weekNum, 'uncorrected=', chartIndex, stockChartYValuesFunction[weekNum])
                    if (LOG_SPLITS) {
                      console.log(sym, 'Max Jump weekMum=', maxJumpWeekNum, 'dateAtJmp=', stockChartXValuesFunction[maxJumpWeekNum], 'priceAtJmp=', stockChartYValuesFunction[maxJumpWeekNum])
                      console.log(sym, 'before compensation (' + chartIndex + ', ' + stockChartYValuesFunction[chartIndex] + ') ' + valuesBefore);
                    }

                  }
                  else
                    console.log ('wrong dislay index, split close to end', chartIndex, stockChartXValuesFunction.length)
                  splitsIndexArray.push (chartIndex);

                  // compensation calc
                  if (LOG_SPLITS)
                    console.log (sym, 'compensate split', splitNum, splitArrayList[splitNum])
                  if (splitsCalcFlag) {  // if flag is off do not compensate
                    for ( let k = maxJumpWeekNum; k < stockChartYValuesFunction.length; k++) {
                        (stockChartYValuesFunction[k] = Number (Number (Number (stockChartYValuesFunction[k]) / jump).toFixed(3)));
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
              }
              if (stockChartXValuesFunction.length === 0) {
                console.log ('stockChartXValuesFunction  empty')
                return;
              }
              setStockChartXValues (stockChartXValuesFunction);  // save for plotly chart
              setStockChartYValues (stockChartYValuesFunction);

              gainMap[sym]  = {'x': stockChartXValuesFunction, 'y': stockChartYValuesFunction}
          
              if (logFlags.includes('xyValue')) {
                console.log (stockChartXValuesFunction)
                console.log (stockChartYValuesFunction)
                console.log (chartData)
              } 
              const ind = allColumns.findIndex((column)=> column.Header === 'verify_1');
              if (allColumns[ind].isVisible || ! isAdjusted) {           
              if (marketwatch)
                marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, verifyDateOffset,refreshByToggleColumns, firebaseGainAdd, servSelect, ssl, logFlags, errorAdd, null);
              else
                GainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, gain_validation_json, logFlags) // static table
              }
                peak2PeakCalc (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction,
                  weekly, logFlags, true, new Date(2007, 10, 1), new Date(2021, 11, 1), errorAdd, null, null) //setCalcResults, setCalcInfo

              const updateMili = Date.now();
              const updateDate = getDate();
              // var date;
              const todaySplit = todayDateSplit();

              var mon3 = Number(-1);
              var mon6 = Number(-1);
              var year = Number(-1);
              var year2 = Number(-1);
              var year5 = Number(-1);
              var year10 = Number(-1);
              var year20 = Number(-1);

              if (weekly) {
                if (stockChartYValuesFunction.length > 13)
                  mon3 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[13]).toFixed(2));
                if (stockChartYValuesFunction.length > 26)
                  mon6 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[26]).toFixed(2));
                if (stockChartYValuesFunction.length > 52)
                  year = (stockChartYValuesFunction[0] / stockChartYValuesFunction[52]).toFixed(2);
                if (stockChartYValuesFunction.length > 104)
                  year2 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[104]).toFixed(2));
                if (stockChartYValuesFunction.length > 260)
                  year5 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[260]).toFixed(2));
                if (stockChartYValuesFunction.length > 520)
                  year10 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[520]).toFixed(2));
                if (stockChartYValuesFunction.length > 1024)
                  year20 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[1040]).toFixed(2));
              }
              else {
                var dateBackSplit = daysBack (todaySplit, 7);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex === undefined)
                  return
              
                dateBackSplit = monthsBack (todaySplit, 3, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  mon3 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            
          
                dateBackSplit = monthsBack (todaySplit, 6, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  mon6 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 12, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);

                dateBackSplit = monthsBack (todaySplit, 24, sym); 
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year2 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 60, sym); // 5 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year5 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 120, sym); // 10 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined) 
                  year10 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 240, sym); // 20 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year20 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));         
              }

              var price = stockChartYValuesFunction[0];
              if (price === undefined)
                price = -1;
              // if (LOG_SPLITS)
              // console.log (splitArray); 
              searchDeepValue (rows, sym, stockChartXValuesFunction, stockChartYValuesFunction, deepCallBack, deepStartDate, logFlags, weekly, chartData[`${periodTag}`])
              updateTableGain (sym, splitArray, updateDate, updateMili, mon3, mon6, year, year2, year5, year10, year20, price, undefined);                      
            }
        )
  }
  
  const handleDeleteClick = (symbol) => {
    try {
      if (useData) { // avoid unclean access to rows
        const index = data.findIndex((row)=> row.symbol === symbol);
        if (index === -1) {
          alert ('symbol not found, delete ', symbol);
          return;
        } 
        data.splice(index, 1);
      } else {
      const index = rows.findIndex((row)=> row.values.symbol === symbol);
      if (index === -1) {
        alert ('symbol not found, delete_', symbol);
        return;
      } 
      rows.splice(index, 1);
      }
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

    if (useData) {
      const newSym = addFormData.symbol
      const newStock = {
        'symbol': addFormData.symbol
      }
      data.push ( newStock)
      saveTable(newSym);
    } else {
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
    }
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
    selectedFlatRows,
    state,
    setGlobalFilter,
    visibleColumns,
    allColumns, getToggleHideAllColumnsProps,
  } = useTable ({
    columns,
    data,
    initialState: {
      hiddenColumns: hiddenCols,
      sortBy: [
        {
            id: 'symbol',
            desc: false
        }
      ]
    } 
  },
  useGlobalFilter, useSortBy, useRowSelect, //useSticky, useBlockLayout, useFlexLayout, useAbsoluteLayout
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
  //       }, ...columns
  //     ]
  //   })
  // }  
  )

  
  const saveTable = (sym) => {
    setGlobalFilter () // if not cleared will save only displayed rows
    const stocks = [];
    if (useData) {
      for (let i = 0; i < data.length; i++) {
        data[i].sym = data[i].symbol;  //align added field sym
        stocks.push(data[i]);
      }
    } else {
    for (let i = 0; i < rows.length; i++) {
      rows[i].values.sym = rows[i].values.symbol;  //align added field sym
      stocks.push(rows[i].values);
    }
    }
    const stocksStr = JSON.stringify(stocks);
    if (stocks.length > 0) {
      localStorage.setItem ('stocks', stocksStr);
      const date = new Date();
      const formattedDate = format(date, "yyyy-MMM-dd hh:mm");
      console.log (sym, `(${formattedDate}) stocks saveTable, length:`, stocks.length)
    }
    else
      localStorage.removeItem ('stocks'); // reading empty array cause a bug
    localStorage.setItem ('state', JSON.stringify(state));
    refreshByToggleColumns ();
    // setError('')
  }

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

  // css inline style="margin:-10 padding: -10 height: 13px overflow:hidden display:block float:left"
  const { globalFilter } = state

  // checkboxes 
  const calcChange = () => {setSplitsCalcFlag(! splitsCalcFlag)}
  const openMaretFlagChange = () => {setOpenMaretFlag ( ! openMarketFlag)}
  const columnHideFlagChange = () => {setColumnHideFlag (! columnHideFlag)}
  const marketwatchToggle = () => {setMarketwatch (! marketwatch)}
  const sslToggle = () => {setSsl (! ssl)}

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

  function test () {
    console.log ('checkBox (marketwatch):', marketwatch, 'radio(servSelect):', servSelect, 'verifyOffset:', verifyDateOffset)
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

  // color some column hide checkbox
  function getCheckBoxColor (header) {
    if (header === 'info_date')
      return 'magenta'
      if (header === 'gain_date')
      return 'red'
    return 'black'
  }
  
  function getColor(val, column, sym) {
    if (val === undefined || val === -1 || val === '-1.00')
      return 'Black'
    if (column.id === 'verify_1') {
      if (val > 1.2 || val < 0.8)  // inconsistant data
        return 'rgb(250,10,0)' // red '#ff0000'
      else
        return 'black'
    }
    if (isNaN (val)) {
      return 'black'
  }
    if (val < '1.00') {
      return 'orange'
    }
    else {
      return 'black'//RGBA(170,214,136,0.4)';
    }
  }

  function clickedRow (row) {
    console.log (row.id, row.values.symbol)
  }

  const stockTableStyle = {
    border: '2px solid green',
    display: 'block',
    height: '55vh',
    width: '100%',
    /* min-width: 1900px; */
    'overflowy': 'scroll',
    /* background: yellow; */
    'textAlign': 'center'
  }
  
  function gainButtonColor (sym) {
    var col = {};
    if (gainMap[sym])
      col['color'] = '#00cc00'   
    if (sym === chartSymbol)
      col['background'] = 'pink'
    return col;
  }

  return (
    <>
        <div className='w-100 text-left mt-2 d-flex '>   
          {currentUser && <div><strong>   </strong> {currentUser.email}   &nbsp;  </div> }  
          {admin && <div> <strong>(admin)</strong>  &nbsp; </div>}
          {/* <div> <Link to="/dashboard" > Login Dashboard </Link>  </div>  */}
        </div>
        {errors.length > 0 && <ErrorList errorList={errors}/> }

        <div id="buttons_id" style={{display:'flex'}}>
          {/* {  <CustomSelect options={corsServerOptions} label='server' onChange={corsServerChange } defaultValue={corsServerOptions[0]} />} */}
          {admin && <div> &nbsp; <input  type="checkbox" checked={marketwatch}  onChange={marketwatchToggle} />  marketwatchVerify &nbsp;</div>}
          {/* {admin && <GlobalFilter className="stock_button_class" filter={verifyDateOffset} setFilter={setVerifyDateOffset} name='VerifyDateOffset'  />} */}

          {admin && <div> &nbsp; <button onClick={polygonCompare} > polygonCompare </button> &nbsp; </div>}

          {admin && <div> &nbsp; <input  type="checkbox" checked={ssl}  onChange={sslToggle} /> ssl &nbsp;&nbsp;</div>}
          {admin && <div style={{display:'flex'}}> <ServerSelect setServ={setSer} title='server' options={servList} defaultValue={servList[0]}/> </div>}
          {admin && <div style={{display:'flex'}}> <ServerSelect setServ={setTblHight} title='tblHight' options={tblHightList} defaultValue={tblHightList[3]}/> </div>}

          {admin && <div> &nbsp; <button onClick={test} > test </button> &nbsp; </div>}
        </div>

        <div id="buttons_id" style={{display:'flex'}}>
          {admin && <div> <input  type="checkbox" checked={splitsCalcFlag}  onChange={calcChange} /> calc_splits &nbsp;</div>}     
          <div style={{display:'flex'}}> <input  type="checkbox" checked={openMarketFlag}  onChange={openMaretFlagChange} /> &nbsp;openMarket &nbsp;&nbsp;</div> 
          <div style={{display:'flex'}}> <input  type="checkbox" checked={smoothSpikes}  onChange={() => setSmoothSpikes(! smoothSpikes)} />  &nbsp;smoothSpikes </div>
          {admin && <div> <input  type="checkbox" checked={weekly} onChange={() => {setWeekly(!weekly)}} /> weekly &nbsp;</div>  }

          &nbsp; &nbsp;       
          <button style={{height: '30px'}} type="button" className="stock_button_class" onClick={()=>saveTable()}>saveTable    </button>
          &nbsp; &nbsp;   
          <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter} name='Search' isMobile={isMobile}/>
          &nbsp;&nbsp;
           
          <div style={{display:'flex'}}> <input type="checkbox" checked={columnHideFlag}  onChange={ columnHideFlagChange} /> &nbsp;columnHide &nbsp; </div>
          {columnHideFlag && <div style={{display:'flex'}}> <CheckBox {...getToggleHideAllColumnsProps()} /> ToggleAll </div>}
          &nbsp;&nbsp; 
          {/* <button type="button" className="stock_button_class" onClick={()=>hiddenColumnRestore()}> restoreVisible    </button> */}
        </div>

      {columnHideFlag && 
        <div id="columnToggle">
          {
          allColumns.map(column => (
            <div key={column.id}>
              <label id="column_Label_id" style={{'color': getCheckBoxColor(column.Header) }}>
                <input   type='checkbox' {...column.getToggleHiddenProps()}  />
                &nbsp;{column.Header}   &nbsp; &nbsp;
              </label>
            </div>
          ))
          }
          {hiddenColumnsSave()}
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
              // <tr id='stock_row_id' key={row.id} onClick={() => clickedRow (row)}
                {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  // if (cell.column.id === 'year') {
                  //   console.log ('render', row.values.symbol, cell.value)
                  // }
                  return <td {...cell.getCellProps({style: {margin: '0px',  padding: '3px', color: getColor(cell.value, cell.column, row.values.symbol)}})}>{cell.render('Cell')}</td>
                })}
                  <div style={{display:'flex'}}>
                    <button type="button" onClick={()=>handleDeleteClick(row.values.symbol)}>del</button>
                    <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button>     
                    <button style={gainButtonColor(row.values.symbol)} type="button" onClick={()=>handleGainClick(row.values.symbol)}>gain</button> 
                  </div>
              </tr>
            )
          })}
      </tbody>
    </table>
       
    <div id='trailer_id'>

      {! isMobile && <LogFlags setLogFlags={setLogFlags} />}      

        <Firebase localIp={localIp} ipStockRef = {ipStockRef} gainRef = {gainRef} infoRef = {infoRef} rows={rows} prepareRow={prepareRow} db = {db}
         admin = {admin} saveTable = {saveTable} refreshCallBack = {refreshByToggleColumns} updateTableGain ={updateTableGain} updateTableInfo  = {updateTableInfo} allColumns={allColumns} />

        {chartSymbol && <div>
          <StockChart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}
          gainMap = {gainMap} isMobile = {isMobile} weekly = {weekly} logFlags = {logFlags} />
          <DropRecoveryButtons StockSymbol = {chartSymbol} rows = {rows} allColumns={allColumns} deepStartDate={deepStartDate} setDropStartDate={setDropStartDate} />
          
          <Peak2PeakGui symbol = {chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues}
            stockChartYValues = {stockChartYValues} logFlags = {logFlags} weekly={weekly} />
          
          <Verify symbol = {chartSymbol} rows = {rows} allColumns={allColumns} stockChartXValues = {stockChartXValues} 
            stockChartYValues = {stockChartYValues} verifyDateOffset = {verifyDateOffset} setVerifyDateOffset={setVerifyDateOffset} refreshByToggleColumns = {refreshByToggleColumns}
            firebaseGainAdd = {firebaseGainAdd}  logFlags = {logFlags} errorAdd={errorAdd}/>
            {/* props.verifyDateOffset,   props.refreshByToggleColumns, props.firebaseGainAdd,  */}
    

          {/* <Splits symbol ={chartSymbol} rows = {rows} admin = {admin} localIpv4 = {localIpv4}  saveTable = {saveTable}refreshCallBack = {props.refreshCallBack}/> */}

          {admin && <MarketStackApi symbol={chartSymbol} admin = {admin} />}

          <StockGain stockGain = {gainData} infoSymbol={chartSymbol} />
        </div>}
        
        {infoSymbol && <StockInfo stockInfo = {stockInfo} infoSymbol={infoSymbol} />}
        <Config alphaCallBack = {alphaCallBack} rows = {rows} saveTable= {saveTable} refreshByToggleColumns={refreshByToggleColumns} />
        <Manual />
        <hr/>
    </div> 
    </>
  )
}
