import React, {useState, useEffect} from 'react'



import axios from 'axios'
import {format} from "date-fns"

import {db} from '../firebaseConfig'
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import {ErrorList, errorAdd, beep, beep2} from '../utils/ErrorList'

function IpContext  () {

  const [localIp, setLocalIP] = useState('');
  const [localIpv4, setLocalIPv4] = useState('');
  const [userAgent, setUserAgent] = useState("");
  const [city, setCity] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [userAgentMobile, setUserAgentMobile] = useState(false);
  const [ios, setIos] = useState(false);
  const [eliHome, setEliHome] = useState(false);
  const { login, currentUser, admin } = useAuth();
  const [err, setErr] = useState();
  const [ip, setIp] = useState();

  const LOG_FLAG = false;


  const getData = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    // console.log(res.data);
    setIp(res.data.ip);
    setEliHome (res.data.ip === '62.0.92.49' || admin);
  };



  useEffect (() => { 
    getData ()
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
    setErr()
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

    const url = 'https://geolocation-db.com/json/';
    try {
      const res = await axios.get(url)
      if (LOG_FLAG)
      console.log('ip ', res.data);
      if (res.data !== '') {
        // setLocalIP(res.data);
        setEliHome (ip === '62.0.92.49' || admin);
        setLocalIPv4 (res.data.IPv4);
        setCity (res.data.city);
        setCountryName(res.data.country_name)
        setCountryCode(res.data.country_code)
      }
      else
        console.log ('no ip');

    // admin password
     // save ip
     } catch (err) {
      console.log (err.message, url)
      var err_txt = 'ipContext,  err=' + err.message
      if (eliHome)
        err_txt +=  ' url=' + url
      setErr (err_txt)
    }
  } 
  

  const value = {
    localIp,
    localIpv4,
    city,
    countryName,
    countryCode,
    userAgent,
    userAgentMobile,
    ios,
    eliHome,
    err,
    ip
  }
  return (value)

}

export default IpContext;