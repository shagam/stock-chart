import React, {useState, useEffect} from 'react'
import axios from 'axios'
// import cors from 'cors' 
// import {dateSplit, formatDate} from '../utils/Date'
// import {format} from "date-fns"
import {IpContext} from '../contexts/IpContext';
import {useAuth, logout} from '../contexts/AuthContext';

// import GetInt from '../utils/GetInt'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'


function UrlGetParse (props) {
  const { eliHome, } = IpContext();
  const urlPatternPair = {
    nasdaq: {u: 'https://www.nasdaq.com/market-activity/etf/' + props.symbol + '/after-hours',
        // p: '<p class="watchlist__slide-price">$515.56</p>'},
        p: '<p class="watchlist__slide-price">$([0-9]\\.]*)</p>'},

    NDX:    {u: 'https://www.google.com/finance/quote/NDX:INDEXNASDAQ', p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'},
    IXIC:   {u: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ', p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'},

    SPDR_put_call:    {u: 'https://www.alphaquery.com/stock/SPY/volatility-option-statistics/30-day/',
      p:'<a href="/stock/SPY/volatility-option-statistics/30-day/put-call-ratio-volume"><div class="indicator-figure-inner">([0-9\\.]~~)</div></a>'},

  }
  const keys = Object.keys(urlPatternPair) // select pait of {url,pattern}

  const [urlName, setUrlName]  = useState(keys[0]);
  const [log, setLog] = useState(false)
  const [subPages, setSubPages] = useState(false);

  const pairNum = 0
  const ticker = Object.keys(urlPatternPair)[pairNum] // select pait of {url,pattern}
  const [latency, setLatency] = useState()
  const [results, setResults] = useState()

  function urlGetParse () {
      // console.log ('urlGetParse', serverUrl, pattern, LOG, callBack) 
      var url
      if (props.ssl) 
        url = "https://";
      else 
          url = "http://"; 

      url += props.corsServer + ":" + props.PORT + "/urlGetParse?stock=" + props.symbol + '&url=' + urlPatternPair[urlName].u + '&pattern=' + urlPatternPair[urlName].p

      if (log)
        url += '&LOG=true';
      
      if (subPages)
        url += '&subPages=true';

      if (log)
        console.log (url) // log the url

      setLatency('request sent to server')
      const mili = Date.now()

      axios.get (url)
      .then ((result) => {

        const latency = Date.now() - mili
        setLatency('response latency(msec)=' + latency)

          if (result.data) {
              console.log (result.data)
              setResults(result.data) 
          }

          if (result.data.err === "No data") {
              props.stockChartXValues([props.symbol, 'verify marketwatch', result.data.err])
              return;
          }

          if ((result.data !== '') && ! result.data.err) {
              // callBack(result.data)
          }
      })
  }

  return (
    <div style = {{ border: '2px solid green'}}>
        <h6 style={{color: 'blue'}}> UrlGetParse &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; url get and parse &nbsp; </h6>
          {eliHome && latency && <div style={{color: 'green'}}> {latency} </div>}
        
        <div style={{display:'flex'}}> 

          <ComboBoxSelect serv={urlName} nameList={keys} setSelect={setUrlName} 
          title='urlName' options={keys} defaultValue={urlName}/>  &nbsp; &nbsp; {/* Select urlName */}

          <input type="checkbox" checked={log}  onChange={()=> setLog( !log)}  />  &nbsp;Log &nbsp; &nbsp;

          <input type="checkbox" checked={subPages}  onChange={()=>setSubPages (! subPages)}  />  &nbsp;SubPages &nbsp; &nbsp;
        </div> 
        <div>&nbsp;</div>
        <button style={{background: 'aqua'}} type="button" onClick={()=> urlGetParse()}>urlGetParse  </button>  &nbsp;
        <div>&nbsp;</div>
        {results && <div>{results}</div>}
        <div>&nbsp;</div>
    </div>
  )
}

export {UrlGetParse}