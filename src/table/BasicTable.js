import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'
import './table.css'
import GlobalFilter from './GlobalFilter'
import CheckBox from './CheckBox'
import Stock_chart from '../Stock-chart'
import AlphaVantage from '../AlphaVantage'
import {nanoid} from 'nanoid';
//import cloneDeep from 'lodash/cloneDeep';
import axios from 'axios'

import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where} from "firebase/firestore";
import { validateArgCount } from '@firebase/util'
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

  const [stocksGain, setStocksGain] = useState([]);
  const [stocksInfo, setStocksInfo] = useState([]);
  const gainRef = collection(db, "gain-history")
  const infoRef = collection(db, "stock-info")


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


  const [ip, setIP] = useState('');

  //creating function to load ip address from the API
  const getIp = async () => {
    if (ip !== '' && ip !== undefined) {
      console.log('ip ', ip)
      return;
    }

    const res = await axios.get('https://geolocation-db.com/json/')
    console.log('ip ', res.data);
    setIP(res.data.IPv4)
  } 
  getIp();

  function getOneGain (symbol) {
    //where ('symbol', '==', symbol)
    db.collection("gain-history").get().then((snapshot) => {
      snapshot.docs.forEach ((doc) => {
        console.log (doc.data());

      });
      }
    );
  }
   

  // read from firebase
  const getFirebaseGain = async () => {
    const gain = await getDocs(gainRef)
    setStocksGain(gain.docs.map((doc) =>({...doc.data(), id: doc.id})))
    console.log ('firebase read gain: ', gain.length);
  }
  const getFirebaseInfo = async () => {
    const info = await getDocs(infoRef)
    setStocksInfo(info.docs.map((doc) =>({...doc.data(), id: doc.id})))
    console.log ('firebase read info: ', info.length);
  }

  useEffect (() => { 
    //getGain();

     //getInfo();
  }, [])
 

 
  const getGainDocIndex = (symbol) => {
    for (let i = 0; i < stocksGain.length; i++) {
      if (stocksGain[i]._symbol === symbol)
        return i;
    }
    return -1;
  }
 const getGainDocId = (symbol) => {
    const index = getGainDocIndex (symbol);   
    if (index >= 0)
      return stocksGain[index].id;
    return '';
  }
  const firebaseGainAdd = async (symbol, updateDate, updateMili, newGain, splits) => {
    let id = getGainDocId (symbol);
    if (id === '') // not found: delete
      await addDoc (gainRef, {_symbol: symbol, _ip: ip, _updateDate: updateDate, _updateMili: updateMili, data: newGain, splits: splits })
    else { // found update
      var gainDoc = doc(db, "gain-history", id);
      await updateDoc (gainDoc,  {_symbol: symbol, _ip: ip, _updateDate: updateDate, _updateMili: updateMili, data: newGain, splits: splits });
      //await deleteDoc (gainDoc);
    }
    const gain = await getDocs(gainRef)
    setStocksGain(gain.docs.map((doc) =>({...doc.data(), id: doc.id})))
  }

  const getInfoDocIndx = (symbol) => {
    for (let i = 0; i < stocksInfo.length; i++) {
      if (stocksInfo[i]._symbol === symbol)
        return i;
    }
    return -1;
  }
  const getInfoDocId = (symbol) => {
    const i = getInfoDocIndx (symbol);
    if (i >= 0)
        return stocksInfo[i].id;
    return '';
  }
  const firebaseInfoAdd = async (symbol, updateDate, updateMili, newInfo) => {
    const id = getInfoDocId (symbol);
    if (id === '') // not found add
      await addDoc (infoRef, {_symbol: symbol, _ip: ip, _updateDate: updateDate, _updateMili: updateMili, data: newInfo })
    else { // found: update
      const gainDoc = doc(db, "stock-info", id)
      await updateDoc (gainDoc, {_symbol: symbol, _ip: ip, _updateDate: updateDate, _updateMili: updateMili, data: newInfo });
      // await deleteDoc (gainDoc); // temp fix for format change)
    }
    const info = await getDocs(infoRef)
    setStocksInfo(info.docs.map((doc) =>({...doc.data(), id: doc.id})))
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
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;      
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
                    handleOverview (data);
                  }
              }
          )
         }
  
         const handleCallBackForHistory = (childData, sym, splits) => {
            console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
            const index = rows.findIndex((row)=> row.values.symbol === sym);            
            if (index === -1) {
              alert (`stock-table, history call back, invalid chartSymbol (${sym}) trying to updatehistory values` );
              return;
            }

            if (Date.now() - rows[index].values.nowChart < 1000)
              return "duplicate";

            rows[index].values.nowHist = Date.now();
            rows[index].values.gain_date = getDate();

            rows[index].values.wk = childData[0]; //stocks[index].wk;
            rows[index].values.wk2 = childData[1]; //stocks[index].wk2;
            rows[index].values.mon = childData[2]; //stocks[index].mon;
            rows[index].values.mon3 = childData[3]; //stocks[index].mon3;
            rows[index].values.mon6 = childData[4]; //stocks[index].mon6;
            rows[index].values.year = childData[5]; //stocks[index].year;
            rows[index].values.year2 = childData[6]; //stocks[index].year2;
            rows[index].values.year5 = childData[7]; //stocks[index].year5;
            rows[index].values.year10 = childData[8]; //stocks[index].year10;
            rows[index].values.year20 = childData[9]; //stocks[index].year20; 
            rows[index].values.nowChart = Date.now();
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
        }

        const handleOverview = (childData)  => {
          if (childData === null || childData === {} || childData["Exchange"] == null) {
            console.log ('ChildData missing');
            return;
          }
          console.log (JSON.stringify(childData).substring(0,100));
          const symbol = childData["Symbol"];
          const index = rows.findIndex((row)=> row.values.symbol === symbol);

          rows[index].values.Exchange = childData["Exchange"].substring(0,4);
          rows[index].values.PE = childData["PERatio"];
          rows[index].values.PEG = childData["PEGRatio"]; 
          rows[index].values.TrailPE = childData["TrailingPE"];
          rows[index].values.ForwPE = childData["ForwardPE"];
          rows[index].values.Div = childData["DividendYield"];
          rows[index].values.BETA = childData["Beta"];
          rows[index].values.EVToEBITDA = childData["EVToEBITDA"];
          rows[index].values.EVToRevenue = childData["EVToRevenue"];
          rows[index].values.target = childData["AnalystTargetPrice"];
          rows[index].values.Industry = childData["Industry"];
          rows[index].values.PriceToBookRatio = childData["PriceToBookRatio"];
          //Sector         

          rows[index].values.nowOverview = Date.now();
          rows[index].values.info_date = getDate();
         
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
                  if (i > 1040)
                    continue;  //ignore splis before 20 years
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

              var histArray = [];  // data for stocks table.
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[1]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[2]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[4]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[13]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[26]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[52]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[104]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[260]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[520]).toFixed(2));
              histArray.push ((stockChartYValuesFunction[0] / stockChartYValuesFunction[1040]).toFixed(2));
              handleCallBackForHistory (histArray, sym, splits);
              firebaseGainAdd (sym, getDate(), Date.now(), histArray, splits);  // save in firestore
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
    //console.log (rows);
    props.callBack(-1);
    saveTable();
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
    var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    prepareRow(newStock);
    const index = rows.findIndex((row)=> row.values.symbol.toUpperCase() === addFormData.symbol.toUpperCase());

    //console.log (addFormData.symbol)
    const re = new RegExp('^[a-zA-Z0-9]*$');  // Verify valid symbol in englis letters
    if (! re.test (addFormData.symbol)) {
      alert (`Invalid symbol: ${addFormData.symbol}`);
      return;
    }
    if (index !== -1) {
      alert ('Trying to add duplicate symbol: (' + addFormData.symbol + ')');
      return;
    }
    
    //var newStock = cloneDeep (rows[0]);
    //newStock.id = getUniqueId();
    newStock.id = nanoid();
    newStock.values.symbol = addFormData.symbol.toUpperCase();
    newStock.original.symbol = addFormData.symbol.toUpperCase();
    newStock.cells = null;
    newStock.allCells = [];

    rows.push (newStock);

    //get info from firebase
    //const dat = getOneGain (newStock.values.symbol);
    getFirebaseGain();
    var ind = getGainDocIndex (newStock.values.symbol);
    if (ind >= 0) {
      handleCallBackForHistory (stocksGain[ind].data, newStock.values.symbol, stocksGain[ind].splits); 
    }
    getFirebaseInfo();
    ind = getInfoDocIndx (newStock.values.symbol);
    if (ind >= 0) {
      handleOverview (stocksInfo[ind].data); 
    }
  
    saveTable();
    //window.location.reload();
    //props.callBack(1);
    //setUpdateCount( updateCount + 1);
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
      hiddenColumns: ["Exchange","Industry","TrailPE","ForwPE","ForwPE","Div","BETA","PriceToBookRatio","EVToEBITDA","EVToRevenue","target","wk2","mon6","year20","splits_list","info_date","gain_date"]
    }

  },
  useGlobalFilter, useSortBy, useRowSelect,
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

  const { globalFilter } = state

 const handleChange = () => {setSplitsCalc(! splitsCalc)}

  return (
    <>
    <div>
      <div className="buttons">
        <label>
          <input
            type="checkbox" checked={splitsCalc}
            onChange={handleChange}
          /> calc-splits
        </label>
 
        <button type="button" onClick={()=>saveTable()}>saveTable    </button>   rows ({rows.length}),      
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter}  />
        <CheckBox {...getToggleHideAllColumnsProps()} /> Toggle All, 
      </div>
      {
        allColumns.map(column => (
          <div key={column.id}>
            <label>
              <input type='checkbox' {...column.getToggleHiddenProps()} />
              {column.Header}
            </label>
          </div>
        ))
      }
    </div>

    <div className="tbl">
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map ((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')} 
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' V ' : ' A ') : ''} 
                  </span>
                  </th>
              ))}
            </tr>
        ))}
      </thead>
    
      <tbody {...getTableBodyProps()}>
        {
          rows.map(row => {

            prepareRow(row)
            return (
              <tr
                {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
                  <div>
                  <button type="button" onClick={()=>handleDeleteClick(row, row.values.symbol)}>del</button>
                  <button type="button" onClick={()=>handleInfoClick(row.values.symbol)}>info</button>     
                  <button type="button" onClick={()=>handleChartClick(row.values.symbol)}>chart</button> 
                  </div>
              </tr>
            )
          })}
      </tbody>
    </table>
    </div>
    <div>
       <label>Add stock symbol </label>
       <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="required"
            placeholder="stock symbol to add ..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add</button>
        </form>
   </div>
   <div>
     {/* {console.log (chartSymbol)} */}
    <Stock_chart StockSymbol ={chartSymbol} stockChartXValues = {stockChartXValues}  stockChartYValues = {stockChartYValues}    splitsFlag = {splitsFlag} />
    {/* {conditionalChart}     */}
    {AlphaVantage (alphaCallBack)}
    </div>
    </>
  )
}
