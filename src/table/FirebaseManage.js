import React, {useState, useMemo, useEffect} from 'react'

import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where, orderByChild, firestore} from "firebase/firestore";


const FirebaseManage = (props) => {
  const [stocksGain, setStocksGain] = useState([]);
  const [stocksInfo, setStocksInfo] = useState([]);
  const [ipList, setIpList] = useState ([]);
  const [ipDisplayFlag, setIpDisplayFlag] = useState(false);
  const [ipListFormatted, setIpListFormated] = useState ([]);

  const ipRef = collection(db, "ipList")


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
        console.log (gain.docs[i].data()._ip);
      }
    }
  }

  //read from firebase info
  const firebaseInfoGetAll = async () => {
    const info = await getDocs(props.infoRef)
    setStocksInfo(info.docs.map((doc) =>({...doc.data(), id: doc.id})))
    console.log ('firebase read info: ', info.docs.length, stocksInfo.length);
    for ( let i = 0; i < info.docs.length; i++) {
      var index = -1;
      if (ipList.length > 0)
        index = ipList.findIndex((ip) => ip.IPv4 === info.docs[i].data()._ip.IPv4);
      if (index === -1) {// not found
        ipList.push(info.docs[i].data()._ip)
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

    console.log ('stocksGain (count): ', stocksGain.length, 'stocksInfo (count): ', stocksInfo.length);
   // console.log ("ipList: ", ipList.length);
  }


  const usageHelpChange = () => {setIpDisplayFlag (! ipDisplayFlag)}

  return (

    <>
      <div>
        <h4> Firebase Manage  ip: {props.ip.IPv4}</h4>
        <h4> table rows={props.rows.length} gain: {stocksGain.length}, info: {stocksInfo.length} ipList: {ipList.length} </h4>
        <button type="button" onClick={()=>removeDuplicates()}>removeDuplicates    </button>
      </div>

      <label>
          <input
            type="checkbox" checked={ipDisplayFlag}
            onChange={usageHelpChange}
          /> ip-display
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