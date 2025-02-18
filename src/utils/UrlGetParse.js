import React, {useState, useEffect} from 'react'
import axios from 'axios'
// import cors from 'cors' 
// import {dateSplit, formatDate} from '../utils/Date'
// import {format} from "date-fns"
import {IpContext} from '../contexts/IpContext';
import {useAuth, logout} from '../contexts/AuthContext';

// import GetInt from '../utils/GetInt'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import {getDate} from '../utils/Date' 

function UrlGetParse (props) {
  const { eliHome, } = IpContext();
  const urlPatternPair = {

    nasdaq: {
      u: 'https://www.nasdaq.com/market-activity/index/' + props.symbol,
      //https://www.nasdaq.com/market-activity/etf/qqq/after-hours 
         // p: '<p class="watchlist__slide-price">$515.56</p>'},
      p: '<p class="watchlist__slide-price">$([0-9]\\.]~~)</p>'},

    NDX:    { // ok
      u: 'https://www.google.com/finance/quote/NDX:INDEXNASDAQ',
      // 
      p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'},
    
    IXIC:   { // ok
      u: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ',
      // 
      p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'
    },
    
    SPDR_put_call: {
      u: 'https://www.alphaquery.com/stock/' + props.symbol + '/volatility-option-statistics/30-day/',
      // p: 'span id="quote-price-container".([0-9\\.]*)..span'
      p:'div class="indicator-figure-inner">([0-9\\.]~~)'
    },

    goog: {
      u: 'https://www.google.com/search?q=' + props.symbol, 
      // <span jsname="wurNO">538.11</span>
      p:  'span jsname="wurNO".([0-9\\.]*)..span',
    },

    yahoo:{
      u: 'https://finance.yahoo.com/quote/' + props.symbol,
      // data-testid="qsp-post-price">538.13
      // p:  'data-testid="qsp-post-price".([0-9\\.]*)
      // p: 'data-testid="qsp-pre-price-change-percent"\\>~~\\(([0-9\\.]*)\\) \\</span'
      p: '(538.1[0-9]~~)'
     },

    barChart:{ //* barChart ok
      u:  'https://www.barchart.com/etfs-funds/quotes/' + props.symbol + '/overview/',
      // p:  '"lastPriceExt":"538.15","priceChangeExt":',},
      p:  '"lastPriceExt":"([0-9\\.]*)","priceChangeExt":',
      // p:  '"lastPriceExt":"([0-9\\.]~~)"',
    },
          
  

  }
  const keys = Object.keys(urlPatternPair) // select pait of {url,pattern}

  const [urlName, setUrlName]  = useState(keys[0]);
  const [log, setLog] = useState(false)
  const [subPages, setSubPages] = useState(false);

  const pairNum = 0
  const ticker = Object.keys(urlPatternPair)[pairNum] // select pait of {url,pattern}
  const [latency, setLatency] = useState()
  const [results, setResults] = useState()
  const [error, setError] = useState()

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
      setError ()
      setLatency('request sent to server')
      const mili = Date.now()
      setResults('waiting for response')
      axios.get (url)
      .then ((result) => {

        const latency = Date.now() - mili
        setLatency('response latency(msec)=' + latency)

        console.log (result.data)
        if (result.data && result.data === 'read ETIMEDOUT'){ //} || result.data+''.includes('fail')) {
            setError([props.symbol + '    ' + result.data])
            setResults()
            return;
        }
        if (result.data) {
            console.log (result.data)
            setResults(result.data) 
        }

        if ((result.data !== '') && ! result.data.err) {
            // callBack(result.data)
        }
      })
      .catch ((err) => {
      // setError([sym, 'email', err.message, corsUrl])
        console.log(getDate(), 'msg', err, url)
      })  
  }

  return (
    <div style = {{ border: '2px solid green'}}>
      <div style={{display:'flex'}}>
        <h6 style={{color: 'blue'}}> UrlGetParse &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; url get and parse &nbsp; </h6>
        <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
      </div>

          {eliHome && latency && <div style={{color: 'green'}}> {latency} </div>}
        {error && <div style={{color: 'red'}} >{error}</div>}
        
        
        <div style={{display:'flex'}}> 

          <ComboBoxSelect serv={urlName} nameList={keys} setSelect={setUrlName} 
          title='urlName' options={keys} defaultValue={urlName}/>  &nbsp; &nbsp; {/* Select urlName */}

          <input type="checkbox" checked={log}  onChange={()=> setLog( !log)}  />  &nbsp;Log &nbsp; &nbsp;

          <input type="checkbox" checked={subPages}  onChange={()=>setSubPages (! subPages)}  />  &nbsp;SubPages &nbsp; &nbsp;
        </div> 
        <div>&nbsp;</div>
        <button style={{background: 'aqua'}} type="button" onClick={()=> urlGetParse()}>urlGetParse  </button>  &nbsp;
        <div>&nbsp;</div>
        {results && <div>results={results}</div>}
        <div>&nbsp;</div>
    </div>
  )
}

export {UrlGetParse}