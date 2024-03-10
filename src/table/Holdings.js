import React, {useState} from 'react'
import axios from 'axios'
// import cors from 'cors'
import {nanoid} from 'nanoid';

import GetInt from '../utils/GetInt'

// corsUrl = "https://dinagold.org:5000/holdings?stock=qqq";

// https://stockanalysis.com/etf/ivv/holdings/

// (sym, rows, setError, corsServer, logFlags)
function Holdings (props) {
  const [err, setErr] = useState();
  const [arr, setArr] = useState();
  const [dat, setDat] = useState();

  const [etfArr, setEtfArr] = useState([])
  const [etfArr_, setEtfArr_] = useState([''])  // for table header
  const [holdingsRawObj, setHoldingsArray] = useState({}) // Raw received data
  const [heldMasterObj, setHeldMasterObj] = useState({})
  const [warn, setWarn] = useState([])

  const [count, setCount] =useState(17)

  const LOG = props.logFlags.includes('holdings')

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
    const FAIL = 'Request failed with status code 404'

    var corsUrl = "https://";
    corsUrl += props.corsServer + ":5000/holdings?stock=" + props.chartSymbol;

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
      if (result.status !== 200) {
        console.log (props.chartSymbol, 'status=', result)
        return;
      }
      if (LOG)
        console.log (props.chartSymbol, JSON.stringify(result.data))

    // Check for err
      if (result.data.holdArr === 'Request failed with status code 404') {
        setErr(result.data.holdArr + ", May be not an ETF")
        // console.log (result.data)
        props.errorAdd ([props.chartSymbol,result.data.holdArr + ", May be not an ETF"])
        return;
      }
      
      if (logOnly)
        return;
      holdingsRawObj[props.chartSymbol] = result.data;

      const etf = result.data.sym;
      if (! etfArr.includes(etf)) {
        etfArr.push (etf)
        etfArr_.push (etf)
      }

      const holdArr = result.data.holdArr;
      const len = result.data.holdArr.length < Number(count)+1 ? result.data.holdArr.length : Number(count)+1; // limit size.  (first is verification counters)
      for (let i = 1; i < len; i++) {
        const symm = result.data.holdArr[i].sym;
        if (heldMasterObj[symm] === undefined)
        heldMasterObj[symm] = {};
        // const obj = {etf: {symm: holdArr[i].perc}}
        heldMasterObj[symm][etf] =  holdArr[i].perc
      }

      // build a warningObj
      const warnObj = {sym: etf, update: result.data.updateDate};
      if (holdingsRawObj[etf].holdArr[0].sym !== holdingsRawObj[etf].holdArr[0].perc)
        warnObj['warn'] = 'Last percentage off by ' +
       (holdingsRawObj[etf].holdArr[0].perc - holdingsRawObj[etf].holdArr[0].sym) + ' row'
      warn.push (warnObj)
      if (LOG)
        console.log ('warn:', warn)

      // fill missing values with 0
      Object.keys(heldMasterObj).forEach((symm) => {
        etfArr.forEach((etf) => {
          if (heldMasterObj[symm][etf] === undefined)
            heldMasterObj[symm][etf] = 0
        })
      })

      // console.log (JSON.stringify(etfArr));
      if (LOG)
      console.log (heldMasterObj)
      if (LOG)
      console.log (Object.keys(holdingsRawObj))

      for (let i = 1; i < len; i++) {
        if (insert) { // insert in table
          const sym = result.data.holdArr[i].sym;
          console.log(sym)
          const r_index = props.rows.findIndex((row)=> row.values.symbol === sym);
          if (r_index !== -1) { 
            props.rows[r_index].values.percent = result.data.holdArr[i].perc; // symm exist,so put in only percetage
          }
          else {
            // add a new sym
            const newStock = addSymOne (sym)
            console.log ('added', newStock)
            newStock.values.percent = result.data.holdArr[i].perc
            props.rows.push (newStock);
          }  
        }
      } // end of add
      if (insert)
        props.saveTable()


      if (insert)
        window.location.reload(); 
      // const arr = JSON.parse(result.data)

      if (! insert) {
        // setErr(JSON.stringify(result.data))
        setArr(result.data.holdArr)
        setDat(result.data)
      }
    } )
    .catch ((err) => {
      setErr(err.message + ' ' + corsUrl)
      // console.log(err.message)
    })
  }

  // display list (of holdings)
  function renderList(array) {
    if (array.length < 1)
      return;
      return array.map((item) => <li key={item.sym}>{JSON.stringify(item)}</li>);  
  }


  return (
    <div style={{ border: '2px solid blue'}}> 

      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div> &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> ETF Holdings &nbsp;  </h6>
      </div>

      <br></br>
      
      {props.chartSymbol && <div>
          <div stype={{display: 'flex'}}>
              {/* <button type="button" onClick={()=>getHoldings (false, true)}>console.log  </button> &nbsp; */}
              <GetInt init={count} callBack={setCount} title='Count-Limit (50 max) &nbsp;' pattern="[0-9]+"/> 
              <button type="button" onClick={()=>getHoldings (false, false)}>display  </button> &nbsp;
              <button type="button" onClick={()=>getHoldings (true, false)}>insert-in-table &nbsp; {etfArr[etfArr.length-1]} </button>

              {/* <button type="button" onClick={()=>ETFCompare ()}>Compare  </button> &nbsp;       */}
          </div> 
          <div>&nbsp; </div>
        </div>
      }

      {err && <div style={{color:'red'}}> {err} </div>} 
      {Object.keys(warn).length > 0 && Object.keys(warn).map((w)=>{
        return(
        <div style={{display: 'flex'}}>
          {warn[w].sym} &nbsp;&nbsp;  ({warn[w].update}) &nbsp; &nbsp; <div style={{color:'red'}}> {warn[w].warn} </div>
        </div>
        )
      })}

      {<div>
      {props.eliHome && 
      <table>
        <thead>
          <tr>
            {etfArr_ && etfArr_.length > 1 && etfArr_.map((e) => {
              return (
                <th scope="col">
                  {e}
                </th>      
              )
            })}         
          </tr>   
        </thead>

        <tbody>             
          {Object.keys(heldMasterObj).map((s) =>{
            return (
            <tr>
              <td style={{width: '8px'}}>{s}</td>
                {etfArr.map((k)=>{
                  return (
                    <td>
                      {heldMasterObj[s][k]}
                    </td>
                  )
                })
              }
            </tr>
            )
          })}
        </tbody>  
      </table>
      }
      </div> }

      <div>&nbsp;</div>  
    </div>
    )

}

export {Holdings} 