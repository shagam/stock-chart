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
  const [dat, setDat] = useState();
  const [etfArr, setEtfArr] = useState([])
  const [holdingsObj, setHoldingsArray] = useState({})
  const [heldObj, setHeldObj] = useState({})
  const [heldMasterObj, setHeldMasterObj] = useState({})
  const [tstObj, setTstObj] = useState ({
    'ANZN':{'QQQ': 12, 'SCHG': 5, 'IVV': 5},
    'AMD':{'QQQ': 10, 'SCHG': 3, 'IVV': 5},
    'IBM':{'QQQ': 10, 'SCHG': 3, 'IVV': 5}})


  const [tbl, setTbl] = useState (true)

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
      holdingsObj[props.chartSymbol] = result.data;
      etfArr.push (result.data.sym)
      console.log (Object.keys(holdingsObj))

      for (let i = 1; i < result.data.holdArr.length; i++) {
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

  function ETFCompare () {
    const hold = {}
    console.log (holdingsObj)

    etfArr.forEach((etf) => {
      console.log ('holdArr=', holdingsObj[etf].holdArr)
      const holdArr = holdingsObj[etf].holdArr
      for (let i = 1; i < holdArr.length; i++) {
        const symm = holdArr[i].sym;
        if (heldMasterObj[symm] === undefined)
          heldMasterObj[symm] = holdArr[i].sym;
        if (heldObj[symm] === undefined)
          heldObj[symm] = holdArr[i].perc;
      }
      console.log('heldObj=', heldObj)
      console.log ('heldMasterObj=', heldMasterObj)
      holdingsObj[etf].holdArr.forEach((sym2Percent) => {
        hold[sym2Percent.sym] = sym2Percent.perc;
      })
      holdingsObj[etf]['hold'] = hold;  
      

    })
  }


  function renderList(array) {
    if (array.length < 1)
      return;
      return array.map((item) => <li key={item.sym}>{JSON.stringify(item)}</li>);  
  }

  // const [tstObj, setTstObj] = useState ({
  //   'ANZN':{'QQQ': 12, 'SCHG': 5, 'IVV': 5},
  //   'AMD':{'QQQ': 10, 'SCHG': 3, 'IVV': 5},
  //   'IBM':{'QQQ': 10, 'SCHG': 3, 'IVV': 5}})

  return (
    <div style={{ border: '2px solid blue'}}> 

      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div> &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> Holdings &nbsp;  </h6>
      </div>

      <br></br>
      
      {props.chartSymbol && <div>
          <div stype={{display: 'flex'}}>
              {/* <button type="button" onClick={()=>getHoldings (false, true)}>console.log  </button> &nbsp; */}
              <button type="button" onClick={()=>getHoldings (false, false)}>display  </button> &nbsp;
              <button type="button" onClick={()=>getHoldings (true, false)}>insert-in-table  </button> &nbsp; 
              <button type="button" onClick={()=>ETFCompare ()}>Compare  </button> &nbsp;      
          </div> 
          <div>&nbsp; </div>
        </div>
      }

      {err && <div style={{color:'red'}}> {err} </div>} 
      {arr && arr[0].sym !== arr[0].perc && <div>percentage may be off row</div>}      
      {dat && <div> &nbsp; sym={dat.sym} &nbsp; date={dat.updateDate} </div>}
      {arr && props.eliHome && Array.isArray(arr) &&  renderList(arr)}

      {<div>
      {props.eliHome && <table>
        <theader>
          {etfArr && etfArr.length > 0 && etfArr.map((e) => {
            return (
            <tr>
              <th>
                {e}
              </th>
            </tr>
            )
          })}
          
        </theader>
        <tbody>             
          {Object.keys(tstObj).map((s) =>{
            return (
            <tr>
              <td>{s}</td>
                {Object.keys(tstObj[s]).map((k)=>{
                  return (
                    <td>
                      {JSON.stringify(tstObj[s][k])}
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

      {/* {holdingsArray && 
      <div>
        <table>
          <tbody> 
           {
                Object.keys(holdingsArray).map((symm,i)=>{
                  return (
                      <tr  key={i}>
                        <td> {holdingsArray[symm].holdArr[1].sym} </td>
                        <td> {holdingsArray[symm].holdArr[1].perc} </td> 
                      </tr>
                  )
                })
              }
          </tbody>  
        </table>
      </div>
      } */}
      <div>&nbsp;</div>  
    </div>
    )
}

export {Holdings} 