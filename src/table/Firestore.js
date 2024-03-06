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

async function holdingsGet (sym) {
    try {
        var userQuery = query (holdingsRef, where ('key', '==', sym));
        const holdingsArray = await getDocs (userQuery);
        var holdingAr = [];
        for (let i = 0; i < holdingsArray.docs.length; i++) {    
            holdingAr.push ({})
        }
    } catch (e) {
        console.log(e.message)
        return e.message;
    }
    return holdingAr;
}

export {holdingsAddDoc,  holdingsGet}