import React, {useState, useEffect} from 'react'

import LogFlags from '../LogFlags'
import {marketwatchGainValidate, nasdaqTest} from './GainValidateMarketwatch'
import StockSplitsGet from '../splits/StockSplitsGet'
import GetInt from '../utils/GetInt'
import {spikesSmooth, spikesGet} from './Spikes'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'
import {getTargetPriceArray} from './TargetPrice'

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
    const [monGainTxt, setMonGainText] = useState ();
    const [totalMonGain, setTotalMonGain] = useState ();
    const [targetInfo, setTargetInfo] = useState ();
    const [price, setPrice] = useState ();

    var totalGain;
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
      setMonGainText()
      setTotalMonGain()
    },[props.symbol]) 


    function splitsGet () {
      if (! props.symbol) {
        alert ("Missing symbol, press gain for a symbol")
        return;
      }
      StockSplitsGet(props.symbol, props.rows, props.errorAdd, servList[0], true, props.logFlags, setSplitInfo)
    }

    function targetGet (symbol) {
      const tar = getTargetPriceArray (props.symbol, setTargetInfo)

      const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
      if (row_index  === -1)
        return;
      setPrice (props.rows[row_index].values.price)
      // console.log (tar)
      // setTargetInfo (tar)
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

    function nextMonthIndex (i, month) {
      const date = props.stockChartXValues[i];
      if(date === undefined) {
        var b = 1
      }
      const dateSplit_ = dateSplit (date);
      var monthNum = dateSplit_[1];

      for (let j = i; j < props.stockChartXValues.length; j++) {
        const nextDate = props.stockChartXValues[j];
        const nextDateSplit = dateSplit (nextDate);
        const nextMonth = nextDateSplit[1];
        if (nextMonth !== monthNum)
          return j;
      }
      return -1; // error
    }

    function monthGain () {    

    const mGain = [1,1,1,1,1,1, 1,1,1,1,1,1]
    var i = 0;
    for (; i < props.stockChartYValues.length; ) {
      var nextIndex = nextMonthIndex(i);
      if (nextIndex < 0) {
        break;
      }
      const date = props.stockChartXValues[i];
      const dateSplit_ = dateSplit (date);
      const mon = (Number(dateSplit_[1]) - 1 + 12) % 12; 


      if (nextIndex - i >= 3) {
        const p = (props.stockChartYValues[i] / props.stockChartYValues[nextIndex])
        mGain[mon] *= Number(p);
        mGain[mon]= (Number(mGain[mon]))
        const a = 1;
        if (props.logFlags.includes('month')) {
          console.log (props.stockChartXValues[nextIndex], ' ', props.stockChartXValues[i],  '  month:', mon, 'gain:', p.toFixed(2))
        }
      }
      i = nextIndex; 
    }
    const mGainObj = {}
    mGainObj.Jan = Number(mGain[0] + 0.0005).toFixed(2);
    mGainObj.Feb = Number(mGain[1] + 0.0005).toFixed(2);
    mGainObj.Mar = Number(mGain[2] + 0.0005).toFixed(2);
    mGainObj.Apr = Number(mGain[3] + 0.0005).toFixed(2);
    mGainObj.May = Number(mGain[4] + 0.0005).toFixed(2);
    mGainObj.Jun = Number(mGain[5] + 0.0005).toFixed(2);
    mGainObj.Jul = Number(mGain[6] + 0.0005).toFixed(2);
    mGainObj.Aug = Number(mGain[7] + 0.0005).toFixed(2);
    mGainObj.Sep = Number(mGain[8] + 0.0005).toFixed(2);
    mGainObj.Oct = Number(mGain[9] + 0.0005).toFixed(2);
    mGainObj.Nov = Number(mGain[10] + 0.0005).toFixed(2);
    mGainObj.Dec = Number(mGain[11] + 0.0005).toFixed(2); 
    const totalGain = mGain[0] * mGain[1] * mGain[2] * mGain[3] * mGain[4] * mGain[5]
                    * mGain[6] * mGain[7] * mGain[8] * mGain[9] * mGain[10] * mGain[11];
    setTotalMonGain (totalGain.toFixed(3))
    var mGainTxt = JSON.stringify (mGainObj)
    mGainTxt = mGainTxt.replace (/,/g, '  ')
    mGainTxt = mGainTxt.replace (/"/g, '')
    setMonGainText(mGainTxt)
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
          <button type="button" onClick={()=>verify (false)}>verify &nbsp;(MarketWatch)   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyTxt)} &nbsp;  </div>
          <br></br>
          <button type="button" onClick={()=>verify (true)}>verify &nbsp;(Nasdaq)   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyNasdaqTxt)} &nbsp;  </div>
          <br></br>

          <button type="button" onClick={()=>monthGain()}>monthGainCompare</button>
          <div>{monGainTxt} </div>
          {totalMonGain && <div>totalGain: &nbsp;&nbsp; {totalMonGain} </div>}
          <br></br>        
          
          <button type="button" onClick={()=>splitsGet ()}>Splits  </button>  
          {splitInfo && renderList(JSON.parse(splitInfo))}
          <br></br>           <br></br>
          
          <button type="button" onClick={()=>spikes ()}>Spikes  </button>  
          {spikeInfo && spikeInfo.length > 0 && renderList(spikeInfo)}
          <br></br>           <br></br>

          <button type="button" onClick={()=>targetGet ()}>targetPriceHistory  </button> 
          {price && <div>price: {price} </div> }
          {targetInfo && renderList(targetInfo)}
          <br></br>           <br></br>

        </div>
      }
    </div>
  )
}

export default Verify