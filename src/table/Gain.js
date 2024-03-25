import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'



function GainWrite (sym, rows, setError, corsServer, PORT, ssl, logFlags) {

    const LOG = logFlags.includes('gain'); 
    if (LOG)
      console.log (sym, getDate(), 'gainWrite, req params ', rows.length)

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    if (row_index === -1) {
        alert ('stock missing: ' + sym)
        return;
    }
    const dat = rows[row_index].values;
    if ( dat.Industry)
        dat.Industry = dat.Industry.replace('&', '-') // & cause problem for write at corsServer
    var corsUrl;
    // if (corsServer === 'serv.dinagold.org')
    if (ssl)
      corsUrl = "https://";
    else 
        corsUrl = "http://"
 
    corsUrl += corsServer+ ":" + PORT + "/gain?cmd=w&stock=" + sym + '&dat=' + JSON.stringify(dat);
    

    if (LOG)
      console.log (sym, 'gainWrite', corsUrl)


    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
      if (result.status !== 200)
        return;
        if (LOG)
            console.log (sym, result.data)
    })
    .catch ((err) => {
      setError([sym, 'gainWrite', err.message, corsUrl])
      console.log(getDate(), 'gainWrite', err, corsUrl)
    })     
}

function GainFilter (rows, setError, corsServer, PORT, ssl, logFlags, period, factor) {

    const LOG = logFlags.includes('gain'); 
    if (LOG)
      console.log (getDate(), ' gainFilter req params ', rows.length)

      const row_index = rows.findIndex((row)=> row.values.symbol === 'QQQ');
      if (row_index === -1) {
          alert ('stock missing: QQQ')
          return;
      }

    var qqqValue;
    switch (period){
        case 1:
            qqqValue = rows[row_index].values.year;
            break;
        case 2:
            qqqValue = rows[row_index].values.year2;
            break;
        case 5:
            qqqValue = rows[row_index].values.year5;
            break;
        case 10:
            qqqValue = rows[row_index].values.year10;
            break;
        default: {
            setError(['gainFilter ', 'invalidPeriod'])
            console.log(getDate(), 'gainFilter ', 'invalidPeriod')       
        }                      
    }         


    var corsUrl;
    // if (corsServer === 'serv.dinagold.org')
    if (ssl)
    corsUrl = "https://";
    else 
        corsUrl = "http://"   
    corsUrl += corsServer+ ":" + PORT + '/gain?cmd=f&period=' + period + '&factor=' + factor + '&qqqValue=' + qqqValue; 
    

    if (LOG)
    console.log (getDate(), 'gainFilter', corsUrl)

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
        if (result.status !== 200)
            return;
        // if (LOG)
            console.log (result.data)


        return result.data;
    }).catch ((err) => {
        setError(['gainFilter ', err.message, corsUrl])
        console.log(getDate(), err, corsUrl)
    })
}
export  {GainWrite, GainFilter}
