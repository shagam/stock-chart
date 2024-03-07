import React, {useState} from 'react'
import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";
import {db} from '../firebaseConfig'
import {format} from "date-fns"


const holdingsRef = collection(db, "holdings")
const LOG = true;

function getDate() {
    const date = new Date();
    var formattedDate = format(date, "yyyy-MMM-dd  HH:mm");
    return formattedDate;    
}  
const updateDate = getDate();
const updateMili = Date.now();

// save valueArray
async function holdingsAddDoc (sym, value) {
    // delete old records
    var userQuery = query (holdingsRef, where ('key', '==', sym));
    const holdingsArray = await getDocs (userQuery);

    for (let i = 0; i < holdingsArray.docs.length; i++) {    
        var hold = doc(db, "holdings", holdingsArray.docs[i].id);
        if (LOG)
            console.log (sym, 'holdings, delete obsolete arrays', holdingsArray.docs[i].data())
        await deleteDoc (hold);    
    }

    await addDoc (holdingsRef, {key: sym, val: value, _updateDate: updateDate, _updateMili: updateMili,})
}

async function holdingsGet (sym, setArr) {
    try {
        var userQuery = query (holdingsRef, where ('key', '==', sym));
        const holdingsArray = await getDocs (userQuery);
        console.log (holdingsArray.docs[0].data().val)
        setArr (JSON.parse(holdingsArray.docs[0].data().val))

    } catch (e) {
        console.log(e.message)
        return e.message;
    }

}

async function holdingsGetList (setErr, setArr) {
    try {
        const holdingsArray = await getDocs (holdingsRef);
        var holdingAr = [];
        for (let i = 0; i < holdingsArray.docs.length; i++) {    
            holdingAr.push (holdingsArray.docs[i].data().key)
        }
    } catch (e) {
        console.log(e.message)
        return e.message;
    }
    setErr(JSON.stringify(holdingAr))
    // setArr(holdingAr)
}

async function holdingsInsert (sym, rows) {
    var userQuery = query (holdingsRef, where ('key', '==', sym));
    const holdingsArray = await getDocs (userQuery);
    console.log (holdingsArray.docs[0].data().val)
    const arr = JSON.parse (holdingsArray.docs[0].data().val)
    for (let i = 0; i < arr.length; i++) { 
        const sym1 = arr[i].sym
        const row_index = rows.findIndex((row)=> row.values.symbol === sym1);
        if (row_index === -1) {
            alert ('stock missing: ' + props.chartSymbol)
        }

        
    }
}


export {holdingsAddDoc,  holdingsGet, holdingsGetList, holdingsInsert }