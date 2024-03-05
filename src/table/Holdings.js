import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'
import {nanoid} from 'nanoid';

// corsUrl = "https://dinagold.org:5000/holdings?stock=qqq";

// https://stockanalysis.com/etf/ivv/holdings/

// (sym, rows, setError, corsServer, logFlags)
function Holdings (props) {
  const [err, setErr] = useState();
  const [arr, setArr] = useState();

  React.useEffect (() => {
    setErr();
    setArr();
  }, [props.chartSymbol])


  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.chartSymbol);
  if (row_index === -1) {
    alert ('stock missing: ' + props.chartSymbol)
    return;
  }

  function addSymOne (sym) {
    const sym_index = props.rows.findIndex((row)=> row.values.symbol === sym); 
    if (sym_index !== -1) 
      return; // skip if already in table
    var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    props.prepareRow(newStock);
    newStock.id = nanoid();
    newStock.values.symbol = sym;
    newStock.original.symbol = sym;
    newStock.cells = null;
    newStock.allCells = [];
    
    // newStock.values.gain_date = fireGain._updateDate;
    // newStock.values.gain_mili = fireGain._updateMili;
    props.prepareRow(newStock);
    return (newStock)
  }


  function getHoldings (insert) {
    if (props.rows[row_index].values.PE !== -2) {
      const er = 'Not an ETF, Holdings only for ETF';
      console.log (er)
      setErr (er)
      return;
    }  

    var corsUrl = "https://";
    corsUrl += props.corsServer + ":5000/holdings?stock=" + props.chartSymbol;

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
      if (result.status !== 200)
        return;

      // if (result.data.startsWith('err'))
      //   setErr(result.status)
      console.log (result.data, result.data.length)
      for (let i = 0; i < result.data.length; i++) {
        if (insert) {
          // const sym = result.data[i].sym;
          // const r_index = props.rows.findIndex((row)=> row.values.symbol === sym);
          // if (r_index !== -1) { 
          //   props.rows[i].values.percent = result.data[i].perc; // put in only percetage
          // }
          // else {
          //   // insert in table
          //   // const newStock = addSymOne (sym)
          // } 
          // window.location.reload();    
        }
      }
      // const arr = JSON.parse(result.data)

      if (! insert) {
        // setErr(JSON.stringify(result.data))
        setArr(result.data)
      }

      // if (rows[row_index].values.splits_list !== undefined) {
      //   // console.log ('old split: ', rows[row_index].values.splits)

      // }

    } )
    .catch ((err) => {
      setErr(err.message + ' only for ETF')
      // console.log(err.message)
    })
  }

  function renderList(array) {
    if (array.length < 1)
      return;
      return array.map((item) => <li key={item.sym}>{JSON.stringify(item)}</li>);  
  }


  return (
    <div style={{ border: '2px solid blue'}}> 

      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div> &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> Holdings &nbsp;  </h6>
      </div>

      <br></br>
      
      {props.chartSymbol &&
       <div stype={{display: 'flex'}}>
          <button type="button" onClick={()=>getHoldings (false)}>Holdings-display  </button> &nbsp;
          <button type="button" onClick={()=>getHoldings (true)}>Holdings-insert-in-table  </button>
        </div> 
      }

      {arr && arr[0].sym !== arr[0].nam && <div>Corporate name may be off row, because regex fail to match '&'</div>}
      {arr && Array.isArray(arr) &&  renderList(arr)}
      {err && <div style={{color:'red'}}> {err} </div>} 
      <div>&nbsp;</div>  
    </div>
    )
}

export {Holdings} 