import React, {useState, useEffect} from 'react'
import DatePicker, {moment} from 'react-datepicker';
import Plot from 'react-plotly.js';
import {beep2} from '../utils/ErrorList'
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from '../utils/Date'
import {IpContext, getIpInfo} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import GetInt from '../utils/GetInt'



function DropsCount (props) {
      //** for counting drops */
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
    const [err, setErr] = useState();
    const [changeThreshold, setChangeThreshold] = useState(85) // drop percentage, used for count number of drops
    const [dropsArray, setDropsArray] = useState([])

    const [searchRange, setSearchRange] = useState(props.daily? 400:80) // default a year search range
    const [chartData, setChartData] = useState()

    const [bigDropCount, setBigDropsCount] = useState()
    const [bigRiseCount, setBigRiseCount] = useState();
    var bigDropCount_ = 0;
    var bigRiseCount_ = 0;

    var chartx_temp = []
    var charty_temp = []


    useEffect (() => { 
        setDropsArray([])
      }, [props.StockSymbol,  props.daily]) 



    //** countDrops */
    function searchLow (highIndex, searchRange) {
        // today is index 0
        var lowValue = props.stockChartYValues[highIndex] // start from high value
        var lowIndex = -1;
        const limit =  highIndex - searchRange <= 0 ? 0:  highIndex - searchRange;
        for (let i = highIndex; i > limit; i --) {
        if (lowValue > props.stockChartYValues[i]) {
            lowValue = props.stockChartYValues[i]
            lowIndex = i;
        }
        }
        return lowIndex;
    }

    function searchHigh (startIndex, searchRange) {
        // today is index 0
        var value = props.stockChartYValues[startIndex] // start from high value
        var foundIndex = -1;
        const limit =  startIndex - searchRange <= 0 ? 0:  startIndex - searchRange;
        for (let i = startIndex; i > limit; i --) {
        if (value < props.stockChartYValues[i]) {
            value = props.stockChartYValues[i]
            foundIndex = i;
        }
        }
        return foundIndex;
    }

    function countDrops () {

        if (! props.highIndex) {
        setErr('Missing highIndex, please press DropRecoveryCalc to calc high for start')
        beep2()
        return;
        }

        // first high before drop calc by dropRecovery    
        if (props.LOG)
        console.log ('highndex=', props.highIndex)  // found by dropRecovery

        var searchIndex = props.highIndex;
        var nextIndex; 
        var dropsArray_ = []


        for (let i = 0; i < 300; i++) {
        if (i % 2 === 0) {
            nextIndex = searchLow (searchIndex, searchRange)
            if (props.LOG)
            console.log ('searchLow', searchIndex, nextIndex)
        }
        else {
            nextIndex = searchHigh (searchIndex, searchRange)
            if (props.LOG)
            console.log ('searchHigh', searchIndex, nextIndex)
        }
        if (nextIndex === -1)
            break;

        const changeRatio = props.stockChartYValues[nextIndex] / props.stockChartYValues[searchIndex];
        if (changeRatio < changeThreshold/100) {
            bigDropCount_ ++
        }
        const thresh = 1/(changeThreshold/100)
        if (changeRatio >  thresh ){
            bigRiseCount_ ++
        }

        //* prepare for table
        const dropObj = {
            endDate: props.stockChartXValues[nextIndex],
            change: changeRatio.toFixed(3),
            startIndex: searchIndex,
            endIndex: nextIndex,
            endPrice: props.stockChartYValues[nextIndex].toFixed(2),
        }
        if (props.LOG)
            console.log (dropObj, searchIndex, nextIndex)
        
        //** build arrays for the chart */
        chartx_temp.push(props.stockChartXValues[nextIndex])
        charty_temp.push(changeRatio * 100)

        // if (dropRatio < dropThreshold / 100)

            dropsArray_.push (dropObj)
            // console.log (dropRatio, dropObj, dropThreshold/100, dropsArray.length)

        searchIndex = nextIndex; 
        }

        setDropsArray(dropsArray_)
        setBigDropsCount(bigDropCount_)
        setBigRiseCount(bigRiseCount_)

        //** clipp main chart */
        var chartClippedX_temp = [];
        var chartClippedY_temp = [];
        for (let i = 0; i < props.highIndex; i++) {
        chartClippedX_temp[i] = props.stockChartXValues[i];
        chartClippedY_temp[i] = props.stockChartYValues[i];
        }


        const dat =
        [
        {
            name: props.StockSymbol,
            x: chartClippedX_temp,
            y: chartClippedY_temp,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'green' },           
        },
        {
            name: 'drop_rise',
            x: chartx_temp,
            y: charty_temp,
            type: 'scatter',
            mode: 'lines+markers',
            // type: 'bar',
            marker: { color: 'blue' },       
        },
        ]
        setChartData(dat)
    

    }

    function colorChange (col, change) {
        if (col !== 'change')
        return 'black'
        if (change < changeThreshold/100) {
        return 'red'
        }
        const thresh = 1/(changeThreshold/100)
        if (change >  thresh ){
        return 'lightGreen'
        }
        return 'black'
    }


    return (
        <div>
    {/* <hr/>  */}
        <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {props.StockSymbol} </div>  &nbsp; &nbsp;
            <h6 style={{color: 'blue'}}> DropRecovery  </h6>  &nbsp; &nbsp;
            <div>{ props.daily? '(daily)' : '(weekly)'}</div>
          </div>

        <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Count market drops more than specified percentage</h6>
        <div style={{color: 'red'}}>{err}</div>

        <GetInt init={changeThreshold} callBack={setChangeThreshold} title='Change percentage' type='Number' pattern="[0-9]+" width = '15%'/> 
        <GetInt init={searchRange} callBack={setSearchRange} title='SearchRange' type='Number' pattern="[0-9]+" width = '15%'/> 
        <div>&nbsp;</div>
        <button  style={{background: 'aqua'}} type="button" onClick={()=>countDrops()}> Count drops   </button> &nbsp;

        <div> length={dropsArray.length} &nbsp;&nbsp; highIndex={props.highIndex} &nbsp;&nbsp; startDate={props.stockChartXValues[props.highIndex]}</div>
        {bigDropCount && bigRiseCount && <div>bigDropCount={bigDropCount} &nbsp; &nbsp;  bigRiseCount={bigRiseCount}</div>}


        {<div>            
       
        {dropsArray.length > 0 && 
        <div>
            <div style={{width: '450px', height: '45vh', 'overflowY': 'scroll'}}>
            <table>
                <thead>
                <tr>
                    <th style={{padding: '1px', margin: '1px'}}>N</th>
                    {Object.keys(dropsArray[0]).map((h,h1) => {
                        return (
                            <th style={{padding: '1px', margin: '1px'}} key={h1}>{h}</th>
                        )
                    })}
                </tr>
                </thead>
                <tbody>
                    {dropsArray.map((s, s1) =>{
                        return (
                        <tr key={s1}>
                            <td style={{padding: '1px', margin: '1px'}}>{s1}</td>
                            {Object.keys(dropsArray[s1]).map((a,a1) => {
                                return (
                                    <td key={a1} style={{padding: '1px', margin: '1px', color: colorChange(a,dropsArray[s1][a])}} >{dropsArray[s1][a]}</td>
                                )
                            })}
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>

        {chartData && <Plot  data={chartData} layout={{ width: 550, height: 400, title: 'moving-average',
            xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'price'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}

        </div>}
        </div>}
    </div>
  )

}


export {DropsCount}