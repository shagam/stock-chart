import React, {useState, useMemo, useEffect} from 'react'

import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import GlobalFilter from './GlobalFilter'
import { FaArrowDown, FaArrowUp } from 'react-icons/fa'
import Firebase from './Firebase'
import {db} from './firebase-config'
import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";
import { SPLIT_COLUMNS } from './split_columns'
import SPLIT_MOCK_DATA from './split_mock_data.json'
import {nanoid} from 'nanoid';

export const Splits = (props) => {
 
    const [splitsFlag, setSplitsFlag] = useState(false);
    const [split, setSplit] = useState({});

    const columns = useMemo(() => SPLIT_COLUMNS, []);
    var  data = useMemo(() => SPLIT_MOCK_DATA, []);
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

  
  const insetInTable = (split) => {
    var newSplit = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    prepareRow(newSplit);
    try {
    newSplit.id = nanoid();
    newSplit.values.symbol = split.symbol.toUpperCase();
    newSplit.original.symbol = split.symbol.toUpperCase();
    newSplit.values.key = split.symbol.toUpperCase() + '_' + split.year;

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
   

    insetInTable(split);

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
  }

  function deleteClick(symbol) {
    const rowIndex = rows.findIndex((row)=> row.values.symbol === symbol);
      if (rowIndex === -1) {
        alert ('split symbol not found ', symbol);
        return;
      } 
      rows.splice(rowIndex, 1);
      props.refreshCallBack(-1);
  }

  const firebaseGet = async () => {
    const splitRecords = await getDocs(splitRef);

    for (let i = 0; i < splitRecords.docs.length; i++) {
      console.log (splitRecords.docs[i].data());
      const key = splitRecords.docs[i].data()._key;

      if (searchKeyInTable (key))
        continue;
  
      const split = {key: splitRecords.docs[i].data()._key, symbol: splitRecords.docs[i].data()._symbol,
          jump: splitRecords.docs[i].data().jump, year: splitRecords.docs[i].data().year,
        month: splitRecords.docs[i].data().month, day: splitRecords.docs[i].data().day}

      insetInTable(split);
    }
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

  return  props.admin && (
  
    <div style= {style_component}>
      <div>
            <input
              type="checkbox" checked={splitsFlag}
              onChange={splitsFlagChange}
            /> splits
      </div>

      { splitsFlag &&

        <div  className = 'split'>
          
          <GlobalFilter className="stock_button_class" filter={globalFilter} setFilter={setGlobalFilter}  />
          {'  rows=' + rows.length + "  "}
          <button type="button" onClick={()=>firebaseGet()}>firebaseGet </button>
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