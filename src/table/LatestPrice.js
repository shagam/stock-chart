import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import axios from 'axios'
import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import {todaySplit, todayDate, dateSplit,} from '../utils/Date'
import {getDate,} from '../utils/Date'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import { finnhub } from './Finnhub'


function LatestPrice (props) {
    const [LOG, setLOG] = useState(false)
    const {eliHome} = IpContext();
    const [subPages, setSubPages] = useState(false)  
    const priceSources = ['goog','fetchPage','nasdaq','yahoo','watch']
    const [source, setSource] = useState(priceSources[0])
    const [latency, setLatency] = useState()
    const [ignoreSaved, setIgnoreSaved] = useState(false)

    const log = props.logFlags.includes('gain')
    const [priceDivClose, setPriceDivClose] = useState()
  
    // if (req.query.src === 'goog'){
    //     url = 'https://www.google.com/finance/quote/' + req.query.stock + ':NASDAQ'
    //     pattern = 'data-currency-code="USD" data-last-price="([0-9.]+)'
    // }
    // else if (req.query.src === 'nasdaq') {
    //     url = 'https://www.nasdaq.com/market-activity/etf/' + req.query.stock
    //         // <bg-quote class="value" field="Last" format="0,0.00" channel="/zigman2/quotes/208575548/composite,/zigman2/quotes/208575548/lastsale" session="pre">513.26</bg-quote>
    //     pattern = '<bg-quote class="value" field="Last" format="0,0.00" channel="/zigman2/quotes/208575548/composite,/zigman2/quotes/208575548/lastsale" session="pre">([0-9.]+)</bg-quote>'
    // }
    // else if (req.query.src === 'yahoo') {
    //     url = 'https://finance.yahoo.com/quote/' + req.query.stock + '/'
    //     pattern = 'data-testid="qsp-pre-price">([0-9.]+)'
    // }
    // else if (req.query.src === 'watch') {
    //     url = 'https://www.marketwatch.com/investing/fund/' + req.query.stock 
    //     pattern = 'data-last-raw="([0-9.]+)">([0-9.]+)</bg-quote>'
    // }

    const openInNewTab = (url) => {
        window.open(url, "_blank", "noreferrer");
      };


    function extendedHoursPrice () {

        const u =  'https://www.barchart.com/etfs-funds/quotes/' + props.symbol + '/overview/'
        // p:  '"lastPriceExt":"538.15","priceChangeExt":',},
        const p =   '"lastPriceExt":"([0-9\\.]*)","priceChangeExt":'

        // console.log ('urlGetParse', serverUrl, pattern, LOG, callBack) 
        var url
        if (props.ssl) 
          url = "https://";
        else 
            url = "http://"; 
  
        url += props.corsServer + ":" + props.PORT + "/urlGetParse?stock=" + props.symbol + '&url=' + u + '&pattern=' + p
  
        if (log)
          url += '&LOG=true';
        
        if (ignoreSaved)
            url += '&ignoreSaved=true';

        if (log)
          console.log (u, p) // log the url
        props.setErr ()
        setLatency('request sent to server')
        const mili = Date.now()
        // setResults('waiting for response')
        axios.get (url)
        .then ((result) => {

            if (JSON.stringify(result.data).includes ('err Request failed')) {
                props.errorAdd([props.symbol, ' latestPrice', result.data])
                // props.setErr (result.data)
                return
            }
  
          const latency = Date.now() - mili
          setLatency('response latency(msec)=' + latency)
          if (log)
              console.log ('result=', result.data)
          if (result.data && result.data === 'read ETIMEDOUT'){ //} || result.data+''.includes('fail')) {
              props.setError([props.symbol + ' LatestPrice ' + result.data])
            //   setResults()
              return;
          }
  
          const dat = result.data
          if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
              console.log(props.symbol, getDate(), 'latestPrice', dat)
              props.setErr(props.symbol + ' ' +  getDate() + ' latestPrice ' + dat)
              return;
          }
        //   if (log)
        //       console.log (dat)
          // find highest price
          var highestPrice = -1; // highest price
          for (let i = 0; i < props.stockChartYValues.length; i++) {
              const val = props.stockChartYValues[i];
              if (val > highestPrice)
                  highestPrice = val;
          } 

          const price = Number(result.data.result_1)

        //   console.log (getDate(), result.data)
          const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);

          props.rows[row_index].values.price = price.toFixed(2);
          props.rows[row_index].values.price_mili = Date.now();
          props.rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(3);
          if (! props.stockChartYValues[0]) {
              props.setErr('close price not found')
              return;
          }
          const ratio = price / props.stockChartYValues[0];
          const sign = ratio > 1 ? '+' : '' 
          const color = ratio > 1 ? '#82b74b': 'red' 
          console.log ('price=' + price, ' highest=' + highestPrice.toFixed(2), ' price/high=' + (price / highestPrice).toFixed(3), 'closePrice=' + props.stockChartYValues[0],
           'price/close=' + (price / props.stockChartYValues[0]).toFixed(4), 'color:' + color)
          const priceDivCloseObj = {symbol: props.symbol, price: price, sign: sign, ratio: ((price/props.stockChartYValues[0] -1) * 100).toFixed(3), color: color, seconds: result.data.secondsDiff.toFixed(0)};

          setPriceDivClose (priceDivCloseObj)
          props.refreshByToggleColumns()
          props.setErr()

        })
        .catch ((err) => {
            props.errorAdd([props.symbol, 'LatestPrice ', err.message])
            console.log(getDate(), 'msg', err, url)
        })  
    }


//  'inline-block'
    return (
        <div style={{display: 'flex'}}>
            {props.symbol}&nbsp;
            {eliHome && props.symbol && <button onClick={() => openInNewTab('https://www.barchart.com/etfs-funds/quotes/' + props.symbol)}> barchart </button>} &nbsp;
            {eliHome && props.symbol && <button onClick={() => openInNewTab('https://www.marketwatch.com/investing/fund/' + props.symbol)}> marketWatch </button>} &nbsp;
            
            {props.symbol && <div><button style={{backgroundColor: 'aqua', height:'28px'}} onClick={() => {finnhub (props.symbol, props.stockChartYValues, props.rows, props.refreshByToggleColumns, props.setErr,
            props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect, setPriceDivClose, props.eliHome)}} title='price during market open' > marketOpen </button> </div>}

            {/* <ComboBoxSelect serv={source} nameList={priceSources} setSelect={setSource} title='' TITLE='market open price ' options={priceSources} defaultValue={false} /> &nbsp; */}
            {/* <div> <input  type="checkbox" checked={subPages}  onChange={()=> setSubPages(! subPages)} />  subPages </div> */}
            &nbsp;<button  style={{background: 'aqua', height:'28px'}} type="button" title="price during market closed (not ready)" onClick={()=>extendedHoursPrice()}>marketClosed </button> &nbsp;
            
            {props.eliHome && <div><input  type="checkbox" checked={ignoreSaved}  onChange={() => setIgnoreSaved (! ignoreSaved)} />&nbsp;ignoreSaved</div>} &nbsp;
            
            {priceDivClose && <div style={{display: 'flex'}} >&nbsp;&nbsp;{priceDivClose.symbol}&nbsp; <div style={{color: priceDivClose.color}}> {priceDivClose.sign}{priceDivClose.ratio}% </div> &nbsp;({priceDivClose.price})</div>}
        </div>

    )

}

export {LatestPrice}