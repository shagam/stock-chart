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

  const handleInfoClick = (sym) => {
    //restoreTable();
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
