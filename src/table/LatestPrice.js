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
import { el } from 'date-fns/locale';


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
    const [price, setPrice] = useState(0)
    const [changepct, setChangepct] = useState(0)

    const openInNewTab = (url) => {
        window.open(url, "_blank", "noreferrer");
      };


    function checkPriceColumnVisible () {
      var ind_price = props.allColumns.findIndex((column)=> column.Header === 'price');
      var ind_priceDivHigh = props.allColumns.findIndex((column)=> column.Header === 'price/high');
      const isInvisible_price = props.allColumns[ind_price].isVisible;
      const isInvisible_priceDivHigh = props.allColumns[ind_priceDivHigh].isVisible;

      // if on mobile, hide price and priceDivHigh columns  exit
      if (isInvisible_price || isInvisible_priceDivHigh) {
        return;
      }
      
      if (! isInvisible_price && ! isInvisible_priceDivHigh) {
        // props.allColumns[ind_price].toggleHidden();
        props.errorAdd([props.symbol, 'Column nonVisible. price or priceDivHigh. use column_select to make visible']) // show error if priceDivHigh is visible
      } 
    }

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
  
        url += props.servSelect + ":" + props.PORT + "/urlGetParse?stock=" + props.symbol + '&url=' + u + '&pattern=' + p
  
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
          props.rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(4);
          props.setPrice(price)
          setPrice(price)
          if (! props.stockChartYValues[0]) {
              props.setErr('price not found, Try again')
              return;
          }
          const ratio = price / props.stockChartYValues[0];
          setChangepct(((ratio -1) * 100).toFixed(3))
          const sign = ratio > 1 ? '+' : '' 
          const color = ratio > 1 ? '#82b74b': 'red' 
          console.log (props.symbol, getDate(), 'price=' + price, ' highest=' + highestPrice.toFixed(2), ' price/high=' + (price / highestPrice).toFixed(3), 'closePrice=' + props.stockChartYValues[0],
           'price/close=' + (price / props.stockChartYValues[0]).toFixed(4))
          const priceDivCloseObj = {symbol: props.symbol, price: price, sign: sign, ratio: ((price/props.stockChartYValues[0] -1) * 100).toFixed(3), color: color, seconds: result.data.secondsDiff.toFixed(0)};

          setPriceDivClose (priceDivCloseObj)
          if (false)
            checkPriceColumnVisible()
          props.refreshByToggleColumns()
          props.setErr()

        })
        .catch ((err) => {
            props.errorAdd([props.symbol, 'LatestPrice ', err.message])
            console.log(getDate(), 'msg', err, url)
        })  
    }


    // function extendedHoursPrice () {

    //     const u =  'https://www.barchart.com/etfs-funds/quotes/' + props.symbol + '/overview/'
    //     // p:  '"lastPriceExt":"538.15","priceChangeExt":',},
    //     const p =   '"lastPriceExt":"([0-9\\.]*)","priceChangeExt":'

    //     // console.log ('urlGetParse', serverUrl, pattern, LOG, callBack) 
    //     var url
    //     if (props.ssl) 
    //       url = "https://";
    //     else 
    //         url = "http://"; 
  
    //     url += props.servSelect + ":" + props.PORT + "/urlGetParse?stock=" + props.symbol + '&url=' + u + '&pattern=' + p
  
    //     if (log)
    //       url += '&LOG=true';
        
    //     if (ignoreSaved)
    //         url += '&ignoreSaved=true';

    //     if (log)
    //       console.log (u, p) // log the url
    //     props.setErr ()
    //     setLatency('request sent to server')
    //     const mili = Date.now()
    //     // setResults('waiting for response')
    //     axios.get (url)
    //     .then ((result) => {

    //         if (JSON.stringify(result.data).includes ('err Request failed')) {
    //             props.errorAdd([props.symbol, ' latestPrice', result.data])
    //             // props.setErr (result.data)
    //             return
    //         }
  
    //       const latency = Date.now() - mili
    //       setLatency('response latency(msec)=' + latency)
    //       if (log)
    //           console.log ('result=', result.data)
    //       if (result.data && result.data === 'read ETIMEDOUT'){ //} || result.data+''.includes('fail')) {
    //           props.setError([props.symbol + ' LatestPrice ' + result.data])
    //         //   setResults()
    //           return;
    //       }
  
    //       const dat = result.data
    //       if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
    //           console.log(props.symbol, getDate(), 'latestPrice', dat)
    //           props.setErr(props.symbol + ' ' +  getDate() + ' latestPrice ' + dat)
    //           return;
    //       }
    //     //   if (log)
    //     //       console.log (dat)
    //       // find highest price
    //       var highestPrice = -1; // highest price
    //       for (let i = 0; i < props.stockChartYValues.length; i++) {
    //           const val = props.stockChartYValues[i];
    //           if (val > highestPrice)
    //               highestPrice = val;
    //       } 

    //       const price = Number(result.data.result_1)

    //     //   console.log (getDate(), result.data)
    //       const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);

    //       props.rows[row_index].values.price = price.toFixed(2);
    //       props.rows[row_index].values.price_mili = Date.now();
    //       props.rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(4);
    //       props.setPrice(price)
    //       setPrice(price)
    //       if (! props.stockChartYValues[0]) {
    //           props.setErr('price not found, Try again')
    //           return;
    //       }
    //       const ratio = price / props.stockChartYValues[0];
    //       setChangepct(((ratio -1) * 100).toFixed(3))
    //       const sign = ratio > 1 ? '+' : '' 
    //       const color = ratio > 1 ? '#82b74b': 'red' 
    //       console.log (props.symbol, getDate(), 'price=' + price, ' highest=' + highestPrice.toFixed(2), ' price/high=' + (price / highestPrice).toFixed(3), 'closePrice=' + props.stockChartYValues[0],
    //        'price/close=' + (price / props.stockChartYValues[0]).toFixed(4))
    //       const priceDivCloseObj = {symbol: props.symbol, price: price, sign: sign, ratio: ((price/props.stockChartYValues[0] -1) * 100).toFixed(3), color: color, seconds: result.data.secondsDiff.toFixed(0)};

    //       setPriceDivClose (priceDivCloseObj)
    //       if (false)
    //         checkPriceColumnVisible()
    //       props.refreshByToggleColumns()
    //       props.setErr()

    //     })
    //     .catch ((err) => {
    //         props.errorAdd([props.symbol, 'LatestPrice ', err.message])
    //         console.log(getDate(), 'msg', err, url)
    //     })  
    // }


    // * use marketData
    function getPrice() {
      const TOKEN = process.env.REACT_APP_MARKETDATA;
      var url = 'https://api.marketdata.app/v1/stocks/quotes/' + props.symbol
      url += '/?token=' + TOKEN
      url += '&extended=true'
      axios.get (url)
      .then ((result) => {
        if (result.data.s !== 'ok') {
          console.log (props.symbol, 'option-fee error', result.data.s)
          return 'fail status =' + result.data.s 
        }
      
        const priceInfo = result.data
        console.log (result.data)
      
      const price_ = priceInfo.mid[0]; 
      setPrice(price_)
      const changepct_ = priceInfo.changepct[0]
      setChangepct((changepct_ * 100).toFixed(3))
      const ratio = changepct_;
      console.log (price_, changepct_)

      var highestPrice = -1; // highest price
      if (props.stockChartYValues.length > 0)
      for (let i = 0; i < props.stockChartYValues.length; i++) {
          const val = props.stockChartYValues[i];
          if (val > highestPrice)
              highestPrice = val;
      }
      else {
        console.log ('missing props.stockChartYValues')
      }

      const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);

      props.rows[row_index].values.price = price_.toFixed(2);
      props.rows[row_index].values.price_mili = Date.now();
      if (highestPrice !== -1)
        props.rows[row_index].values.priceDivHigh = (price_ / highestPrice).toFixed(4);
      props.setPrice(price_)


      // const ratio = price_ / props.stockChartYValues[0];
      const sign = changepct_ >= 0 ? '+' : '' 
      const color = changepct_ >= 0 ? '#82b74b': 'red' 
      console.log (props.symbol, getDate(), 'price=' + price_, ' highest=' + highestPrice.toFixed(2), ' price/high=' + (price_ / highestPrice).toFixed(3), 'closePrice=' + props.stockChartYValues[0],
        'price/close=' + ratio.toFixed(4))
      const priceDivCloseObj = {symbol: props.symbol, price: price_, sign: sign, ratio: changepct_  , color: color};
      console.log (priceDivCloseObj)
      setPriceDivClose (priceDivCloseObj)
      if (false)
        checkPriceColumnVisible()
      props.refreshByToggleColumns()
      props.setErr()
    })
    .catch ((err) => {
      console.log (err.message)
      return ('fail latest price of ' + props.symbol+ ' ' + err.message)
    })

  }



    return (
        <div style={{display: 'flex'}}>
                      
            <button  style={{background: 'aqua', height:'28px'}} type="button" title="price during market closed (not ready)" onClick={()=>getPrice()}>price </button> &nbsp;
            
            {/* {priceDivClose && <div style={{display: 'flex'}} >&nbsp;&nbsp;{priceDivClose.symbol}&nbsp; <div style={{color: priceDivClose.color}}> {priceDivClose.sign}{priceDivClose.ratio}% </div> &nbsp;({priceDivClose.price})</div>} */}
            {props.eliHome && <button  style={{background: 'aqua', height:'28px'}} type="button" title="price during market closed (not ready)" onClick={()=>extendedHoursPrice()}>preMarket </button>} &nbsp;
        
            {props.eliHome && <div style={{display: 'flex'}}><input  type="checkbox" checked={ignoreSaved}  onChange={() => setIgnoreSaved (! ignoreSaved)} />&nbsp;ignoreSaved</div>} &nbsp;

            {priceDivClose && <div style={{display: 'flex'}} >&nbsp;&nbsp;{priceDivClose.symbol}&nbsp; &nbsp;{price} &nbsp; <div style={{color: changepct >= 0 ? '#82b74b': 'red'}}> 
              {changepct>0 ? '+': ''}{changepct}% </div> </div>}

        </div>

    )

}

export {LatestPrice}