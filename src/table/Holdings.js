import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'
import {nanoid} from 'nanoid';
import {holdingsAddDoc, holdingsGet, holdingsGetList, holdingsInsert} from './Firestore'

// corsUrl = "https://dinagold.org:5000/holdings?stock=qqq";

// https://stockanalysis.com/etf/ivv/holdings/

// (sym, rows, setError, corsServer, logFlags)
function Holdings (props) {
  const [err, setErr] = useState();
  const [arr, setArr] = useState();
  const [dat, setDat] = useState();

  React.useEffect (() => {
    setErr();
    setArr();
    setDat();
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


  function getHoldings (insert, logOnly) {
    // if (props.rows[row_index].values.PE !== -2) {
    //   const er = 'Server connection fail';
    //   console.log (er)
    //   setErr (er)
    //   return;
    // }  

    var corsUrl = "https://";
    corsUrl += props.corsServer + ":5000/holdings?stock=" + props.chartSymbol;

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
      if (result.status !== 200) {
        console.log (props.chartSymbol, 'status=', result)
        return;
      }

      // Check for err
      if (result.data.includes('failed')) {
        setErr(result.data)
        return;
      }

      console.log (props.chartSymbol, result.data, result.data.length)
      if (logOnly)
        return;

      // send to common database
      // const arr = result.data.shift()
      holdingsAddDoc(props.chartSymbol, JSON.stringify(result.data));

      for (let i = 1; i < result.data.length; i++) {
        if (insert) { // insert in table
          const sym = result.data[i].sym;
          console.log(sym)
          const r_index = props.rows.findIndex((row)=> row.values.symbol === sym);
          if (r_index !== -1) { 
            props.rows[r_index].values.percent = result.data[i].perc; // symm exist,so put in only percetage
          }
          else {
            // add a new sym
            const newStock = addSymOne (sym)
            console.log ('added', newStock)
            newStock.values.percent = result.data[i].perc
            props.rows.push (newStock);
          }  
        }
      } // end of add
      props.saveTable()


      if (insert)
        window.location.reload(); 
      // const arr = JSON.parse(result.data)

      if (! insert) {
        // setErr(JSON.stringify(result.data))
        setArr(result.data)
        // setDat(result.data)
      }
    } )
    .catch ((err) => {
      setErr(err.message + ' only for ETF')
      // console.log(err.message)
    })
  }

  function getList () {
    const list = holdingsGetList(setErr, setArr);

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
      
      {props.chartSymbol && <div>
        <div stype={{display: 'flex'}}>
            <button type="button" onClick={()=>getHoldings (false, true)}>console.log  </button> &nbsp;
            <button type="button" onClick={()=>getHoldings (false, false)}>display  </button> &nbsp;
            <button type="button" onClick={()=>getHoldings (true, false)}>insert-in-table  </button> &nbsp;      
          </div> 
          <div>&nbsp; </div>
          <div stype={{display: 'flex'}}>
            <button type="button" onClick={()=>getList ()}>dataBaseList  </button> &nbsp;
            <button type="button" onClick={()=>holdingsGet (props.chartSymbol, setDat, setArr)}>dataBaseGet  </button> 
            {/* {props.eliHome && <button type="button" onClick={()=>holdingsInsert (props.chartSymbol, props.rows)}>dataBaseInsert  </button>} */}
          </div>
        </div>
      }

      {err && <div style={{color:'red'}}> {err} </div>} 
      {dat && arr[0].sym !== arr[0].perc && <div>percentage may be off row</div>}      
      {dat && <div>sym={dat.key} &nbsp; date={dat._updateDate} </div>}
      {arr && Array.isArray(arr) &&  renderList(arr)}
      <div>&nbsp;</div>  
    </div>
    )
}

export {Holdings} 