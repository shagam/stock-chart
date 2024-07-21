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

// import Splits from '../splits/Splits'

import {DropRecoveryButtons} from './DropRecovery'
import {Peak2PeakGui} from './Peak2Peak'

import StockInfo from './StockInfo'
import StockGain from './StockGain'

import {Holdings} from './Holdings'


import LogFlags from '../utils/LogFlags'
import peak2PeakCalc from './Peak2PeakCalc'
import searchURL from '../utils/SearchURL'
import {spikesSmooth, spikesGet} from './Spikes'
import {targetPriceAdd} from './TargetPrice'
import {gain} from './Gain'
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

import '../GlobalVar'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import {ErrorList, beep, beep2} from '../utils/ErrorList'
// import CookieConsent from 'react-cookie-consent'
import  {CommonDatabase} from './CommonDatabase'


import {useTable, useSortBy, useGlobalFilter, useRowSelect, useBlockLayout, useFlexLayout, useAbsoluteLayout } from 'react-table'



import Tools from './Tools'

import Config from './Config'

import MarketStackApi from  './MarketStackApi'

import Manual from '../manual/Manual';

import {polygon} from './Polygon'

import StockChart from '../Stock-chart';

// const Tools = lazy(() => import ('./Tools'))

// const Config = lazy(() => import ('./Config'))

// const polygon = lazy(() => import('./Polygon').then((module) => ({default: module.polygon})))
// const Manual = lazy(() => import ('../manual/Manual'))

// const StockChart = lazy(() => import ('../Stock-chart'));

// const MarketStackApi = lazy(() => import ('./MarketStackApi'))

const BasicTable = (props) => {

  const [errors, setErrors] = useState([]);
  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");
  const [gainMap, setGainMap] = useState([]);
  const [bubbleLine, setBubbleLine] = useState();

  
  const servList = [process.env.REACT_APP_AWS_IP, process.env.REACT_APP_LOCAL_SERV_IP];
  const servNameList = ['production', 'test'];
  //   'localhost', process.env.REACT_APP_SERV_EXT, process.env.REACT_APP_AWS_IP_, '10.100.102.4',];
  const [ssl, setSsl] = useState(true)
  const [servSelect, setServSelect] = useState(servList[0]);

  const tblHightList = ['25vh', '35vh', '45vh', '55vh'];
  const [tblHight, setTblHight] = useState(tblHightList[2]);

  //const [chartData, setChartData] = useState("");
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [gainData, setGainData] = useState();

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
  "EVToEBITDA","EVToRevenue","price","mon3","year20","splits_list","splits","alphaPrice","alphaDate","verifyDate","verifyPrice",
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
  const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
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
  
    gain (sym, rows, errorAdd, props.logFlags, API_KEY, weekly, openMarketFlag, gainRawDividand, setGainData, smoothSpikes,
      splitsCalcFlag, saveTabl, setStockChartXValues, setStockChartYValues, gainMap, deepStartDate, ssl, PORT, servSelect, saveTable, localIpv4, city, countryName, countryCode)

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
      setChartSymbol()
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

  const toolEnum = {
    None: 'None',
    DropRecovery: 'DropRecovery',
    Holdings: 'Holdings',
    peak2Peak: 'peak2Peak',
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

 

  return (
    <Suspense fallback={<div>Loading ... (from BaseTable)</div>}>
    <>
        <Link to="/tutorials">Tutorials</Link> &nbsp; 
        <Link to="/about">About</Link>&nbsp; 
        {/* <Link to="/manual">Manual</Link> &nbsp; &nbsp; */}

        {! isMobile && eliHome && <Link to="/logFlags">console-log-flags</Link>} &nbsp;

        {<Link to="/contactUs">Contact US</Link>}  &nbsp;
        {eliHome && <Link to="/contactGet">ContactGet</Link>} 
        {<Link to="/generalLinks">Auxilary links</Link>} &nbsp;
     
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

          {admin && <div> &nbsp; <input  type="checkbox" checked={ssl}  onChange={sslToggle} /> ssl &nbsp;&nbsp;</div>}
     
          {/* {admin && <div style={{display:'flex'}}> <ServerSelect serv={tblHight} setServSelect={setTblHight} title='tblHight' options={tblHightList} defaultValue={tblHight}/> </div>} */}

          {admin && <div> &nbsp; <button onClick={test} > test </button> &nbsp; </div>}
        </div>
        {eliHome && <div style={{display:'flex'}}> <ComboBoxSelect serv={servSelect} nameList={servNameList} setSelect={setServSelect} title='backEndServer' options={servList} defaultValue={servSelect}/> </div>}
        <div id="buttons_id" style={{display:'flex'}}>
          {/* {admin && <div> <input  type="checkbox" checked={splitsCalcFlag}  onChange={calcChange} /> calc_splits &nbsp;</div>}      */}
          {/* {admin && <div> <input  type="checkbox" checked={weekly} onChange={() => {setWeekly(!weekly)}} /> weekly &nbsp;&nbsp; </div>  } */}

          {<div> <button onClick={gainAll} > gainAll </button> </div>}
          &nbsp; &nbsp; <button onClick={reloadPage} > reloadPage </button>                          
          &nbsp;&nbsp; <div style={{display:'flex'}}> <input type="checkbox" checked={columnHideFlag}  onChange={ columnHideFlagChange} /> &nbsp;columnHide &nbsp; </div>
          {/* {columnHideFlag && <div style={{display:'flex'}}> <CheckBox {...getToggleHideAllColumnsProps()} /> ToggleAll </div>} &nbsp; */}
     
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
         admin = {admin} eliHome = {eliHome} saveTable = {saveTable} refreshCallBack = {refreshByToggleColumns}
         allColumns={allColumns} logFlags = {props.logFlags} ssl={ssl} PORT={PORT} errorAdd={errorAdd} corsServer={servSelect}/>}


        <Config alphaCallBack = {alphaCallBack} rows = {rows} saveTable= {saveTable} refreshByToggleColumns={refreshByToggleColumns}
        smoothSpikes={smoothSpikes} setSmoothSpikes={setSmoothSpikes} openMarketFlag={openMarketFlag} setOpenMaretFlag={setOpenMaretFlag}/>

        {chartSymbol && <div>
          <div>&nbsp;</div>
          {! analyzeTool && <div style={{display: 'flex'}}> 
            <div style={{color: 'magenta' }}>  {chartSymbol} </div> &nbsp; Analyze &nbsp;
            <div style={{color: 'blue'}}> (Choose):</div>
          </div>}

          {<div>
            <div style={{display:'flex'}}>
              <input style={{'color':'magenta', marginLeft: '0px'}}  type="radio" name="mon" value='peak2peak' id='0' checked={analyzeTool==='peak2peak'} onChange={onOptionChange}/>
              <div style={{color:'blue'}}> peak2peak  </div> 
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='dropRecovery' id='1' checked={analyzeTool==='dropRecovery'} onChange={onOptionChange}/>         
              <div style={{color:'blue'}}>  dropRecovery   </div> 
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='holdings' id='2' checked={analyzeTool==='holdings'} onChange={onOptionChange}/> 
              <div style={{color:'blue'}}> holdings  </div> 
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='tools' id='3' checked={analyzeTool==='tools'} onChange={onOptionChange}/>  
              <div style={{color:'blue'}}>  tools       </div> 
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='stockGain' id='4' checked={analyzeTool==='stockGain'} onChange={onOptionChange}/> 
              <div style={{color:'blue'}}> gainRaw  </div> 
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='stockInfo' id='5' checked={analyzeTool==='stockInfo'} onChange={onOptionChange}/>  
              <div style={{color:'blue'}}> infoRaw   </div> 
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='none' id='7' checked={analyzeTool==='none'} onChange={onOptionChange}/> 
                {! isMobile && <div style={{color:'blue'}}>none</div>} &nbsp; 
            </div>

            {analyzeTool ==='dropRecovery' && <DropRecoveryButtons StockSymbol = {chartSymbol} rows = {rows} allColumns={allColumns}
             deepStartDate={deepStartDate} setDropStartDate={setDropStartDate}  errorAdd={errorAdd}/>}

            {analyzeTool==='peak2peak' && <Peak2PeakGui symbol = {chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues} gainMap = {gainMap}
                stockChartYValues = {stockChartYValues} logFlags = {props.logFlags} weekly={weekly} setBubbleLine={setBubbleLine}  bubleLine={bubbleLine} errorAdd={errorAdd} saveTable={saveTable}/>}

             {analyzeTool ==='holdings' && <Holdings chartSymbol = {chartSymbol} rows={rows} errorAdd={errorAdd}
             logFlags={props.logFlags} corsServer={servSelect} ssl={ssl} PORT={PORT} prepareRow={prepareRow} saveTable={saveTable} eliHome={eliHome} allColumns={allColumns}/>}

            {analyzeTool ==='tools' && <Tools symbol = {chartSymbol} rows = {rows} logFlags = {props.logFlags} errorAdd={errorAdd} gainMap = {gainMap}
            stockChartXValues = {stockChartXValues} stockChartYValues = {stockChartYValues} refreshByToggleColumns = {refreshByToggleColumns}
            servSelect={servSelect} ssl={ssl} PORT={PORT}  /> }

            {analyzeTool ==='stockGain' &&  <StockGain stockGain = {gainData} infoSymbol={chartSymbol} gainRawDividand = {gainRawDividand} setGainRawDividand = {setGainRawDividand} />}

            {analyzeTool ==='stockInfo' && <StockInfo stockInfo = {stockInfo} chartSymbol = {chartSymbol} infoSymbol={infoSymbol} />}
         
   

            {admin && <MarketStackApi symbol={chartSymbol} admin = {admin} errorAdd={errorAdd} logFlags={props.logFlags}/>}

          </div>}
        </div>}
         <hr/>
    </div> 
    </>
    </Suspense>
  )
}

export default BasicTable