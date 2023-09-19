import React, {useState, } from 'react'

import LogFlags from '../LogFlags'
import {marketwatchGainValidate} from './GainValidateMarketwatch'
import StockSplitsGet from '../splits/StockSplitsGet'
import GetInt from '../utils/GetInt'

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


    const LOG_FLAG = props.logFlags && props.logFlags.includes('verify_1');
    const [displayFlag, setDisplayFlag] = useState (false); 
    const [verifyTxt, setVerifyText] = useState ();
    const [splitInfo, setSplitInfo] = useState ();
    const [spikeInfo, setSpikesInfo] = useState ([]);

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

      for (let i = 0; i <  props.stockChartYValues.length - 2; i++) {
        setSpikesInfo();
        const ratio = Number (props.stockChartYValues[i+1] / props.stockChartYValues[i]);
        const ratio_1 = Number (props.stockChartYValues[i+1] / props.stockChartYValues[i+2]);

        if (ratio > 1.7 && ratio_1 > 1.7) {
          const info = {
            date: props.stockChartXValues[i],
            jump: ratio.toFixed(2),
            jump_1: ratio_1.toFixed(2),
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
      }
      if (spikes.length > 0) {
        setSpikesInfo (spikes)
        console.log (spikes)
      }
    }

    function renderList(array) {
      return array.map((item) => <li>{JSON.stringify(item)}</li>);
    }

// swap first, and force others columns in group to follow
function toggleverifyColumns ()  {
  var ind = props.allColumns.findIndex((column)=> column.Header === 'alphaDate');
  const isInvisible_ = props.allColumns[ind].isVisible;
  props.allColumns[ind].toggleHidden();

  ind = props.allColumns.findIndex((column)=> column.Header === 'alphaPrice');
  var isInvisible = props.allColumns[ind].isVisible;
  if (isInvisible === isInvisible_)
  props.allColumns[ind].toggleHidden();

  // ind = allColumns.findIndex((column)=> column.Header === 'verifyDate');
  // isInvisible = allColumns[ind].isVisible;
  // if (isInvisible === isInvisible_)
  //   allColumns[ind].toggleHidden();

  ind = props.allColumns.findIndex((column)=> column.Header === 'verifyPrice');
  isInvisible = props.allColumns[ind].isVisible;
  if (isInvisible === isInvisible_)
  props.allColumns[ind].toggleHidden();

  ind = props.allColumns.findIndex((column)=> column.Header === 'verify_1');
  isInvisible = props.allColumns[ind].isVisible;
  if (isInvisible === isInvisible_)
  props.allColumns[ind].toggleHidden();
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
          <br></br>
          <div style={{display:'flex'}}>
            <button type="button" className="CompareColumns" onClick={()=>toggleverifyColumns()}>toggleVerifyColumns  </button>
            &nbsp; &nbsp;
            <GetInt init={props.verifyDateOffset} callBack={props.setVerifyDateOffset} title='verifyOffset' pattern="[-]?[0-9]+"/>
            &nbsp; &nbsp; &nbsp;
            <button type="button" onClick={()=>verify ()}>verify {props.symbol}  </button>
          </div>
          <div  style={{display:'flex' }}>  {verifyTxt} &nbsp;  </div>
          <br></br>
          <button type="button" onClick={()=>splitsGet ()}>Splits {props.symbol}  </button>  
          {splitInfo && renderList(JSON.parse(splitInfo))}
          <br></br>           <br></br>
          <button type="button" onClick={()=>spikes ()}>Spikes {props.symbol}  </button>  
          {spikeInfo.length > 0 && renderList(spikeInfo)}
        </div>
      }
    </div>
  )
}

export default Verify