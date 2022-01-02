import React, {useState, useMemo, useEffect} from 'react'

import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where, orderByChild, firestore} from "firebase/firestore";


const FirebaseManage = (props) => {
  const [stocksGain, setStocksGain] = useState([]);
  const [stocksInfo, setStocksInfo] = useState([]);
  
  if ( props.ip.IPv4 !== '84.228.164.65' && props.ip.IPv4 !== '10.120.250.135')
    return null;




  //read from firebase
  const firebaseGainGetAll = async () => {
    const gain = await getDocs(props.gainRef);
    setStocksGain(gain.docs.map((doc) =>({...doc.data(), id: doc.id})))
    console.log ('firebase read gain: ', gain.docs.length);
    setStocksGain(gain.docs.map((doc) =>(
      console.log (doc.data().__symbol)
      //props.firebaseGainGetOne(doc.data().__symbol)
      )));



  }

  const firebaseInfoGetAll = async () => {
    const info = await getDocs(props.infoRef)
    setStocksInfo(info.docs.map((doc) =>({...doc.data(), id: doc.id})))
    console.log ('firebase read info: ', info.docs.length);


  }

  const removeDuplicates = () => {
    firebaseGainGetAll();
    firebaseInfoGetAll();
   
    // if (stocksGain.length)
    // stocksGain.docs.map((doc) =>({
    //   // const a = doc.data();
    //   // console.log (doc.data());
    //   // // props.firebaseGainGetOne(doc.data().__symbol);
    //   // props.firebaseInfoGetOne(doc.data().__symbol);
    // }))



    // props.firebaseGainGetOne
    // props.firebaseInfoGetOne

    console.log ('stocksGain (count): ', stocksGain.length, 'stocksInfo (count): ', stocksInfo.length);
  }

  return (

    <>
      <div>


        <h3> Firebase Manage table rows={props.rows.length}</h3>
        <h3>gain: {stocksGain.length} info: {stocksInfo.length}</h3>
        <h3>ip: {props.ip.IPv4}</h3>
        <button type="button" onClick={()=>removeDuplicates()}>removeDuplicates    </button>
      </div>
    </>
  )
}

export default FirebaseManage