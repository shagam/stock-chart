// git log --pretty=format:"%h%x09%an%x09%ad%x09%s"

import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
// import { useTable, useSortBy, useGlobalFilter, useRowSelect, useBlockLayout, useFlexLayout, useAbsoluteLayout } from 'react-table'
import { useSticky } from 'react-table-sticky'
//import styled from 'styled-components';
//import{ Styles } from './TableStyles'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'

import './table.css'
import GlobalFilter from '../utils/GlobalFilter'
import CheckBox from '../utils/CheckBox'
import Toggle from '../utils/Toggle'
// import Splits from '../splits/Splits'

import {DropRecoveryButtons} from './DropRecovery'
import {Peak2PeakGui} from './Peak2Peak'
import {MarketOpenPrice} from './MarketOpenPrice'


import StockInfo from './StockInfo'
import StockGain from './StockGain'

import {Holdings} from './Holdings'


import LogFlags from '../utils/LogFlags'

import searchURL from '../utils/SearchURL'
import {spikesSmooth, spikesGet} from './Spikes'
import {targetPriceAdd} from './TargetPrice'
import {gain} from './Gain'

import {format} from "date-fns"

import {addStock} from './AddStock'
//import cloneDeep from 'lodash/cloneDeep';
import {ServerSelect, server, PORT, ssl} from  '../utils/Server'

// import {db} from '../firebaseConfig'

import { Link, useNavigate } from 'react-router-dom'

import { FaArrowDown, FaArrowUp, FaSlideshare, FaVenusMars } from 'react-icons/fa'
//import {} from "https:///www.gstatc"
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'

import '../GlobalVar'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import {ErrorList, beep, beep2} from '../utils/ErrorList'
// import CookieConsent from 'react-cookie-consent'
import  {CommonDatabase} from './CommonDatabase'


import {useTable, useSortBy, useGlobalFilter, useRowSelect, useBlockLayout, useFlexLayout, useAbsoluteLayout } from 'react-table'

import Simulate from './Simulate'
import {MonthGain} from './MonthGain'
import Tools from './Tools'

import Config from './Config'
import StockLists from './StockLists'

import MarketStackApi from  './MarketStackApi'

import Manual from '../manual/Manual';

import {polygon} from './Polygon'

import { LeverageETF } from './LeverageETF'

import StockChart from '../Stock-chart';
import {MovingAverage } from './MovingAverage'
import {Futures} from './Futures'
import {PriceAlert, priceAlertCheck} from './PriceAlert'
import {LatestPrice} from './LatestPrice'
import { finnhub } from './Finnhub'
import {Disclaimer} from './Disclaimer'

const BasicTable = (props) => {

  const [errors, setErrors] = useState([]);
  const[error, setErr] = useState();
  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");
  const [gainMap, setGainMap] = useState([]);
  const [bubbleLine, setBubbleLine] = useState();

  
  const servList = [process.env.REACT_APP_AWS_IP, process.env.REACT_APP_LOCAL_SERV_IP];
  const servNameList = ['production', 'test'];
  //   'localhost', process.env.REACT_APP_SERV_EXT, process.env.REACT_APP_ELI_HOME_IP];
  const [ssl, setSsl] = useState(true)
  const [servSelect, setServSelect] = useState(servList[0]);

  const tblHightList = ['25vh', '35vh', '45vh', '55vh'];
  const [tblHight, setTblHight] = useState(tblHightList[2]);

  const [chartData, setChartData] = useState({});  //needed for dropREcovery
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [gainData, setGainData] = useState();
  const [showUrl, setShowUrl] = useState();

  const LOG_FLAG = props.logFlags && props.logFlags.includes('aux');
  const LOG_API = props.logFlags && props.logFlags.includes('api');
  const LOG_alpha = props.logFlags && props.logFlags.includes('alpha');

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

  const [daily, setDaily] = useState (false);
  const [QQQ_gain, set_QQQ_gain] = useState({})
  const [saveMili, setSaveMili] = useState();
  const [gainRawDividand, setGainRawDividand] = useState (true);

  // const homeUrl = '84.95.84.236'
  // const [corsServer, setCorsServer] = useState (homeUrl);
  // const gainRef = collection(db, "stock-gain_")

    // var flexConfig = localStorage.getItem('flex');
  const [monthGainData, setMonthGainData] = useState ({});

  const [columnHideFlag, setColumnHideFlag] = useState(false);
  // const [searchDeepDate, setSearchDeepDate] = useState()

  //** default start date for drop recovery  Mon 0-11 */
  const [deepStartDate, setDropStartDate] = useState(new Date(2024, 6, 1));  // 2024 jul 1  // new Date(2021, 8, 1 2021 sep 1  
  
  const useData = false;

  const cols =      ["symbol", "percent","Exchange","Industry","Sector","Cap","PE","ForwPE","TrailPE","PEG","Div","BETA",
    "EVToEBITDA","EVToRevenue","PriceToBookRatio",'target','info_date','gap',"price","mon","mon3",'mon6','year','year2','year5',"year10","year20",'short','peak2Peak',"splits_list","splits",
    "gain_date","deep","recoverWeek","deepDate","priceDivHigh","verify_1",'sym']

  const cols_title = ["symbol", "Holdings-percent","Exchange","Industry","Sector","Market Capetalization","Price/Earnings","ForwPE","TrailPE","PEG","Dividand(yearly) / price","BETA (volatility)",
    "EVToEBITDA","EVToRevenue","PriceToBookRatio",'target - Analysts target price (ratio) 1.2 means expected 20% gain','info_date','gap',"price at end of last trade day","mon","mon3",'mon6','year','year2','year5',"year10","year20",'short - yealy gain (high weight for latest)','peak2Peak (averag yearly gain between last major market crashes)',"splits_list","splits",
    "gain_date","deep","recoverWeek (how long it took to get to peak price) ","deepDate","priceDivHigh","verify_1 (compare gain with another site. close to '1' means same)",'sym (symbol)']


  const hiddenColsDefault = ["percent","Exchange","Industry","Sector","Cap","PE","PEG","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio",
  "EVToEBITDA","EVToRevenue","price","year10","year20",'short',"splits_list","splits",
  "target","info_date","gap","gain_date","deep","recoverWeek","deepDate","priceDivHigh","verify_1"] 

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

  //** read last reminder mili */
  const contactGetMili  = useMemo(() => JSON.parse (localStorage.getItem('contactGetReminderMili')), []);
  var priceAlertTable  = useMemo(() => (localStorage.getItem('priceAlert')), []);
  if (priceAlertTable)
    priceAlertTable = JSON.parse(priceAlertTable)
  else
    priceAlertTable =[{sym: 'NVDA', drop: 'true', percent: 7, risePeriod: -1}]

  var  yearlyPercent_temp = useMemo(() => (localStorage.getItem('yearlyPercent')), []);
  var yearlyPercent;
  if (yearlyPercent_temp)
    yearlyPercent = true
  else
    yearlyPercent = false

  useEffect (() => { 
    // setGainMap([]);
    // setChartSymbol()
  }, [daily]) 


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
  const {localIp, localIpv4, eliHome, city, countryName, countryCode, regionName, ip, os} = IpContext();
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

  //const [rows, setRows] = useState (data);

  const [addFormData, setAddFormData] = useState({    })

// get stock overview
  const handleInfoClick = (symbol, saveTabl) => {
    // monthsBackTest ();
    // daysBackTest()
    //callBack ("tableCallBack");

    localStorage.setItem ('infoSymbol', symbol); 
    // if (saveTabl)
    //   console.log(symbol, '(info)');
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

                  var index =  (dataStr.search('API rate limit is 25 requests per day.'))
                  if (index !== -1) {
                    errorAdd([symbol, 'AlphaVantage error', dataStr])
                    return;
                  }

                  index =  (dataStr.search('API call frequency is 5 calls per minute'))
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
        .catch(error => {
          // Do something on error 
          errorAdd ([symbol, 'info', error.message])
          console.log(symbol + ' info ' + error.message)
      })
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
    rows[index].values.Sector = childData["Sector"];
    const PE = childData["PERatio"];
    // if (PE === 'None') {
    //   console.log (symbol)
    // }
    rows[index].values.PE = (PE === 'None' || PE === undefined) ? -1 : Number(PE);
    const PEG = childData["PEGRatio"];
    rows[index].values.PEG = (PEG === 'None' || PEG === undefined) ? -1 : Number (PEG); 
    rows[index].values.TrailPE = Number (childData["TrailingPE"]);
    rows[index].values.ForwPE = Number (childData["ForwardPE"]);
    const div = childData["DividendYield"];
    rows[index].values.Div = (div !== 'None') ? Number(div) : -1;
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

  //** gain click for sym pressed. */
  const handleGainClick = (sym, singleSym) => {
    setErr()
    setChartSymbol (sym);
    const row_index = rows.findIndex((row)=> row.values.symbol === sym);

    var avoidTooFrequentLimit = eliHome ? 2*1000 : 2*1000 //** allowed frequency of 2 sec */
    const lastGainMili = rows[row_index].values.gain_mili; //** save before change */

    var diff = lastGainMili ? Date.now() - lastGainMili : avoidTooFrequentLimit * 2; //** empty => assume more than limit*/ 
    if (diff < avoidTooFrequentLimit) {
      console.log (sym, 'Abort <gain>, too frequent. allowed once per day for sym. diff sec:', (diff / 1000).toFixed(0))
      return;
    }

     rows[row_index].values.gain_mili = Date.now() //**  prevent too frequent gain for sym */

    if (singleSym)
      console.log(sym, getDate(), 'handleGainClick  singleSym=', singleSym)

    localStorage.setItem ('chartSymbol', sym);
    handleInfoClick(sym, singleSym);
  
    //** avoid bubbleline while another symbol */
    if (gainMap['bubbleLine']) {
      console.log (sym, 'delete bubbleLine, avoid bubbleline while another symbol', Object.keys(gainMap))
      delete gainMap['bubbleLine']
    }

    gain (sym, rows, errorAdd, props.logFlags, API_KEY, !daily, openMarketFlag, gainRawDividand, setGainData, smoothSpikes,
      splitsCalcFlag, singleSym, setStockChartXValues, setStockChartYValues, gainMap, deepStartDate, ssl, PORT, servSelect,
      saveTable, os, ip, city, countryName, countryCode, regionName, setChartData, yearlyPercent, set_QQQ_gain, priceAlertTable)

 
     if (singleSym)
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
      setChartSymbol()
    }
    try {
      if (useData) { // avoid unclean access to rows
        const index = data.findIndex((row)=> row.symbol === symbol);
        if (index === -1) {
          errorAdd([symbol, 'symbol not found, delete '])
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
    addStock (rows, addFormData.symbol, true)
    prepareRow(rows[rows.length -1]);
    saveTable(addFormData.symbol);
    //window.location.reload();
    event.target.reset(); // clear input field
  }

  function title (titleName) {


      for (let i = 0; i < cols_title.length; i++) {
        if (titleName === cols[i])
          return cols_title[i]
      }
      return 'title_missing';
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
    if (val === undefined || Number(val) === -1 || val === '-1.00')
      return 'Black'
    if (column.id === 'symbol' || column.id === 'sym') 
        return 'blue';
    if (column.id === 'verify_1') {
      if (val > 1.2 || val < 0.8)  // inconsistant data
        return 'rgb(250,10,0)' // red '#ff0000'
      else
        return 'black'
    }
    if (isNaN (val)) {
      return 'black'
    }
    if (! yearlyPercent) {
      if (val < '1.00')
        return 'orange'
    } else {
      if (val < 0)
        return 'orange'
    }

    return 'black'//RGBA(170,214,136,0.4)';

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
    col['margin'] = '1px'
    col['padding'] = '1px'
    return col;
  }

  function yearlyPercentColor () {
    if (yearlyPercent) {
      return 'orange'
    }
    else
      return 'black'
  }

  const toolEnum = {
    //** Pans that requires stockChart */
    None: 'None',
    DropRecovery: 'DropRecovery',
    Holdings: 'Holdings',
    peak2Peak: 'peak2Peak',
    StockGainRaw: 'StockGainRaw',
    StockInfoRaw: 'StockInfoRaw', 
    Tools: 'Tools',
    SimulateTrade: 'SimulateTrade',
    MonthGain: 'MonthGain',
    marketOpenPrice: 'marketOpenPrice',
    leveragaETF: 'leveragaETF',
    MovingAverage: 'movingAverage',

    //** Pand that does not require stockChart */
    commonDatabase: 'vommonDatabase',
    config:        'config',
    stockLists:    'stockLists',
    futures:       'futures',
    priceAlert:    'priceAlert'
  };
  // marginLeft: '3px', marginRight: '3px', 
  const [analyzeTool, setAnalyzeTool] = useState('none')

  const onOptionChange = e => {
    const tool = e.target.value;
    setAnalyzeTool(tool)
    // console.log(tool)
  }

 const [nonSymTool, setNonSymTool] = useState('none')
  const nonSymChange = e => {
    const tool = e.target.value;
    setNonSymTool(tool)
    // console.log(tool)
  }

  function purgeRestoreStockTable () {
    const keys = Object.keys(rows);
    // empty table 
    for (let i = keys.length -1; i >= 0; i--) {
      delete rows[i].values.mon
      delete rows[i].values.mon3
      delete rows[i].values.mon6
      delete rows[i].values.year
      delete rows[i].values.year2
      delete rows[i].values.year5
      delete rows[i].values.year10
      delete rows[i].values.year20
    }
    setGainMap([]);
    setChartSymbol()
    saveTable();
    window.location.reload(false);
  }
  
  function setYearlyPercent_wrapper () {
    // setYearlyPercent(! yearlyPercent)
    yearlyPercent = ! yearlyPercent
    purgeRestoreStockTable ()
    if (yearlyPercent)
      localStorage.setItem('yearlyPercent',yearlyPercent)
    else
      localStorage.removeItem('yearlyPercent')
  }

  return (
    <Suspense fallback={<div>Loading ... (from BaseTable)</div>}>
    <>
        <Disclaimer eliHome={eliHome} logFlags = {props.logFlags}/>
        {eliHome && isMobile && Date.now() - contactGetMili > 1000 * 3600 * 24 * 3 && <div style={{color:'red'}}>ContactGet reminder</div>} 

        <Link to="/tutorials">Tutorials</Link> &nbsp; 
        <Link to="/about">About</Link>&nbsp; 
        {/* <Link to="/manual">Manual</Link> &nbsp; &nbsp; */}

        {! isMobile && eliHome && <Link to="/logFlags">console-log-flags</Link>} &nbsp;

        {<Link to="/contactUs">Contact US</Link>}  &nbsp;
        {<Link to="/generalLinks">Auxilary links</Link>} &nbsp;
        {eliHome && <Link to="/contactGet">ContactGet</Link>}
        <div className='w-100 text-left mt-2 d-flex '>   
          {currentUser && <div><strong>   </strong> {currentUser.email}   &nbsp;  </div> }  
          {admin && <div> <strong style={{color: 'red'}}>(admin)</strong>  &nbsp; </div>}
          {/* <div> <Link to="/dashboard" > Login Dashboard </Link>  </div>  */}
        </div>
        {errors.length > 0 && <ErrorList errorList={errors} setErrors={setErrors}/> }
        <div style={{color: 'red'}}>{error}</div>
        {/* <div>&nbsp;</div> */}
        <div id="buttons_id" style={{display:'flex'}}> 
          {/* {  <CustomSelect options={corsServerOptions} label='server' onChange={corsServerChange } defaultValue={corsServerOptions[0]} />} */}
          {/* {admin && <div> &nbsp; <input  type="checkbox" checked={marketwatch}  onChange={marketwatchToggle} />  marketwatchVerify &nbsp;</div>} */}
          {/* {admin && <GlobalFilter className="stock_button_class" filter={verifyDateOffset} setFilter={setVerifyDateOffset} name='VerifyDateOffset'  />} */}

          {/* {admin && <div> &nbsp; <button onClick={polygonCompare} > polygonCompare </button> &nbsp; </div>} */}

          {/* {admin && <div> &nbsp; <input  type="checkbox" checked={ssl}  onChange={sslToggle} /> ssl &nbsp;&nbsp;</div>} */}
     
          {/* {admin && <div style={{display:'flex'}}> <ServerSelect serv={tblHight} setServSelect={setTblHight} title='tblHight' options={tblHightList} defaultValue={tblHight}/> </div>} */}

          {/* {admin && <div> &nbsp; <button onClick={test} > test </button> &nbsp; </div>} */}
        </div>
        {/* {eliHome && <ServerSelect />} */}
        <div style={{display:'flex'}}>
           {! showUrl && eliHome && <div style={{display:'flex'}}> <ComboBoxSelect serv={servSelect} nameList={servNameList} setSelect={setServSelect} title='backEndServer' options={servList} defaultValue={servSelect}/> </div>}  &nbsp; &nbsp;
           {eliHome && !isMobile && <div>&nbsp;<input  type="checkbox" checked={showUrl}  onChange={()=> setShowUrl(! showUrl)} />URL&nbsp;</div>} &nbsp;
           {showUrl &&  <h5 style={{'color':'green', fontWeight: "bold"}}>stocks-compare.netlify.app</h5>}
        </div>

        <div id="buttons_id" style={{display:'flex'}}>
          {/* {admin && <div> <input  type="checkbox" checked={splitsCalcFlag}  onChange={calcChange} /> calc_splits &nbsp;</div>}      */}

          {<div> <button style={{backgroundColor: '#bbffbb'}} onClick={gainAll} title='fetch and fill table with gain values' > gainAll </button> </div>} &nbsp;
          <button style={{backgroundColor: '#ffccff', height:'30px'}} onClick={reloadPage} title='clear table, and load default symbols' > Clear_table </button>&nbsp;                         

          {/* {columnHideFlag && <div style={{display:'flex'}}> <CheckBox {...getToggleHideAllColumnsProps()} /> ToggleAll </div>} &nbsp; */}

          {/* {<div>&nbsp;<input  type="checkbox" checked={daily}  onChange={()=> setDaily(! daily)}  title='daily vs weekly' /> daily&nbsp;&nbsp;</div>} */}

          <ComboBoxSelect serv={daily} nameList={['weekly','daily',]} setSelect={setDaily} title='' TITLE='data resultion. weekly or daily ' options={[false,true]} defaultValue={false} /> &nbsp;
         <ComboBoxSelect serv={yearlyPercent} nameList={['gain_factor','year_percent',]} setSelect={setYearlyPercent_wrapper} TITLE={'table entries: yearly-percent gain vs gain-factor (1.5 means 50% gain)'} options={[false,true]} defaultValue={false} /> &nbsp;

          {/* <div style={{display:'flex'}}> <input type="checkbox" checked={columnHideFlag}  onChange={ columnHideFlagChange} 
              title='select which columns are visible and which are hidden'/> &nbsp;column_select  </div>&nbsp; */}
          {eliHome && chartSymbol && <LatestPrice symbol = {chartSymbol} rows={rows} logFlags={props.logFlags} corsServer={servSelect} ssl={ssl} PORT={PORT}  eliHome={eliHome} 
                errorAdd={errorAdd} stockChartYValues = {stockChartYValues} refreshByToggleColumns = {refreshByToggleColumns} setErr={setErr}/>} &nbsp;
          {chartSymbol && <button style={{backgroundColor: 'aqua'}} onClick={() => {finnhub (chartSymbol, stockChartYValues, rows, refreshByToggleColumns, setErr)}} title='finnhub info' > lastPrice {chartSymbol} </button>   }
       
         </div>

      {/* insert sym, filter */}

      <div style={{display:'flex'}} id="add_stock_id">
        <form className='w-00 text-left mt-2 d-flex ' onSubmit = {handleAddFormSubmit}>
          <input style={{width:'145px'}}
            type="text"
            name="symbol"
            required="required"
            placeholder="Add stock symbol ..."
            onChange={handleAddFormChange}
          />
          <button style={{backgroundColor: '#ff55'}} type="submit"> Add  ({rows.length})  </button>
        </form>&nbsp;&nbsp;

        <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter} name='Search/Filter' isMobile={isMobile}/>
          &nbsp;&nbsp;

        <div style={{display:'flex', paddingTop: '20px'}}> <input type="checkbox" checked={columnHideFlag}  onChange={ columnHideFlagChange} 
              title='select which columns are visible and which are hidden'/> </div>&nbsp;
              <div style={{paddingTop: '20px'}}>column_select </div>
      </div>

      {columnHideFlag && 
        <div id="columnToggle" style={{width: '550px'}}>
          {
          allColumns.map(column => (
            <div key={column.id}>
              <label id="column_Label_id" style={{'color': getCheckBoxColor(column.Header) }} title={title(column.id)}>
                <input   type='checkbox' {...column.getToggleHiddenProps()}  />
                &nbsp;{column.Header}   &nbsp; &nbsp;
              </label>
            </div>
          ))
          }
          {hiddenColumnsSave()}
        </div>
      }

      {/* stock Table */}

      <table style={{marginTop: '4px'}} id="stockTable" {...getTableProps()}>
      <thead>

        {headerGroups.map ((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              <th>N</th>
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
          rows.map((row, i) => {
            // {style: (row.verify_1 > 1.1 || row.verify_1 < 0.9) ? {background: red}}

            prepareRow(row)
            return (
              <tr id='stock_row_id'
              // <tr id='stock_row_id' key={row.id} onClick={() => clickedRow (row)}
                {...row.getRowProps()}>
                <td style= {{margin: '1px',  padding: '1px',}}>{i}</td>
                {row.cells.map((cell) => {
                  // if (cell.column.id === 'year') {
                  //   console.log ('render', row.values.symbol, cell.value)
                  // }
                  return <td {...cell.getCellProps({style: {margin: '1px',  padding: '1px', color: getColor(cell.value, cell.column, row.values.symbol)}})}>{cell.render('Cell')}</td>
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

    {/* Machanizms not for spacific sym */}
    {! chartSymbol && <div style={{display: 'flex'}}>Press &nbsp;
      <div style={{color: 'red', fontSize:'18px', fontStyle: "italic", fontWeight: "bold"}}>gain</div> &nbsp; for one or more symbols</div>}  
    <div id='trailer_id'>
        {chartSymbol && stockChartXValues.length > 0 && 
         <StockChart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}
          gainMap = {gainMap} isMobile = {isMobile} daily = {daily}
           logFlags = {props.logFlags} errorAdd = {errorAdd} bubbleLine = {bubbleLine} rows={rows}/>}

        {/* {! isMobile && eliHome && <LogFlags setLogFlags={setLogFlags} checkList={checkList}/>}   */}

        {/* Machanizms  for spacific sym (chartSymbol) */}
        <hr/> 
        {chartSymbol && <div>
          {/* <div>&nbsp;</div> */}
          {(! analyzeTool || analyzeTool === 'none') && <div style={{display: 'flex'}}> 
            <div style={{color: 'magenta' }}>  {chartSymbol} </div> &nbsp; Analyze &nbsp;
            {/* <div style={{color: 'blue'}}> (Choose):</div> */}
          </div>}

          {<div>
            <div style={{display:'flex'}}>
              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='none' id='11' checked={analyzeTool==='none'} onChange={onOptionChange}/> 
              {<div style={{color:'blue'}}>none</div>} &nbsp; 

              <input style={{'color':'magenta', marginLeft: '5px'}}  type="radio" name="day" value='peak2peak' id='0' checked={analyzeTool==='peak2peak'} onChange={onOptionChange}
                 title='calc line that connect major stock market bubbles (2008,2022)'/>
              {<div style={{color:'blue', fontWeight: gainMap.bubbleLine? "bolder": 'normal'}}> bubble-line  </div>} 
              
              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='dropRecovery' id='1' checked={analyzeTool==='dropRecovery'} onChange={onOptionChange}
                  title='calc value drop of a symbol during market crash, and the recovery time (weeks or dayes) '/>         
              <div style={{color:'blue'}}>  dropRecovery   </div> 

              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='holdings' id='2' checked={analyzeTool==='holdings'} onChange={onOptionChange}
                title='Get ETF holdings '/> 
              <div style={{color:'blue'}}> holdings  </div> 

              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='stockGain' id='4' checked={analyzeTool==='stockGain'} onChange={onOptionChange}
                title='Raw gain data as fetched by provider' /> 
              <div style={{color:'blue'}}> gainRaw  </div> 

              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='stockInfo' id='5' checked={analyzeTool==='stockInfo'} onChange={onOptionChange}
                title='Raw basic company data as fetched by provider'/>  
              <div style={{color:'blue'}}> infoRaw   </div> 
   
            </div>
              
            <div style={{display:'flex'}}>
                <input style={{marginLeft: '5px'}}  type="radio" name="day" value='simulateTrade' id='6' checked={analyzeTool==='simulateTrade'} onChange={onOptionChange}
                   title='simulate optimized trade based on week gain or bubble-line proximety'/>  
                <div style={{color:'blue'}}> simulateTrade   </div> 
                
                <input style={{marginLeft: '5px'}}  type="radio" name="day" value='monthGain' id='7' checked={analyzeTool==='monthGain'} onChange={onOptionChange}
                    title='Calc average month and week gain over the last 24 years'/>  
                <div style={{color:'blue', fontWeight: monthGainData.weekGainArray? "bolder" : 'normal'}}> monthGain   </div>

                <input style={{marginLeft: '5px'}}  type="radio" name="day" value='leveragaETF' id='8' checked={analyzeTool==='leveragaETF'} onChange={onOptionChange}
                title='Strategy for Lavarage ETF like TQQQ (tripple QQQ)'/>
                {<div style={{color:'blue'}}> leveragaETF  </div>}

                <input style={{marginLeft: '5px'}}  type="radio" name="day" value='marketOpenPrice' id='9' checked={analyzeTool==='marketOpenPrice'} onChange={onOptionChange}/>
                {<div style={{color:'blue'}}> marketOpenPrice  </div>}
                
            </div>

            <div style={{display:'flex'}}>
              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='movingAverage' id='10' checked={analyzeTool==='movingAverage'} onChange={onOptionChange}/>
              <div style={{color:'blue'}}  title='Moving average, for market trend'> movAverage  </div>

              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='priceAlert' id='11' checked={analyzeTool==='priceAlert'} onChange={onOptionChange}/>
              <div style={{color:'blue'}}  title='Moving average, for market trend'> priceAlert </div>

              <input style={{marginLeft: '5px'}}  type="radio" name="day" value='tools' id='20' checked={analyzeTool==='tools'} onChange={onOptionChange}/>  
              <div style={{color:'blue'}}  title='auxilery tools'>  tools       </div> 
            </div>
            
            {/* <hr/>  */}
            {/* pans  */}
            {/* <div> &nbsp; </div> */}
            {analyzeTool ==='dropRecovery' && <DropRecoveryButtons StockSymbol = {chartSymbol} rows = {rows} allColumns={allColumns}
             deepStartDate={deepStartDate} setDropStartDate={setDropStartDate}  stockChartXValues = {stockChartXValues} stockChartYValues = {stockChartYValues}
              errorAdd={errorAdd} logFlags={props.logFlags} chartData={chartData} daily={daily}/>}

            {analyzeTool==='peak2peak' && <Peak2PeakGui symbol = {chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues} gainMap = {gainMap}
                stockChartYValues = {stockChartYValues} logFlags = {props.logFlags} weekly={! daily} setBubbleLine={setBubbleLine}  bubleLine={bubbleLine} errorAdd={errorAdd} saveTable={saveTable}/>}

             {analyzeTool ==='holdings' && <Holdings chartSymbol = {chartSymbol} rows={rows} errorAdd={errorAdd}
             logFlags={props.logFlags} corsServer={servSelect} ssl={ssl} PORT={PORT} prepareRow={prepareRow} saveTable={saveTable} eliHome={eliHome} allColumns={allColumns}/>}

            {analyzeTool ==='tools' && <Tools symbol = {chartSymbol} rows = {rows} logFlags = {props.logFlags} errorAdd={errorAdd} gainMap = {gainMap}
            stockChartXValues = {stockChartXValues} stockChartYValues = {stockChartYValues} refreshByToggleColumns = {refreshByToggleColumns}
            servSelect={servSelect} ssl={ssl} PORT={PORT} daily={daily} /> }

            {analyzeTool ==='stockGain' &&  <StockGain stockGain = {gainData} infoSymbol={chartSymbol} gainRawDividand = {gainRawDividand} setGainRawDividand = {setGainRawDividand}
            daily={daily} chartData={chartData}/>}

            {analyzeTool ==='stockInfo' && <StockInfo stockInfo = {stockInfo} chartSymbol = {chartSymbol} infoSymbol={infoSymbol} />}
         
            {analyzeTool ==='simulateTrade' &&  <Simulate symbol = {chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues} gainMap = {gainMap}
                stockChartYValues = {stockChartYValues} logFlags = {props.logFlags}
                 errorAdd={errorAdd} saveTable={props.saveTable} monthGainData={monthGainData} daily={daily}/>}

            {analyzeTool ==='monthGain' && <MonthGain symbol = {chartSymbol}  gainMap = {gainMap}  stockChartXValues = {stockChartXValues} 
                  stockChartYValues = {stockChartYValues} logFlags = {props.logFlags} errorAdd={errorAdd} setMonthGainData={setMonthGainData} daily={daily}/>}

            {analyzeTool ==='marketOpenPrice' && <MarketOpenPrice symbol = {chartSymbol} API_KEY={API_KEY}
              setDropStartDate={setDropStartDate}  stockChartXValues = {stockChartXValues} stockChartYValues = {stockChartYValues}
              errorAdd={errorAdd} logFlags={props.logFlags} chartData={chartData} daily={daily} />}

            {/* {admin && <MarketStackApi symbol={chartSymbol} admin = {admin} errorAdd={errorAdd} logFlags={props.logFlags}/>} */}
            {analyzeTool ==='leveragaETF' && <LeverageETF  symbol = {chartSymbol} gainMap = {gainMap}  logFlags = {props.logFlags} errorAdd={errorAdd}  daily={daily} />}

            {analyzeTool ==='movingAverage' && <MovingAverage symbol = {chartSymbol} rows = {rows} allColumns={allColumns}
             deepStartDate={deepStartDate} setDropStartDate={setDropStartDate}  stockChartXValues = {stockChartXValues} stockChartYValues = {stockChartYValues}
              errorAdd={errorAdd} logFlags={props.logFlags} chartData={chartData} daily={daily}/>}

            {analyzeTool ==='priceAlert' && <div> <PriceAlert  symbol = {chartSymbol} daily={daily} priceAlertTable = {priceAlertTable} gainMap = {gainMap}
              errorAdd={errorAdd} servSelect={servSelect} ssl={ssl} PORT={PORT} rows = {rows} refreshByToggleColumns = {refreshByToggleColumns}
               stockChartXValues = {stockChartXValues} stockChartYValues = {stockChartYValues} /> </div>}

          </div>}
          </div>}        
          <hr/> 
           
          <div style={{display:'flex'}}>
          <input style={{ marginLeft: '5px'}}  type="radio" name="nonSym" value='none' id='4' checked={nonSymTool==='none'} onChange={nonSymChange}
            title='turn off other pans on line'/>
          <div style={{color:'#9932CC'}}> none  </div> 

          <input style={{ marginLeft: '5px'}}  type="radio" name="nonSym" value='config' id='1' checked={nonSymTool==='config'} onChange={nonSymChange}
             title='maintenance functios like purge table or default column selected'/>
          <div style={{color:'#9932CC'}}> config  </div>   

          <input style={{ marginLeft: '5px'}}  type="radio" name="nonSym" value='commonDatabase' id='0' checked={nonSymTool==='commonDatabase'} onChange={nonSymChange}
             title='get symbols with heigher than the hi-tech ETF QQQ'/>
          <div style={{color:'#9932CC'}}> commonDatabase  </div>   
        
          <input style={{marginLeft: '5px'}}  type="radio" name="nonSym" value='stockLists' id='2' checked={nonSymTool==='stockLists'} onChange={nonSymChange}
             title='Share stock-lists with other users of the tool'/>
          <div style={{color:'#9932CC'}}> stockLists </div>   

          <input style={{ marginLeft: '5px'}}  type="radio" name="nonSym" value='futures' id='3' checked={nonSymTool==='futures'} onChange={nonSymChange}
             title='ETF futures contracts'/>
          <div style={{color:'#9932CC'}}> futures  </div>             
        </div>

           {/* select non sym tool */}
        {nonSymTool ==='commonDatabase' && <CommonDatabase localIp={localIp} rows={rows} prepareRow={prepareRow} symbol = {chartSymbol}
         admin = {admin} eliHome = {eliHome} saveTable = {saveTable} refreshCallBack = {refreshByToggleColumns}
         allColumns={allColumns} logFlags = {props.logFlags} ssl={ssl} PORT={PORT} errorAdd={errorAdd} corsServer={servSelect} 
         yearlyPercent={yearlyPercent} QQQ_gain={QQQ_gain}/>}

        {nonSymTool ==='config' && <Config alphaCallBack = {alphaCallBack} ip={ip} rows = {rows} saveTable= {saveTable} logFlags = {props.logFlags} refreshByToggleColumns={refreshByToggleColumns}
        smoothSpikes={smoothSpikes} setSmoothSpikes={setSmoothSpikes} openMarketFlag={openMarketFlag} setOpenMaretFlag={setOpenMaretFlag} errorAdd={errorAdd}
         servSelect={servSelect} ssl={ssl} PORT={PORT}/>}

        {nonSymTool ==='stockLists' && <StockLists ip={ip} rows = {rows} logFlags = {props.logFlags} saveTable={saveTable}
         errorAdd={errorAdd} servSelect={servSelect} ssl={ssl} PORT={PORT}/>}

        {nonSymTool ==='futures' && <Futures symbol = {chartSymbol} rows = {rows} allColumns={allColumns} stockChartXValues = {stockChartXValues} 
          stockChartYValues = {stockChartYValues} refreshByToggleColumns = {refreshByToggleColumns} 
          logFlags = {props.logFlags} servSelect={servSelect} ssl={ssl} PORT={PORT} errorAdd={errorAdd}/>}        

         {/* <hr/> */}
    </div> 
    </>
    </Suspense>
  )
}

export default BasicTable