import React, {useState, useEffect} from 'react'

import LogFlags from '../utils/LogFlags'
import {VerifyGain} from './GainValidateMarketwatch'
import {Splits} from '../splits/StockSplitsGet'

import {spikesGet} from './Spikes'

import IpContext from '../contexts/IpContext';
import {  useAuth, logout } from '../contexts/AuthContext';

function Verify (props) {


  // props.symbol
  // props.rows
  // props.startDate
  // props.setStartDate
  // props.endDate
  // props.setEndDate
  // stockChartXValues
  // stockChartYValues
  // logFlags
  // weekly
  // errorAdd


    const LOG_FLAG = props.logFlags && props.logFlags.includes('verify_1');

    const [splitInfo, setSplitInfo] = useState ([]);
    const [spikeInfo, setSpikesInfo] = useState ([]);
    const [corsUrl, setCorsUrl] = useState ();
    const [url, setUrl] = useState ();
    const [err, setErr] = useState ();
    const [ignoreSaved, setIgnoreSaved] = useState ();
    const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
    const { currentUser, admin, logout } = useAuth();


    useEffect(() => {
      setSplitInfo();
      setSpikesInfo([])
      setUrl()
      setCorsUrl()
      setErr()
    },[props.symbol]) 



    function spikes () {
      if (! props.symbol) {
        alert ("Missing symbol, press gain for a symbol")
        return;
      }
      var spikes =  spikesGet (props.symbol, props.stockChartXValues, props.stockChartYValues, props.logFlags);
      // if (spikes.length > 0) {
      //   setSpikesInfo (spikes)
      //   console.log ('spikes:', spikes)
      // }
    }

    function renderList(array) {
      if (array.length === 0)
        return <div>[]</div>
      if (array[0].date)
        return array.map((item) => <li key={item.date}>{JSON.stringify(item)}</li>);
      else
        return array.map((item) => <li>{JSON.stringify(item)}</li>);

    }

  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid green'
  };
  // style={{display:'flex'}}

  function setIgnore () {
    setIgnoreSaved (!ignoreSaved)
  }


  return (
        <div style={{ border: '2px solid blue'}}> 

          <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
            <h6 style={{color: 'blue'}}> Verify &nbsp;  </h6>
          </div>
          {err && <div style={{color: 'red'}}> {err} </div>}
          {LOG_FLAG && <div>{corsUrl}</div>}
          {LOG_FLAG && <div>{url}</div>}
  
          <br></br>
          <VerifyGain symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} firebaseGainAdd = {props.firebaseGainAdd} 
                  logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>
          
          <br></br> 

          <Splits symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} firebaseGainAdd = {props.firebaseGainAdd} 
                  logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>

          {/* <button type="button" onClick={()=>verify (true)}>verify &nbsp;(Nasdaq)   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyNasdaqTxt)}  </div>
           */}
            <br></br> 
          {/*
          <button type="button" onClick={()=>splitsGet ()}>Splits  </button>  
          {splitInfo && renderList(splitInfo)}
          <div>&nbsp;</div>           */}
          
          {admin && <button type="button" onClick={()=>spikes ()}>Spikes  </button> } 
          {spikeInfo && spikeInfo.length > 0 && renderList(spikeInfo)}
          <div>&nbsp;</div>  
        </div>
  )
}

export default Verify