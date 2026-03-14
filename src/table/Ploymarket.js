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
  const [latency, setLatency] = useState('')

  const [results, setResults] = useState(null)
  const [url, setUrl] = useState('')
  const [question, setQuestion] = useState('')
  const [resultsKeys, setResultsKeys] = useState([])


  const fetchTrend = async () => {
    setLoading(true);
    // var url = 'https://polymarket.com/event/ndx-above-dec-2026' + '-15000/trend'
    const url_ = "https://gamma-api.polymarket.com/events?slug=ndx-above-dec-2026&limit=2"
    setUrl(url_)

    const mili = Date.now()
    setError(null)
    // try {

     var corsUrl = "https://";
    corsUrl += props.servSelect+ ":" + props.PORT + '/polymarket'; 
      corsUrl += '?url=' + url_
    corsUrl += '&index=0'
    if (log)
        corsUrl += '&log=1'


        if (log)
        console.log (getDate(), 'params', corsUrl)

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;
             const dat = result.data 
            if (dat.message) {
                setError(dat.message)
                setResults(null)
                setLoading(false)
                return;
            }
            if (log) {
                console.log(getDate(), 'result', result.data)
            }

            if (dat.data) {
              // question =
              // 'Will Nasdaq 100 (NDX) close over $38,000 on the final trading day of December 2026?'
              // slug =
              // 'ndx-above-38000-dec-2026'
              // yesPrice =
              // '0.08'

              setQuestion(dat.data[0].question)
              for (let i = 0; i < dat.data.length; i++) {
                delete dat.data[i].question 
              }
              setResults(dat.data)
              setResultsKeys(Object.keys(dat.data[0]))
            }

            setLoading(false)
            const latency = Date.now() - mili
            setLatency('polymarket done, latency(msec)=' + latency)
            // beep2();
        }).catch ((err) => {
            setError(getDate() + ' ' + err.message)
            console.log(getDate(), err.message)
            setLoading(false)
        })


        // "https://polymarket.com/event/ndx-above-dec-2026-15000/trend",
        // {
        //   params: {
        //     market: QQQ_MARKET_ID,
        //     interval: "1h",
        //     fidelity: "1"
        //   }
        // }
      // );

 
  };

      // {resultsKeys.length > 0 && <div style={{maxHeight:'500px', maxWidth: '780px', overflow:'auto'}}>
      //   <table>
      //       <thead>
      //         <tr style={ROW_SPACING}>
      //           <th style={{...ROW_SPACING, width: '20px'}}> N</th>
      //           {resultsKeys.map((key, keyI) => {
      //             return  (
      //               <th style={ROW_SPACING} key={keyI}>{key}</th>
      //             )
      //           })}
      //         </tr> 
      //       </thead>
              
      //         {/* top, right, bottom, left */} 
      //       <tbody>
      //         {results.map((quote, index) => {
      //           return (
      //             <tr key={index} style={ROW_SPACING}>
      //             <td style={{...ROW_SPACING, width: '20px'}}> {index}</td>
      //             {resultsKeys.map((key, keyI) => {
      //             return  (
      //               <td key={keyI} style={{...ROW_SPACING,}}> 
      //               {(results[key][index])}</td>
      //             )
      //           })}

      //           </tr>
      //           )
      //         })}
      //       </tbody>
      //   </table>
      // </div>}


  const ROW_SPACING = {padding: "0px 7px 0px 7px", margin: 0}
 
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
      {/* {results && <pre style={{color:'green'}}>  {results.length} </pre> } */}
      {results && results.data && <b> {results.data}</b> }
      {results && results.data && <div dangerouslySetInnerHTML={{ __html:results.data }}/>}
 
      {url && <div>url: &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp;{url}</div>}
      {question && <div>question: &nbsp; &nbsp; &nbsp; {question}</div>}
      <div>&nbsp;</div>
      {results && <pre> bets {results.length} {JSON.stringify(results, null, 2)}</pre>}

    </div>
  );
}



export  {Polymarket};

