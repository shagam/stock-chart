import React, {useState, useMemo, useEffect} from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import {collection, getDocs, addDoc,  doc, deleteDoc, updateDoc, query, where} from "firebase/firestore";
import {db} from '../firebaseConfig'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'


const targetRef = collection(db, "targetPriceArray")

const TARGET_CHANGE_THRESHOLD = 1.05
function bigDiff (tar0, tar1, threshold) {
    if (tar1 / tar0 > threshold|| tar0 / tar1 > threshold)
        return true;
    return false
}

async  function targetPriceAdd (symbol, targetRaw, price, logFlags, errorAdd, src, ssl, PORT, servSelect) {
    const LOG = logFlags.includes('target') 
    if (price === 0 || targetRaw === undefined) {
        if (LOG)
            console.log (symbol, 'targetPrice abort price=', price,  'targetRaw=', targetRaw, ' src=', src)
        return; // do not add tar record
    }

    var userQuery = query (targetRef, where ('symbol', '==', symbol));
    const fromFireBase = await getDocs (userQuery);
     
    // save target prices for symbol in array
    const tar = targetRaw / price; 
    const symTargetOne =  {date: getDate(), dateMili: Date.now(), target: targetRaw, price: price, tar: tar.toFixed(3)};
    if (isNaN (tar)) {
        console.log (symbol, 'faile to calc tar', symTargetOne)
        return;  // do not add bad records
    }


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
        if (targetPriceArrayForSym.length > 40)  {
            targetPriceArrayForSym.splice(Math.floor(targetPriceArrayForSym.length/4), 1) // remove oldest    
            targetPriceArrayForSym.splice(Math.floor(targetPriceArrayForSym.length/4*2), 1) // remove oldest    
            targetPriceArrayForSym.splice(Math.floor(targetPriceArrayForSym.length/4*3), 1) // remove oldest    
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
            const priceLast =  targetPriceArrayForSym[targetPriceArrayForSym.length - 1].price; 
            if (! bigDiff (targetRaw, target, 1.02) || bigDiff (price, priceLast, 1.04)) {
                bigDifference = false;
                if (LOG)
                    console.log (symbol, 'targetPrice abort, small diff=', (targetRaw / target).toFixed(3),  'price=', price, 'targetRaw=', targetRaw, 'src=', src); // show the change of last target
            }
        }
    }
    else
        if (LOG)
            console.log (symbol, 'targetPrice new')


    if (bigDifference) {
        // const target =  targetPriceArrayForSym[targetPriceArrayForSym.length - 1].target; 
        // remove bad records
        for (let i = 0; i < targetPriceArrayForSym.length; i++) {
            if (targetPriceArrayForSym[i].price === undefined) {
                console.log (symbol, 'bad record', targetPriceArrayForSym[i])
                targetPriceArrayForSym = targetPriceArrayForSym.splice(i,1); // remove bad 
            }
        }
        
        targetPriceArrayForSym.push (symTargetOne)
        const arrayStringify = JSON.stringify(targetPriceArrayForSym);
        
        // home server
        var corsUrl = ''
        if (ssl)
            corsUrl = 'https://'
        else
            corsUrl = 'http://'
        corsUrl += servSelect + ":" + PORT + "/target?cmd=w&" + "stock=" + symbol + "&dat=" + arrayStringify
        
        axios.get (corsUrl)
        // getDate()
        .then ((result) => {

            if (result.status !== 200) {
                console.log (symbol, 'status=', result)
                return;
            }
            if (LOG)
                console.log (JSON.stringify(result.data))

            if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
                errorAdd([symbol, 'target',result.data])
                return;
            }
            console.log('targetPrice', result.data)          
        } )
        .catch ((err) => {
            errorAdd([symbol, 'target', err.message])
            console.log('targetPrice', err.message)
        })


        // firefox firestore
        // await addDoc (targetRef, {symbol: symbol, dat: arrayStringify}) 

        if (LOG) {
            console.log (symbol, 'targetPrice add', 'target=',  targetRaw, (targetRaw / target).toFixed(3), arrayStringify, ' size=', targetPriceArrayForSym.length, 'src=', src)  
        }   
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
async function targetHistBigDiff (setTargetPriceHist, logFlags) {
    const LOG = logFlags.includes('target')

    const tagetHistory = await getDocs(targetRef);
    var tarHist = {}
    for (let i = 0; i < tagetHistory.docs.length; i++) {
        const sym = tagetHistory.docs[i].data().symbol;
        try {
            const histArr = JSON.parse (tagetHistory.docs[i].data().dat)
            const tar0 =  histArr[0].target;
            const tar1 =  histArr[histArr.length - 1].target;            

            if (bigDiff (tar0, tar1, 1.05)) {
                if (LOG)
                    console.log (sym, histArr.length)
                for (let i = 0; i < histArr.length; i++)                   
                    delete histArr[i].dateMili;  // reduce unimportant info
                if (LOG)
                    console.dir (histArr)
                tarHist[sym] = histArr;

            }
        } catch (e) {console.log (sym, e.message)}
    }

    setTargetPriceHist(tarHist);
}

// hiest target gain
async function targetHistBest (setTargetPriceHist, logFlags) {
    const LOG = false; //logFlags.includes('target')

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
    const LOG = false; //logFlags.includes('target')
    const tagetHistory = await getDocs(targetRef);
    if (LOG)
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

function TargetPrice () {
    const [targetPriceHist, setTargetPriceHist] = useState ({});

    return (

        <div>
        <div className='w-100 text-left mt-2'>
            <Link to="/" > Home </Link>
        </div>
        <br></br>
        {/* <hr/>  */}
        <h4 style={{color:'Green'}}>TargetPriceHistory</h4>
        {/* <hb/> */}

        <hr/>  

        <button type="button" onClick={()=>targetHistAll (setTargetPriceHist)}>targetHistoryAll</button>  &nbsp; &nbsp;
        {/* <button type="button" onClick={()=>targetHistBigDiff (setTargetPriceArray, logFlags)}>targetHistBigDiff</button>  &nbsp; &nbsp; */}
        <button type="button" onClick={()=>targetHistBest (setTargetPriceHist)}>targetHistBest</button>         

        {targetPriceHist && Object.keys(targetPriceHist).length > 0 &&
         <div  style={{display: 'flex'}}>count={Object.keys(targetPriceHist).length} &nbsp; &nbsp; &nbsp; <div style={{color: 'lightGreen'}}>(targetNew &nbsp;/ targetOld)</div> </div>}

        <div  style={{ maxHeight: '65vh', 'overflowY': 'scroll'}}  > 

          {targetPriceHist && Object.keys(targetPriceHist).sort().map((sym,i)=>{
            return (
                <div style={{width: '90vw'}} key={i}>
                  <div  style={{display: 'flex'}} >
                    <div style={{color: 'red', width: '50px'}} > {sym}   </div>   ({targetPriceHist[sym].length}) &nbsp; &nbsp;
                    <div style={{color: 'lightGreen'}} > {(targetPriceHist[sym][targetPriceHist[sym].length - 1].target /  targetPriceHist[sym][0].target).toFixed(3)} </div>
                  </div> 
                  {targetPriceHist[sym].map((targetItem) => <li key={targetItem.date}>{JSON.stringify(targetItem)} </li>)} 
                </div>
              )
          })}
        </div>
        <br></br>
        <hr/>  
      </div>

    )
}

export {TargetPrice, targetPriceAdd, getTargetPriceArray, targetHistAll, targetHistBigDiff, targetHistBest}