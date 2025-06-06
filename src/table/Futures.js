import React, {useState, useEffect} from 'react'
import axios from 'axios'
// import cors from 'cors' 
// import {dateSplit, formatDate} from '../utils/Date'
// import {format} from "date-fns"
import {IpContext} from '../contexts/IpContext';
import {useAuth, logout} from '../contexts/AuthContext';

// import GetInt from '../utils/GetInt'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

function Futures (props) {
    const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
    const { currentUser, admin, logout } = useAuth();

    const [url, setUrl] = useState ();
    // const [url, setUrl] = useState ();
    const [err, setErr] = useState ();

    const [futuresArray, setFuturesArray] = useState ([]);
    const [futureArrLastVal, setVutureArrLastVal] = useState ();

    const [ignoreSaved, setIgnoreSaved] = useState ();
    const [logBackEnd, setLogBackEnd] = useState ();
    const [saveInFile, setSaveInFile] = useState ();
    const [latency, setLatency] = useState ();
  
    const [NQ, set_NQ] = useState();
    const [subPages, setSubPages] = useState(false);

    const LOG = logBackEnd; // props.logFlags.includes("futures");

    //** selevt future sym */
    const futuresSymList = 
    {
      // NQ: 'today',
      // MNQ: 'today',
      // '$NDX': 'today',
      // '$IXIC': 'today',


      // NQZ24: '20 Dec 2024',
      NQH25: '21_Mar 2025',
      // NQI25: "????",
      NQM25: '20 Jun 2025',
      NQU25: '19 Sep 2025',
      NQZ25: '19 Dec 2025',
      NQH26: '20 Mar 2026',
      '$IUXX': '',
      // NQW00: '????',
    }
    const symList = Object.keys(futuresSymList)
    
    

    const googFinance = {
      'INDEXNASDAQ: NDX': 'Nasdaq 100 biggest', // today
      'INDEXNASDAQ: .IXIC': 'Nasdaq All',
      // NQ: 'Future of nasdaq QQQ',
      'CME_EMINIS: NQW00': 'QQQ_future', // NQ=F
    }
    const googFinanceSymList = Object.keys(googFinance)


    var dateList = [];
    for (let i = 0; i < symList.length; i++)
      dateList.push(symList[i] + '_' + futuresSymList[symList[i]])
  
    const [futureSym, setFutureSym]  = useState(symList[0]);
    const [urlGetSym, setUrlGetSym]  = useState(googFinanceSymList[0]);


    useEffect (() => {
        setLatency()
        setFuturesArray([])
      }, [futureSym])

      

    //** Get nasdaq futures contract */
    // https://www.barchart.com/futures/quotes/
    function nasdaqFutures() {
      var url
      if (props.ssl) 
        url = "https://";
      else 
      url = "http://"; 
      url += props.servSelect + ":" + props.PORT + "/futures?stock=" + futureSym
      if (saveInFile)
        url += '&saveInFile=true';
      if (logBackEnd)
        url += '&LOG=true';
  
        //corsUrl = "http://localhost:5000/price?stock=" + sym
        // console.log (getDate(), corsUrl)     
        if (ignoreSaved)
          url += '&ignoreSaved=true';
  
        if (LOG)
          console.log (url) // log the url

        const mili = Date.now()
        if(LOG)  
          setUrl('https://www.barchart.com/futures/quotes/' + futureSym)  // save url for debug
        setLatency('request sent to server')

        axios.get (url)
        .then ((result) => {
          setErr()
          if (result.data && LOG) {
            console.log (result.data)
          }
          const ver = {}
          if (result.data.err === "No data") {
            props.stockChartXValues([props.symbol, 'verify marketwatch', result.data.err])
            return; 
          }
  
          const latency = Date.now() - mili
          setLatency('futures done, latency(msec)=' + latency)

          if ((result.data !== '') && ! result.data.err) {
  
            // result.data['a'] = 'b'
            const keys = Object.keys(result.data)
            const arr = []

            for (let i = 0; i < keys.length; i++) {
              // arr.push({date:result.data[keys[keys.length - 1 - i]], val:})
              // arr.push({date: keys[i], value: result.data[keys[i]] })
              arr.push({date: keys[keys.length - 1 - i], value: result.data[keys[keys.length -1 - i]] })
            }
            setFuturesArray (arr)
            setVutureArrLastVal(arr[arr.length-1].value.replace(/,/,''))
            if (LOG)
              console.log (arr)
           }
        })
    }

    //** test function */
    function urlGetParse () {

      const urlPatternPair = {
        NDX:    {u: 'https://www.google.com/finance/quote/NDX:INDEXNASDAQ', p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'},
        IXIC:   {u: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ', p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'},
        NQZ24:  {u: 'https://www.barchart.com/futures/quotes/' + futureSym, p: '"lastPrice":"([0-9\\.,]~~)'},
        // SPDR_put_call:    {u: 'https://www.alphaquery.com/stock/SPY/volatility-option-statistics/30-day/',
        //    p:'<a href="/stock/SPY/volatility-option-statistics/30-day/put-call-ratio-volume"><div class="indicator-figure-inner">1.2686</div></a>'},
        SPDR_put_call:    {u: 'https://www.alphaquery.com/stock/SPY/volatility-option-statistics/30-day/',
          p:'<a href="/stock/SPY/volatility-option-statistics/30-day/put-call-ratio-volume"><div class="indicator-figure-inner">([0-9\\.]~~)</div></a>'},

        put_call: {u: 'https://www.barchart.com/etfs-funds/quotes/SPY/put-call-ratios', p:''},
        put_call_fintel: {u:'https://fintel.io/sopt/us/spy', p:''}
      }

      const pairNum = 1
      const ticker = Object.keys(urlPatternPair)[pairNum] // select pait of {url,pattern}

      var serverUrl  = urlPatternPair[ticker].u
      var pattern = urlPatternPair[ticker].p

      var url
      if (props.ssl) 
        url = "https://";
      else 
      url = "http://"; 

      url += props.servSelect + ":" + props.PORT + "/urlGetParse?stock=" + futureSym + '&url=' + serverUrl + '&pattern=' + pattern

      if (saveInFile)
        url += '&saveInFile=true';
      if (logBackEnd)
        url += '&LOG=true';
     
      if (ignoreSaved)
        url += '&ignoreSaved=true';

      if (subPages)
        url += '&subPages=true';

      if (LOG)
        console.log (url) // log the url

      const mili = Date.now()
      if(LOG)  
        setUrl(url)  // save url for debug

      setLatency('request sent to server')

      axios.get (url)
      .then ((result) => {
        setErr()
        if (result.data) {
          console.log (result.data)
        }
        const ver = {}
        if (result.data.err === "No data") {
          props.stockChartXValues([props.symbol, 'verify marketwatch', result.data.err])
          return;
        }

        const latency = Date.now() - mili
        setLatency('futures done, latency(msec)=' + latency)

        if ((result.data !== '') && ! result.data.err) {

          // result.data['a'] = 'b'
          // setFuturesText(result.data)
          set_NQ(result.data)  

          }
      })
    }


    const ROW_SPACING = {padding: "5px 5px 2px 8px", margin: '0px'}
    //** top, right, bottom, left*/

    return (
        <div style = {{ border: '2px solid green'}}>
          
            {/* <hr/>  */}

            <h6 style={{color: 'blue'}}> Futures contract &nbsp;  </h6>
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Future contracts (Get last price of Nasdaq futures ) &nbsp; </h6>
            {LOG && <div>{url}</div>}
            {err && <div style={{color: 'red'}}> {err} </div>}
            {eliHome && latency && <div style={{color: 'green'}}> {latency} </div>}

            <div style={{display:'flex'}}>
                {eliHome && <div>  &nbsp; <input  type="checkbox" checked={ignoreSaved}  onChange={()=> setIgnoreSaved(! ignoreSaved)}  />  &nbsp;IgnoreSaved  &nbsp; </div>}
                {eliHome &&  <div> <input type="checkbox" checked={logBackEnd}  onChange={()=> setLogBackEnd( !logBackEnd)}  />  &nbsp;LogBackend &nbsp; &nbsp; </div>}
                {eliHome &&  <input type="checkbox" checked={saveInFile}  onChange={()=>setSaveInFile (! saveInFile)}  />  }&nbsp;SaveInFile &nbsp; &nbsp;
            </div>


            {/* <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>  &nbsp; Get last price of Nasdaq futures  &nbsp; </h6> */}
            {<div style={{display:'flex'}}> <ComboBoxSelect serv={futureSym} nameList={dateList} setSelect={setFutureSym} 
              title='future-contract' options={Object.keys(futuresSymList) } defaultValue={futureSym}/> </div>}   {/* Select futureSymbol */}
            <button style={{background: 'aqua'}} type="button" onClick={()=> nasdaqFutures()}>Nasdaq-future-cotract-get  </button>  &nbsp;
            {/* <div>{futureSym}  &nbsp;  &nbsp;  {futuresSymList[futureSym]} </div> */}

            {/* {futuresTxt && <div style={{height:'200px', overflow:'scroll'}}>  <pre>{JSON.stringify(futuresArray, null, 2)}</pre> </div>} */}
            {/* {futuresArray.length > 0 && <div style={{height:'200px', overflow:'scroll'}}>  <pre>{JSON.stringify(futuresArray, null, 2)}</pre> </div>} */}
            {futuresArray.length > 0 && <div>count={futuresArray.length} </div>}
      
            {futuresArray.length > 0 &&  <div style={{width: '300px', maxheight: '30vh', 'overflowY': 'scroll'}}>
              <table>
                <thead>
                    <tr>
                      <th>N</th>
                        {Object.keys(futuresArray[0]).map((h,h1) => {
                            return (
                              <th key={h1}>{h}</th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>  
                    {futuresArray.map((s, s1) =>{
                        return (
                          <tr key={s1}>
                              <td  style={{padding: '2px', margin: '2px'}}>{s1}</td>

                              {Object.keys(futuresArray[s1]).map((a,a1) => {
                                  return ( 
                                      <td  style={{padding: '2px', margin: '2px'}} key={a1} >{futuresArray[s1][a]}</td>
                                  )
                                  })
                              }
                        
                          </tr>
                        )
                    })}
                </tbody>
            </table>
          </div>}

            {NQ && futuresArray.length > 0 &&<div>expectedGain={(futureArrLastVal / NQ.replace(/,/,'')).toFixed(3)}  </div>}

            <hr/> 
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Get today NDX nasdaq 100  &nbsp; </h6>
            {<div style={{display:'flex'}}> <ComboBoxSelect serv={urlGetSym} nameList={googFinanceSymList} setSelect={setUrlGetSym} 
              title='urlGetSym' options={googFinanceSymList} defaultValue={urlGetSym}/> </div>}   {/* Select urlGetSym */}
            { <div><button style={{background: 'aqua'}} type="button" onClick={()=> urlGetParse()}>urlGetParse  </button>  &nbsp;</div>}
            {eliHome &&  <div><input type="checkbox" checked={subPages}  onChange={()=>setSubPages (! subPages)}  />  &nbsp;SubPages &nbsp; &nbsp;</div>}
            {urlGetSym && <div>{urlGetSym}</div>}
            {NQ && <div>{NQ}</div>}
            <div>&nbsp;</div>
        </div>
    )
}

export {Futures}