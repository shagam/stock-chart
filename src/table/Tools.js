import React, {useState, useEffect} from 'react'



// import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
//     searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

import {format} from "date-fns"
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
    
import logFlags from '../utils/LogFlags'
import {monthGain} from './MonthGain'
import IpContext from '../contexts/IpContext';
import { TargetPriceGui } from './TargetPriceGui';
import {VerifyGain} from './GainValidateMarketwatch'
import {Splits} from './StockSplits'
import {Spikes} from './Spikes'

// import axios from 'axios'
// import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
//   searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

function Tools (props) {
    const [displayFlag, setDisplayFlag] = useState (false); 
    const [status, setStatus] = useState (); 
    const {localIp, localIpv4, eliHome} = IpContext();

    const [mGainObj, setMgainObj] = useState ({});
    const [yearGain, setYearGain] = useState ();
    const [monthNames, setMonthNames] = useState(['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])

    
    const [startDate, setStartDate] = useState (new Date(2002, 9, 15));
 
    // const [logFlags, setLogFlags] = useState([]);
    
    var totalGain;
    
  const LOG = props.logFlags.includes('month')



  // clear vars when symbol change
    useEffect(() => {
        setStatus()
        setMgainObj({})
      },[props.symbol]) 
  
      
    return (
        <div style = {{border: '2px solid blue'}} >
              <div>
                <div style = {{display: 'flex'}}>
                  <div  style={{color: 'magenta' }}>  {props.symbol} </div>  &nbsp;  &nbsp; 
                  <h6 style={{color: 'blue'}}> Tools </h6>
                </div>
                <div style={{color:'red'}}>{status}</div>
                
                <br></br> 
                <h5>Month gain </h5>
                {/* &nbsp; &nbsp; */}
                <div style={{display:'flex'}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"md"}} 
                  dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> &nbsp; &nbsp; 
                 {props.symbol && <button type="button" onClick={()=>monthGain(props.gainMap, mGainObj, setMgainObj, setYearGain, props.logFlags, startDate)}>monthGain</button>}
                </div>
                
                {/* <br></br>  */}
                { Object.keys(mGainObj).map((oneKey,i)=>{
                  return (
                      <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {monthNames[i]}:  </div> &nbsp; &nbsp; {mGainObj[oneKey]}</div>
                    )
                })}

                {Object.keys(mGainObj).length > 0 && <div>stockCount={Object.keys(props.gainMap).length} yearlyGain={yearGain.toFixed(3)} </div>}
                <br></br>           
                    
            </div>

            {/* <br></br> */}
            <VerifyGain symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} firebaseGainAdd = {props.firebaseGainAdd} 
                    logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>
            
            <br></br> 
            <Splits symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} firebaseGainAdd = {props.firebaseGainAdd} 
                    logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>

            {/* <br></br>  */}
            <TargetPriceGui  symbol = {props.symbol} rows = {props.rows} logFlags = {props.logFlags} errorAdd={props.errorAdd} gainMap = {props.gainMap}
             ssl={props.ssl} PORT={props.PORT} servSelect={props.servSelect}/>

            <Spikes symbol = {props.symbol} rows = {props.rows} stockChartXValues = {props.stockChartXValues} 
                stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns}
                 logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>



        </div>
    )

}

export default Tools
