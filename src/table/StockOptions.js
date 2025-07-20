
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {IpContext} from '../contexts/IpContext';
import GetInt from '../utils/GetInt'
import {format} from "date-fns"
import {todayDate, getDate_YYYY_mm_dd} from '../utils/Date';
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
// 
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
  const [expirationCount, setExpirationCount] = useState(2);
  const [selectedExpiration, setSelectedExpiration] = useState(null);

  const [strikeArray, setStrikeArray] = useState([]);
  const [selectedStrike, setSelectedStrike] = useState(null);
  const [strikeCount, setStrikeCount] = useState(5);
  const [lineNumberArr, setLineNumberArr] = useState([]); // each line corespond to one strike-price

  const [optionQuote, setOptionQuote] = useState({});
  const [optionKeys, setOptionKeys] = useState([]);
  const  options = ['call', 'put'];
  const [callOrPut, setCallOrPut] = useState(options[0]); // default to call options
  const[responseRows, setResponseRows] = useState(); // for debugging

// (26) ['s', 'optionSymbol', 'underlying', 'expiration', 'side', 'strike', 'firstTraded', 'dte', 'updated', 'bid', 'bidSize', 'mid', 'ask', 'askSize', 'last', 'openInterest', 'volume', 'inTheMoney', 'intrinsicValue', 'extrinsicValue', 'underlyingPrice', 'iv', 'delta', 'gamma', 'theta', 'vega']
  
  const quoteKeys =['optionSymbol', 'underlying', 'expiration', 'side', 'strike', 'firstTraded', 'dte', 'updated', 'bid', 'bidSize', 'mid', 'ask',];

  function expirationsGet () {
    if (log)
      console.log ('expirationCount=', expirationCount)
    url = 'https://api.marketdata.app/v1/options/expirations/' + props.symbol + '/' //'/&api_key=' + TOKEN
    if (log)
      console.log (url)
    const expArray = []

    axios.get (url)
      .then ((result) => {
        if (log)
          console.dir (result.data)
        const mili = result.data.updated
        const status = result.data.s

        if (result.data.s !== 'ok') {
          props.errorAdd ([props.symbol, 'expiration error', result.data.s])
          console.log (props.symbol, 'expiration error', result.data.s)
        }
        
        for (var i = 0; i < result.data.expirations.length; i++) {
          if (selectedExpiration + i >= result.data.expirations.length)
            break;
          expArray.push (result.data.expirations[selectedExpiration + i])
        }
        if (log)
          console.log ('expirationsArray=', expArray)
        setExpirationsArray(expArray);
      })
      .catch ((err) => {
        console.log(err)
      })

  }

  function handleRowClick(rowId)  { 
    setSelectedExpiration(rowId);
    if (log)
      console.log('Expiration Row clicked:', rowId);
  }

 function handleRowClickStrike(rowId)  { 
    setSelectedStrike(rowId);
    if (log)
      console.log('Strike Row clicked:', rowId);
  }

  function strikePrices () {
    url = 'https://api.marketdata.app/v1/options/strikes/' + props.symbol + '/?expiration=' 
        + expirationsArray[selectedExpiration] + '&api_key=' + TOKEN
        // + '?token=' + TOKEN;
    if (log)
      console.log (url)

    const strikeArray = [] 
    axios.get (url)
    .then ((result) => {
      if (log)
        console.dir (result.data)
      const mili = result.data.updated

      if (result.data.s !== 'ok') {
        props.errorAdd ([props.symbol, 'strike-price error', result.data.s])
        console.log (props.symbol, 'strike-price error', result.data.s)
      }

      const arr = result.data[expirationsArray[selectedExpiration]]
      if(log)
        console.log (arr)
      for (var i = 0; i < arr.length; i++) {
        strikeArray.push (arr[i])
      }
      // console.log ('strikeArray=', strikeArray)
      setStrikeArray(strikeArray );
      // console.log (strikeArray)
    })
    .catch ((err) => {
      console.log(err)
    })
  }
 

  function optionFee () {

    //** create expiration group */
    // console.log (expirationCount, selectedExpiration, expirationsArray.length)
    var expirationGroup =  '/?expiration=' + expirationsArray[selectedExpiration];
    // console.log ('expirationCount=', expirationCount)
    if (expirationCount > 1) {
      expirationGroup =  '/?from=' + expirationsArray[selectedExpiration] + '&to=' + expirationsArray[selectedExpiration + expirationCount -1];

      // for (let i = 1; i < expirationCount; i++) {
      //   if (selectedExpiration + i >= expirationsArray.length)
      //     break;
      //   expirationGroup += ',' + expirationsArray[selectedExpiration + i] 
      // }
      // expirationGroup += ']';
    }

 
    //** Create strike-group  (list) */

    var strikeGroup = strikeArray[selectedStrike];
    
    for (let i = 1; i < strikeCount; i++) {
      if (selectedStrike + i >= strikeArray.length)
        break;
      strikeGroup += ',' + strikeArray[selectedStrike + i]
    }
    if (log) {
      console.log ('strikeGroup=', strikeGroup) 
      console.log ('expirationGroup=', expirationGroup)
    }
    
    // url = 'https://api.marketdata.app/v1/options/quotes/' + props.symbol
    url = 'https://api.marketdata.app/v1/options/chain/'+ props.symbol 
        + expirationGroup
        + '&side=' + callOrPut + '&strike=' + strikeGroup + '&api_key=' + TOKEN
        // + '?human=true';

    // const TEST = 'https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25'
    // url = TEST;
    if (log)
      console.log (url)

    axios.get (url)
    .then ((result) => {
      if (log)
        console.log (result.data)

      if (result.data.s !== 'ok') {
        props.errorAdd ([props.symbol, 'option-fee error', result.data.s])
        console.log (props.symbol, 'option-fee error', result.data.s)
        return
      }

      setResponseRows(result.data.expiration.length)  // response lines

      var lineArr = [0]
      for (let i = 0; i < result.data.expiration.length; i++) {
        //  console.log (Date(result.data.expiration[i]))
        // console.log (getDate_YYYY_mm_dd(new Date(result.data.expiration[i] * 1000 )));
        result.data.expiration[i] = getDate_YYYY_mm_dd(new Date(result.data.expiration[i] * 1000))
        result.data.firstTraded[i] = getDate_YYYY_mm_dd(new Date(result.data.firstTraded[i] * 1000))
        result.data.updated[i] = getDate_YYYY_mm_dd(new Date(result.data.updated[i] * 1000))
        delete result.data.optionSymbol
        delete result.data.s
        lineArr.push (i) 
      }
      setLineNumberArr(lineArr);

      setOptionQuote(result.data); // take the first one, there could be more
      setOptionKeys(Object.keys(result.data))
      if (log)
        console.log ('keys', Object.keys(result.data))

     })
    .catch ((err) => {
      console.log(err)
    })

  }

  return (

      <div style = {{ border: '2px solid blue'}} >
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}>Option Quote (under development) </h6>  &nbsp; &nbsp;
        </div>

        {eliHome && <div style = {{display: 'flex'}}> <input type="checkbox" checked={log}  onChange={()=>setLog (! log)}  />&nbsp;log &nbsp; &nbsp; </div>}

        <div style = {{display: 'flex'}}>
          <button style={{background: 'aqua'}} type="button" onClick={()=>expirationsGet()}>  expirations   </button> &nbsp; &nbsp; 
          <GetInt init={expirationCount} callBack={setExpirationCount} title='expiration-count' type='Number' pattern="[0-9]+" width = '15%'/> 
        </div>

        { expirationsArray.length > 0 && <div style={{height:'300px', width: '300px', overflow:'auto'}}>
          <h6> count {expirationsArray.length} </h6>
            <table>
                <thead>
                  <tr>
                    <th>N</th>
                    <th>expiration-date</th>
                  </tr>
                </thead>
                <tbody>
                  {expirationsArray.map((date, index) =>{
                    return (
                    <tr key={index}
                      onClick={() => handleRowClick(index)}
                      style={{
                          backgroundColor: selectedExpiration === index ? '#d3e5ff' : 'white',
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
        {expirationsArray.length > 0 && <div>
          <hr/> 
          {!selectedExpiration && ! strikeArray.length > 0 && <div style={{color: 'red'}}>Please select an expiration date first</div>}
          {selectedExpiration && <div style = {{display: 'flex'}}>
            <button style={{background: 'aqua'}} type="button" onClick={()=>strikePrices()}>  strike-price   </button> &nbsp; &nbsp; 
            <GetInt init={strikeCount} callBack={setStrikeCount} title='strike-count' type='Number' pattern="[0-9]+" width = '15%'/> 
          </div>}


          {strikeArray.length > 0 && <div style={{height:'300px', width: '300px', overflow:'auto'}}>
          <h6> count {strikeArray.length} </h6>
            <table>
                <thead>
                  <tr>
                    <th>N</th>
                    <th>strike-price</th>
                  </tr>
                </thead>
                <tbody>
                  {strikeArray.map((date, index) =>{
                    return (
                    <tr key={index}
                      onClick={() => handleRowClickStrike(index)}
                      style={{
                          backgroundColor: selectedStrike === index ? '#d3e5ff' : 'white',
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
          </div>}

          <hr/> 
          {selectedExpiration && !selectedStrike && strikeArray.length > 0 && <div style={{color: 'red'}}>Please select a strike-price first</div>}

          {selectedStrike && <div style = {{display: 'flex'}}>
            <button style={{background: 'aqua'}} type="button" onClick={()=>optionFee()}>  option-fee   </button>  &nbsp; &nbsp;  &nbsp;
            <ComboBoxSelect serv={callOrPut} nameList={options} setSelect={setCallOrPut} title='' options={options} defaultValue={callOrPut}/> 
          </div>}


          {/* <h8>expiration-date={expirationsArray[selectedExpiration]}</h8> */}
          {optionKeys.length > 0 && <div style={{height:'300px', width: '1200px', overflow:'auto'}}>
          <h6> count {optionQuote.expiration.length} </h6>
            <table>
                <thead>
                  <tr>
                    <th>N</th>
                    {optionKeys.map((key, keyI) => {
                      return (
    
                        <th key={keyI}>{optionKeys[keyI]}</th>
                      )
                    })}
                  </tr> 
                </thead>
                <tbody>
                  {lineNumberArr.map((quote, index) =>{
                    return (
                    <tr key={index}>
                      <td>{index}</td>
                      {optionKeys.map((key, keyI) => {
                      return (
                        <td key={keyI} style={{padding: '2px', margin: '2px', width: '10px'}}>{optionQuote[key][quote]}</td>
                      )
                    })}

                    </tr>
                    )
                  })}
                </tbody>
            </table>

        </div>}

    </div>
  )
}





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
// https://api.marketdata.app/v1/options/chain/AAPL/?from=2027-01-01&to=2027-06-30.

// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2025-08-15&side=call&strike=25



export {OptionQuote};