import React, {useState, useEffect} from 'react'

import LogFlags from '../LogFlags'
import {marketwatchGainValidate, nasdaqTest} from './GainValidateMarketwatch'
import StockSplitsGet from '../splits/StockSplitsGet'
import GetInt from '../utils/GetInt'
import {spikesSmooth, spikesGet} from './Spikes'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'
import {getTargetPriceArray, targetHistAll} from './TargetPrice'

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
    const [displayFlag, setDisplayFlag] = useState (false); 
    const [verifyTxt, setVerifyText] = useState ({});
    const [verifyNasdaqTxt, setVerifyNasdaqText] = useState ({});
    const [splitInfo, setSplitInfo] = useState ();
    const [spikeInfo, setSpikesInfo] = useState ([]);

    const servList = ['dinagold.org', '84.95.84.236', 'localhost', ];

    function verify (nasdaq) {
      const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
      if (row_index  === -1)
        return;
      if  (nasdaq && props.rows[row_index].values.Exchange !== 'NASD') {
        console.log (props.symbol, props.rows[row_index].values.Exchange)
        props.errorAdd (['Allowed Only for NASDAQ (press <info> for a stock to see Exchange)'])
        return;
      }

      // setVerifyText()
      // setVerifyNasdaqText()
      if (! props.symbol) {
          alert ("Missing symbol, press gain for a symbol")
          return;
      }
      if (! nasdaq)
        marketwatchGainValidate (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues, props.verifyDateOffset,
          props.refreshByToggleColumns, props.firebaseGainAdd, servList[0], true, props.logFlags, props.errorAdd, setVerifyText, nasdaq);
      else
        marketwatchGainValidate (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues, props.verifyDateOffset,
          props.refreshByToggleColumns, props.firebaseGainAdd, servList[0], true, props.logFlags, props.errorAdd, setVerifyNasdaqText, nasdaq);
    }

    function verifyTest () {
      nasdaqTest();
    }

    useEffect(() => {
      setVerifyText()
      setVerifyNasdaqText()
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
        <div style={{ border: '2px solid blue'}}> 

          <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
            <h6 style={{color: 'blue'}}> Verify &nbsp;  </h6>
          </div>
 
          <div style={{display:'flex'}}>
            <GetInt init={props.verifyDateOffset} callBack={props.setVerifyDateOffset} title='verifyOffset' pattern="[-]?[0-9]+"/>
            &nbsp; &nbsp; &nbsp;
            <button style={{height: '4vh', marginTop: '6px'}} type="button" className="CompareColumns" onClick={()=>toggleverifyColumns()}>toggleVerifyColumns  </button>
          </div>   
          <br></br>

          <button type="button" onClick={()=>verify (false)}>verify &nbsp;(MarketWatch)   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyTxt)}  </div>
          <br></br>  
    
          <button type="button" onClick={()=>verify (true)}>verify &nbsp;(Nasdaq)   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyNasdaqTxt)}  </div>
          <br></br>  
  
          <button type="button" onClick={()=>splitsGet ()}>Splits  </button>  
          {splitInfo && renderList(JSON.parse(splitInfo))}
          <div>&nbsp;</div>          
          
          <button type="button" onClick={()=>spikes ()}>Spikes  </button>  
          {spikeInfo && spikeInfo.length > 0 && renderList(spikeInfo)}
          <div>&nbsp;</div>  
        </div>
  )
}

export default Verify