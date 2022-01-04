import React, {useState, useMemo, useEffect} from 'react'

import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where, orderByChild, firestore} from "firebase/firestore";
import {nanoid} from 'nanoid';

const FirebaseManage = (props) => {
  const [stocksGain, setStocksGain] = useState([]);
  const [stocksInfo, setStocksInfo] = useState([]);
  const [ipList, setIpList] = useState ([]);
  const [ipDisplayFlag, setIpDisplayFlag] = useState(false);
  const [ipListFormatted, setIpListFormated] = useState ([]);

  const ipRef = collection(db, "ipList")
  
  const LOG_FLAG = false;

  if ( props.ip.IPv4 !== '84.228.164.65' && props.ip.IPv4 !== '10.120.250.135')
    return null;

  //read from firebase gain
  const firebaseGainGetAll = async () => {
    const gain = await getDocs(props.gainRef);
    setStocksGain(gain.docs.map((doc) =>({...doc.data(), id: doc.id})))
    console.log ('firebase read gain: ', gain.docs.length, stocksGain.length);
    for ( let i = 0; i < gain.docs.length; i++) {
      var index = -1;
      if (ipList.length > 0)
        index = ipList.findIndex((ip) => ip.IPv4 === gain.docs[i].data()._ip.IPv4);
      if (index === -1) {// not found
        ipList.push(gain.docs[i].data()._ip)
        if (LOG_FLAG)
          console.log (gain.docs[i].data()._ip);
      }
    }
  }

  //read from firebase info
  const firebaseInfoGetAll = async () => {
    const info = await getDocs(props.infoRef)
    setStocksInfo(info.docs.map((doc) =>({...doc.data(), id: doc.id})))
    if (LOG_FLAG)
    console.log ('firebase read info: ', info.docs.length, stocksInfo.length);
    for ( let i = 0; i < info.docs.length; i++) {
      var index = -1;
      if (ipList.length > 0)
        index = ipList.findIndex((ip) => ip.IPv4 === info.docs[i].data()._ip.IPv4);
      if (index === -1) {// not found
        ipList.push(info.docs[i].data()._ip)
        if (LOG_FLAG)
          console.log (info.docs[i].data()._ip);
      }
    }
  }

  // save to firebase
  const ipFireSave = async () => {
    for (let i = 0; i < ipList.length; i++) {
      const ipData = JSON.stringify (ipList[i]);
      await addDoc (ipRef, {_ipv4: ipList[i].IPv4, data: ipData});
    }
  }
  
  const ipFireGet = async () => {
    var ipTable = "";
    const ipReadList = await getDocs(ipRef)
    for (let i = 0; i < ipReadList.docs.length; i++) {
      const ipJson = JSON.parse (ipReadList.docs[i]);
      const index = ipList.findIndex((ip) => ip.IPv4 === ipJson.IPv4);
      if (index === -1) {// not found
        ipList.push (ipJson);
      }
      ipFireCleanDup (ipJson.IPv4);

      ipTable += JSON.stringify(ipJson) + "\n\n";
      setIpListFormated(ipTable);
    }
  }

  // clear duplicates of ip from firebase  and clean duplicates
  const ipFireCleanDup = async (ipv4) => {
    try {
      var userQuery = query (ipRef, where('_ipv4', '==', ipv4));
      const ipFromFirebase = await getDocs(userQuery);
      if (ipFromFirebase.docs.length > 0) {
        if (ipFromFirebase.docs.length > 1) {  // clean duplicates
          if (LOG_FLAG)
          console.log ('duplicates', ipFromFirebase.docs.length, ipFromFirebase.docs[0].data());
          for (let i = 1; i < ipFromFirebase.docs.length; i++) {
            const id = ipFromFirebase.docs[i].id;
            var ipDoc = doc(db, "ipList", id);
            await deleteDoc (ipDoc);    
          }
        }
        // var newJason = stocksInfoOne;
        // newJason[symbol] =  ipFromFirebase.docs[latestIndex];
        // setIpList (newJason);       
      }
    } catch(e) {console.log (e); alert (e)}
  }
  
  const ipCleanDupAll = () => {
  try {
    for (let i = 0; i < ipList.length; i++)
      ipFireCleanDup (ipList[i].IPv4);
    } catch (e) {console.log (e)} 
  }


  // prepare for display ip
  const ipTablePrepareDisplay = () => {
    var ipTable = "";
    for (let i = 0; i < ipList.length; i++) {
      ipTable += JSON.stringify(ipList[i]) + "\n\n";
    }
    setIpListFormated(ipTable);
  }

  // main entry
  const removeDuplicates = () => {
    firebaseGainGetAll();
    firebaseInfoGetAll();

    ipFireSave();    
    ipCleanDupAll ();
    ipTablePrepareDisplay();

//    ipFireGet();
    localStorage.setItem ('ipList', JSON.stringify(ipList));

    if (LOG_FLAG)
    console.log ('stocksGain (count): ', stocksGain.length, 'stocksInfo (count): ', stocksInfo.length);
   // console.log ("ipList: ", ipList.length);
  }

  // get all stocks better than QQQ
  const firebaseGainGetBest = async (symbol) => {
    try {
      // get one symbol gain from firebase
      const QQQ_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ'); 
      if (QQQ_index === -1) {
        alert ('QQQ missing in table');
        return; // cannot compare with QQQ
      }
      
      if (LOG_FLAG)
      console.log (props.rows[QQQ_index].values.mon6)  
      var userQuery = query (props.gainRef, where(
        'mon6', '>', props.rows[QQQ_index].values.mon6 
        || 'year', '>', props.rows[QQQ_index].values.year
        || 'year2', '>', props.rows[QQQ_index].values.year2
        || 'year5', '>', props.rows[QQQ_index].values.year5
        || 'year10', '>', props.rows[QQQ_index].values.year10
        ));
      const gain = await getDocs(userQuery);
      if (LOG_FLAG)
      console.log (gain.docs.length);
      var found_stocks_array = [];
      for (let i = 0; i < gain.docs.length; i++) {
        const symbol = gain.docs[i].data().__symbol;
        
        const symIndex = props.rows.findIndex((row)=> row.values.symbol === symbol); 
        if (symIndex !== -1) {
          console.log ('stock alreay in table ', i, symbol);
          continue; // already in table
        }
       
        console.log ('stock equ QQQ added ', i, symbol);
        found_stocks_array.push(symbol);
        // var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    
        // newStock.id = nanoid();
        // newStock.values.symbol = symbol;
        // newStock.original.symbol = symbol;
        // newStock.cells = null;
        // newStock.allCells = [];
        // newStock.values.updateDate = gain.docs[i].data()._updateDate;
        // newStock.values.updateMili = gain.docs[i].data()._updateMili;

        // newStock.values.wk = gain.docs[i].data().wk;
        // newStock.values.wk2 = gain.docs[i].data().wk2;
        // newStock.values.mon = gain.docs[i].data().mon;
        // newStock.values.mon3 = gain.docs[i].data().mon3;
        // newStock.values.mon6 = gain.docs[i].data().mon6;
        // newStock.values.year = gain.docs[i].data().year;
        // newStock.values.year2 = gain.docs[i].data().year2;
        // newStock.values.year5 = gain.docs[i].data().year5;
        // newStock.values.year10 = gain.docs[i].data().year10;
        // newStock.values.year20 = gain.docs[i].data().year20;
        // newStock.values.splits = gain.docs[i].data().splits;

        // try {
        // props.prepareRow(newStock);
        // props.rows.push (newStock);
        // } catch (e) {
        //   console.log (e)
        //   alert ('adding best stocks' + e);
        // }
        // window.location.reload();
      }
      if (found_stocks_array.length > 0)
        alert (`stock compared with QQQ (6m, y, 2y, 5y, 10y):    [${found_stocks_array}]`)
    } catch(e) { console.log (e); alert (e)}
  }

  const usageHelpChange = () => {setIpDisplayFlag (! ipDisplayFlag)}

  return (
    <>
      <div>
        <h4> Firebase Manage  ip: {props.ip.IPv4},  stocks={props.rows.length},
          gain: {stocksGain.length}, info: {stocksInfo.length}, ipList: {ipList.length} </h4>

          <button type="button" onClick={()=>firebaseGainGetBest()}> stocks-better-then-QQQ    </button>
          <button type="button" onClick={()=>removeDuplicates()}>removeDuplicates    </button>
      </div>

      <label>
          <input type="checkbox" checked={ipDisplayFlag}  onChange={usageHelpChange} /> ip-display
      </label>




      {ipDisplayFlag &&
        <div className='text'> 
          <textarea
            type='text'
            name='ipList'
            cols='90'
            rows='20'
            readOnly
            defaultValue={ipListFormatted}
          >
          </textarea>
        </div>
      }
    </>
  )
}

export default FirebaseManage