import React, {useState, useMemo, useEffect} from 'react'

import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import GlobalFilter from './GlobalFilter'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import Firebase from './Firebase'
import {db} from './firebase-config'
import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";
import { SPLIT_COLUMNS } from './split_columns'
import SPLIT_MOCK_DATA from './stocksplithistory.json'
import {nanoid} from 'nanoid';

export const Splits = (props) => {
 
    const [splitsFlag, setSplitsFlag] = useState(false);
    const [split, setSplit] = useState({});
    // const [splitArray, setSplitArray] = useTable ([]);

    const columns = useMemo(() => SPLIT_COLUMNS, []);
    var  data;// = useMemo(() => SPLIT_MOCK_DATA, []);

    var stocksFromLocalStorage = localStorage.getItem("splits");

    data = useMemo(() => SPLIT_MOCK_DATA, []);


    const splitRef = collection(db, "splits")

    const splitsFlagChange = () => {setSplitsFlag (! splitsFlag)}

  function formChange (event) {
    event.preventDefault();

    const name = event.target.name;
    const value = event.target.value;

    setSplit (values => ({...values, [name]: value.toUpperCase()}))

    //console.log(event.target.name + " " + event.target.value.toUpperCase());
    //split (event.target.name: event.target.value.toUpperCase());
  }

  
  const insetInSplitsTable = (split) => {
    var newSplit = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    prepareRow(newSplit);
    try {
    newSplit.id = nanoid();
    newSplit.values.key = split.symbol.toUpperCase() + '_' + split.year;
    newSplit.values.symbol = split.symbol.toUpperCase();
    newSplit.original.symbol = split.symbol.toUpperCase();

    newSplit.cells = null;
    newSplit.allCells = [];

    newSplit.values.jump = split.jump;
    newSplit.values.year = split.year;
    newSplit.values.month = split.month;
    newSplit.values.day = split.day;
    prepareRow(newSplit);

    rows.push (newSplit);
    
    props.refreshCallBack(-1);

    } catch (e) {console.log (e);}
  }
  
  
  const searchKeyInTable = (key) => {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].values.key === key) {
        return true;
      }          
    }
    return false;
  }


  const formSubmit = async (event) => {
    event.preventDefault();
    // console.log (split); // array of splits

    const key = split.symbol.toUpperCase() + '_' + split.year;

    if (searchKeyInTable (key)) {
      alert ('duplicate key:  ' + key);
      return;
    }
   

    insetInSplitsTable(split);

    // delete old docs with this key
    var userQuery = query (splitRef, where('_key', '==', key));
    const split_array = await getDocs(userQuery);
    for (let i = 0; i < split_array.docs.length; i++) {
      //const id = gain.docs[i].id;
      var splitDoc = doc(db, "splits", split_array.docs[i].id);
      await deleteDoc (splitDoc);    
    }

    // try {
      await addDoc (splitRef, {_key: key, _symbol: split.symbol, jump: split.jump, year: split.year, month: split.month, day: split.day, _ip: props.localIpv4})
    // } catch (e) {console.log (e)}
    saveTable();
  }


  function deleteClick(symbol) {
    const rowIndex = rows.findIndex((row)=> row.values.symbol === symbol);
      if (rowIndex === -1) {
        alert ('split symbol not found ', symbol);
        return;
      } 
      rows.splice(rowIndex, 1);
      saveTable();
      props.refreshCallBack(-1);
  }

  const insertSplitInStockTable = (sym) => {
    if (props.symbol === undefined || rows === undefined) // not initialized yet
      return;

    // search stock table
      // build array for specific stock
      if (sym === undefined)
        return;

      const row_index = props.rows.findIndex((row)=> row.values.symbol === sym);
      if (row_index === -1) // not found
        return;
      if (props.rows[row_index].values.splits_calc === 'table')
        return;  // already in

      const splitArray_build = [];
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].values.symbol !== sym)
          continue;
          const date = rows[i].values.year + '-' + rows[i].values.month + '-' + rows[i].values.day;
          const split = {ratio: Number (rows[i].values.jump), date: date};
          splitArray_build.push (split);
      }
      if (splitArray_build.length === 0) // no split found ?
        return;
      
      // insert splits in stock table.
      console.log (sym, splitArray_build);
      props.rows[row_index].values.splits_list_table = splitArray_build;
      props.rows[row_index].values.splits_list = JSON.stringify(splitArray_build);
      props.rows[row_index].values.splits_calc = 'table'
  }

  // get splits from firebase into splits table. 
  const firebaseGet = async () => {
    const splitRecords = await getDocs(splitRef);

    for (let i = 0; i < splitRecords.docs.length; i++) {
      // console.log (splitRecords.docs[i].data());
      const key = splitRecords.docs[i].data()._key;

      if (searchKeyInTable (key))
        continue;
  
      const split = {key: splitRecords.docs[i].data()._key, symbol: splitRecords.docs[i].data()._symbol,
          jump: splitRecords.docs[i].data().jump, year: splitRecords.docs[i].data().year,
        month: splitRecords.docs[i].data().month, day: splitRecords.docs[i].data().day}

      insetInSplitsTable(split);
    }
    saveTable();
    props.refreshCallBack(-1);
  }
  

  // useEffect (() => { 
  //   insertSplitsInStockTableAll();
  // }, [])

  // scan stocktable to insert splits
  const insertSplitsInStockTableAll = () => {
    for (let s = 0; s < props.rows.length; s++) {
      const sym = props.rows[s].values.symbol;
      insertSplitInStockTable (sym);  // if found
      // build array for specific stock
    }
    props.saveTable();
    props.refreshCallBack(-1);
  }


  const saveTable = () => {
    const splitsTable = [];
    for (let i = 0; i < rows.length; i++) {
      splitsTable.push(rows[i].values);
    }
    const stocksStr = JSON.stringify(splitsTable);
    if (splitsTable.length > 0)
      localStorage.setItem ('splits', stocksStr);
    else
      localStorage.removeItem ('splits'); // reading empty array cause a bug
  }


  const stocksplithistory = (sym) => {
    const API_Call = `http://www.stocksplithistory.com/?symbol=${sym}`
    fetch(API_Call)
    .then(
        function(response) {
          const respStr = JSON.stringify (response);
          console.log(response);
          return response.json();
        }
    )
    .then(
        (data) => {
          const dataStr = JSON.stringify(data);
          if (dataStr === "{}") {
            alert (`Invalid symbol: (${sym})`)
            return;
          }
          console.log(API_Call);
          console.log (dataStr.substring(0,150));
        
          
        })
  }

  const {

    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable ({
    columns,
    data,

  },
  useGlobalFilter, useSortBy, useRowSelect, //useSticky, useBlockLayout, useFlexLayout, useAbsoluteLayout

  )
  
  //insertTableSplit(props.symbol);

  const style_component = {
    border: '2px solid red',
  };

  const style_header = {
    // 'text-align': 'center',
    // 'background-color': '#04AA6D',
    color: 'white',
    position: 'sticky',
    top: 0
  }
    
  
  const style_table = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    overflowY: 'scroll',
    /* background: yellow; */
    textAlign: 'center',
    height: '40vh',
    display: 'block'
    // padding: '-20px',
    // margin: '-20px'
  };



  const { globalFilter } = state

  return (
  
    <div style= {style_component}>
      <div>
            <input
              type="checkbox" checked={splitsFlag}
              onChange={splitsFlagChange}
            /> splits
      </div>

      { splitsFlag &&

        <div  className = 'split'>
          {/* <div> splits from url:    https://www.stocksplithistory.com  </div> */}
          <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter}  />
          {'  rows=' + rows.length + "  "}

          <button type="button" onClick={()=>saveTable()}>saveTable </button>          
          <button type="button" onClick={()=>firebaseGet()}>firebaseGet </button>
          <button type="button" onClick={()=>insertSplitsInStockTableAll()}>insertSplitsInStockTable </button>


          <table style = {style_table} id="stockTable_id" {...getTableProps()}>
            <thead style={ style_header }>
              {headerGroups.map ((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((columns) => (
                        <th {...columns.getHeaderProps(columns.getSortByToggleProps())}>{columns.render('Header')} 
                        <span>
                          {columns.isSorted ? (columns.isSortedDesc ? <FaArrowUp color='blue'/> : <FaArrowDown color='red'/>) : ''} 
                        </span>
                        </th>
                    ))}
                  </tr>
              ))}
            </thead>
          
            <tbody id="tableBodyId" {...getTableBodyProps()}>
              {
                rows.map(row => {
                  // {style: (row.GOOGCompare > 1.1 || row.GOOGCompare < 0.9) ? {background: red}}
                  prepareRow(row)
                  return (
                    <tr id='stock_row_id_'
                      {...row.getRowProps()}>
                      {row.cells.map((cell) => {
                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      })}
                        <div>
                        <button type="button" onClick={()=>deleteClick(row.values.symbol)}>del</button>
                        <button type="button" onClick={()=>stocksplithistory(row.values.symbol)}>get</button>
                        </div>
                    </tr>
                  )
                })}
            </tbody>
          </table>


          <form onSubmit = {formSubmit}>
          < input type="text" name="symbol"  required="required"
              placeholder="Symbol (stock or etf"  onChange={formChange}  /> 

            <input type="text" name="jump"  required="required"
              placeholder="jump (2, 0.5)"  onChange={formChange}  />
     
            <input type="number" name="year"  required="required"
              placeholder="year "  onChange={formChange}  />

            <input type="number" name="month"  required="required"
              placeholder="month 1..12 "  onChange={formChange}  />

            <input type="number" name="day"  required="required"
              placeholder="day 1..31"  onChange={formChange}  />

            <button type="submit"> add split </button>
          </form>
        </div>

      }     
    </div>
  )
}

export default Splits