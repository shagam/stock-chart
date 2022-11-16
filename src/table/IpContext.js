import React, {useState, useEffect} from 'react'

import {collection, getDocs, addDoc,  doc, deleteDoc, query, where} from "firebase/firestore";

import axios from 'axios'
import {format} from "date-fns"

import {db} from '../firebaseConfig'


function IpContext  () {

  const [localIp, setLocalIP] = useState('');
  const [localIpv4, setLocalIPv4] = useState('');
  const [userAgent, setUserAgent] = useState("");
  const [userAgentMobile, setUserAgentMobile] = useState(false);
  const [ios, setIos] = useState(false);

  const LOG_FLAG = false;

  const ipRef = collection(db, "ipList")

  useEffect (() => { 
    getIp();
  // eslint-disable-next-line
  }, []) 

   // eslint-disable-line_

  function getDate() {
    const date = new Date();
    var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
    return formattedDate;    
  }
  

  const getIp = async () => {
    if (localIp !== '' && localIp !== undefined) {
      //console.log('ip ', ip)
      return;
    }

    // const os = require('os');
    // const cpu=os.cpus();
    // const hostName = os.hostname()
    // const platform = os.platform();
    // const type = os.type();
    // const arch = os.arch();
    // const uptime = os.uptime();
    // var path = require('path');
    //var userInfo_ = process.env['USERPROFILE']//.split(path.sep)[2];
    // const username = require('username')
   // const userInfo = os.userInfo('buffer');
  
    // userAgent
    const userAgent = navigator.userAgent;
    setUserAgent(navigator.userAgent)
    //if (/Android/i.test(navigator.userAgent))
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
      setUserAgentMobile(true);
    } else {
      setUserAgentMobile(false);
      if (LOG_FLAG)
        console.log("not mobile device");
    }

    if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){
      setIos(true);
      if (LOG_FLAG)
        console.log("ios device");
    } else {
      setIos(false);
    }


    const res = await axios.get('https://geolocation-db.com/json/')
    if (LOG_FLAG)
    console.log('ip ', res.data);
    if (res.data !== '') {
      setLocalIP(res.data);
      // setAdmin (res.data.IPv4 === '84.228.164.64');
      setLocalIPv4 (res.data.IPv4);
    }
    else
      console.log ('no ip');

    // admin password
     // save ip
    var ipQuery = query (ipRef, where('_ipv4', '==', (res.data.IPv4)));
    const ipInfo = await getDocs(ipQuery);

    // add new entry
    await addDoc (ipRef, {_ipv4: res.data.IPv4, update: getDate(), country_name: res.data.country_name,
      city: res.data.city, state: res.data.state, postal: res.data.postal,
       longitude: res.data.longitude, latitude: res.data.latitude, userAgent: userAgent })

    // delete old entries
    if (ipInfo.docs.length > 0 && LOG_FLAG)
      console.log (res, 'ipList', ipInfo.docs.length);
    for (let i = 0; i < ipInfo.docs.length; i++) {
      //const id = ipInfo.docs[i].id;
      var ipDoc = doc(db, "ipList", ipInfo.docs[i].id);
      await deleteDoc (ipDoc);    
    }
  } 
  

  const value = {
    localIp,
    localIpv4,
    userAgent,
    userAgentMobile,
    ios
  }
  return (value)

}

export default IpContext;