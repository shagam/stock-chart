import React, {useState, useMemo, useEffect} from 'react'
import {collection, getDocs, addDoc,  doc, deleteDoc, updateDoc, query, where} from "firebase/firestore";
import {db} from '../firebaseConfig'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'


const targetRef = collection(db, "targetPriceArray")

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
        console.log (symbol, 'add new targetPrice', targetRaw)
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

export {targetPriceAdd, getTargetPriceArray}