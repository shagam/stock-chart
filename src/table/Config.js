import React, {useState} from 'react';

import AlphaVantage from '../AlphaVantage'
import { Link, useNavigate } from 'react-router-dom'
import {IpContext, getIpInfo} from '../contexts/IpContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import MobileContext from '../contexts/MobileContext'
import {beep2, beep} from '../utils/ErrorList'

const  Config = (props) => { 

  const [configFlag, setConfigFlag] = useState (false);
  //console.log(`AlphaVantage localStorage ${alpha}`); 
  const {localIp, localIpv4, eliHome, err, ip} = IpContext();
  const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
  const { resetPassword, currentUser, admin } = useAuth(); //, currentUser
  const [city_, setCity_] = useState()
  const [region_, setRegion_] = useState()
  const [country_, setCountry_] = useState()
  const [err_, setErr_] = useState()


  const configFlagChange = () => {setConfigFlag (! configFlag)}

  function purgeStockTable () {
    for (let index = props.rows.length -1; index >= 0; index--)
      props.rows.splice(index, 1);
    props.saveTable();
    window.location.reload(false);
  }

  function reloadPage() {
    window.location.reload(false);
  }

  function columnsHiddenPurge() {
    localStorage.removeItem('columnsHidden')
    reloadPage()
  }
  
  function getIpInfoClick () {
    getIpInfo ('66.87.125.72', setCity_, setRegion_, setCountry_, setErr_)
    // getIpInfo ('66.87.125.72', null, null, null, null)
    // console.log('ipInfo', city_, country_, region_)
    // getIpInfo ('66.87.125.72', null, null, null, null)
  }

  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid blue'
  };
  //   
  return (

    <div style = {{border: '2px solid maroon'}}>

      {/* ====== Displasy/hide checkbox */} 
      <input
        type="checkbox" checked={configFlag}
        onChange={ configFlagChange }
      /> Config 

      { configFlag &&
        <div id = "config_id">
          <div>  &nbsp; <Link to="/dashboard" > Login Dashboard </Link>  </div>

          {/* ====== Filter buttons */} 
          <div  style={{display:'flex', paddingTop: '5px'}}>
             <div> <button onClick={purgeStockTable} > Purge stock table </button> </div>
            <div> &nbsp; <button onClick={columnsHiddenPurge} > Default Hidden columns </button> &nbsp; </div>
            {/* <div> &nbsp; <button onClick={reloadPage} > Reload page </button> &nbsp; </div> */}
          </div>

          <div>
              <button style={{height: '30px'}} type="button" className="stock_button_class" onClick={()=>props.saveTable()}>saveTable</button>
              &nbsp; <button onClick={props.refreshByToggleColumns} > Refresh table </button> 
          </div>
          <div> &nbsp; </div>
          {/* {isMobile && <div> &nbsp; </div>}  */}
          {admin && <div>
            <button type="button" onClick={()=>beep2 ()}>beep2</button>} &nbsp;
            <button type="button" onClick={()=>beep(20,64,50)}>64Hz</button>&nbsp;  {/*beep(vol, freq, duration){ */}
            <button type="button" onClick={()=>beep(20,128,50)}>128Hz</button>&nbsp; {/*beep(vol, freq, duration){ */}
            <button type="button" onClick={()=>beep(20,256,50)}>256Hz</button> &nbsp;
            <button type="button" onClick={()=>beep(20,512,50)}>512Hz</button>&nbsp;
            <button type="button" onClick={()=>beep(20,1024,50)}>1024Hz</button>&nbsp;
            <button type="button" onClick={()=>beep(20,2048,50)}>2048Hz</button>&nbsp;
            <button type="button" onClick={()=>beep(20,3072,50)}>3072Hz</button>&nbsp;
            <button type="button" onClick={()=>beep(20,3430,80)}>3430Hz</button>&nbsp;
          </div>}
          {/* <div> &nbsp; </div>  */}
          {/* <hr/> */}

          
          {/* ====== General checlboxes */} 
          <div  style={{display:'flex', paddingTop: '5px'}}>            
            <div style={{display:'flex'}}> &nbsp; &nbsp; <input  type="checkbox" checked={props.smoothSpikes} 
              onChange={() => props.setSmoothSpikes(! props.smoothSpikes)} />  &nbsp;smoothSpikes  &nbsp;  </div>
            
            <div style={{display:'flex'}}>  &nbsp; <input  type="checkbox" checked={props.openMarketFlag}
              onChange={() => props.setOpenMaretFlag(! props.openMarketFlag,)} />  &nbsp;OpenMarket </div>
          </div>


          {admin && <AlphaVantage alphaCallBack={props.alphaCallBack} />}

          <div  style={{display:'flex', paddingTop: '5px'}}>    
            {eliHome &&  <div> &nbsp; <button onClick={getIpInfoClick} > ipInfo </button> &nbsp; </div>}
            {eliHome && city_ && <div> &nbsp; city={city_}  &nbsp; region={region_}  &nbsp; country={country_}  </div>}
          </div>

          {/* ====== Location info */} 
          <div>&nbsp; </div>
          <div>Url: {window.location.href} </div>
          {/* {eliHome && <div>Global-ip: {localIpv4} </div>} */}
          {eliHome && <div>Global-ip: {ip} </div>}
          {eliHome && <div>Browser:  {userAgent} </div>}
          <div style={{color: 'red'}}> {err} </div>

        </div>
      }

    </div>
  )
}

export default Config