import React, {useState, useMemo, useEffect} from 'react'

import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where, orderByChild, firestore} from "firebase/firestore";


const FirebaseManage = (props) => {
  const [stocksGain, setStocksGain] = useState([]);
  const [stocksInfo, setStocksInfo] = useState([]);
  const [ipList, setIpList] = useState ([]);

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

  const removeDuplicates = () => {
    firebaseGainGetAll();
    firebaseInfoGetAll();

    localStorage.setItem ('ipList', JSON.stringify(ipList));

    console.log ('stocksGain (count): ', stocksGain.length, 'stocksInfo (count): ', stocksInfo.length);
   // console.log ("ipList: ", ipList.length);
  }

  return (

    <>
      <div>
        <h4> Firebase Manage  ip: {props.ip.IPv4}</h4>
        <h4> table rows={props.rows.length} gain: {stocksGain.length}, info: {stocksInfo.length} ipList: {ipList.length} </h4>
        <button type="button" onClick={()=>removeDuplicates()}>removeDuplicates    </button>
      </div>
    </>
  )
}

export default FirebaseManage