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
import {Futures} from './Futures'
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
              <h6 style={{color: 'blue'}}> Tools </h6>
            </div>             
            <br></br>       

            <MonthGain symbol = {props.symbol}  gainMap = {props.gainMap}  stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} logFlags = {props.logFlags} errorAdd={props.errorAdd}/>

            <hr/> 
            {/* <br></br> */}
            <VerifyGain symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} 
                    logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>

            <hr/> 
            {<Futures symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} 
                    logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>}


            <hr/> 
            {/* <br></br>  */}
            <Splits symbol = {props.symbol} rows = {props.rows} allColumns={props.allColumns} stockChartXValues = {props.stockChartXValues} 
                  stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns} 
                    logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>
            
            <hr/> 
            {/* <br></br>  */}
            <TargetPriceGui  symbol = {props.symbol} rows = {props.rows} logFlags = {props.logFlags} errorAdd={props.errorAdd} gainMap = {props.gainMap}
             ssl={props.ssl} PORT={props.PORT} servSelect={props.servSelect}/>
            
            <hr/> 
            <Spikes symbol = {props.symbol} rows = {props.rows} stockChartXValues = {props.stockChartXValues} 
                stockChartYValues = {props.stockChartYValues} refreshByToggleColumns = {props.refreshByToggleColumns}
                 logFlags = {props.logFlags} servSelect={props.servSelect} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd}/>
            
            <hr/> 
            {eliHome &&  <IpSearchGui/>}

        </div>
    )

}

export default Tools
