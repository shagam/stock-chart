import React, {useState, useMemo, useEffect} from 'react'
import {collection, getDocs, addDoc,  doc, deleteDoc, updateDoc, query, where} from "firebase/firestore";
import {db} from '../firebaseConfig'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'


const targetRef = collection(db, "targetPriceArray")

const TARGET_CHANGE_THRESHOLD = 1.05
function bigDiff (tar0, tar1, threshold) {
    if (tar1 / tar0 > threshold|| tar0 / tar1 > threshold)
        return true;
    return false
}

async  function targetPriceAdd (symbol, targetRaw, price, logFlags) {

    const LOG = logFlags.includes('target') || true
    var userQuery = query (targetRef, where ('symbol', '==', symbol));
    const fromFireBase = await getDocs (userQuery);
     
    // save target prices for symbol in array
    const tar = price !== 0 ? targetRaw / price : -1; 
    const symTargetOne =  {date: getDate(), dateMili: Date.now(), target: targetRaw, price: price, tar: tar.toFixed(3)};

 // choose earliest, in case of more than one
    var targetPriceArrayForSym = [];
    var earliestIndx = -1;
    var earliest = Date.now()
    var target = -1;

    // find earliest collection (if more than one)
    var bigDifference = true;
    if (fromFireBase.docs.length > 0) {
        for (let i = 0; i < fromFireBase.docs.length; i++) {
            targetPriceArrayForSym = JSON.parse(fromFireBase.docs[i].data().dat);
            if (targetPriceArrayForSym[0].dateMili < earliest) {
                earliest = targetPriceArrayForSym[0].dateMili;   // 0 is oldest
                earliestIndx = i
            }
        }
        targetPriceArrayForSym = JSON.parse(fromFireBase.docs[earliestIndx].data().dat); // indx of earliest

        // avoid too many
        while (targetPriceArrayForSym.length > 20)  {
            targetPriceArrayForSym.shift() // remove oldest    
        }

        // delete all previous entries but the earliest
        if (fromFireBase.docs.length > 1) {
            const debug = 1;
        }else {
            const debug = 0
        }

        // allow new record only if none or significant dufferent
        if (targetPriceArrayForSym.length > 0) {
            target =  targetPriceArrayForSym[targetPriceArrayForSym.length - 1].target; // compare new target with last entry of collection           
            if (! bigDiff (targetRaw, target, 1.02)) {
                bigDifference = false;
                if (LOG)
                    console.log (symbol, 'targetPrice skip add small diff: ', (targetRaw / target).toFixed(3)); // show the change of last target
            }
        }
    }
    else
        if (LOG)
            console.log (symbol, 'targetPrice new')


    if (bigDifference) {
        // const target =  targetPriceArrayForSym[targetPriceArrayForSym.length - 1].target; 
        targetPriceArrayForSym.push (symTargetOne)
        const arrayStringify = JSON.stringify(targetPriceArrayForSym);
        await addDoc (targetRef, {symbol: symbol, dat: arrayStringify}) 

        if (LOG) {
            console.log (symbol, 'targetPrice add', 'target: ',  targetRaw, (targetRaw / target).toFixed(3), arrayStringify, ' size: ', targetPriceArrayForSym.length)  
        }   
    }

    // delete all extra collection except earliest
    for (let i = 0; i < fromFireBase.docs.length; i++) {
        if (! bigDifference && i === earliestIndx)
        continue       
        var tarDoc_ = doc(db, "targetPriceArray", fromFireBase.docs[i].id);
        if (LOG)
            console.log (symbol, 'targetPrice, delete duplicate arrays', fromFireBase.docs[i].data())
        await deleteDoc (tarDoc_);    
    }
}


// get all target Price history for one symbol
async function getTargetPriceArray (symbol, setTargetInfo) {

    var userQuery = query (targetRef, where ('symbol', '==', symbol));
    const fromFireBase = await getDocs (userQuery);

    const targetPriceArray = fromFireBase.docs.length > 0? JSON.parse(fromFireBase.docs[0].data().dat) : [];
    var str = JSON.stringify (targetPriceArray)
    str = str.replace (/,"dateMili":\d*/g, '')
    const arr = JSON.parse (str)
    setTargetInfo (arr)
    // return targetPriceArray;   
}

// obsolete
async function targetHistBigDiff (setTargetPriceArray, logFlags) {
    const allTarget = {};
    const tagetHistory = await getDocs(targetRef);
    // gainLength = gain.docs.length;
    var txt = '';
    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        try {
            const dat = JSON.parse (tagetHistory.docs[i].data().dat)
            const tar0 =  dat[0].target;
            const tar1 =  dat[dat.length - 1].target;            

            if (bigDiff (tar0, tar1, 1.05)) {
                console.log (sym, dat.length)
                for (let i = 0; i < dat.length; i++)                   
                    delete dat[i].dateMili;  // reduce unimportant info
                console.dir (dat)
                txt += sym + ' ' + JSON.stringify (dat) + '\n\n'
            }
        } catch (e) {console.log (sym, e.message)}
    }
    // IBM [{"target":152.06,"date":"2024-Jan-15  11:39"},{"target":138.69,"date":"2024-Jan-17  13:42"}]
    const txt1 = txt.replace(/{/g,'\n{');
    setTargetPriceArray (txt1)
}

// hiest target gain
async function targetHistBest (setTargetPriceHist, logFlags) {
    const LOG = logFlags.includes('target')

    const tagetHistory = await getDocs(targetRef);

    var tarHist = {}
    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        try {
            const histArr = JSON.parse (tagetHistory.docs[i].data().dat)
            const tar =  histArr[histArr.length - 1].tar;            

            if (tar > 1.12) {
                for (let i = 0; i < histArr.length; i++)                   
                    delete histArr[i].dateMili;  // reduce unimportant info
                tarHist[sym] = histArr;
            }
        } catch (e) {console.log (sym, e.message)}
    }
    // IBM [{"target":152.06,"date":"2024-Jan-15  11:39"},{"target":138.69,"date":"2024-Jan-17  13:42"}]

    setTargetPriceHist(tarHist);
}

async function targetHistAll (setTargetPriceHist, logFlags) {
    const LOG = logFlags.includes('target')
    const tagetHistory = await getDocs(targetRef);
    console.log ('count=', tagetHistory.docs.length)
    var tarHist = {}
    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        if (sym === 'AAPL') {
            const b = 1
        }
        const histArr = JSON.parse (tagetHistory.docs[i].data().dat)
        if (LOG)
        console.log (sym, histArr.length, histArr)
        for (let j = 0; j < histArr.length; j++)  {                 
            delete histArr[j].dateMili;  // reduce unimportant info
        }
        if (! tarHist[sym])
            tarHist[sym] = histArr;
        else
            if (LOG)
            console.log (sym, 'duplicate', tarHist[sym].length, histArr.length)
        if (histArr.length > 1) {
            const a = 1
        }
    }
    setTargetPriceHist(tarHist);
  }

export {targetPriceAdd, getTargetPriceArray, targetHistAll, targetHistBigDiff, targetHistBest}