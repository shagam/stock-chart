import React, {useState, useEffect} from 'react'

import LogFlags from '../utils/LogFlags'
import {marketwatchGainValidate, nasdaqTest} from './GainValidateMarketwatch'
import StockSplitsGet from '../splits/StockSplitsGet'
import GetInt from '../utils/GetInt'
import {spikesSmooth, spikesGet} from './Spikes'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import {getTargetPriceArray, targetHistAll} from './TargetPrice'
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
    const [displayFlag, setDisplayFlag] = useState (false); 
    const [verifyTxt, setVerifyText] = useState ({});
    const [verifyNasdaqTxt, setVerifyNasdaqText] = useState ({});
    const [splitInfo, setSplitInfo] = useState ([]);
    const [spikeInfo, setSpikesInfo] = useState ([]);
    const [corsUrl, setCorsUrl] = useState ();
    const [url, setUrl] = useState ();
    const [err, setErr] = useState ();
    const [ignoreSaved, setIgnoreSaved] = useState ();
    const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
    const { currentUser, admin, logout } = useAuth();

    function verify (nasdaq) {
      const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
      if (row_index  === -1)
        return;
      if  (nasdaq && props.rows[row_index].values.Exchange !== 'NASD') {
        console.log (props.symbol, props.rows[row_index].values.Exchange)
        props.errorAdd ([props.symbol, 'Allowed Only for NASDAQ (press <info> for a stock to see Exchange)'])
        return;
      }

      // setVerifyText()
      // setVerifyNasdaqText()
      if (! props.symbol) {
          alert ("Missing symbol, press gain for a symbol")
          return;
      }
      
        // var url = "https://bigcharts.marketwatch.com/historical/default.asp?symb=" + props.symbol
        // url += '&closeDate=' + req.query.mon
        // url += '%2F' + req.query.day
        // url += '%2F' + req.query.year
      setErr('Request sent to server')
      if (! nasdaq) {
        setUrl ("https://bigcharts.marketwatch.com/historical/default.asp?symb=" + props.symbol + '&closeDate=' + '5/25/2010')  // save url for debug
        setCorsUrl ('https://' + props.servSelect + ":" + props.PORT + "/price?stock=" + props.symbol + "&year=2010&mon=5&day=25")   // save url for debug
        marketwatchGainValidate (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues, props.verifyDateOffset,
          props.refreshByToggleColumns, props.firebaseGainAdd, props.servSelect, props.PORT, props.ssl, props.logFlags, props.errorAdd, setVerifyText, nasdaq, setErr, ignoreSaved);
        }
      else {
        setCorsUrl  ('https://' + props.servSelect + ":" + props.PORT + "/priceNasdaq?stock=" + props.symbol)
        marketwatchGainValidate (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues, props.verifyDateOffset,
          props.refreshByToggleColumns, props.firebaseGainAdd, props.servSelect, props.PORT, props.ssl, props.logFlags, props.errorAdd, setVerifyNasdaqText, nasdaq, setErr, ignoreSaved);
        }
    }

    function verifyTest () {
      nasdaqTest();
    }

    useEffect(() => {
      setVerifyText()
      setVerifyNasdaqText()
      setSplitInfo();
      setSpikesInfo([])
      setUrl()
      setCorsUrl()
      setErr()
    },[props.symbol]) 


    function splitsGet () {
      if (! props.symbol) {
        alert ("Missing symbol, press gain for a symbol")
        return;
      }
      setErr('Request sent to server')
      setCorsUrl ("https://" + props.servSelect + ":" + props.PORT + "/splits?stock=" + props.symbol)
      setUrl ("https://www.stocksplithistory.com/?symbol=" + props.symbol)

      StockSplitsGet(props.symbol, props.rows, props.errorAdd, props.servSelect,
         props.PORT, props.ssl, props.logFlags, setSplitInfo, setErr, ignoreSaved)
         if (LOG_FLAG)
          console.log (splitInfo)
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
          <div style={{display:'flex'}}>
              {eliHome &&  <input type="checkbox" checked={ignoreSaved}  onChange={setIgnore}  />  } &nbsp;IgnoreSaved &nbsp; &nbsp;
              <button style={{height: '7%', marginTop: '6px'}} type="button" className="CompareColumns" onClick={()=>toggleverifyColumns()}>toggleVerifyColumns</button> &nbsp;&nbsp;
              <GetInt init={props.verifyDateOffset} callBack={props.setVerifyDateOffset} title='verifyOffset' type='Number' pattern="[-]?[0-9]+"/>
          </div>   
          <br></br>

          <button type="button" onClick={()=>verify (false)}>verify &nbsp;   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyTxt)}  </div>
          <br></br>  
    
          {/* <button type="button" onClick={()=>verify (true)}>verify &nbsp;(Nasdaq)   </button>
          <div  style={{display:'flex' }}>  {JSON.stringify(verifyNasdaqTxt)}  </div>
          <br></br>   */}
  
          <button type="button" onClick={()=>splitsGet ()}>Splits  </button>  
          {splitInfo && renderList(splitInfo)}
          <div>&nbsp;</div>          
          
          {admin && <button type="button" onClick={()=>spikes ()}>Spikes  </button> } 
          {spikeInfo && spikeInfo.length > 0 && renderList(spikeInfo)}
          <div>&nbsp;</div>  
        </div>
  )
}

export default Verify