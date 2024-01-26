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

    const LOG = logFlags.includes('target')
    var userQuery = query (targetRef, where ('symbol', '==', symbol));
    const fromFireBase = await getDocs (userQuery);
     
    // save target prices for symbol in array
    const tar = price !== 0 ? targetRaw / price : -1; 
    const symTargetOne =  {date: getDate(), dateMili: Date.now(), target: targetRaw, price: price, tar: tar.toFixed(3)};
    var latest = 0;
    var latestIndex = -1;

    var targetPriceArray = fromFireBase.docs.length > 0? JSON.parse(fromFireBase.docs[0].data().dat) : [];
    
    // avoid too many
    if (targetPriceArray.length > 20)  {
        targetPriceArray.shift() // remove oldest    
    }

    // avoid duplicates
    for (let i = 0; i < targetPriceArray.length; i++) {
        const entry = targetPriceArray[i]
      if (entry.dateMili > latest) {
        latest = entry.dateMili;
        latestIndex = i;
      }
    }

    // empty or different

    if (latestIndex === -1 || targetPriceArray[latestIndex].target === symTargetOne.target) {

        var bigDifference = true;
        if (targetPriceArray.length > 0) {
            const target =  targetPriceArray[targetPriceArray.length - 1].target;            
            if (! bigDiff (targetRaw, target, 1.02)) {
                bigDifference = false;
                // console.log (symbol, 'newTarget/oldTarget: ', (targetRaw / target).toFixed(2)); // show the change of last target
            }
            else {
                if (LOG)
                    console.log ('oldTarget: ', target, ' newTarget: ', targetRaw, ' ratio: ', (targetRaw/target).toFixed(3))
            }
        }

        if (bigDifference) {
            targetPriceArray.push (symTargetOne)
            if (LOG)
                console.log (symbol, 'add new targetPrice', targetRaw, ' size: ', targetPriceArray.length)
        }
        else
            return; // abort 

        const arrayStringify = JSON.stringify(targetPriceArray);

        if (fromFireBase.docs.length > 0) {  // entry already exist
            var targetDoc = doc(db, "targetPriceArray", fromFireBase.docs[0].id);
            await updateDoc (targetDoc, {symbol: symbol, dat: arrayStringify})
        }
        else {
            await addDoc (targetRef, {symbol: symbol, dat: arrayStringify})      
        }
    }
}

// get all target Price history
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

    const tagetHistory = await getDocs(targetRef);
    console.log ('count=', tagetHistory.docs.length)
    var tarHist = {}
    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        if (sym === 'AAPL') {
            const b = 1
        }
        const histArr = JSON.parse (tagetHistory.docs[i].data().dat)
        console.log (sym, histArr.length, histArr)
        for (let j = 0; j < histArr.length; j++)  {                 
            delete histArr[j].dateMili;  // reduce unimportant info
        }
        if (! tarHist[sym])
            tarHist[sym] = histArr;
        else
            console.log (sym, 'duplicate', tarHist[sym].length, histArr.length)
        if (histArr.length > 1) {
            const a = 1
        }
    }
    setTargetPriceHist(tarHist);
  }

export {targetPriceAdd, getTargetPriceArray, targetHistAll, targetHistBigDiff, targetHistBest}