import React, {useState, useEffect} from 'react'



// import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
//     searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

import {format} from "date-fns"
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
    
import logFlags from '../utils/LogFlags'
import {MonthGain} from './MonthGain'
import {IpContext} from '../contexts/IpContext';
import {TargetPriceGui } from './TargetPriceGui';
import {VerifyGain} from './GainValidateMarketwatch'
import {Splits} from './StockSplits'
import {Spikes} from './Spikes'
import {IpSearchGui } from '../utils/IpSearchGui';


// import axios from 'axios'
// import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
//   searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

function Tools (props) {
  const [displayFlag, setDisplayFlag] = useState (false); 
  const {localIp, localIpv4, eliHome} = IpContext();
    
  const LOG = props.logFlags.includes('month')



       
    return (
        <div style = {{border: '2px solid blue'}} >

            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div>  &nbsp;  &nbsp; 
              <h6 style={{color: 'blue'}}> Tools </h6> &nbsp;  &nbsp; 
            </div>               

            <hr style={{ border: '3px solid #000000'}}/> 
            {/* <br></br> */}
            <VerifyGain symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} 
                    logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>

            <hr style={{ border: '3px solid #000000'}}/> 
            {/* <br></br>  */}
            <Splits symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} 
                    logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>
            
            <hr style={{ border: '3px solid #000000'}}/> 
            {/* <br></br>  */}
            <TargetPriceGui  symbol = {props.symbol} rows = {props.rows} logFlags = {props.logFlags} errorAdd={props.errorAdd} gainMap = {props.gainMap}
             ssl={props.ssl} PORT={props.PORT} servSelect={props.servSelect}/>
            
            <hr style={{ border: '3px solid #000000'}}/> 
            <Spikes symbol = {props.symbol} rows = {props.rows} stockChartXValues = {props.stockChartXValues} 
                stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns}
                 logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>
            
            <hr style={{ border: '3px solid #000000'}}/> 
            {eliHome &&  <IpSearchGui/>}

        </div>
    )

}

export default Tools
