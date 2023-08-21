import React, {useState, } from 'react'

import LogFlags from '../LogFlags'
import {marketwatchGainValidate} from './GainValidateMarketwatch'


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


    const [info, setInfo] = useState ();

    const LOG_FLAG = props.logFlags.includes('verify_1');
    const [displayFlag, setDisplayFlag] = useState (false); 
    const [txt, setText] = useState ();


    function verify () {
        // <Verify symbol = {chartSymbol} rows = {rows} stockChartXValues = {stockChartXValues} 
        //   stockChartYValues = {stockChartYValues} logFlags = {logFlags} errorAdd={errorAdd}/>



        const servList = ['dinagold.org', '84.95.84.236', 'localhost', ];
        //marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, verifyDateOffset,
        //refreshByToggleColumns, firebaseGainAdd, servSelect, ssl, logFlags, errorAdd);

        if (! props.symbol) {
            alert ("Missing symbol, press gain for a symbol")
            return;
        }
        marketwatchGainValidate (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues, props.verifyDateOffset,
             props.refreshByToggleColumns, props.firebaseGainAdd, servList[0], true, props.logFlags, props.errorAdd, setText);
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
            <div>
                {props.symbol && <div> {props.symbol}</div>}             
                <div  style={{display:'flex' }}> &nbsp; &nbsp; &nbsp; {txt} &nbsp;  </div>
            </div> 

           <button type="button" onClick={()=>verify ()}>verify {props.symbol}  </button>  

        </div>
      }
    </div>
  )
}

export default Verify