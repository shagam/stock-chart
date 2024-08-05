import React, {useState, useEffect} from 'react'



import axios from 'axios'
import {format} from "date-fns"

import {db} from '../firebaseConfig'
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import {ErrorList, errorAdd, beep, beep2} from '../utils/ErrorList'

const ELI_HOME_IP = process.env.REACT_APP_AWS_IP_
const IPINFO_TOKEN = process.env.REACT_APP_IOINFO_TOKEN

function IpContext  () {

  const [localIp, setLocalIP] = useState('');
  const [localIpv4, setLocalIPv4] = useState('');
  const [userAgent, setUserAgent] = useState("");
  const [city, setCity] = useState();
  const [countryName, setCountryName] = useState();
  const [countryCode, setCountryCode] = useState();
  const [regionName, setRegionName] = useState()
  const [userAgentMobile, setUserAgentMobile] = useState(false);
  const [ios, setIos] = useState(false);
  const [eliHome, setEliHome] = useState(false);
  const { login, currentUser, admin } = useAuth();
  const [err, setErr] = useState();
  const [ip, setIp] = useState();



  const LOG_FLAG = false;

  var eliHome_ = false;

  const getIp = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    // console.log(res.data);

    setIp(res.data.ip);
    setEliHome (res.data.ip === ELI_HOME_IP || admin);
    eliHome_ = res.data.ip === ELI_HOME_IP
  };



  useEffect (() => { 
    getIp ()
    getIpInfo_io () 
    // getIp_api () //*  blocked by netlify.app because http not allowed 
    // getIp_geolocation();
    userAgentGet()
  // eslint-disable-next-line
  }, []) 

   // eslint-disable-line_

  function getDate() {
    const date = new Date();
    var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
    return formattedDate;    
  }
  
  function userAgentGet () {
    const userAgent = navigator.userAgent;
    if (LOG_FLAG)
    console.log ('navigator=', navigator)
      
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
  }

  const getIp_geolocation = async () => {
    setErr()
    if (localIp !== '' && localIp !== undefined) {
      //console.log('ip ', ip)
      return;
    }
  
    const url = 'https://geolocation-db.com/json/';
    try {
      const res = await axios.get(url)
      if (LOG_FLAG)
      console.log('ip ', res.data);
      if (res.data !== '') {
        // setLocalIP(res.data);
        setEliHome (ip === ELI_HOME_IP || admin);
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
      if (eliHome_)
        err_txt +=  ' url=' + url
      setErr (err_txt)
    }
  } 

  async function getIp_api () {
    setErr()
    if (localIp !== '' && localIp !== undefined) {
      //console.log('ip ', ip)
      return;
    }
  
    // const url = 'ip-api.com/json/?fields=61439';
      
    const url = 'http://ip-api.com/json/';
    try {
      console.log ('url=', url)
      const res = await axios.get(url)
      if (eliHome_ || LOG_FLAG)
      console.log('ip ', res.data);
      if (res.data !== '') {
        // setLocalIP(res.data);
        setEliHome (res.data.query === ELI_HOME_IP || admin);
        setLocalIPv4 (res.data.query);
        setCity (res.data.city);
        setCountryName(res.data.country)
        setCountryCode(res.data.countryCode)
        setRegionName(res.data.regionName)
      }
      else
        console.log ('no ip');

    // admin password
     // save ip
     } catch (err) {
      console.log (err.message, url)
      var err_txt = 'ipContext_,  err=' + err.message
      if (eliHome_)
        err_txt +=  ' url=' + url
      setErr (err_txt)
    }
  } 

  async function getIpInfo_io () {
    setErr()
    if (localIp !== '' && localIp !== undefined) {
      //console.log('ip ', ip)
      return;
    }
  
    // const url = 'ip-api.com/json/?fields=61439';
    // getIpInfo (null, setEliHome, setCity, setRegionName, setCountryName, setErr)

    var url;

    url = 'https://ipinfo.io/66.87.125.72/json?token=' + IPINFO_TOKEN
    url = 'https://ipinfo.io/json?token=' + IPINFO_TOKEN

    try {
      // console.log ('url=', url)
      const res = await axios.get(url)
      if (eliHome_ || LOG_FLAG)
      console.log('ip ', res.data);
      if (res.data !== '') {
        // setLocalIP(res.data);
        setEliHome (res.data.ip === ELI_HOME_IP || admin);
        setLocalIPv4 (res.data.ip);
        setCity (res.data.city);
        setCountryName(res.data.country)
        setCountryCode(res.data.countryCode)
        setRegionName(res.data.region)
      }
      else
        console.log ('no ip');

    // admin password
    // save ip
     } catch (err) {
      console.log (err.message, url)
      var err_txt = 'ipInfo,  err=' + err.message
      if (eliHome_ || admin)
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
    regionName,
    userAgent,
    userAgentMobile,
    ios,
    eliHome,
    err,
    ip,
  }
  return (value)

}


//* get ipInfo from ip  failed unused
async function getIpInfo (ip, setCity, setRegion, setCountry, setErr) {
  const eliHome_ = ip === ELI_HOME_IP

    var url;
    // url = 'https://ipinfo.io/66.87.125.72/json?token=' + IPINFO_TOKEN
    url = 'https://ipinfo.io/'
    if (ip)
      url += ip + '/';
    url += 'json?token=' + IPINFO_TOKEN;

    // if (eliHome_)
      console.log ('ipInfoUrl=', url)
    try {
      const res = await axios.get(url)
        console.log('ipInfo results ', res.data);
      if (res.data !== '') {
        if (setCity)
          setCity (res.data.city);
        if (setRegion)
          setRegion(res.data.region)
        if (setCountry)
          setCountry(res.data.country)

      }
      else
        console.log ('no ip');

    // admin password
     // save ip
     } catch (err) {
      if (eliHome_)
        console.log (err.message, url)
      else
        console.log (err.message)
    }
}


export  {IpContext, getIpInfo}
