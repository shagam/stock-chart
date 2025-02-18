import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import axios from 'axios'
import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import {todaySplit, todayDate, dateSplit,} from '../utils/Date'
import {getDate,} from '../utils/Date'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'



function LatestPrice (props) {
    const [LOG, setLOG] = useState(false)
    const {eliHome} = IpContext();
    const [subPages, setSubPages] = useState(false)  
    const priceSources = ['goog','fetchPage','nasdaq','yahoo','watch']
    const [source, setSource] = useState(priceSources[0])
    const [latency, setLatency] = useState()

    const log = props.logFlags.includes('gain')

    // useEffect (() => { 
    //     props.setPriceDivClose()
    // }, [symbol]) 
  

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
        
  
        if (log)
          console.log (url) // log the url
        props.setErr ()
        setLatency('request sent to server')
        const mili = Date.now()
        // setResults('waiting for response')
        axios.get (url)
        .then ((result) => {
  
          const latency = Date.now() - mili
          setLatency('response latency(msec)=' + latency)
          if (log)
              console.log ('result=', result.data)
          if (result.data && result.data === 'read ETIMEDOUT'){ //} || result.data+''.includes('fail')) {
              props.setError([props.symbol + '    ' + result.data])
            //   setResults()
              return;
          }
  
          const dat = result.data
          if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
              console.log(props.symbol, getDate(), 'latestPrice', dat)
              props.setErr(props.symbol + ' ' +  getDate() + ' latestPrice ' + dat)
              return;
          }
          if (log)
              console.log (dat)
          // find highest price
          var highestPrice = -1; // highest price
          for (let i = 0; i < props.stockChartYValues.length; i++) {
              const val = props.stockChartYValues[i];
              if (val > highestPrice)
                  highestPrice = val;
          }

          const price = Number(result.data)
          console.log ('price=' + price, ' highest=' + highestPrice.toFixed(2), ' price/high=' + (price / highestPrice).toFixed(3), 'closePrice=' + props.stockChartYValues[0], 'price/close=' + (price / props.stockChartYValues[0]).toFixed(4))

          const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);

          props.rows[row_index].values.price = price.toFixed(2);
          props.rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(3);
          const ratio = price / props.stockChartYValues[0];
          const sign = ratio > 1 ? '+' : '' 
          props.setPriceDivClose (props.symbol + '  ' + sign + ((ratio-1) * 100).toFixed(3) + '%')
          props.refreshByToggleColumns()

        })
        .catch ((err) => {
            props.errorAdd([props.symbol, 'email', err.message, url])
            console.log(getDate(), 'msg', err, url)
        })  
    }



//  'inline-block'
    return (
        <div style={{display: 'flex'}}>
            {/* <ComboBoxSelect serv={source} nameList={priceSources} setSelect={setSource} title='' TITLE='market open price ' options={priceSources} defaultValue={false} /> &nbsp; */}
            {/* <div> <input  type="checkbox" checked={subPages}  onChange={()=> setSubPages(! subPages)} />  subPages </div> */}
            &nbsp;<button  style={{background: 'aqua'}} type="button" title="price during market closed (not ready)" onClick={()=>extendedHoursPrice()}>marketClosed </button>
        </div>

    )

}

export {LatestPrice}