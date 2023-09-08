import React, {useState, } from 'react'

import LogFlags from '../LogFlags'
import {marketwatchGainValidate} from './GainValidateMarketwatch'
import StockSplitsGet from '../splits/StockSplitsGet'

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


    const LOG_FLAG = props.logFlags.includes('verify_1');
    const [displayFlag, setDisplayFlag] = useState (false); 
    const [verifyTxt, setVerifyText] = useState ();
    const [splitInfo, setSplitInfo] = useState ();
    const [spikeInfo, setSpikesInfo] = useState ();

    const servList = ['dinagold.org', '84.95.84.236', 'localhost', ];

    function verify () {
        // <Verify symbol = {chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues} 
        //   stockChartYValues = {stockChartYValues} logFlags = {logFlags} errorAdd={errorAdd}/>

        //marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, verifyDateOffset,
        //refreshByToggleColumns, firebaseGainAdd, servSelect, ssl, logFlags, errorAdd);

        if (! props.symbol) {
            alert ("Missing symbol, press gain for a symbol")
            return;
        }
        marketwatchGainValidate (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues, props.verifyDateOffset,
             props.refreshByToggleColumns, props.firebaseGainAdd, servList[0], true, props.logFlags, props.errorAdd, setVerifyText);
    }

    
    function splitsGet () {
      if (! props.symbol) {
        alert ("Missing symbol, press gain for a symbol")
        return;
      }
      StockSplitsGet(props.symbol, props.rows, props.errorAdd, servList[0], true, props.logFlags, setSplitInfo)
    }

    function spikes () {
      if (! props.symbol) {
        alert ("Missing symbol, press gain for a symbol")
        return;
      }
      var spikes = [];
      for (let i = 0; i <  props.stockChartYValues.length - 1; i++) {
        setSpikesInfo();
        const ratio = props.stockChartYValues[i] / props.stockChartYValues[i+1];
        if (ratio > 1.5 || ratio < 0.5) {
          const info = {
            jump: ratio.toFixed(3),
            index: i,
            y: props.stockChartYValues[i],
            y1: props.stockChartYValues[i+1],
            date: props.stockChartXValues[i],
          }

          if (spikes.length == 0)
            spikes.push(props.symbol)
          spikes.push (info)
        }
      }
      if (spikes.length > 0) {
        setSpikesInfo (JSON.stringify(spikes))
        console.log (spikes)
      }
    }



  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid green'
  };
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

  return (
    <div style = {style} id='verify_id' >
      <div>
        <input
            type="checkbox" checked={displayFlag}
            onChange={displayFlagChange}
        /> Verify
      </div>

      {displayFlag && 
        <div> 
          {props.symbol && <div> {props.symbol}</div>}             

          <button type="button" onClick={()=>verify ()}>verify {props.symbol}  </button>
          <div  style={{display:'flex' }}>  {verifyTxt} &nbsp;  </div>
          <br></br>
          <button type="button" onClick={()=>splitsGet ()}>Splits {props.symbol}  </button>  
          <div  style={{display:'flex' }}>  {splitInfo} &nbsp;  </div>
          <br></br>
          <button type="button" onClick={()=>spikes ()}>Spikes {props.symbol}  </button>  
          <div  style={{display:'flex' }}>  {spikeInfo} &nbsp;  </div>
        </div>
      }
    </div>
  )
}

export default Verify