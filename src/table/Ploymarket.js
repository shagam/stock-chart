import React, { useEffect, useState } from "react";

import axios from "axios";
import {getDate} from '../utils/Date'

// const QQQ_MARKET_ID = "YOUR_QQQ_MARKET_ID_HERE"; 
const QQQ_MARKET_ID = "0x1234567890abcdef1234567890abcdef12345678";

// Example: "0x1234..." — give me your market link and I’ll extract it for you.
// _QqqTrendButton
 function Polymarket(props) {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [latency, setLatency] = useState('')

  const fetchTrend = async () => {
    setLoading(true);
    var url = 'https://polymarket.com/event/ndx-above-dec-2026' + '-15000/trend'
    url =  'https://polymarket.com/event/ndx-above-dec-2026' 
    const mili = Date.now()
    // try {

     var corsUrl = "https://";
        corsUrl += props.servSelect+ ":" + props.PORT + '/polymarket'; 
        corsUrl += '?url=' + url
        if (log)
            corsUrl += '&log=1'


        if (log)
        console.log (getDate(), 'gainFilter', corsUrl)

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;
            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                setResults(null)
                return;
            }
            if (log) {
                console.log('result', result.data)
            }

            setResults(result.data)
            setLoading(false)

            const latency = Date.now() - mili
            setLatency('polymarket done, latency(msec)=' + latency)
            // beep2();
        }).catch ((err) => {

            setError(getDate() + ' ' + err.message)
            console.log(getDate(), err.message)
        })


      // const res = await axios.get( url,

        // "https://polymarket.com/event/ndx-above-dec-2026-15000/trend",
        // {
        //   params: {
        //     market: QQQ_MARKET_ID,
        //     interval: "1h",
        //     fidelity: "1"
        //   }
        // }
      // );

 
    // } catch (err) {
    //   console.error("Error fetching QQQ trend:", err);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div style={{border: '2px solid green'  }}>
        <h6 style={{color: 'blue'}}> ploymarket &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; ploymarket &nbsp; </h6>
        {error && <div style={{color:'red'}}> {error} </div>}
        {latency}
      {props.eliHome && <div style={{display:'flex'}}> <input  type="checkbox" checked={log}  onChange={()=> setLog(! log)} />  log &nbsp; </div>}

      <button onClick={fetchTrend} disabled={loading}>
        {loading ? "Loading…" : "Load QQQ Trend"}
      </button>

      <ul style={{ marginTop: 20 }}>
        {trend.map((point, i) => (
          <li key={i}>
            {new Date(point.t).toLocaleString()} → {point.p}
          </li>
        ))}
      </ul>
      {results && <pre style={{color:'green'}}>  {results.length} </pre> }
      {results && results.data && <b> {results.data}</b> }
      {results && results.data && <div dangerouslySetInnerHTML={{ __html:results.data }}/>}

    </div>
  );
}



export  {Polymarket};

