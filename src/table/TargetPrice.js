import React, {useState, useMemo, useEffect} from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import {collection, getDocs, addDoc,  doc, deleteDoc, updateDoc, query, where} from "firebase/firestore";
import {db} from '../firebaseConfig'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

const targetRef = collection(db, "targetPriceArray")

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

    // var userQuery = query (targetRef, where ('symbol', '==', symbol));
    // const fromFireBase = await getDocs (userQuery);


    
    
    // if (isNaN (tar)) {
    //     console.log (symbol, 'faile to calc tar', symTargetOne)
    //     return;  // do not add bad records
    // }


 // choose earliest, in case of more than one
    // var targetPriceArrayForSym = [];
    // var earliestIndx = -1;
    // var earliest = Date.now()
    // var target = -1;

    // // find earliest collection (if more than one)
    // var bigDifference = true;
    // if (fromFireBase.docs.length > 0) {
    //     for (let i = 0; i < fromFireBase.docs.length; i++) {
    //         targetPriceArrayForSym = JSON.parse(fromFireBase.docs[i].data().dat);
    //         if (targetPriceArrayForSym[0].dateMili < earliest) {
    //             earliest = targetPriceArrayForSym[0].dateMili;   // 0 is oldest
    //             earliestIndx = i
    //         }
    //     }
    //     targetPriceArrayForSym = JSON.parse(fromFireBase.docs[earliestIndx].data().dat); // indx of earliest

    //     // avoid too many
    //     if (targetPriceArrayForSym.length > 40)  {
    //         targetPriceArrayForSym.splice(Math.floor(targetPriceArrayForSym.length/4), 1) // remove oldest    
    //         targetPriceArrayForSym.splice(Math.floor(targetPriceArrayForSym.length/4*2), 1) // remove oldest    
    //         targetPriceArrayForSym.splice(Math.floor(targetPriceArrayForSym.length/4*3), 1) // remove oldest    
    //     }

    //     // delete all previous entries but the earliest
    //     if (fromFireBase.docs.length > 1) {
    //         const debug = 1;
    //     }else {
    //         const debug = 0
    //     }

        // allow new record only if none or significant dufferent
        // if (targetPriceArrayForSym.length > 0) {
        //     target =  targetPriceArrayForSym[targetPriceArrayForSym.length - 1].target; // compare new target with last entry of collection           
        //     const priceLast =  targetPriceArrayForSym[targetPriceArrayForSym.length - 1].price; 
        //     if (! bigDiff (targetRaw, target, 1.02) || bigDiff (price, priceLast, 1.04)) {
        //         bigDifference = false;
        //         if (LOG)
        //             console.log (symbol, 'targetPrice abort, small diff=', (targetRaw / target).toFixed(3),  'price=', price, 'targetRaw=', targetRaw, 'src=', src); // show the change of last target
        //     }
        // }
    // }
    // else
    //     if (LOG)
    //         console.log (symbol, 'targetPrice new')





        // const target =  targetPriceArrayForSym[targetPriceArrayForSym.length - 1].target; 
        // remove bad records
        // for (let i = 0; i < targetPriceArrayForSym.length; i++) {
        //     if (targetPriceArrayForSym[i].price === undefined) {
        //         console.log (symbol, 'bad record', targetPriceArrayForSym[i])
        //         targetPriceArrayForSym = targetPriceArrayForSym.splice(i,1); // remove bad 
        //     }
        // }
        
        // targetPriceArrayForSym.push (symTargetOne)
        // const arrayStringify = JSON.stringify(targetPriceArrayForSym);
        
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


async function  moveFromFirebase (logFlags, errorAdd, ssl, PORT, servSelect) {
    const LOG = logFlags.includes('target')
    const tagetHistory = await getDocs(targetRef);
    
    if (LOG)
        console.log ('count=', tagetHistory.docs.length)
    var tarHist = {}
    // IBM [{"target":152.06,"date":"2024-Jan-15  11:39"},{"target":138.69,"date":"2024-Jan-17  13:42"}]

    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        if (sym === 'AAPL') {
            const b = 1
        }
        const histArr = JSON.parse (tagetHistory.docs[i].data().dat)

        tarHist[sym] = histArr;

        if (LOG)
            console.log(getDate(), sym, 'moveAll')


        // send sym targetPrices to node express server

        var corsUrl = ''
        if (ssl)
            corsUrl = 'https://'
        else
            corsUrl = 'http://'
        corsUrl += servSelect + ":" + PORT + "/target?cmd=moveAll&stock=" + sym + "&dat=" + JSON.stringify(histArr)
        console.log (corsUrl)
        axios.get (corsUrl)

        .then ((result) => {
            if (result.status !== 200) {
                console.log (getDate(), 'status=', result)
                return;
            }

            const dat = result.data // JSON.parse(result.data);
            if (LOG)
                console.log (getDate(), sym, dat)

            if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
                errorAdd([getDate(), sym, 'target', result.data])
                return;
            }
            console.log(getDate(), sym, 'targetPrice arrived', sym, result.data, histArr)        
        } )
        .catch ((err) => {
            errorAdd([getDate(), sym, 'targetPrice move', err.message])
            console.log(getDate(), sym, 'targetPrice move', err.message)
        })
    }
} 


// get all target Price history for one symbol  // 
async function getTargetPriceArray (symbol, setTargetInfo, logFlags, errorAdd, ssl, PORT, servSelect) {
    const LOG = logFlags.includes('target') 

     // home server
     var corsUrl = ''
     if (ssl)
         corsUrl = 'https://'
     else
         corsUrl = 'http://'
     corsUrl += servSelect + ":" + PORT + "/target?cmd=readOne&" + "stock=" + symbol
     console.log (corsUrl)
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
        for (let j = 0; j < dat.length; j++)  {                 
            delete dat[j].dateMili;  // reduce unimportant info
        }

        if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
             errorAdd([symbol, getDate(), 'target',result.data])
             return;
         }
         console.log(getDate(), symbol, 'targetPrice arrived', result.data,)  
         setTargetInfo(dat)        
     } )
     .catch ((err) => {
         errorAdd([symbol, getDate(), 'target', err.message])
         console.log(getDate(), symbol, 'targetPrice', err.message)
     })
}


async function targetHistAll (setTargetPriceHist, logFlags, errorAdd, ssl, PORT, servSelect) {
    const LOG = true;//logFlags.includes('target')

    var corsUrl = ''
    if (ssl)
        corsUrl = 'https://'
    else
        corsUrl = 'http://'
    corsUrl += servSelect + ":" + PORT + "/target?cmd=readAll&" 
    console.log (corsUrl)
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

        setTargetPriceHist(dat);     
    } )
    .catch ((err) => {
        errorAdd([getDate(), 'target', err.message])
        console.log(getDate(), 'targetPrice', err.message)
    })

  }



export {targetPriceAdd, getTargetPriceArray, targetHistAll, moveFromFirebase}