import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'



function GainWrite (sym, rows, setError, corsServer, PORT, ssl, logFlags) {

    const LOG = logFlags.includes('gain'); 
    if (LOG)
      console.log (sym, getDate(), 'req params ', rows.length)

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    if (row_index === -1) {
        alert ('stock missing: ' + sym)
        return;
    }
    const dat = rows[row_index].values;

    var corsUrl;
    // if (corsServer === 'serv.dinagold.org')
    if (ssl)
      corsUrl = "https://";
    else 
        corsUrl = "http://"   
    corsUrl += corsServer+ ":" + PORT + "/gain?stock=" + sym + '&cmd=w&dat=' + JSON.stringify(dat);
    

    // if (LOG)
      console.log (sym, corsUrl)
    // corsUrl = "https://dinagold.org:5000/gain?stock=" + sym + '?cmd=w dat' + dat ;


    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
      if (result.status !== 200)
        return;
      console.log (sym, result.data)
     
    })
    .catch ((err) => {
      setError([sym, err.message, corsUrl])
      console.log(err, corsUrl)
    }) 
      
}

export  {GainWrite}
