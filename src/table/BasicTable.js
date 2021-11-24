import React, {useState, useMemo} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'
import './table.css'
import GlobalFilter from './GlobalFilter'
import CheckBox from './CheckBox'
import {nanoid} from 'nanoid';
//import cloneDeep from 'lodash/cloneDeep';

//setHiddenColumns   setHiddenColumns: Function(Array<ColumnId: String> | Function(oldHiddenColumns) => Array<ColumnId:

export const BasicTable = (props) => {

  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");

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

  //setHiddenColumns: Function(Array<ColumnId: String> | Function(oldHiddenColumns) => Array<ColumnId: String>) => void
  //toggleHideColumn: Function(columnId: String, ?value: Boolean) => void
  //toggleHideAllColumns: Function(?value: Boolean) => void
  //toggleHideColumn: Function(columnId: String, ?value: Boolean) => void


    // get stock overview
    const handleInfoClick = (symbol) => {
      setInfoSymbol (symbol);
      //callBack ("tableCallBack");
      localStorage.setItem ('infoSymbol', symbol); 
      console.log(`symbol: ${symbol} chartSymbol: ${infoSymbol}`);      
      var API_KEY = 'C542IZRPH683PFNZ';

      let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
      
      //const index = rows.findIndex((row)=> row.original.symbol === symbol);  

      console.log(`Overview info (${symbol})`);
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
                    if (dataStr === '{}')
                      console.log (`info invalid symbol=${symbol} data="${dataStr}"`);
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
  
        const handleOverview = (childData)  => {
          if (childData === null || childData === {} || childData["Exchange"] == null) {
            console.log ('ChildData missing');
            return;
          }
          console.log (JSON.stringify(childData).substring(0,100));
          const symbol = childData["Symbol"];
    
          const index = rows.findIndex((row)=> row.original.symbol === symbol);  
          rows[index].values.Exchange = childData["Exchange"].substring(0,4);
          rows[index].values.PE = childData["PERatio"];
          rows[index].values.PEG = childData["PEGRatio"];  
          rows[index].values.TrailPE = childData["TrailingPE"];
          rows[index].values.ForwPE = childData["ForwardPE"];
          rows[index].values.Div = childData["DividendYield"];
          rows[index].values.BETA = childData["Beta"];;
          rows[index].values.nowOverview = Date.now();
          rows[index].values.target = childData["AnalystTargetPrice"];

          //console.log (`Symbol (${symbol}) index (${index})`);
          props.callBack(-1); 

          // save overview per symbol
          // stocksOverview[symbol] = childData;
          // const stocksOverviewStr = JSON.stringify(stocksOverview);
          // localStorage.setItem('stocksOverview', stocksOverviewStr);
        }
            

  const handleChartClick = (sym) => {
  
  }

  const handleDeleteClick = (row, symbol) => {
    const index = rows.findIndex((row)=> row.original.symbol === symbol);  
    rows.splice(index, 1);
    console.log (rows);
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
    const index = rows.findIndex((row)=> row.original.symbol.toUpperCase() === addFormData.symbol.toUpperCase());

    //console.log (addFormData.symbol)
    if (index !== -1) {
      alert ('Trying to add duplicate symbol: (' + addFormData.symbol + ')');
      return;
    }
    
    //var newStock = cloneDeep (rows[0]);
    //newStock.id = nanoid();
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

  const saveTable = () => {
    const stocks = [];
    for (let i = 0; i < rows.length; i++) {
      //console.log (rows[i].original);
      var newStock = JSON.stringify (rows[i].original)
      stocks.push(newStock);
    }
    const stocksStr = JSON.stringify(stocks);
    localStorage.setItem ('stocks', stocksStr);
    localStorage.setItem ('state', JSON.stringify(state));
  }

  const restoreTable = () => {
    const stocksStr = localStorage.getItem ('stocks');
    const stocks = JSON.parse (stocksStr);    
    for (let i = 0; i < stocks.length; i++) {
      //console.log (rows[i].original);
      stocks.push(stocks[i]);
    }
    //state = JSON.parse(localStorage.getItem ('state'));
  }

  //restoreTable();

  var {
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


  const { globalFilter } = state

  return (
    <>
    <div>
      <div>
        <CheckBox {...getToggleHideAllColumnsProps()} /> Toggle All
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
    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter}/>
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
                  <button type="button" onClick={()=>handleDeleteClick(row, row.original.symbol)}>del</button>
                  <button type="button" onClick={()=>handleInfoClick(row.original.symbol)}>info</button>     
                  <button type="button" onClick={()=>handleChartClick(row.original.symbol)}>chart</button> 
              </tr>
            )
          })}
      </tbody>
    </table>
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
    </>
  )
}
