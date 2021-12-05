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

//setHiddenColumns   setHiddenColumns: Function(Array<ColumnId: String> | Function(oldHiddenColumns) => Array<ColumnId:

export const BasicTable = (props) => {

  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");
  const [chartData, setChartData] = useState("");

  const columns = useMemo(() => COLUMNS, []);
  var  data = useMemo(() => MOCK_DATA, []);

  const dataStored = useMemo(() => localStorage.getItem('stocks', []));
  const dataStoredParsed = JSON.parse(dataStored);
  // console.log ('loaded');
  //   if (dataStored !== null)
  //     data = dataStoredParsed;

    //data = JSON.parse('[{"symbol": "GOOG"},{"symbol": "FB"},{"symbol": "AMZN"},{"symbol": "QQQ"}]');

  // if (dataStored !== null)

  // else
  //   data = useMemo(() => MOCK_DATA, []);



  //const [rows, setRows] = useState (data);

  const [addFormData, setAddFormData] = useState({
    // symbol: '', update: '', nowInfo: -1, nowHist: -1, Exchange: '', /*Sector: '', lastPrice: 0,*/ PE: 0, PEG: 0,
    //  BETA: 0, gap: "", wk: -1, wk2: 20, mon: 0, mon3: 0, mon6: 0, year: 0, year2: 0, year5: 0, year10: 0, year20: 0          
  })

    // get stock overview
    const handleInfoClick = (symbol) => {
      setInfoSymbol (symbol);
      //callBack ("tableCallBack");
      localStorage.setItem ('infoSymbol', symbol); 
      console.log(`symbol: ${symbol} chartSymbol: ${infoSymbol}`);      
      var API_KEY = 'C542IZRPH683PFNZ';

      let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
      
      //const index = rows.findIndex((row)=> row.original.symbol === symbol);  

      //console.log(`Overview info (${symbol})`);
      //console.log (`${API_Call}`);            
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
                    if (dataStr === '{}')
                      alert (`etf or invalid symbol (no info) symbol=${symbol} data="${dataStr}"`);
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
              return chartSymbol;
            }

            if (Date.now() - rows[index].values.nowChart < 1000)
              return "duplicate";

            rows[index].valuesnowHist = Date.now();
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
          newStock.values.nowChart = Date.now();
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

    const API_KEY_ = 'BC9UV9YUBWM3KQGF';
    const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  

    let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${chartSymbol}&outputsize=compact&apikey=${API_KEY_}`;

    
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
            (data_) => {
              const dataStr = JSON.stringify(data_);
              console.log(API_Call);
              console.log (dataStr.substring(0,150));
              // stocksChartHistory[StockSymbol] = data;
              // const stocksHistoryStr = JSON.stringify(stocksChartHistory); 
              // localStorage.setItem ('stocksChartHistory', stocksHistoryStr);
              
              // too frequent AlphaVantage api calls
              if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                  alert (`${dataStr} (${chartSymbol}) \n\n${API_Call} `);
                  return;
              }
              if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
                alert (dataStr.substr(0, 35) + ` symbol(${chartSymbol}) \n\n${API_Call}`);
                return;
              }

              setChartData (data_);
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
      idList.push (rows[i].id);
    }
    idList.sort((a, b) => (a > b) ? 1 : -1);
    // search for hole
    for (let i = 0; i < rows.length - 1; i++) {
      if (rows[i].id + 1 !== rows[i+1].id)
        return rows[i].id + 1;
    }
    return idList[idList.length - 1] + 1;
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
    newStock.id = getUniqueId(); //anoid();
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
    setHiddenColumns,
    toggleHidden,
  } = useTable ({
    columns,
    data,
    initialState: {
      hiddenColumns: ["Exchange","TrailPE","ForwPE","ForwPE","Div","target","splits","year10","year20"]
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
        //newStock.values.symbol = sym;
        rows.push(newStock);
      }
;  
    }

    const state1 = JSON.parse(localStorage.getItem ('state'));
    //toggleHidden('BETA');
    //setHiddenColumns([])  
  }

 restoreTable();
 //setHiddenColumns (["TrailPE", "ForwPE"]);

  const conditionalChart = () => {
    if ((chartSymbol === ""))  {
      console.log ('(BasicTable) chartSymbol undef');
      return null;
    }
    // return  <StockChart StockSymbol ={chartSymbol} API_KEY = {c_API_KEY} callBack = {handleCallBackForHistory} /> 
    return <Stock_chart StockSymbol ={chartSymbol} callBack = {handleCallBackForHistory}  /> 
  }

  const { globalFilter } = state

  return (
    <>
    <div>
      <div>
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
                  <button type="button" onClick={()=>handleDeleteClick(row, row.original.symbol)}>del</button>
                  <button type="button" onClick={()=>handleInfoClick(row.original.symbol)}>info</button>     
                  <button type="button" onClick={()=>handleChartClick(row.original.symbol)}>chart</button> 
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
     {console.log (chartData.stringify)}
    <Stock_chart StockSymbol ={chartSymbol} callBack = {handleCallBackForHistory} dat = {chartData} />
    {/* {conditionalChart}     */}
    {/* {AlphaVantage (alphaCallBack)} */}
    </div>
    </>
  )
}
