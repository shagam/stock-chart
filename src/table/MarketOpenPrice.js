import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from '../utils/Date'


function MarketOpenPrice (props) {

    const END_OF_DAY = false;
    const LOG_DROP = props.logFlags && props.logFlags.includes('drop_');

    var periodTag;
    if (props.weekly)
      periodTag = 'Weekly Adjusted Time Series';
    else
      periodTag = "Time Series (Daily)"

    const gainObj =  props.chartData[`${periodTag}`]
  
    function gainOpen(i) {    
        if (END_OF_DAY)
          return  Number(gainObj[props.stockChartXValues[i]]['5. adjusted close'])
        const high = Number(gainObj[props.stockChartXValues[i]]['1. open']) * 
          Number(gainObj[props.stockChartXValues[i]]['5. adjusted close']) / 
          Number(gainObj[props.stockChartXValues[i]]['4. close']) 
        return high.toFixed(2);
      }
    
    function gainHigh(i) {
        if (END_OF_DAY)
          return  Number(gainObj[props.stockChartXValues[i]]['5. adjusted close'])
        const high = Number(gainObj[props.stockChartXValues[i]]['2. high']) * 
          Number(gainObj[props.stockChartXValues[i]]['5. adjusted close']) / 
          Number(gainObj[props.stockChartXValues[i]]['4. close']) 
        return high.toFixed(3);
      }
  
      function gainLow(i) {
        if (END_OF_DAY)
          return  Number(gainObj[props.stockChartXValues[i]]['5. adjusted close'])
        const low = Number(gainObj[props.stockChartXValues[i]]['3. low']) * 
          Number(gainObj[props.stockChartXValues[i]]['5. adjusted close']) / 
          Number(gainObj[props.stockChartXValues[i]]['4. close']) 
        return low.toFixed(3);
      }
  
      function gainClose(i) {
        if (i < 0)
            return -1
        else
            return Number(gainObj[props.stockChartXValues[i]]['5. adjusted close']).toFixed(2)
    }



       if (LOG_DROP) {
        console.log (gainObj[props.stockChartXValues[props.stockChartXValues.length-1]])
        console.log ('high=', gainHigh(props.stockChartXValues.length-1), 'low=', gainLow(props.stockChartXValues.length-1), 'close=', gainClose(props.stockChartXValues.length-1))
      }
   
      console.log ('open='+ gainOpen(0), 'gainClose=' + gainClose(0),  gainLow(0), gainHigh(0))

       //* color gain numbers according to gain
    function gainColor (gain) {
        const PERCENT_DIFF = 4;
        if (gain > 1 + PERCENT_DIFF / 100) { // for month color for hiegher gain
            const diff = gain -1;
            return '#00ff00' // diff * 40 green
        }
        else if (gain < 1 - PERCENT_DIFF / 100) {
            const diff = (1 - gain)
            return '#ff0000'// + diff * 256 * 40 red
        }
        else
            return '#0'  // black
    }


    return (
        <div>

            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.StockSymbol} </div>  &nbsp; &nbsp;
                <h6 style={{color: 'blue'}}> MarketOpenPrice  </h6>
            </div>


            {<div style={{height:'450px', width: '630px', overflow:'auto'}}>
                <table>
                    <thead>
                        <tr>
                        <th>week date</th>
                        <th>open / prevClose</th>
                        <th>open</th>
                        <th>close</th>
                        <th>dailyGain</th>
                        <th>nextOpen</th>

                        </tr>
                    </thead>
                    <tbody>
                        {gainObj && Object.keys(gainObj).map((date, index) =>{
                            return (
                            <tr key={index}>
                                <td style={{width: '100px'}}>{date}  </td> 
                                {<td style={{color: gainColor((gainClose(index -1) / gainOpen(index)))}}>{index > 0 && (gainClose(index -1) / gainOpen(index)).toFixed(4)}</td>}     
                                <td>{gainOpen(index)}</td>
                                <td>{gainClose(index)}</td>
                                <td>{(gainClose(index) / gainOpen(index)).toFixed(4)}</td>
                                {index < props.stockChartXValues.length - 1 &&  <td style={{color: gainColor(gainOpen(index + 1) / gainClose(index))}}>{index < props.stockChartXValues.length -1 && (gainOpen(index + 1) / gainClose(index)).toFixed(4)}</td>}  
                                {/* <td style= {{color: gainColor (s, true)}} color> {s.toFixed(4)} </td> */}
                                {/* <td>{yearsCollectedForAverage[s1]}</td> */}
                                {/* {gainObj && <td>{props.gainMap[gainMapSym].x[(52 * 30 + weekNumberForDate_0 - s1)%52]}</td>} */}
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>}  
        </div>
    )

}


export {MarketOpenPrice}