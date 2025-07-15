
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {IpContext} from '../contexts/IpContext';
import { set } from 'date-fns';
// Zuberi Moshe

// 

// 


function OptionQuote (props) {
  const {eliHome} = IpContext();
  // const [quote, setQuote] = useState(null);
  const optionSymbol = 'AAPL'+'250817C00' + '150000'; // Jan 2025 $150 AAPL Call
  const TOKEN = process.env.REACT_APP_MARKETDATA;
  var url = 'https://marketdata.app/api/v1/marketdata?token=' + TOKEN;

  const [log, setLog] = useState (eliHome); // default to true if eliHome is true
  const [log1, setLog1] = useState (false);
  const [expirationsArray, setExpirationsArray] = useState([]); 
  const [selectedRow, setSelectedRow] = useState(null);

  function expirationsGet () {
    url = 'https://api.marketdata.app/v1/options/expirations/' + props.symbol;
    if (log)
      console.log (url)
    const expArray = []

    axios.get (url)
      .then ((result) => {
        if (log)
          console.dir (result.data)
        const mili = result.data.updated
        const status = result.data.s
        
        for (var i = 0; i < result.data.expirations.length; i++) {
          expArray.push (result.data.expirations[i])
        }
        console.log ('expirationsArray=', expArray.length)
        setExpirationsArray(expArray);
      })
      .catch ((err) => {
        console.log(err)
      })

  }

  function handleRowClick(rowId)  { 
    // handle row click
    setSelectedRow(rowId);
    if (log)
      console.log('Row clicked:', rowId);
  }


  function strikePrices () {
    url = 'https://api.marketdata.app/v1/options/strikes/' + props.symbol;
  }

  return (
    <div>
      <div style = {{ border: '2px solid blue'}} >
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}>Option Quote (under development) </h6>  &nbsp; &nbsp;
        </div>

        {eliHome &&  <input type="checkbox" checked={log}  onChange={()=>setLog (! log)}  />}&nbsp;log &nbsp; &nbsp;

        <div><button style={{background: 'aqua'}} type="button" onClick={()=>expirationsGet()}>  expirations   </button> </div>

          <h6> count {expirationsArray.length} </h6>
        { expirationsArray.length > 0 && <div style={{height:'300px', width: '300px', overflow:'auto'}}>

            <table>
                <thead>
                  <tr>
                    <th>N</th>
                    <th>date</th>
                  </tr>
                </thead>
                <tbody>
                  {expirationsArray.map((date, index) =>{
                    return (
                    <tr key={index}
                      onClick={() => handleRowClick(index)}
                      style={{
                          backgroundColor: selectedRow === index ? '#d3e5ff' : 'white',
                          cursor: 'pointer',
                        }}                      
                      >
                      <td style={{padding: '2px', margin: '2px', width: '5px'}}>{index}  </td>
                      <td style={{padding: '2px', margin: '2px', width: '10px'}}>{date}  </td> 
                    </tr>
                    )
                  })}
                </tbody>
            </table>
        </div>}  

        {/* <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; for {ymbol}  &nbsp; </h6> */}
        
        <hr/> 
        <div><button style={{background: 'aqua'}} type="button" onClick={()=>strikePrices()}>  strike-price   </button> </div>
      </div>
    </div>
  );
};



// https://www.marketdata.app/docs/api/

// https://api.marketdata.app/v1/options/strikes/{symbol}/?expiration=YYYY-MM-DD

// https://api.marketdata.app/v1/options/expirations/AAPL

// https://api.marketdata.app/v1/options/quotes/AAPL250817C00150000/
// https://api.marketdata.app/v1/options/chaiside=call
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2025-01-17&side=call
// https://api.marketdata.app/v1/options/strikes/AAPL
// https://api.marketdata.app/v1/options/strikes/AAPL/?expiration=2026-02-20
// https://api.marketdata.app/v1/options/strikes/AAPL/?expiration=2025-01-17

// https://api.marketdata.app/v1/options/quotes/AAPL250117C00150000/?human=true
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-02-20&side=call
// https://api.marketdata.app/v1/options/quotes/AAPL260220C00150000/?human=true

// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-02-20&side=call&strike=150.00



export {OptionQuote};
