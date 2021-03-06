import React, {useState, useEffect} from 'react'

import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";

import axios from 'axios'
import {format} from "date-fns"

import {db} from '../firebaseConfig'

function Ip (props) {

  const [ipList, setIpList] = useState ([]);
  const [ipDisplayFlag, setIpDisplayFlag] = useState(false);
  const [ipListFormatted, setIpListFormated] = useState ([]);


  const [localIp, setLocalIP] = useState('');
  const [localIpv4, setLocalIPv4] = useState('');
  const [userAgent, setUserAgent] = useState("");
  const [userAgentMobile, setUserAgentMobile] = useState(false);




  const ipRef = collection(props.db, "ipList")

  if (! props.admin && props.localIp.IPv4 !== '10.120.250.135')
    return null;



  const LOG_FLAG = false;

  const ipFireGet = async () => {
    const longtitude = true;
    const userAgent =- false;
    var ipTable = "";
    var ipListCollect = [];
    setIpList ([]);
    const ipReadList = await getDocs(ipRef)
    for (let i = 0; i < ipReadList.docs.length; i++) {
      if (LOG_FLAG)
      console.log (ipReadList.docs[i].data());
      const index = ipList.findIndex((ip) => ip._ipv4 === ipReadList.docs[i].data().ipv4);
      if (index === -1) {// not found
        //ipList.push (ipReadList.docs[i].data());
        ipListCollect.push (ipReadList.docs[i].data());
        var ipTable_one = "ipv4: '" + ipReadList.docs[i].data()._ipv4  + "', ";
        ipTable_one += "country_name: '" + ipReadList.docs[i].data().country_name  + "', ";
        ipTable_one += "city: '" + ipReadList.docs[i].data().city  + "', ";
        ipTable_one += "state: '" + ipReadList.docs[i].data().state  + "', ";
        if (longtitude) {
        ipTable_one += "latitude: '" + ipReadList.docs[i].data().latitude  + "', ";
        ipTable_one += "longitude: '" + ipReadList.docs[i].data().longitude  + "', ";
        }
        // ipTable_one += "postal: " +   ipReadList.docs[i].data().postal + ", ";
        if (userAgent)
          ipTable_one += "userAgent: '" + ipReadList.docs[i].data().userAgent  + "', ";
        ipTable_one += "update: '" + ipReadList.docs[i].data().update  + "'\n";
   
        ipTable += ipTable_one; //JSON.stringify(ipReadList.docs[i].data()) + "\n\n";
      }
    }
    setIpListFormated(ipTable);
    setIpList (ipListCollect);
  }

  
  const collect_ip = () => {
    ipFireGet();
  }


 

  localStorage.setItem ('ipList', JSON.stringify(ipList));

  const ipDisplayChange = () => {setIpDisplayFlag (! ipDisplayFlag)}


  return (
    <>
      {/* {/* <div style={{display:'flex'}}></div> */}
      <div id = 'ip_diaspay_Checkbox'>
          <input type="checkbox" checked={ipDisplayFlag}  onChange={ipDisplayChange} /> ip-display
      </div>

      {ipDisplayFlag && <div>
        <div style={{display:'flex'}}> 
          <div>  ip info: &nbsp; {props.localIp.IPv4},  &nbsp; ipList: {ipList.length} &nbsp; &nbsp; </div>
          <button type="button" onClick={()=>collect_ip()}>   get IP    </button>
        </div>

        <div className='text'> 
          <textarea
            type='text'
            name='ipList'
            cols='170'
            rows='20'
            readOnly
            defaultValue={ipListFormatted}
          >
          </textarea>
        </div>
        
      </div>
    }
    </>
  )
}

export default Ip



