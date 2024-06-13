import React, {useState, useEffect} from 'react';
import IpContext from '../contexts/IpContext';
import {  useAuth, logout } from '../contexts/AuthContext';

function spikesSmooth (sym, stockChartXValues, stockChartYValues, logFlags) {
  for (let i = 0; i <  stockChartYValues.length - 2; i++) {
      const ratio = Number (stockChartYValues[i+1] / stockChartYValues[i]);
      const ratio_1 = Number (stockChartYValues[i+1] / stockChartYValues[i+2]);
  
      if (ratio > 1.7 && ratio_1 > 1.7) {
          stockChartYValues[i+1] = (stockChartYValues[i] + stockChartYValues[i + 2]) / 2;
          const info = {
              symbol: sym,
              date: stockChartXValues[i],
              jump: ratio.toFixed(2),
              jump_back: (1/ratio_1).toFixed(2),
              index: i,
          }
          
          if (logFlags.includes ('spikes'))
              console.log ('spike smoothed:',  info)
      }
  }
}

function Spikes (props) {
  const LOG_FLAG = props.logFlags && props.logFlags.includes('verify_1');

  const [spikeInfo, setSpikesInfo] = useState ([]);
  const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
  const { currentUser, admin, logout } = useAuth();


  useEffect(() => {

    setSpikesInfo([])
  },[props.symbol]) 


  function spikesGet (symbol, stockChartXValues, stockChartYValues, logFlags) {
    if (! symbol) {
      alert ("Missing symbol, press gain for a symbol")
      return;
    }
    var spikes = [];


    for (let i = 0; i <  stockChartYValues.length - 2; i++) {

      const ratio = Number (stockChartYValues[i+1] / stockChartYValues[i]);
      const ratio_1 = Number (stockChartYValues[i+1] / stockChartYValues[i+2]);

      if (ratio > 1.7 && ratio_1 > 1.7) {  //  spike?
        const info = {
          date: stockChartXValues[i],
          jump: ratio.toFixed(2),
          jump_back: (1/ratio_1).toFixed(2),
          index: i,
          // y: props.stockChartYValues[i],
          // y1: props.stockChartYValues[i+1],
          // y2: props.stockChartYValues[i+2],
        }

        // if (spikes.length === 0)
        //   spikes.push(props.symbol)
        spikes.push (info)

        // if (info.jump > 1)
        //   console.log ('%c' + JSON.stringify(info), 'background: #fff; color: #22ff11')
        // else
        //   console.log ('%c' + JSON.stringify(info), 'background: #fff; color: #ee1122')
      }
      else { // check for jump
        if (ratio > 1.7 || ratio <  1/1.7) {
        const info = {
          date: stockChartXValues[i],
          jump: ratio.toFixed(2),
          index: i,
        }
        spikes.push (info)

        }      
      }
    }
    if (logFlags.includes('spikes') && spikes.length > 0) {
      console.log ('spikes:', spikes)
    }
    return spikes;
  }
  
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
        <h5>Spikes</h5>      
        {eliHome && <button type="button" onClick={()=>spikes ()}>Spikes  </button> } 
        {spikeInfo && spikeInfo.length > 0 && renderList(spikeInfo)}
        <div>&nbsp;</div>  
      </div>
)

}

export {Spikes, spikesSmooth}