import React, {useState, useEffect} from 'react'
import axios from 'axios'
// import cors from 'cors'
import {dateSplit, formatDate} from '../utils/Date'
import {format} from "date-fns"
import IpContext from '../contexts/IpContext';
import {  useAuth, logout } from '../contexts/AuthContext';

import GetInt from '../utils/GetInt'


  function reverseSplit (splits) {
    if (! splits)
      return false;
    const splits_list = JSON.parse(splits)
    for (let n = 0; n < splits_list.length; n++) { 
      if (splits_list[n].ratio < 1)
        return true;
    }
    return false;
  }

function VerifyGain (props) {
  const [corsUrl, setCorsUrl] = useState ();
  const [url, setUrl] = useState ();
  const [err, setErr] = useState ();
  const [verifyTxt, setVerifyText] = useState ({});
  const [verifyNasdaqTxt, setVerifyNasdaqText] = useState ({});
  const [ignoreSaved, setIgnoreSaved] = useState ();
  const [verifyDateOffset, setVerifyDateOffset ] = useState(Number(-1));  // last entry by default
  const [updateDate, setUpdateDate] = useState ();

  const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
  const { currentUser, admin, logout } = useAuth();

  const LOG = props.logFlags.includes("verify_1");
    

  function marketwatchGainValidate (nasdaq) {

    // setError();

    // choose entry for compare
    var entry = props.stockChartXValues.length - 1;
    var requestedEntry = Number(verifyDateOffset)
    if (requestedEntry === 0)
      entry = props.stockChartXValues.length - 1;
    if (requestedEntry < 0) { // negative go back from end
      if (requestedEntry + props.stockChartXValues.length > 0)
        entry = props.stockChartXValues.length + requestedEntry;
      else {
        entry = 0;
        console.log ('out of range', props.stockChartXValues.length - 1);
      }
    }
    else { // positive: use requested entry if possible.
      if (requestedEntry < props.stockChartXValues.length)
        entry = requestedEntry;
      else {
        entry = props.stockChartXValues.length - 1;
        console.log ('out of range', props.stockChartXValues.length - 1);
      }
    }

    const limitTxt = entry === props.stockChartXValues.length - 1 ? '' :  'limit: ' + (props.stockChartXValues.length - 1)
    if (LOG)
    console.log (props.symbol, 'AlphaVantage price, requesIndx=', requestedEntry, 'entry=', entry, props.stockChartXValues[entry], 'val', props.stockChartYValues[entry], limitTxt)


    const oldestDate = props.stockChartXValues[entry];
    const oldestDateComponets = dateSplit(oldestDate) // [year, month, day]
    const year = oldestDateComponets[0]
    const mon = oldestDateComponets[1]
    const day = oldestDateComponets[2]

    var corsUrl;
    // if (corsServer === 'serv.dinagold.org')
    if (props.ssl) 
      corsUrl = "https://";
    else 
      corsUrl = "http://"; 

    if (! nasdaq)
      corsUrl += props.servSelect + ":" + props.PORT + "/price?stock=" + props.symbol
    else
      corsUrl += props.servSelect + ":" + props.PORT + "/priceNasdaq?stock=" + props.symbol

    // var corsUrl = "http://62.0.92.49:5000/price?stock=" + sym
      //corsUrl = "http://localhost:5000/price?stock=" + sym
      corsUrl += "&year=" + year + "&mon=" + mon + "&day=" + day;
      // console.log (getDate(), corsUrl)
      
      if (ignoreSaved)
        corsUrl += '&ignoreSaved=true';

    if (LOG)
    console.log (props.symbol, corsUrl)
      axios.get (corsUrl)
      .then ((result) => {
        setErr()
        if (result.data) {
          console.log (props.symbol, JSON.stringify(result.data), formatDate (new Date(result.data.updateMili)))
          setUpdateDate(formatDate (new Date(result.data.updateMili)))
        }
        
        if (result.data.err === "No data") {
          props.stockChartXValues([props.symbol, 'verify marketwatch', result.data.err])
          return;
        }
        // console.log ("Price Compare", getDate(), year, mon, day,
        // 'other=', result.data.open, 'alpha=', stockChartYValuesFunction[entry])
        const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
        if (result.data.err)
          console.log (props.symbol, result.data, corsUrl) 
        var closeValue = result.data.close;
        if ((result.data !== '' || ! props.stockChartXValues) && ! result.data.err) {
          // if (nasdaq) {
          //   const splitsArray = JSON.parse(rows[row_index].values.splits_list)
          //   // compensate for splits
          //   const oldestDateSplit = dateSplit(oldestDate)
          //   for (let i = 0; i < splitsArray.length; i++) {
          //     const oneSplit = splitsArray[i];
          //     const oneSplitDate = dateSplit (oneSplit.date)
          //     if (oneSplitDate[0] < oldestDateSplit[0])  // skip old splits
          //       continue;
          //     if (oneSplitDate[1] < oldestDateSplit[1])
          //       continue;
          //     if (oneSplitDate[2] < oldestDateSplit[2])
          //       continue;
          //     closeValue /= oneSplit.ratio;
          //   }
          // }

          const alphaDate = props.stockChartXValues[entry];
          const alphaPrice = Number(props.stockChartYValues[entry]).toFixed(2);

          props.rows[row_index].values.verifyDate = oldestDate;
          props.rows[row_index].values.verifyPrice = closeValue;

          // const alphaPrice = stockChartYValuesFunction[stockChartYValuesFunction.length - backIndex]
          props.rows[row_index].values.alphaDate = alphaDate;
          props.rows[row_index].values.alphaPrice = alphaPrice;
  
          var p = Number(alphaPrice / closeValue).toFixed(2)

          //MarketWatch fail whenReverse split
          if (reverseSplit(props.rows[row_index].values.splits_list)) {
            props.rows[row_index].values.verify_1 = 'Rv-split';
          }
          else  
          props.rows[row_index].values.verify_1 = Number(p);
          props.rows[row_index].values.verifyUpdateMili = Date.now();

          const searcDate = year + '-' + mon + '-' + day;
    
          // build return object
          const ver = {};

          ver['sym'] = props.symbol;
          ver['date'] = alphaDate

          ver['alphaPrice'] = alphaPrice

          if (!nasdaq)
            ver['verifyPrice'] = props.rows[row_index].values.verifyPrice;
          else
            ver['nasdaqPrice'] = props.rows[row_index].values.verifyPrice;

          ver['week'] = entry;
          ver['max'] = props.stockChartXValues.length - 1
          ver['verify_1'] = p

          if (p < 0.85 || p > 1.2)
            setErr('Verify_1 mismatch. Too far from "1" ')

          if (LOG) {
            console.log (ver)
          }

            setVerifyText(ver)

          if (props.rows[row_index].values.verifyDate !== props.rows[row_index].values.alphaDate) {
            console.log (props.rows[row_index].values.verifyDate) }
            
          // firebaseGainAdd(sym, 'validate');
        }
        else {
          props.rows[row_index].values.verify_1 = -1;
          props.rows[row_index].values.verifyUpdateMili = Date.now(); // update fresh info even if no data
        }
      })
      .catch ((err) => {
        console.log(err, corsUrl)
        props.errorAdd([err.message])
      })

      props.refreshByToggleColumns();
  }

  function nasdaqTest () {
    const url='https://data.nasdaq.com/api/v3/datasets/WIKI/NVDA/data.json?start_date=2010-05-01&end_date=2024-2-2&limit=1'
    axios.get (url)
    .then ((result) => {
      const res_date = result.data.dataset_data.data[0][0];
      const res_open = result.data.dataset_data.data[0][8].toFixed(2);
      const res_close = result.data.dataset_data.data[0][11].toFixed(2);
      console.log("\n",result.data.dataset_data.column_names, result.data.dataset_data.data,
          res_date, res_open, res_close)

    })
  }


  function setIgnore () {
    setIgnoreSaved (!ignoreSaved)
  }

  useEffect(() => {
    setVerifyText()
    setVerifyNasdaqText()
    setUrl()
    setCorsUrl()
    setErr()
    setUpdateDate()
  },[props.symbol]) 


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
      marketwatchGainValidate (nasdaq);
      }
    else {
      setCorsUrl  ('https://' + props.servSelect + ":" + props.PORT + "/priceNasdaq?stock=" + props.symbol)
      marketwatchGainValidate ( nasdaq);
      }
  }

  function verifyTest () {
    nasdaqTest();
  }



  return (
    <div>
      {LOG && <div>{corsUrl}</div>}
      {LOG && <div>{url}</div>}
      {err && <div style={{color: 'red'}}> {err} </div>}
      <div style={{display:'flex'}}>
          {eliHome &&  <input type="checkbox" checked={ignoreSaved}  onChange={setIgnore}  />  } &nbsp;IgnoreSaved &nbsp; &nbsp;

          <GetInt init={verifyDateOffset} callBack={setVerifyDateOffset} title='verifyOffset' type='Number' pattern="[-]?[0-9]+"/>
      </div> 

      <button type="button" onClick={()=>verify (false)}>verify   </button>  &nbsp;
      <button style={{height: '7%', marginTop: '6px'}} type="button" className="CompareColumns" onClick={()=>toggleverifyColumns()}>toggleVerifyColumns</button> &nbsp;&nbsp;
      <div  style={{display:'flex' }}>  {JSON.stringify(verifyTxt)}  </div> 
      {updateDate&& <div>Update: {updateDate}</div>}
    </div>
  )
}

export {VerifyGain}