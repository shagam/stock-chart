
import React, {useState, useEffect} from 'react'
import {IpContext, getIpInfo} from '../contexts/IpContext';
import GetInt from '../utils/GetInt'
import MobileContext from '../contexts/MobileContext'

function IpSearchGui () {

    const {localIp, localIpv4, eliHome, err, ip} = IpContext();
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();

    const [city_, setCity_] = useState()
    const [region_, setRegion_] = useState()
    const [country_, setCountry_] = useState()
    const [err_, setErr_] = useState()
    const [ipSearch, setIpSearch] = useState()

    function getIpInfoClick () {
        var ipForSearch = '66.87.125.72'
        if (ipSearch)
          ipForSearch = ipSearch;
        getIpInfo (ipForSearch, setCity_, setRegion_, setCountry_, setErr_)
        // getIpInfo ('66.87.125.72', null, null, null, null)
        // console.log('ipInfo', city_, country_, region_)
        // getIpInfo ('66.87.125.72', null, null, null, null)
      }
      
    return (
        <div>
          <div style={{display:'flex'}}>    
          {/* <div>&nbsp; </div> */}
            {eliHome && <GetInt style={{marginright: '0px'}} init={null} callBack={setIpSearch} title='ipSearch' type='Text' pattern="[0-9\\.]+"/>} &nbsp; &nbsp;
            {eliHome &&  <div> &nbsp; <button style={{marginTop: '15px', background: 'aqua'}} onClick={getIpInfoClick} > ipInfo </button> &nbsp; </div>}
          </div>
          {eliHome && city_ && <div style={{marginTop: '15px'}}> &nbsp; city={city_}  &nbsp; region={region_}  &nbsp; country={country_}  </div>} 
          <div> &nbsp;</div>      
        </div>
    )
}

export {IpSearchGui}