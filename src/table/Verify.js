import React, {useState, useEffect} from 'react'

import LogFlags from '../utils/LogFlags'
import {VerifyGain} from './GainValidateMarketwatch'
import {Splits} from './StockSplits'

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

    const [spikeInfo, setSpikesInfo] = useState ([]);
    const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
    const { currentUser, admin, logout } = useAuth();


    useEffect(() => {

      setSpikesInfo([])
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

  return (
        <div>      
          {eliHome && <button type="button" onClick={()=>spikes ()}>Spikes  </button> } 
          {spikeInfo && spikeInfo.length > 0 && renderList(spikeInfo)}
          <div>&nbsp;</div>  
        </div>
  )
}

export default Verify