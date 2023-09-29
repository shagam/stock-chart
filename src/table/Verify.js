import React, {useState, useEffect} from 'react'

import LogFlags from '../LogFlags'
import {marketwatchGainValidate} from './GainValidateMarketwatch'
import StockSplitsGet from '../splits/StockSplitsGet'
import GetInt from '../utils/GetInt'
import {spikesSmooth, spikesGet} from './Spikes'

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
    const [verifyTxt, setVerifyText] = useState ({});
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

    useEffect(() => {
      setVerifyText()
      setSplitInfo();
      setSpikesInfo([])
    },[props.symbol]) 


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
      var spikes =  spikesGet (props.symbol, props.stockChartXValues, props.stockChartYValues, props.logFlags);
      // if (spikes.length > 0) {
      //   setSpikesInfo (spikes)
      //   console.log ('spikes:', spikes)
      // }
    }

    function renderList(array) {
      if (array.length < 1)
        return;
      if (array[0].date)
        return array.map((item) => <li key={item.date}>{JSON.stringify(item)}</li>);
      else
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
          {props.symbol && <div  style={{color: 'magenta' }}> {props.symbol}</div>}   
          <div style={{display:'flex'}}>
            <GetInt init={props.verifyDateOffset} callBack={props.setVerifyDateOffset} title='verifyOffset' pattern="[-]?[0-9]+"/>
            &nbsp; &nbsp; &nbsp;
            <button type="button" className="CompareColumns" onClick={()=>toggleverifyColumns()}>toggleVerifyColumns  </button>
            {/* &nbsp; &nbsp; */}
          </div>
          <br></br>
          <button type="button" onClick={()=>verify ()}>verify   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyTxt)} &nbsp;  </div>
          <br></br>
          <button type="button" onClick={()=>splitsGet ()}>Splits  </button>  
          {splitInfo && renderList(JSON.parse(splitInfo))}
          <br></br>           <br></br>
          <button type="button" onClick={()=>spikes ()}>Spikes  </button>  
          {spikeInfo && spikeInfo.length > 0 && renderList(spikeInfo)}
        </div>
      }
    </div>
  )
}

export default Verify