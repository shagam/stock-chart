import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'
// import {addSymOne}  from './Firebase';
import {ErrorList, beep, beep2} from './ErrorList'

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
        dat.Industry = dat.Industry.replace(/&/g, '-') // & cause problem for write at corsServer
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

function GainFilter (rows, setError, corsServer, PORT, ssl, logFlags, period, factor, setResults, insert) {

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
        const symbols = Object.keys(result.data)
        // if (LOG)
        console.log (symbols)
        setResults(symbols)
        beep2();
        if (insert) { // inser in table
            Object.keys(result.data).forEach((sym) => {
                const row_index = rows.findIndex((row)=> row.values.symbol === sym);
                if (row_index === -1) {// not in table
                    const r = result.data[sym]
                    // const newStock = {values: r}
                    console.log (sym, 'isert')
                    // rows.values.push(r)
                }
                else
                    console.log (sym, 'alreadyInTable:')
            })
        }

    }).catch ((err) => {
        setError(['gainFilter ', err.message, corsUrl])
        console.log(getDate(), err, corsUrl)
    })
}

function GainFilterLocal (rows, setError, corsServer, PORT, ssl, logFlags, period, factor, setResults, insert) {

    const row_index = rows.findIndex((row)=> row.values.symbol === 'QQQ');
  
    var corsUrl;
    if (ssl)
    corsUrl = "https://";
    else 
        corsUrl = "http://"   
    corsUrl += corsServer+ ":" + PORT + '/gain?cmd=a'
    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
        if (result.status !== 200)
            return;



            
        const symbols = Object.keys(result.data)
        // if (LOG)
        console.log (symbols)
        setResults(symbols)
        beep2();
   
    }).catch ((err) => {
        setError(['gainFilterLocal ', err.message, corsUrl])
        console.log(getDate(), err, corsUrl)
    })   
}


export  {GainWrite, GainFilter, GainFilterLocal}
