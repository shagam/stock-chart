import React, {useState} from 'react'
import axios from 'axios'
// import cors from 'cors'

import GetInt from '../utils/GetInt'
import {IpContext} from '../contexts/IpContext';

import {addStock} from './AddStock'
// corsUrl = "https://dinagold.org:5000/holdings?stock=qqq";

// https://stockanalysis.com/etf/ivv/holdings/

// (sym, rows, setError, corsServer, logFlags)
function Holdings (props) {
  const [err, setErr] = useState();
  const [arr, setArr] = useState();
  const [dat, setDat] = useState();

  const [latency, setLatency] = useState ();
  const [etfArr, setEtfArr] = useState([])
  const [etfArr_, setEtfArr_] = useState([''])  // for table header
  const [holdingsRawObj, setHoldingsArray] = useState({}) // Raw received data
  const [heldMasterObj, setHeldMasterObj] = useState({})
  const [warn, setWarn] = useState({})

  const [count, setCount] =useState(25)
  const [urlLast, setUrlLast] = useState();
  const urlCors = 'https://stockanalysis.com/etf/'+props.chartSymbol+'/holdings/';
  const url_holdings_schwab = 'https://www.schwab.wallst.com/schwab/Prospect/research/etfs/schwabETF/index.asp?type=holdings&symbol=' + props.chartSymbol ;
  const [ignoreSaved, setIgnoreSaved] = useState (false);
  const [logBackEnd, setLogBackEnd] = useState (false);
  const [saveInFile, setSaveInFile] = useState (false);
  const [ignoreMismatch, setIgnoreMismatch] = useState (false);

  const [percentRegex, setPercentRegex] = useState ();


  const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();

  const LOG = logBackEnd; // props.logFlags.includes('holdings')

  React.useEffect (() => {
    setErr();
    setArr();
    setDat();
  }, [props.chartSymbol])

  function clearPercentColumn () {
    for (let i = 0; i < props.rows.length; i++)
      props.rows[i].values.percent = '';
    // props.saveTable()
  }


  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.chartSymbol);
  if (row_index === -1) {

    setErr ('stock missing (Holdings): ' + props.chartSymbol)
    return;
  }

  function addSymOne (sym) {
    const sym_index = props.rows.findIndex((row)=> row.values.symbol === sym); 
    if (sym_index !== -1) 
      return; // skip if already in table

    addStock (props.rows, sym, false)
    
    // newStock.values.gain_date = fireGain._updateDate;
    // newStock.values.gain_mili = fireGain._updateMili;
    props.prepareRow(props.rows[props.rows.length - 1]);
  }

  function togglePercent () {
    var ind = props.allColumns.findIndex((column)=> column.Header === '%');
    if (ind === -1) {
      console.log ('column percent invalid')
      alert ('column percent invalid')
      return
    }
    props.allColumns[ind].toggleHidden();
  }

  function holdingsInsertInTable () {    
    if (holdingsRawObj[props.chartSymbol] === undefined) {
      props.errorAdd ([props.chartSymbol,' need to <fetch> '])
      console.log (props.chartSymbol + ' need to <fetch>')
      return;
    }

    clearPercentColumn();     
    
    const holdArr = holdingsRawObj[props.chartSymbol].holdArr;
    const len = holdArr.length < Number(count)+1 ? holdArr.length : Number(count)+1; // limit size.  (first is verification counters)

    for (let i = 1; i < len; i++) {
        const sym = holdArr[i].sym;
        // if (LOG)
        //   console.log(sym)
        const r_index = props.rows.findIndex((row)=> row.values.symbol === sym);
        if (r_index !== -1) { // alread in table: just add %
          props.rows[r_index].values.percent = holdArr[i].perc; // symm exist,so put in only percetage
        }
        else {
          // add a new sym
          addSymOne (sym)
          if (LOG)
            console.log ('added', sym)
          props.rows[props.rows.length - 1].values.percent = holdArr[i].perc
        }  
    } // end of add

    props.saveTable()
    window.location.reload(); 
  }

  function fetchHoldings (srcNum) {
    // if (props.rows[row_index].values.PE !== -2) {
    //   const er = 'Server connection fail';
    //   console.log (er)
    //   setErr (er)
    //   return;
    // }  
    const FAIL = 'Request failed with status code 404'

    var corsUrl;
    if (props.ssl)
      corsUrl = "https://";
    else
      corsUrl = "http://";

    if (srcNum === 0) {
      corsUrl += props.corsServer + ":" + props.PORT + "/holdings?stock=" + props.chartSymbol;
    }
    else if (srcNum === 1) {
      corsUrl += props.corsServer + ":" + props.PORT + "/holdingsSch?stock=" + props.chartSymbol;
    }
    if (logBackEnd)
      console.log (urlCors)


    corsUrl += '&count=' + count;

    if (ignoreSaved)
      corsUrl += '&ignoreSaved=true';
    if (logBackEnd)
      corsUrl += '&LOG=true';
    if (saveInFile)
      corsUrl += '&saveInFile=true';
    if (percentRegex)
      corsUrl += '&percentRegex=' + percentRegex;
    if (ignoreMismatch)
      corsUrl += '&ignoreMismatch=' + ignoreMismatch;

    else if (srcNum === 2) {
        corsUrl += props.corsServer + ":" + props.PORT + "/holdingsMarketwatch?stock=" + props.chartSymbol;
        // setUrlCors('https://finance.yahoo.com/quote/' + props.chartSymbol  
    }

    if (logBackEnd)
      console.log (corsUrl)

    setUrlLast(corsUrl)
    setLatency('holdings request sent to server')
    const mili = Date.now()

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
      setErr()
      if (result.status !== 200) {
        console.log (props.chartSymbol, 'status=', result)
        return;
      }
      if (LOG)
        console.log (props.chartSymbol, JSON.stringify(result.data))

      if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
        setErr(result.data)
        if (! ignoreMismatch)
          return;
      }

    // Check for err
      if (result.data.holdArr === 'Request failed with status code 404') {
        setErr(result.data.holdArr + ", May be not an ETF")
        // console.log (result.data)
        props.errorAdd ([props.chartSymbol,result.data.holdArr + ", May be not an ETF"])
        return;
      }
    
      const MIS_MATCH_MAX = ignoreMismatch ? 50 : 3
      const etf = result.data.sym;
      const holdArr = result.data.holdArr;
      if (Math.abs (holdArr[0].sym - holdArr[0].perc) < MIS_MATCH_MAX) {

        if (! etfArr.includes(etf)) {
          etfArr.push (etf)
          etfArr_.push (etf)
        }
        
        holdingsRawObj[props.chartSymbol] = result.data;

        const len = result.data.holdArr.length < Number(count)+1 ? result.data.holdArr.length : Number(count)+1; // limit size.  (first is verification counters)
        var cnt = 0;
        var percentSum = 0;
        for (let i = 1; i < len; i++) {
          cnt ++;
          const symm = result.data.holdArr[i].sym;
          if (heldMasterObj[symm] === undefined)
          heldMasterObj[symm] = {};
          // const obj = {etf: {symm: holdArr[i].perc}}
          heldMasterObj[symm][etf] =  holdArr[i].perc
          percentSum += Number(holdArr[i].perc);
        }

        // build a warningObj
        const warnObj = {sym: etf, cnt: cnt, update: result.data.updateDate, percentSum: percentSum.toFixed(2)};
        if (holdingsRawObj[etf].holdArr[0].sym !== holdingsRawObj[etf].holdArr[0].perc) {
          const c = holdingsRawObj[etf].holdArr[0].perc - holdingsRawObj[etf].holdArr[0].sym;
          const txt = 'Last percentage off by ' + c + ' row  '
            warnObj['warn'] = txt;
          }
        warn[etf] = warnObj
        if (LOG)
          console.log ('warn:', warn)

        // fill missing values with 0
        Object.keys(heldMasterObj).forEach((symm) => {
          etfArr.forEach((etf) => {
            if (heldMasterObj[symm][etf] === undefined)
              heldMasterObj[symm][etf] = 0
          })
        })
      }
      else {
        const warnObj = {sym: etf, update: result.data.updateDate};
        warnObj['warn'] = ' holding mismatch,   symCount=' + holdArr[0].sym + ' percentageCount=' + holdArr[0].perc; 
        warnObj['percentSum'] = 0; 
        warn[etf] = warnObj
      }

      // console.log (JSON.stringify(etfArr));
      if (LOG)
      console.log (heldMasterObj)
      if (LOG)
      console.log (Object.keys(holdingsRawObj))

      const latency = Date.now() - mili
      setLatency ('get holdings done,  Latency(msec)=' + latency)    
      setArr(result.data.holdArr)
      setDat(result.data)
         
    } )
    .catch ((err) => {
      setErr(err.message)
      // console.log(err.message)
    })
  }

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
  };

  // display list (of holdings)
  function renderList(array) {
    if (array.length < 1)
      return;
      return array.map((item) => <li key={item.sym}>{JSON.stringify(item)}</li>);  
  }

  const ROW_SPACING = {padding: '1px', margin: '1px'}

  return (
    <div style={{ border: '2px solid blue'}}> 

      {/* ====== Header titles */} 
      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div> &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> ETF Holdings &nbsp;  </h6>
        {eliHome && <div style={{color: 'blue'}}> {latency}</div>}
      </div>

      <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Get holdings of an ETF. (Allow to insert holdings into stock-table) </h6>

      {/* <div>&nbsp; </div> */}
      {/* <br></br> */}
      {/* ====== Buttons */} 
      {props.chartSymbol && <div>
        {/* <div>&nbsp; </div> */}
          <div stype={{display: 'flex'}}>
      
            {eliHome &&  <input type="checkbox" checked={ignoreSaved}  onChange={()=>setIgnoreSaved (!ignoreSaved)}  />}&nbsp;IgnoreSaved &nbsp; &nbsp;
            {eliHome &&  <input type="checkbox" checked={logBackEnd}  onChange={()=>setLogBackEnd (! logBackEnd)}  />}&nbsp;log &nbsp; &nbsp;
            {eliHome &&  <input type="checkbox" checked={saveInFile}  onChange={()=>setSaveInFile (! saveInFile)}  />  }&nbsp;SaveInFile &nbsp; &nbsp;
            {<input type="checkbox" checked={ignoreMismatch}  onChange={() => setIgnoreMismatch (! ignoreMismatch)}  />  }&nbsp;get-even-when-mismatch &nbsp; &nbsp; 

            <GetInt init={count} callBack={setCount} title='Count-Limit (50 max) &nbsp;' type='Number' pattern="[0-9]+" width = '15%'/> 
            <div style={{display: 'flex', marginTop: '10px'}}>
              {eliHome && <GetInt init={percentRegex} callBack={setPercentRegex} title='price regex  &nbsp;' type='text' pattern="[0-9_a-zA-Z\\.]+" width = '15%'/>}
              <button type="button" onClick={()=>togglePercent ()}>toggle % column  </button>  &nbsp; &nbsp;
            </div>
            <div>&nbsp; </div>
          </div>

          <div>  
            <button style={{background: 'aqua'}} type="button" onClick={()=>fetchHoldings (0)}>fetch50  </button> &nbsp; 
            {eliHome && <button onClick={() => openInNewTab(urlCors)}> holdings_tab_50 </button>} &nbsp;

            <button style={{background: 'aqua'}} type="button" onClick={()=>fetchHoldings (1)}>fetch20  </button> &nbsp;
            {eliHome && <button onClick={() => openInNewTab(url_holdings_schwab)}> holdings_tab_20 </button>} &nbsp;

            {/* <button type="button" onClick={()=>fetchHoldings (2)}>fetch10  </button> &nbsp; */}
            {holdingsRawObj[props.chartSymbol] && <button style={{background: 'Chartreuse'}} type="button" onClick={()=>holdingsInsertInTable ()}>insert-in-table &nbsp; {props.chartSymbol} holdings</button> } &nbsp;
          </div> 
          <div>&nbsp; </div>
        </div>
      }

      {/* ====== List of ETF */} 
      {err && <div style={{color:'red'}}> {err} </div>} 
      {Object.keys(warn).length > 0 && Object.keys(warn).map((w, w1)=>{
        return(
        <div key={w1} style={{display: 'flex'}}>
          {warn[w].sym} &nbsp;({warn[w].cnt}) &nbsp;&nbsp; {warn[w].update} &nbsp; total={warn[w].percentSum}%
          &nbsp; &nbsp; <div style={{color:'red'}}> {warn[w].warn} </div>
        </div>
        )
      })}
      
      {LOG && props.eliHome && <div> {urlLast} </div>}
      {LOG && props.eliHome && <div> {urlCors} </div>}


      {/* ====== Display filtered held list */} 
      {Object.keys(heldMasterObj).length > 0 && <div  style={{ maxHeight: '50vh', overflowY: 'scroll'}}>
      <table>
        <thead>
          <tr>
            <th>N</th>
            {etfArr_ && etfArr_.length > 1 && etfArr_.map((e, index) => {
              return (
                <th key={index} scope="col">
                  {e}
                </th>      
              )
            })}         
          </tr>   
        </thead>

        <tbody>             
          {Object.keys(heldMasterObj).map((s, s1) =>{
            return (
            <tr key={s1}>
              <td style={{padding: '2px', margin: '1px', width: '12px'}}>{s1}</td>
              <td style={{padding: '2px', margin: '1px', width: '8px'}}>{s}</td>
                {etfArr.map((k,n)=>{
                  return (
                    <td key={n} style={{padding: '2px', margin: '1px'}}>
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

      </div> }

      <div>&nbsp;</div>  
    </div>
    )

}

export {Holdings} 