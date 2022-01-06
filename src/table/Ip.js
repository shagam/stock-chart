import React, {useState, useMemo, useEffect} from 'react'

import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where, orderByChild, firestore} from "firebase/firestore";



function Ip (props) {

  const [ipList, setIpList] = useState ([]);
  const [ipDisplayFlag, setIpDisplayFlag] = useState(false);
  const [ipListFormatted, setIpListFormated] = useState ([]);

  const ipRef = collection(props.db, "ipList")

  if (! props.admin && props.localIp.IPv4 !== '10.120.250.135')
    return null;



  const LOG_FLAG = false;


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
            var ipDoc = doc(props.db, "ipList", id);
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

  const collect_ip = () => {

    if (props.stocksInfoAll !== undefined) 
    for ( let i = 0; i < props.stocksInfoAll.docs.length; i++) {
      var index = -1;
      if (ipList.length > 0)
        index = ipList.findIndex((ip) => ip.IPv4 === props.stocksInfoAll.docs[i].data()._ip.IPv4);
      if (index === -1) {// not found
        const infoOne = props.stocksInfoAll.docs[i].data();
        ipList.push(infoOne._ip)
        if (LOG_FLAG)
          console.log (infoOne._ip);
      }
    }

    if (props.stocksGainAll !== undefined) 
    for ( let i = 0; i < props.stocksGainAll.docs.length; i++) {
      var index = -1;
      if (ipList.length > 0)
        index = ipList.findIndex((ip) => ip.IPv4 === props.stocksGainAll.docs[i].data()._ip.IPv4);
      if (index === -1) {// not found
        const gainOne = props.stocksGainAll.docs[i].data();
        ipList.push(gainOne._ip)
        if (LOG_FLAG)
          console.log (gainOne._ip);
      }
    }
    ipCleanDupAll ();
    ipTablePrepareDisplay();
    ipFireSave(); 
    
  //    ipFireGet();
  }

  
  localStorage.setItem ('ipList', JSON.stringify(ipList));

  const ipDisplayChange = () => {setIpDisplayFlag (! ipDisplayFlag)}


  return (
    <>
      <div id="ip_diaplay">
        <label>  ip info: {props.localIp.IPv4}, ipList: {ipList.length} </label>
        <button type="button" onClick={()=>collect_ip()}>get IP    </button>

        <div id = 'ip_diaspay_Checkbox'>
            <input type="checkbox" checked={ipDisplayFlag}  onChange={ipDisplayChange} /> ip-display
        </div>
      </div>

        {ipDisplayFlag &&
        <div className='text'> 
          <textarea
            type='text'
            name='ipList'
            cols='150'
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

export default Ip



