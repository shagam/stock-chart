import React, {useState, useMemo, useEffect} from 'react'
import {collection, getDocs, addDoc,  doc, deleteDoc, updateDoc, query, where} from "firebase/firestore";
import {db} from '../firebaseConfig'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'


const targetRef = collection(db, "targetPriceArray")

const TARGET_CHANGE_THRESHOLD = 1.05
function bigDiff (tar0, tar1) {
    if (tar1 / tar0 > TARGET_CHANGE_THRESHOLD|| tar0 / tar1 > TARGET_CHANGE_THRESHOLD)
        return true;
    return false
}

async  function targetPriceAdd (symbol, targetRaw) {

    var userQuery = query (targetRef, where ('symbol', '==', symbol));
    const fromFireBase = await getDocs (userQuery);
     
    // save target prices for symbol in array
    const symTargetOne =  {target: targetRaw, date: getDate(), dateMili: Date.now()};
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

    if (latestIndex === -1 || targetPriceArray[latestIndex].target !== symTargetOne.target) {
        targetPriceArray.push (symTargetOne)
        console.log (symbol, 'add new targetPrice', targetRaw, ' size: ', targetPriceArray.length)
        if (targetPriceArray.length > 1) {
            const tar0 =  targetPriceArray[0].target;
            const tar1 =  targetPriceArray[targetPriceArray.length - 1].target;            
            if (bigDiff (tar0, tar1)) {
                console.log ('Ratio: ', (tar0 / tar1).toFixed(2)); // show the change of last target
            }
        }
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

async function targetHistBigDiff () {
    const allTarget = {};
    const tagetHistory = await getDocs(targetRef);
    // gainLength = gain.docs.length;

    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        try {
            const dat = JSON.parse (tagetHistory.docs[i].data().dat)
            const tar0 =  dat[0].target;
            const tar1 =  dat[dat.length - 1].target;            

            if (bigDiff (tar0, tar1)) {
                console.log (sym, dat.length)
                for (let i = 0; i < dat.length; i++)                   
                    delete dat[i].dateMili;  // reduce unimportant info
                console.dir (dat)
            }
        } catch (e) {console.log (sym, e.message)}
    }
}


async function targetHistAll () {
    const allTarget = {};
    const tagetHistory = await getDocs(targetRef);
    // gainLength = gain.docs.length;

    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        try {
            const dat = JSON.parse (tagetHistory.docs[i].data().dat)
            console.log (sym, dat.length)
            for (let i = 0; i < dat.length; i++)                   
                delete dat[i].dateMili;  // reduce unimportant info
            console.dir (dat)
        } catch (e) {console.log (sym, e.message)}
    }
    // allTarget[sym] = dat;
    // allTarget.sort();

}

export {targetPriceAdd, getTargetPriceArray, targetHistAll, targetHistBigDiff}