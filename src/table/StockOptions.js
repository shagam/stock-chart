
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {IpContext} from '../contexts/IpContext';
import GetInt from '../utils/GetInt'
import {format} from "date-fns"
import {todayDate, getDate_YYYY_mm_dd} from '../utils/Date';
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import { el } from 'date-fns/locale';
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
  const [selectedExpiration, setSelectedExpiration] = useState(-1);

  const [strikeArray, setStrikeArray] = useState([]);
  const [selectedStrike, setSelectedStrike] = useState(-1);
  const [strikeCount, setStrikeCount] = useState(5);
  const [lineNumberArr, setLineNumberArr] = useState([]); // each line corespond to one strike-price

  const [optionQuote, setOptionQuote] = useState({});
  const [optionKeys, setOptionKeys] = useState([]);
  const  options = ['call', 'put'];
  const [callOrPut, setCallOrPut] = useState(options[0]); // default to call options
  const [columnHideFlag, setColumnHideFlag] = useState(false);
  const [hide, setHide]  = useState([])
// (26) ['s', 'optionSymbol', 'underlying', 'expiration', 'side', 'strike', 'firstTraded', 'dte', 'updated', 'bid', 'bidSize', 'mid', 'ask', 'askSize', 'last', 'openInterest', 'volume', 'inTheMoney', 'intrinsicValue', 'extrinsicValue', 'underlyingPrice', 'iv', 'delta', 'gamma', 'theta', 'vega']
  
  const quoteKeys =['optionSymbol', 'underlying', 'expiration', 'side', 'strike', 'firstTraded', 'dte', 'updated', 'bid', 'bidSize', 'mid', 'ask',];

  function expirationsGet () {
    // if (log)
    //   console.log ('expirationCount=', expirationCount)
    url = 'https://api.marketdata.app/v1/options/expirations/' + props.symbol + '/?token=' + TOKEN
    if (log)
      console.log (url)

    axios.get (url)
      .then ((result) => {
        if (log)
          console.log ('expirations', result.data)
        const mili = result.data.updated
        const status = result.data.s

        if (result.data.s !== 'ok') {
          props.errorAdd ([props.symbol, 'expiration error', result.data.s])
          console.log (props.symbol, 'expiration error', result.data.s)
        }
        
        setExpirationsArray(result.data.expirations);
      })
      .catch ((err) => {
        console.log(err.message)
        props.errorAdd ([props.symbol, 'expiration error', err.message])
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
        + expirationsArray[selectedExpiration] + '&token=' + TOKEN
        // + '?token=' + TOKEN;
    if (log)
      console.log (url)

    axios.get (url)
    .then ((result) => {
      if (log)
        console.log ('strike-prices', result.data)
      const mili = result.data.updated

      if (result.data.s !== 'ok') {
        props.errorAdd ([props.symbol, 'strike-price error', result.data.s])
        console.log (props.symbol, 'strike-price error', result.data.s)
      }

      const arr = result.data[expirationsArray[selectedExpiration]]
      if(log)
        console.log ('strike-array', arr)

      setStrikeArray(arr);

    })
    .catch ((err) => {
      console.log(err.message)
      props.errorAdd ([props.symbol, 'expiration error', err.message])
    })
  }
 

  function optionFee () {
    //** clear */
    setOptionQuote({})
    setOptionKeys([]);
    setLineNumberArr([]);
    //** create expiration group */
    // console.log (expirationCount, selectedExpiration, expirationsArray.length)
    var expirationGroup =  '/?expiration=' + expirationsArray[selectedExpiration] + '&token=' + TOKEN;
    // console.log ('expirationCount=', expirationCount)
    if (expirationCount > 1 && (selectedExpiration + expirationCount < expirationsArray.length)) {
      expirationGroup =  '/?from=' + expirationsArray[selectedExpiration] + '&to=' + expirationsArray[selectedExpiration + expirationCount -1]
       + '&token=' + TOKEN

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
        console.log ('primium', result.data)

      if (result.data.s !== 'ok') {
        props.errorAdd ([props.symbol, 'option-fee error', result.data.s])
        console.log (props.symbol, 'option-fee error', result.data.s)
        return
      }

      var lineArr = []
      var OptionQuoteFiltered = {}
      OptionQuoteFiltered.expiration = [] 
      OptionQuoteFiltered.firstTraded = []
      OptionQuoteFiltered.updated = []
      const rows = result.data.expiration.length;  // row count
      Object.keys(result.data).forEach((key) => {
        // if (key === 'iv' || key === 'delta' || key === 'gamma' || key === 'theta' || key === 'vega')
        //   return; // skip these keys
    
        if (key === 's' || key === 'optionSymbol')
          return;

            // delete result.data.optionSymbol
            // delete result.data.s
          OptionQuoteFiltered[key] = []
          for (let i = 0; i < rows; i++) {
            if (key === 'expiration' || key === 'firstTraded' || key === 'updated') {
              OptionQuoteFiltered.expiration[i] = getDate_YYYY_mm_dd(new Date(result.data.expiration[i] * 1000))
              OptionQuoteFiltered.firstTraded[i] = getDate_YYYY_mm_dd(new Date(result.data.firstTraded[i] * 1000))
              OptionQuoteFiltered.updated[i] = getDate_YYYY_mm_dd(new Date(result.data.updated[i] * 1000))
            }
            else
              OptionQuoteFiltered[key][i] = result.data[key][i]; // all other just
            if (key === 'expiration')
              lineArr.push (i) 
          }
        } )
      console.log ('filtered', OptionQuoteFiltered)
      setLineNumberArr(lineArr);

      setOptionQuote(OptionQuoteFiltered); // take the first one, there could be more
      setOptionKeys(Object.keys(OptionQuoteFiltered))
      if (log)
        console.log ('keys', Object.keys(result.data))

     })
    .catch ((err) => {
      console.log(err.message)
      props.errorAdd ([props.symbol, 'expiration error', err.message])
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
          <h6> count {expirationsArray.length} </h6>
        </div>

        { expirationsArray.length > 0 && <div style={{maxHeight:'250px', width: '300px', overflow:'auto'}}>

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
          {selectedExpiration === -1 && <div style={{color: 'red'}}>Please select an expiration date first</div>}
          {selectedExpiration >= 0  && <div style = {{display: 'flex'}}>
            <button style={{background: 'aqua'}} type="button" onClick={()=>strikePrices()}>  strike-price   </button> &nbsp; &nbsp; 
            <GetInt init={strikeCount} callBack={setStrikeCount} title='strike-count' type='Number' pattern="[0-9]+" width = '15%'/> 
            <h6> count {strikeArray.length} </h6>
          </div>}


          {strikeArray.length > 0 && <div style={{maxHeight:'250px', width: '300px', overflow:'auto'}}>
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
          {selectedExpiration !== -1 && selectedStrike ===-1 && strikeArray.length > 0 && <div style={{color: 'red'}}>Please select a strike-price first</div>}

          {selectedStrike !== -1 && <div style = {{display: 'flex'}}>
            <button style={{background: 'aqua'}} type="button" onClick={()=>optionFee()}>  option-primium   </button>  &nbsp; &nbsp;  &nbsp;
            <ComboBoxSelect serv={callOrPut} nameList={options} setSelect={setCallOrPut} title='' options={options} defaultValue={callOrPut}/>  &nbsp;  &nbsp; &nbsp;  &nbsp;
            {optionQuote && optionQuote.expiration && <h6> count {optionQuote.expiration.length} </h6>}  &nbsp; &nbsp;&nbsp;  
            <div style = {{display: 'flex'}}> <input type="checkbox" checked={columnHideFlag} 
                onChange={()=>setColumnHideFlag (! columnHideFlag)}  />&nbsp;column-select</div>
          </div>}

          {columnHideFlag && <div>
            
            <hr/> 
            <div style={{color:'#11ee33', fontWeight: '32', fontStyle: "italic"}}> column-select  </div>
              {optionKeys.map((key, keyI) => {
                return (
                  <div style = {{display: 'flex'}}>
                  <input type="checkbox" checked={hide[keyI]} 
                    onChange={()=>setHide (! hide[keyI])}  /> &nbsp; &nbsp;&nbsp; 
                  <label key={keyI} style={{margin: '2px', padding: '2px'}}>{key}</label>
                  </div>
                )
              })}

            </div>}

          {/* <h8>expiration-date={expirationsArray[selectedExpiration]}</h8> */}


          {optionKeys.length > 0 && <div style={{height:'500px', width: '1400px', overflow:'auto'}}>

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