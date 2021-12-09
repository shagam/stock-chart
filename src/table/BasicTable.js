import React, {useState, useMemo} from 'react'
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


export const BasicTable = (props) => {

  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");
  const [chartData, setChartData] = useState("");
  const [apiKeyIndex, setApiKeyIndex] = useState (0);
  const [API_KEY, setAPI_KEY] = useState('');
  const [splitsFlag, setSplitsFlag] = useState('');

  const columns = useMemo(() => COLUMNS, []);
  var  data;// = useMemo(() => MOCK_DATA, []);
  var stocksFromLocalStorage = localStorage.getItem("stocks");
  var mmmmm = useMemo; 
  if (!stocksFromLocalStorage) 
  {
      data = mmmmm(() => MOCK_DATA, []);
  }
  else   
      data = mmmmm(() => JSON.parse (localStorage.getItem("stocks")), []);

  const alphaCallBack = (key) => {
    setAPI_KEY (key);
    localStorage.setItem("alphaVantage", key);
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
      setInfoSymbol (symbol);
      //callBack ("tableCallBack");
      localStorage.setItem ('infoSymbol', symbol); 
      console.log(`symbol: ${symbol} infoSymbol: ${infoSymbol}`);
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
            const index = rows.findIndex((row)=> row.original.symbol === sym);            
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
            rows[index].values.splits = splits;
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
          const index = rows.findIndex((row)=> row.original.symbol === symbol);

          var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
          prepareRow(newStock);
          newStock.id = rows[index].id;
          newStock.values.symbol = symbol;
          newStock.values.Exchange = childData["Exchange"].substring(0,4);
          newStock.values.PE = childData["PERatio"];
          newStock.values.PEG = childData["PEGRatio"]; 
          newStock.values.TrailPE = childData["TrailingPE"];
          newStock.values.ForwPE = childData["ForwardPE"];
          newStock.values.Div = childData["DividendYield"];
          newStock.values.BETA = childData["Beta"];;
          newStock.values.target = childData["AnalystTargetPrice"];

          newStock.values.nowOverview = Date.now();
          newStock.values.nowHist = rows[index].values.nowHist;
          newStock.values.gain_date =  rows[index].values.gain_date;

          newStock.values.wk = rows[index].values.wk;
          newStock.values.wk2 = rows[index].values.wk2;
          newStock.values.mon = rows[index].values.mon;
          newStock.values.mon3 = rows[index].values.mon3;
          newStock.values.mon6 = rows[index].values.mon6;
          newStock.values.year = rows[index].values.year;
          newStock.values.year2 = rows[index].values.year2;
          newStock.values.year5 = rows[index].values.year5;
          newStock.values.year10 = rows[index].values.year10;
          newStock.values.year20 = rows[index].values.year20; 
          newStock.values.splits = rows[index].values.splits;

          newStock.values.info_date = getDate();
          //rows[index] = newStock;
          rows.splice (index, 1, newStock);
          saveTable();
          props.callBack(-1); 
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
                alert (dataStr.substr(0, 35) + ` symbol(${sym}) \n\n${API_Call}`);
                //setChartData ('');
                return;
              }

              var stockChartYValuesFunction = [];
              let periodTag = 'Weekly Adjusted Time Series';

              let i = 0;
              var splits = "";
              var splitArray = [];
              for (var key in chartData[`${periodTag}`]) {
                  stockChartYValuesFunction.push(chartData[`${periodTag}`][key]['1. open']);
                  if (i > 0) {
                    let ratio = stockChartYValuesFunction[i] / stockChartYValuesFunction[i-1];
                    if (ratio > 1.8 || ratio < 0.6) {
                      ratio = ratio.toFixed(2);
                      //splits += `date=${key}  ratio=${ratio} week=${i}, `;
                      const  split = {ratio1: ratio, date: key, week: i};
                      splitArray.push(split); 
                    }                        
                  }
                  i++;
              }
              if (splitArray.length > 0)
                splits = JSON.stringify(splitArray);
              else
                splits = '';  
              if (splitArray.length > 1 && (splitArray[splitArray.length - 1].week - splitArray[0].week) < 208)
                splits = '';

              var histArray = [];
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
              setChartData (chartData);
              //props.callBack(-1);
            }
        )
      }
  

  const handleDeleteClick = (row, symbol) => {
    const index = rows.findIndex((row)=> row.original.symbol === symbol);  
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

  const getUniqueId = () => {
    var idList = [];
    for (let i = 0; i < rows.length; i++) {
      idList.push (rows[i].id * 1);
    }
    idList.sort((a, b) => (a > b) ? 1 : -1);
    // search for hole
    for (let i = 0; i < rows.length - 1; i++) {
      if ((rows[i].id * 1 + 1) !== rows[i+1].id)
        return rows[i].id * 1 + 1;
    }
    return idList[idList.length - 1] * 1 + 1;
    //console.log (idList);
  }

  const handleAddFormSubmit = (event) => {
    event.preventDefault();
    var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    prepareRow(newStock);
    const index = rows.findIndex((row)=> row.values.symbol.toUpperCase() === addFormData.symbol.toUpperCase());

    //console.log (addFormData.symbol)
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
    // const stocksStr = JSON.stringify(rows);
    // localStorage.setItem ('stocks', stocksStr);
    saveTable();
    props.callBack(1);
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
      hiddenColumns: ["Exchange","TrailPE","ForwPE","ForwPE","Div","target","wk2","mon6","year10","year20","splits","info_date","gain_date"]
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
      //console.log (rows[i].original);
      //var newStock = JSON.stringify (rows[i].values)
      stocks.push(rows[i].values);
    }
    const stocksStr = JSON.stringify(stocks);
    localStorage.setItem ('stocks', stocksStr);
    localStorage.setItem ('state', JSON.stringify(state));
  }


  const restoreTable = () => {
    if (rows === undefined)
      return;
    //const defaultStocks = ['AMZN','GOOG','IBM','MRNA','PFE','QQQ','VOO','DIA'];
    const stocksStr = localStorage.getItem ('stocks');
    const stocks = JSON.parse(stocksStr);
    if (stocks !== null && stocks.length > 0) {
       rows.splice (0, rows.length);    
      for (let i = 0; i < stocks.length; i++) {
        const sym = stocks[i]["symbol"];
        // const index = rows.findIndex((row)=> row.values.symbol == sym);
        // if (index !== -1)
        //   rows.splice (index, 1);   
        //console.log (stocks[i]);

        var newStock = JSON.parse (`{"id":${i},"original":{"symbol":"${sym}"},"index":0,"values":{"symbol":"${sym}"}}`);
        newStock.values = stocks[i];
        newStock.original = stocks[i];
        prepareRow(newStock);
        rows.push(newStock);
      }
  
    }

    const state1 = JSON.parse(localStorage.getItem ('state')); 
  }

 //restoreTable();
 //setHiddenColumns (["TrailPE", "ForwPE"]);

  // const conditionalChart = () => {
  //   if ((chartSymbol === ""))  {
  //     console.log ('(BasicTable) chartSymbol undef');
  //     return null;
  //   }
  //   // return  <StockChart StockSymbol ={chartSymbol} API_KEY = {c_API_KEY} callBack = {handleCallBackForHistory} /> 
  //   return <Stock_chart StockSymbol ={chartSymbol} callBack = {handleCallBackForHistory}  /> 
  // }

  const { globalFilter } = state

  return (
    <>
    <div>
      <div className="buttons">
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
    <Stock_chart StockSymbol ={chartSymbol} dat = {chartData}     splitsFlag = {splitsFlag} />
    {/* {conditionalChart}     */}
    {AlphaVantage (alphaCallBack)}
    </div>
    </>
  )
}
