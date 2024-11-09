import React, {useState, useEffect} from 'react'
import axios from 'axios'
// import cors from 'cors'
// import {dateSplit, formatDate} from '../utils/Date'
// import {format} from "date-fns"
import {IpContext} from '../contexts/IpContext';
import {useAuth, logout} from '../contexts/AuthContext';

// import GetInt from '../utils/GetInt'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

function Futures (props) {
    const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
    const { currentUser, admin, logout } = useAuth();

    const [url, setUrl] = useState ();
    // const [url, setUrl] = useState ();
    const [err, setErr] = useState ();

    const [futuresTxt, setFuturesText] = useState ({});

    const [ignoreSaved, setIgnoreSaved] = useState ();
    const [logBackEnd, setLogBackEnd] = useState ();
    const [saveInFile, setSaveInFile] = useState ();
    const [latency, setLatency] = useState ();
  
    const LOG = props.logFlags.includes("futures");

    //** selevt future sym */
    const futuresSymList = 
    {
      // NQ: 'today',
      // MNQ: 'today',
      // '$NDX': 'today',
      // '$IXIC': 'today',
  
      NQZ24: 'Dec 24',
      NQH25: 'Mar 25',
      NQM25: 'Jun 25',
      NQU25: 'Sep 25',
      NQZ25: 'Dec 25',
      NQH26: 'Mar 26',
      '$IUXX': 'today',
    }
  
    const symList = Object.keys(futuresSymList)
    var dateList = [];
    for (let i = 0; i < symList.length; i++)
      dateList.push(symList[i] + '_' + futuresSymList[symList[i]])
  
    const [futureSym, setFutureSym]  = useState(symList[0]);
  
    useEffect (() => {
        setFuturesText()
        setLatency()
      }, [futureSym])

      

    //** Get nasdaq futures contract */
    // https://www.barchart.com/futures/quotes/
    function nasdaqFutures() {
      var url
      if (props.ssl) 
        url = "https://";
      else 
      url = "http://"; 
      url += props.servSelect + ":" + props.PORT + "/futures?stock=" + futureSym
      if (saveInFile)
        url += '&saveInFile=true';
      if (logBackEnd)
        url += '&LOG=true';
  
        //corsUrl = "http://localhost:5000/price?stock=" + sym
        // console.log (getDate(), corsUrl)     
        if (ignoreSaved)
          url += '&ignoreSaved=true';
  
        if (logBackEnd)
          console.log (url) // log the url

        const mili = Date.now()
        if(LOG)  
          setUrl('https://www.barchart.com/futures/quotes/' + futureSym)  // save url for debug

        axios.get (url)
        .then ((result) => {
          setErr()
          if (result.data) {
            console.log (result.data)
          }
          const ver = {}
          if (result.data.err === "No data") {
            props.stockChartXValues([props.symbol, 'verify marketwatch', result.data.err])
            return;
          }
  
          const latency = Date.now() - mili
          setLatency('futures done, latency(msec)=' + latency)

          if ((result.data !== '') && ! result.data.err) {
  
            // result.data['a'] = 'b'
            setFuturesText(result.data)
  
           }
        })
    }

    //** test function */
    function urlGetParse () {
      var url
      if (props.ssl) 
        url = "https://";
      else 
      url = "http://"; 

      const serverUrl = 'https://www.barchart.com/futures/quotes/' + futureSym
      // const pattern = '"lastPrice\\\\":\\\\"([0-9\\.,]+)'
      var pattern = '"symbolName":"Nasdaq 100 E-Mini","lastPrice":"([0-9\\.,]+)","symbol":'
      pattern = '"lastPrice":"([0-9\\.,]\\+)'
      url += props.servSelect + ":" + props.PORT + "/urlGetParse?stock=" + futureSym + '&url=' + serverUrl + '&pattern=' + pattern

      if (saveInFile)
        url += '&saveInFile=true';
      if (logBackEnd)
        url += '&LOG=true';
     
      if (ignoreSaved)
        url += '&ignoreSaved=true';

      if (logBackEnd)
        console.log (url) // log the url

      const mili = Date.now()
      if(LOG)  
        setUrl('https://www.barchart.com/futures/quotes/' + futureSym)  // save url for debug

      axios.get (url)
      .then ((result) => {
        setErr()
        if (result.data) {
          console.log (result.data)
        }
        const ver = {}
        if (result.data.err === "No data") {
          props.stockChartXValues([props.symbol, 'verify marketwatch', result.data.err])
          return;
        }

        const latency = Date.now() - mili
        setLatency('futures done, latency(msec)=' + latency)

        if ((result.data !== '') && ! result.data.err) {

          // result.data['a'] = 'b'
          setFuturesText(result.data)

          }
      })
    }

    return (
        <div>
            {/* <hr/>  */}
            <h5>Nasdaq futures  </h5>

            {LOG && <div>{url}</div>}
            {err && <div style={{color: 'red'}}> {err} </div>}
            {latency && <div style={{color: 'red'}}> {latency} </div>}

            <div style={{display:'flex'}}>
                {eliHome && <div>  &nbsp; <input  type="checkbox" checked={ignoreSaved}  onChange={()=> setIgnoreSaved(! ignoreSaved)}  />  &nbsp;IgnoreSaved  &nbsp; </div>}
                {eliHome &&  <div> <input type="checkbox" checked={logBackEnd}  onChange={()=> setLogBackEnd( !logBackEnd)}  />  &nbsp;LogBackend &nbsp; &nbsp; </div>}
                {eliHome &&  <input type="checkbox" checked={saveInFile}  onChange={()=>setSaveInFile (! saveInFile)}  />  }&nbsp;SaveInFile &nbsp; &nbsp;
            </div>


            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>  &nbsp; Get last price of Nasdaq futures  &nbsp; </h6>
            {eliHome && <div style={{display:'flex'}}> <ComboBoxSelect serv={futureSym} nameList={dateList} setSelect={setFutureSym} title='futureSelect' options={Object.keys(futuresSymList) } defaultValue={futureSym}/> </div>}
        
            <button style={{background: 'aqua'}} type="button" onClick={()=> nasdaqFutures()}>Nasdaq-future  </button>  &nbsp;
            <button style={{background: 'aqua'}} type="button" onClick={()=> urlGetParse()}>urlGetParse  </button>  &nbsp;

            {futuresTxt && <div>futures  <pre>{JSON.stringify(futuresTxt, null, 2)}</pre> </div>}
        </div>
    )
}

export {Futures}