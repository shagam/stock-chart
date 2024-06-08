import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
// import { useTable, useSortBy, useGlobalFilter, useRowSelect, useBlockLayout, useFlexLayout, useAbsoluteLayout } from 'react-table'
import { useSticky } from 'react-table-sticky'
//import styled from 'styled-components';
//import{ Styles } from './TableStyles'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'

import './table.css'
import GlobalFilter from './GlobalFilter'
import CheckBox from './CheckBox'

// import Splits from '../splits/Splits'

import {searchDeepValue, DropRecoveryButtons} from './DropRecovery'
import {Peak2PeakGui} from './Peak2Peak'

import StockInfo from './StockInfo'
import StockGain from './StockGain'
import GainValidate from './GainValidate'
import {Holdings} from './Holdings'


import LogFlags from '../utils/LogFlags'
import peak2PeakCalc from './Peak2PeakCalc'
import searchURL from '../utils/SearchURL'
import {spikesSmooth, spikesGet} from './Spikes'
import {targetPriceAdd} from './TargetPrice'

import {nanoid} from 'nanoid';
import {format} from "date-fns"

//import cloneDeep from 'lodash/cloneDeep';


// import {db} from '../firebaseConfig'

import { Link, useNavigate } from 'react-router-dom'

import { FaArrowDown, FaArrowUp, FaSlideshare } from 'react-icons/fa'
//import {} from "https:///www.gstatc"
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import IpContext from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'

import StockSplitsGet from '../splits/StockSplitsGet'
import '../GlobalVar'
import { ServerSelect } from './ServerSelect'
import {ErrorList, beep, beep2} from '../utils/ErrorList'
import CookieConsent from 'react-cookie-consent'
import  {CommonDatabase, GainWrite} from './CommonDatabase'


import {useTable, useSortBy, useGlobalFilter, useRowSelect, useBlockLayout, useFlexLayout, useAbsoluteLayout } from 'react-table'

const Manual = lazy(() => import ('../manual/Manual'))

const Tools = lazy(() => import ('./Tools'))

const Config = lazy(() => import ('./Config'))

const Verify = lazy(() => import ('./Verify'))

// +
// in comboModule.js:
// export A from '../test/A'
// export B from '../test/B'

// in the code that needs lazy modules
// const A = lazy(() => import('./comboModule').then((module) => ({default: module.A})))
// const B = lazy(() => import('./comboModule').then((module) => ({default: module.B})))

// import {polygon} from './Polygon'
const polygon = lazy(() => import('./Polygon').then((module) => ({default: module.polygon})))

//  import {marketwatchGainValidate} from './GainValidateMarketwatch'
const marketwatchGainValidate = lazy(() => import('./GainValidateMarketwatch').then((module) => ({default: module.marketwatchGainValidate})))

const StockChart = lazy(() => import ('../Stock-chart'));

const MarketStackApi = lazy(() => import ('./MarketStackApi'))

const BasicTable = (props) => {

  const [errors, setErrors] = useState([]);
  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");
  const [gainMap, setGainMap] = useState([]);
  const [bubbleLine, setBubbleLine] = useState();

  
  const servList = [process.env.REACT_APP_AWS_IP, process.env.REACT_APP_LOCAL_SERV_IP];
  //   'localhost', process.env.REACT_APP_SERV_EXT, process.env.REACT_APP_AWS_IP_, '10.100.102.4',];
  const [ssl, setSsl] = useState(true)
  const [servSelect, setServSelect] = useState(servList[0]);

  const tblHightList = ['25vh', '35vh', '45vh', '55vh'];
  const [tblHight, setTblHight] = useState(tblHightList[2]);

  //const [chartData, setChartData] = useState("");
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [gainData, setGainData] = useState();
  const [verifyDateOffset, setVerifyDateOffset ] = useState(Number(-1));  // last entry by default
  
//   const [logFlags, setLogFlags] = useState([]);
//   const checkList = ["hiddenCols","drop", 'drop_', 'peak2Peak', 'holdings', "firebase", "verify_1", "splits",
// "xyValue", "chart", 'chart1', 'alpha','api', "aux","date","spikes","month","target"];

  const LOG_FLAG = props.logFlags && props.logFlags.includes('aux');
  const LOG_API = props.logFlags && props.logFlags.includes('api');
  const LOG_SPLITS = props.logFlags && props.logFlags.includes('splits');
  const LOG_FIREBASE = props.logFlags && props.logFlags.includes('firebase');
  const LOG_alpha = props.logFlags && props.logFlags.includes('alpha');
  const LOG_DROP = props.logFlags && props.logFlags.includes('drop_');

  var PORT;
  if (servSelect === process.env.REACT_APP_LOCAL_SERV_IP)
    PORT = 5000;
  else
    PORT = 5000

  // ,'C542IZRPH683PFNZ','BC9UV9YUBWM3KQGF','QMV6KTIDIPRAQ9R0','Q6A0J5VH5720QBGR'
  const HIGH_LIMIT_KEY = process.env.REACT_APP_ALPHAVANTAGE_KEY

  var aleph = localStorage.getItem('alphaVantage');
  const [API_KEY, setAPI_KEY] = useState(aleph);
  if (API_KEY === null)
    setAPI_KEY(HIGH_LIMIT_KEY)
  if (LOG_alpha)
    console.log (API_KEY)

  
  const [splitsCalcFlag, setSplitsCalcFlag] = useState(true);
  const [openMarketFlag, setOpenMaretFlag] = useState(false);
  const [smoothSpikes, setSmoothSpikes] = useState(true);

  const [stockInfo, setStockInfo] = useState ('');

  const [weekly, setWeekly] = useState (true);
  const [saveMili, setSaveMili] = useState();
  const [gainRawDividand, setGainRawDividand] = useState (true);

  // const homeUrl = '84.95.84.236'
  // const [corsServer, setCorsServer] = useState (homeUrl);
  // const gainRef = collection(db, "stock-gain_")

    // var flexConfig = localStorage.getItem('flex');


  const [columnHideFlag, setColumnHideFlag] = useState(false);
  // const [searchDeepDate, setSearchDeepDate] = useState()
  const [analyzeShow, setAnalyzeShow] = useState(false);

  const [deepStartDate, setDropStartDate] = useState(new Date(2021, 8, 1)); // 2021 sep 1   Mon 0-11
  
  const useData = false;

  const hiddenColsDefault = ["percent","Exchange","Industry","Cap","PE","PEG","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio",
  "EVToEBITDA","EVToRevenue","price","mon3","mon6","year20","splits_list","splits","alphaPrice","alphaDate","verifyDate","verifyPrice",
  "target","info_date","gap","gain_date","deep","recoverWeek","deepDate","priceDivHigh","verify_1"] // ,"target"

  var hiddenCols = JSON.parse(localStorage.getItem('columnsHidden'))
  if (! hiddenCols) {
    hiddenCols = hiddenColsDefault;
    if (LOG_FLAG)
      console.log ('hiddenColumns', hiddenCols)
  }

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
    const currentTime = getDateSec();
    // if (errors.length > 1 && err === errors[0][1] && currentTime === errors[0][0])
    //   return
    // else 
    //   console.log (errors)

    errors.unshift ([currentTime, ...err])
    refreshByToggleColumns()
    navigator.vibrate(500) // celular only
    //beep(100, 1000, 50) // beep(vol, freq, duration)
    beep2();
  }

  const { login, currentUser, admin } = useAuth();
  const {localIp, localIpv4, eliHome} = IpContext();
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
    if (props.logFlags && props.logFlags.includes('hiddenCols'))
      console.log ('hiddenColumnsSave', JSON.stringify(hiddenArray))
  }


  // send stock gain to firebase, delete old and add new one (No woory about format change)
  const firebaseGainAdd = async (symbol, src) => {

    GainWrite (symbol, rows, errorAdd, servSelect, PORT, ssl, props.logFlags)

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
  const handleInfoClick = (symbol, saveTabl) => {
    // monthsBackTest ();
    // daysBackTest()
    //callBack ("tableCallBack");

    localStorage.setItem ('infoSymbol', symbol); 
    if (saveTabl)
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
                    // errorAdd([` ${symbol} etf or invalid symbol (has no info) data="${dataStr}" PE=-2 `])
                    return;
                  }
                  const index =  (dataStr.search('API call frequency is 5 calls per minute'))
                  if (index !== -1) {
                    errorAdd([symbol, dataStr])
                    // alert (dataStr + `\n\n${API_Call}`);
                    //alert (dataStr);
                    return;
                  }
                      
                  const updateMili = Date.now();
                  const updateDate = getDate();
                  setInfoSymbol(symbol)
                  setStockInfo (JSON.stringify(data));
                  updateTableInfo (symbol, data, updateDate, updateMili);
                  // if (saveTabl) // skip save for info all
                  //   saveTable(symbol);
                }
            }
        )
    
  }

  const   updateTableGain = (sym, splits, updateDate, updateMili, mon3, mon6, year, year2, year5, year10, year20, price, saveTabl) => {
    //console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
    const row_index = rows.findIndex((row)=> row.values.symbol === sym);            
    if (row_index === -1) {
      alert (`stock-table, history call back, invalid chartSymbol (${sym}) trying to updatehistory values` );
      return;
    }

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
    
    targetPriceAdd (sym, rows[row_index].values.target_raw, price, props.logFlags, errorAdd, 'gain', ssl, PORT, servSelect) 

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
    if (saveTabl)
      saveTable(sym);
  }

  const updateTableInfo = (symbol, childData, updateDate, updateMili)  => {
    if (childData === null || childData["Exchange"] == null) {
      console.log ('ChildData missing');
      return;
    }
    //console.log (JSON.stringify(childData).substring(0,100));
    const symbol_ = childData["Symbol"];
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
    const targetRaw = Number (childData["AnalystTargetPrice"]);
    rows[index].values.target_raw = targetRaw 
    rows[index].values.Cap = Number (childData["MarketCapitalization"] / 1000 / 1000 / 1000).toFixed(2);
    rows[index].values.PriceToBookRatio = Number (childData["PriceToBookRatio"]);
    //Sector         
    targetPriceAdd (symbol, targetRaw, rows[index].values.price, props.logFlags, errorAdd, 'info', ssl, PORT, servSelect) 

    rows[index].values.info_mili = updateMili;
    rows[index].values.info_date = updateDate;

    if (rows[index].values.price !== undefined && rows[index].values.target_raw !== undefined)
      rows[index].values.target = Number((rows[index].values.target_raw/rows[index].values.price).toFixed(2))
    
    // childData.Address = '';   // Clear some data to decrese traffic
    // childData.Description = '';
    
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
    childData['graham'] = grahamTxt;
    setStockInfo (childData);
 

    // save target prices history for a symbol in array
    // targetPriceAdd (symbol, targetRaw, price,logFlags)

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
    const openVal = Number (Number (chartData[`${periodTag}`][key]['1. open']))
    const closeVal = Number (Number (chartData[`${periodTag}`][key]['4. close']))
    var yValue;
    if (isAdjusted()) {
      const adjustedCloseValue = Number (Number (chartData[`${periodTag}`][key]['5. adjusted close']))
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

  const handleGainClick = (sym, saveTabl) => {
    setChartSymbol (sym);
    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    const oneDayMili = 1000 * 3600 + 24;
    var diff = Date.now() - rows[row_index].values.gain_mili;
    if (! eliHome && (rows[row_index].values.gain_mili !== undefined || diff < oneDayMili)) {
      let date = new Date(rows[row_index].values.gain_mili);
      // if (LOG_FLAG)
        console.log (sym, 'Abort <gain>, too frequent. allowed once per day for sym. diff sec:', (diff / 1000).toFixed(0))
      return; // write only if fresh gain info
    }

    if (saveTabl)
      console.log(sym, 'handleGainClick  saveTable param on ')

    localStorage.setItem ('chartSymbol', sym);
    handleInfoClick(sym, saveTabl);

    if (LOG_FLAG)
      console.log(sym, 'gain/chart (symbol)'); 
    if (sym === '' || sym === undefined) {
      alert (`bug, chart sym vanished (${sym})`);
      return;
    }

    const ind = allColumns.findIndex((column)=> column.Header === 'splits_list');
    if (allColumns[ind].isVisible || ! isAdjusted ())  // high limit no need for compensation
      StockSplitsGet(sym, rows, errorAdd, servSelect, ssl, props.logFlags, null) // no need for return value

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
                errorAdd([sym, 'Invalid symbol'])
                // alert (`Invalid symbol: (${sym})`)
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
                // str = str.replace (/00"/g, '')
                gainArrayTxt += key + '  ' + i + ' ' + str + '\n' // prepare for gain display

                i++
                stockChartXValuesFunction.push(key);
                const yValue = Number(getYValue (chartData, key, openMarketFlag))

                if (yValue > 0.1)
                  stockChartYValuesFunction.push(yValue);
                else
                  stockChartYValuesFunction.push(yValue);
                if (isNaN (yValue)) {
                  console.log (sym, i, yValue)
                }
              }
              if (gainRawDividand) { // filter volume and 
                gainArrayTxt = gainArrayTxt.replace (/,"6. volume":"\d*"/g, '')      
              }
              gainArrayTxt = gainArrayTxt.replace (/,"7. dividend amount":"0.000*"/g, '')  
              setGainData(gainArrayTxt)

              if (smoothSpikes)
                spikesSmooth (sym, stockChartXValuesFunction, stockChartYValuesFunction, props.logFlags)


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
                  var chartIndex = searchDateInArray (stockChartXValuesFunction, splitDate, sym, props.logFlags)
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
                console.log (sym, 'stockChartXValuesFunction  empty')
                return;
              }
              setStockChartXValues (stockChartXValuesFunction);  // save for plotly chart
              setStockChartYValues (stockChartYValuesFunction);

              gainMap[sym]  = {'x': stockChartXValuesFunction, 'y': stockChartYValuesFunction}
          
              if (props.logFlags.includes('xyValue')) {
                console.log (stockChartXValuesFunction)
                console.log (stockChartYValuesFunction)
                console.log (chartData)
              } 
              const ind = allColumns.findIndex((column)=> column.Header === 'verify_1');
              if (allColumns[ind].isVisible || ! isAdjusted) {
                marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, verifyDateOffset,refreshByToggleColumns, firebaseGainAdd, servSelect, ssl, props.logFlags, errorAdd, null);
              }
    
              peak2PeakCalc (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction,
                  weekly, props.logFlags, true,  new Date(2007, 10, 1), new Date(2021, 11, 1), errorAdd, null, false)  //setCalcResults, setCalcInfo

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
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex === undefined)
                  return
              
                dateBackSplit = monthsBack (todaySplit, 3, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex !== undefined)
                  mon3 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            
          
                dateBackSplit = monthsBack (todaySplit, 6, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex !== undefined)
                  mon6 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 12, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex !== undefined)
                  year = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);

                dateBackSplit = monthsBack (todaySplit, 24, sym); 
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex !== undefined)
                  year2 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 60, sym); // 5 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex !== undefined)
                  year5 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 120, sym); // 10 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex !== undefined) 
                  year10 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 240, sym); // 20 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, props.logFlags)
                if (chartIndex !== undefined)
                  year20 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));         
              }

              var price = stockChartYValuesFunction[0];
              if (price === undefined)
                price = -1;
              // if (LOG_SPLITS)
              // console.log (splitArray); 
              searchDeepValue (rows, sym, stockChartXValuesFunction, stockChartYValuesFunction, deepCallBack, deepStartDate, props.logFlags, weekly, chartData[`${periodTag}`], errorAdd)
              updateTableGain (sym, splitArray, updateDate, updateMili, mon3, mon6, year, year2, year5, year10, year20, price, saveTabl);                      
            }
        )
        // handleInfoClick(sym, false);
        if (saveTabl)
          saveTable(sym);
      searchURL (props.logFlags)
  }

   // get all info for targetPrice
  function gainAll() {
    rows.forEach ((row, i) => {
      handleGainClick (row.values.symbol, false) 
    })
    saveTable();
  }

  const handleDeleteClick = (symbol) => {
    if (chartSymbol === symbol){
      alert ('Cannot del focus symbol, click <gain> on another symbol before delete')
      return;
    }
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

  // first empty call handleGainClick for each: to show chart
  // useEffect (() => { 
  //   var empty = true
  //   for (let i =0; i < rows.length; i++) {
  //     if (rows[i].values.year !== undefined && (rows[i].values.symbol === 'QQQ' || rows[i].values.symbol === 'SPY'))
  //       empty = false;
  //   }
  //   if (empty) {
  //     for (let i =0; i < rows.length; i++) {
  //       handleGainClick(rows[i].values.symbol, false)
  //     }
  //   }   
  // }, )

  const saveTable = (sym) => {
    // if (saveMili && Date.now - saveMili < 1000) {
    //   console.log (sym, 'Avoid duplicate saveTable')
    //   return;
    // }
    if (!saveMili)
      setSaveMili(Date.now())

    setGlobalFilter () // if not cleared will save only displayed rows
    const stocks = [];
    if (useData) {
      for (let i = 0; i < data.length; i++) {
        data[i].sym = data[i].symbol;  //align added field sym
        stocks.push(data[i]);
      }
    } else {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] && rows[i].values) {
          rows[i].values.sym = rows[i].values.symbol;  //align added field sym
          stocks.push(rows[i].values); // collect values to be saved in localStorage
        }
        else {
          console.log (sym, 'missing values', )
        }
      }
    }
    const stocksStr = JSON.stringify(stocks);
    if (stocks.length > 0) {
      localStorage.setItem ('stocks', stocksStr);
      const date = new Date();
      const formattedDate = format(date, "yyyy-MMM-dd hh:mm");
      console.log (sym, `(${formattedDate}) stocks saveTable, stockCount:`, stocks.length)
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
  
  function reloadPage() {
    window.location.reload(false);
  }

  function getColor(val, column, sym) {
    if (val === undefined || val === -1 || val === '-1.00')
      return 'Black'
    if (column.id === 'symbol' || column.id === 'sym') 
        return 'magenta';
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

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
  };

  const toolEnum = {
    None: 'None',
    DropRecovery: 'DropRecovery',
    Holdings: 'Holdings',
    peak2Peak: 'peak2Peak',
    Verify: 'Verify',
    StockGainRaw: 'StockGainRaw',
    StockInfoRaw: 'StockInfoRaw', 
    Tools: 'Tools'
  };
  // marginLeft: '3px', marginRight: '3px', 
  const [analyzeTool, setAnalyzeTool] = useState()
  const onOptionChange = e => {
    const tool = e.target.value;
    setAnalyzeTool(tool)
    // console.log(tool)
  }
  props.setServer(servSelect)

  return (
    <Suspense fallback={<div>Loading ... (from BaseTable)</div>}>
    <>
        <Link to="/tutorials">Tutorials</Link> &nbsp; 
        <Link to="/about">About</Link>&nbsp; 
        {/* <Link to="/manual">Manual</Link> &nbsp; &nbsp; */}

        {! isMobile && eliHome && <Link to="/logFlags">console-log-flags</Link>} &nbsp;

        {<Link to="/contactUs">Contact US</Link>}  &nbsp;
        {eliHome && <Link to="/contactGet">ContactGet</Link>} &nbsp;

        {/* <a href="https://www.google.com/search?q=vix">VIX</a> &nbsp; */}
        {/* <a href="https://finance.yahoo.com/quote/%5EVIX/">VIX </a> &nbsp; */}
        <button role="link" onClick={() => openInNewTab("https://finance.yahoo.com/quote/%5EVIX/")}> VIX </button>

        <div className='w-100 text-left mt-2 d-flex '>   
          {currentUser && <div><strong>   </strong> {currentUser.email}   &nbsp;  </div> }  
          {admin && <div> <strong>(admin)</strong>  &nbsp; </div>}
          {/* <div> <Link to="/dashboard" > Login Dashboard </Link>  </div>  */}
        </div>
        {errors.length > 0 && <ErrorList errorList={errors}/> }


        <div id="buttons_id" style={{display:'flex'}}>
          {/* {  <CustomSelect options={corsServerOptions} label='server' onChange={corsServerChange } defaultValue={corsServerOptions[0]} />} */}
          {/* {admin && <div> &nbsp; <input  type="checkbox" checked={marketwatch}  onChange={marketwatchToggle} />  marketwatchVerify &nbsp;</div>} */}
          {/* {admin && <GlobalFilter className="stock_button_class" filter={verifyDateOffset} setFilter={setVerifyDateOffset} name='VerifyDateOffset'  />} */}

          {/* {admin && <div> &nbsp; <button onClick={polygonCompare} > polygonCompare </button> &nbsp; </div>} */}

          {eliHome && <div> &nbsp; <input  type="checkbox" checked={ssl}  onChange={sslToggle} /> ssl &nbsp;&nbsp;</div>}
          {eliHome && <div style={{display:'flex'}}> <ServerSelect serv={servSelect} setServSelect={setServSelect} title='server' options={servList} defaultValue={servSelect}/> </div>}
          {/* {admin && <div style={{display:'flex'}}> <ServerSelect serv={tblHight} setServSelect={setTblHight} title='tblHight' options={tblHightList} defaultValue={tblHight}/> </div>} */}

          {admin && <div> &nbsp; <button onClick={test} > test </button> &nbsp; </div>}
        </div>

        <div id="buttons_id" style={{display:'flex'}}>
          {/* {admin && <div> <input  type="checkbox" checked={splitsCalcFlag}  onChange={calcChange} /> calc_splits &nbsp;</div>}      */}
          {/* {admin && <div> <input  type="checkbox" checked={weekly} onChange={() => {setWeekly(!weekly)}} /> weekly &nbsp;&nbsp; </div>  } */}

          {<div> <button onClick={gainAll} > gainAll </button> </div>}
          &nbsp; &nbsp; <button onClick={reloadPage} > reloadPage </button>                          
          &nbsp;&nbsp; <div style={{display:'flex'}}> <input type="checkbox" checked={columnHideFlag}  onChange={ columnHideFlagChange} /> &nbsp;columnHide &nbsp; </div>
          {columnHideFlag && <div style={{display:'flex'}}> <CheckBox {...getToggleHideAllColumnsProps()} /> ToggleAll </div>}
         </div>
     

      <div style={{display:'flex'}} id="add_stock_id">
        <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter} name='Search' isMobile={isMobile}/>
          &nbsp;&nbsp;

        <form className='w-100 text-left mt-2 d-flex ' onSubmit = {handleAddFormSubmit}>
          <input style={{width:'145px'}}
            type="text"
            name="symbol"
            required="required"
            placeholder="Add stock symbol ..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add  ({rows.length})  </button>
        </form>
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

      <table style={{marginTop: '4px'}} id="stockTable" {...getTableProps()}>
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
                    {/* <button type="button" onClick={()=>handleInfoClick(row.values.symbol, true)}>info</button>      */}
                    <button style={gainButtonColor(row.values.symbol)} type="button" onClick={()=>handleGainClick(row.values.symbol, true)}>gain</button> 
                  </div>
              </tr>
            )
          })}
      </tbody>
    </table>
       
    <div id='trailer_id'>
        {/* {eliHome && <div style={{display: 'flex'}}>
          <h4 style={{'color':'blue', display: 'flex'}}>Best_stocks</h4>
          <h4 style={{'color':'green'}}>(stocks-compare.netlify.app) - Tutorials</h4>
        </div>} */}
        {chartSymbol && stockChartXValues.length > 0 && 
         <StockChart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}
          gainMap = {gainMap} isMobile = {isMobile} weekly = {weekly}
           logFlags = {props.logFlags} errorAdd = {errorAdd} bubbleLine = {bubbleLine} rows={rows}/>}

        {/* {! isMobile && eliHome && <LogFlags setLogFlags={setLogFlags} checkList={checkList}/>}   */}

        {<CommonDatabase localIp={localIp} rows={rows} prepareRow={prepareRow} symbol = {chartSymbol}
         admin = {admin} eliHome = {eliHome} saveTable = {saveTable} refreshCallBack = {refreshByToggleColumns} updateTableGain ={updateTableGain}
         allColumns={allColumns} logFlags = {props.logFlags} ssl={ssl} PORT={PORT} errorAdd={errorAdd} corsServer={servSelect}/>}


        <Config alphaCallBack = {alphaCallBack} rows = {rows} saveTable= {saveTable} refreshByToggleColumns={refreshByToggleColumns}
        smoothSpikes={smoothSpikes} setSmoothSpikes={setSmoothSpikes} openMarketFlag={openMarketFlag} setOpenMaretFlag={setOpenMaretFlag}/>

        {chartSymbol && <div>
          {/* <input type="checkbox" checked={analyzeShow}  onChange={() => setAnalyzeShow (! analyzeShow) } /> Analyze  */}
          <div style={{display: 'flex'}}> 
            <div style={{color: 'magenta' }}>  {chartSymbol} </div> &nbsp; Analyze &nbsp;
            <div style={{color: 'blue'}}> (Choose):</div>
          </div>
          {<div>
            <div style={{display:'flex'}}>
              <input style={{marginLeft: '0px'}}  type="radio" name="mon" value='dropRecovery' id='0' checked={analyzeTool==='dropRecovery'} onChange={onOptionChange}/> dropRecovery          
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='peak2peak' id='1' checked={analyzeTool==='peak2peak'} onChange={onOptionChange}/> peak2peak
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='holdings' id='5' checked={analyzeTool==='holdings'} onChange={onOptionChange}/> holdings
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='verify' id='2' checked={analyzeTool==='verify'} onChange={onOptionChange}/> verify       
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='stockGain' id='3' checked={analyzeTool==='stockGain'} onChange={onOptionChange}/> gainRaw
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='stockInfo' id='4' checked={analyzeTool==='stockInfo'} onChange={onOptionChange}/> infoRaw
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='tools' id='5' checked={analyzeTool==='tools'} onChange={onOptionChange}/> tools&nbsp;
              <input style={{marginLeft: '0px', color:'red'}}  type="radio" name="mon" value='none' id='7' checked={analyzeTool==='none'} onChange={onOptionChange}/> 
                {! isMobile && <div style={{color:'red'}}>none</div>}
            </div>

            {analyzeTool ==='dropRecovery' && <DropRecoveryButtons StockSymbol = {chartSymbol} rows = {rows} allColumns={allColumns}
             deepStartDate={deepStartDate} setDropStartDate={setDropStartDate}  errorAdd={errorAdd}/>}

            {analyzeTool==='peak2peak' && <Peak2PeakGui symbol = {chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues} gainMap = {gainMap}
                stockChartYValues = {stockChartYValues} logFlags = {props.logFlags} weekly={weekly} setBubbleLine={setBubbleLine}  bubleLine={bubbleLine} errorAdd={errorAdd} saveTable={saveTable}/>}

             {analyzeTool ==='holdings' && <Holdings chartSymbol = {chartSymbol} rows={rows} errorAdd={errorAdd}
             logFlags={props.logFlags} corsServer={servSelect} ssl={ssl} PORT={PORT} prepareRow={prepareRow} saveTable={saveTable} eliHome={eliHome} allColumns={allColumns}/>}

            {analyzeTool==='verify' && <Verify symbol = {chartSymbol} rows = {rows} allColumns={allColumns} stockChartXValues = {stockChartXValues} 
                stockChartYValues = {stockChartYValues} verifyDateOffset = {verifyDateOffset} setVerifyDateOffset={setVerifyDateOffset} refreshByToggleColumns = {refreshByToggleColumns}
                 firebaseGainAdd = {firebaseGainAdd}  logFlags = {props.logFlags} servSelect={servSelect} ssl={ssl} PORT={PORT} errorAdd={errorAdd}/> }

            {analyzeTool ==='stockGain' &&  <StockGain stockGain = {gainData} infoSymbol={chartSymbol} gainRawDividand = {gainRawDividand} setGainRawDividand = {setGainRawDividand} />}

            {analyzeTool ==='stockInfo' && <StockInfo stockInfo = {stockInfo} chartSymbol = {chartSymbol} infoSymbol={infoSymbol} />}
         
            {analyzeTool ==='tools' && <Tools symbol = {chartSymbol} rows = {rows} logFlags = {props.logFlags} errorAdd={errorAdd} gainMap = {gainMap}
             ssl={ssl} PORT={PORT} servSelect={servSelect} /> }

            {/* props.verifyDateOffset,   props.refreshByToggleColumns, props.firebaseGainAdd,  */}     

            {/* <Splits symbol ={chartSymbol} rows = {rows} admin = {admin} localIpv4 = {localIpv4}  saveTable = {saveTable}refreshCallBack = {props.refreshCallBack}/> */}

            {eliHome && <MarketStackApi symbol={chartSymbol} admin = {admin} errorAdd={errorAdd} logFlags={props.logFlags}/>}

          </div>}
        </div>}
         <hr/>
    </div> 
    </>
    </Suspense>
  )
}

export default BasicTable