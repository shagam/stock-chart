import React, {useState, useMemo, useEffect} from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
// import {collection, getDocs, addDoc,  doc, deleteDoc, updateDoc, query, where} from "firebase/firestore";
// import {db} from '../firebaseConfig'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

// const targetRef = collection(db, "targetPriceArray")

// save locally last targetPrice for each sym
var lastTargetPrice = {}

async  function targetPriceAdd (symbol, targetRaw, price, logFlags, errorAdd, src, ssl, PORT, servSelect) {
    const LOG = logFlags.includes('target') 
    if (price === 0 || targetRaw === undefined) {
        if (LOG)
            console.log (symbol, getDate(), 'targetPrice abort price=', price,  'targetRaw=', targetRaw, ' src=', src)
        return; // do not add tar record
    }
     
    // save target prices for symbol in array
    const tar = targetRaw / price; 
    const symTargetOne =  {date: getDate(), dateMili: Date.now(), target: targetRaw, price: price, tar: tar.toFixed(3)};

    if (lastTargetPrice[symbol]) {
        const p = lastTargetPrice[symbol].target / targetRaw;
        if ( p  <  1.1 && p > 0.9) {// small diff
            console.log ( symbol, getDate(), 'target price small diff', p)
            return;
        }
    }
    
    // save locally last targetPrice for each sym
    lastTargetPrice[symbol] = symTargetOne;

         
    // home server
    var corsUrl = ''
    if (ssl)
        corsUrl = 'https://'
    else
        corsUrl = 'http://'
    corsUrl += servSelect + ":" + PORT + "/target?cmd=writeOne&" + "stock=" + symbol + "&dat=" + JSON.stringify(symTargetOne)
    
    axios.get (corsUrl)
    // getDate()
    .then ((result) => {

        if (result.status !== 200) {
            console.log (symbol, getDate(), 'status=', result)
            return;
        }
        if (LOG)
            console.log (JSON.stringify(result.data))

        if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
            errorAdd([symbol, getDate(), 'target',result.data])
            return;
        }
        console.log(getDate(), symbol, 'targetPrice arrived', result.data, 'from:', src, symTargetOne)          
    } )
    .catch ((err) => {
        errorAdd([symbol, getDate(), 'target', err.message])
        console.log(getDate(), symbol, 'targetPrice', err.message)
    })
}

// get all target Price history for one symbol  // 
async function targetHistoryOne (symbol, setTargetInfoOne, setTargetHistAll, logFlags, errorAdd, ssl, PORT, servSelect, setStatus) {
    const LOG = logFlags.includes('target') 

     // home server
     var corsUrl = ''
     if (ssl)
         corsUrl = 'https://'
     else
         corsUrl = 'http://'
     corsUrl += servSelect + ":" + PORT + "/target?cmd=readOne&" + "stock=" + symbol
     console.log (corsUrl)
     setStatus('request sent')

     axios.get (corsUrl)
     // getDate()
     .then ((result) => {

         if (result.status !== 200) {
             console.log (symbol, getDate(), 'status=', result)
             return;
         }

         const dat = result.data // JSON.parse(result.data);
         if (LOG)
             console.log (symbol, getDate(), dat)

        // remove milisec
        // for (let j = 0; j < dat.length; j++)  {                 
        //     delete dat[j].dateMili;  // reduce unimportant info
        // }

        if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
             errorAdd([symbol, getDate(), 'target',result.data])
             return;
         }
         console.log(getDate(), symbol, 'targetPrice arrived', result.data,)  
         setStatus() // clear msg sent
         setTargetInfoOne(dat) 
         setTargetHistAll();       
     } )
     .catch ((err) => {
         errorAdd([symbol, getDate(), 'target', err.message])
         console.log(getDate(), symbol, 'targetPrice', err.message)
     })
}


async function targetHistAll (setTargetPriceHist, setTargetInfoOne, logFlags, errorAdd, ssl, PORT, servSelect, setStatus) {
    const LOG = true;//logFlags.includes('target')

    var corsUrl = ''
    if (ssl)
        corsUrl = 'https://'
    else
        corsUrl = 'http://'
    corsUrl += servSelect + ":" + PORT + "/target?cmd=readAll&" 
    console.log (corsUrl)
    setStatus('request sent')

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {

        if (result.status !== 200) {
            console.log (getDate(), 'status=', result)
            return;
        }

        const dat = result.data // JSON.parse(result.data);


        if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
            errorAdd([getDate(), 'targetAll', result.data])
            return;
        }
        if (LOG)
        console.log(getDate(),  'targetAll arrived', result.data,)  

        //delete dateMili non essential info
        const stocks = Object.keys(dat);
        for (let i = 0 ; i < stocks.length; i++) {
            for (let j = 0; j < dat[stocks[i]].length; j++)  {                 
                delete dat[stocks[i]][j].dateMili;  // reduce unimportant info
            }
        }
        setStatus()
        setTargetPriceHist(dat); 
        setTargetInfoOne()    
    } )
    .catch ((err) => {
        errorAdd([getDate(), 'target', err.message])
        console.log(getDate(), 'targetPrice', err.message)
    })

  }



export {targetPriceAdd, targetHistoryOne, targetHistAll, }