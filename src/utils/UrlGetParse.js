import React, {useState, useEffect} from 'react'
import axios from 'axios'
// import cors from 'cors' 
// import {dateSplit, formatDate} from '../utils/Date'
// import {format} from "date-fns"
import {IpContext} from '../contexts/IpContext';
import {useAuth, logout} from '../contexts/AuthContext';

// import GetInt from '../utils/GetInt'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

import {servSelect, PORT, ssl} from '../utils/Server'


function urlGetParse (serverUrl, pattern, LOG, callBack) {

    // const urlPatternPair = {
    //   NDX:    {u: 'https://www.google.com/finance/quote/NDX:INDEXNASDAQ', p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'},
    //   IXIC:   {u: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ', p: '<div class="YMlKec fxKbKc">([0-9\\.,]~~)'},
    //   NQZ24:  {u: 'https://www.barchart.com/futures/quotes/' + futureSym, p: '"lastPrice":"([0-9\\.,]~~)'},
    //   // SPDR_put_call:    {u: 'https://www.alphaquery.com/stock/SPY/volatility-option-statistics/30-day/',
    //   //    p:'<a href="/stock/SPY/volatility-option-statistics/30-day/put-call-ratio-volume"><div class="indicator-figure-inner">1.2686</div></a>'},
    //   SPDR_put_call:    {u: 'https://www.alphaquery.com/stock/SPY/volatility-option-statistics/30-day/',
    //     p:'<a href="/stock/SPY/volatility-option-statistics/30-day/put-call-ratio-volume"><div class="indicator-figure-inner">([0-9\\.]~~)</div></a>'},

    //   put_call: {u: 'https://www.barchart.com/etfs-funds/quotes/SPY/put-call-ratios', p:''},
    //   put_call_fintel: {u:'https://fintel.io/sopt/us/spy', p:''}
    // }

    const pairNum = 1
    const ticker = Object.keys(urlPatternPair)[pairNum] // select pait of {url,pattern}

    var url
    if (ssl) 
      url = "https://";
    else 
        url = "http://"; 

    url += servSelect + ":" + PORT + "/urlGetParse?stock=" + futureSym + '&url=' + serverUrl + '&pattern=' + pattern

    if (saveInFile)
      url += '&saveInFile=true';
    if (logBackEnd)
      url += '&LOG=true';
   
    // if (ignoreSaved)
      url += '&ignoreSaved=true';

    if (LOG)
      console.log (url) // log the url

    setLatency('request sent to server')

    axios.get (url)
    .then ((result) => {

        if (result.data) {
            console.log (result.data)
        }

        if (result.data.err === "No data") {
            props.stockChartXValues([props.symbol, 'verify marketwatch', result.data.err])
            return;
        }

        if ((result.data !== '') && ! result.data.err) {
            callBack(result.data)
        }
    })
}

export {urlGetParse}