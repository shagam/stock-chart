import React, {useState, useEffect} from 'react'

import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import Plot from 'react-plotly.js';
import {beep2} from '../utils/ErrorList'

import MobileContext from '../contexts/MobileContext'
import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {searchDateInArray, } from '../utils/Date'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

function DropsCount (props) {
      //** for counting drops */
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
    const [err, setErr] = useState();
    const [log, setLog] = useState (false);

    //** input */
    const [startDate, setStartDate] = useState(new Date(2021, 8, 1 ))   // start date for drop count
    const [changeThreshold, setChangeThreshold] = useState(10) // drop percentage, used for count number of drops
    const [searchRange, setSearchRange] = useState(props.daily? 400:80) // default a year search range
    const [searchMode, setSearchMode] = useState (true) // 'range','threshold',

    const [tableShow, setTableShow] = useState(false)
    const [chartData, setChartData] = useState()

    //** output display */
    const [dropsArray, setDropsArray] = useState([])
    const [bigDropCount, setBigDropsCount] = useState()
    const [bigRiseCount, setBigRiseCount] = useState();
    var bigDropCount_ = 0;
    var bigRiseCount_ = 0;

    var dropRiseRatioX = []
    var dropRiseRatioY = []
    var zigzagx = []
    var zigzagy = []

    useEffect (() => { 
        setDropsArray([])
      }, [props.symbol,  props.daily]) 



    //** countDrops */
    function searchLow (highIndex) {
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

    function searchHigh (startIndex) {
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

    function bigChange (startIndex) {
        var startValue = props.stockChartYValues[startIndex] // start from high value
        for (let i = startIndex; i >= 0; i --) {
            const ratio = startValue / props.stockChartYValues[i];
            if (ratio < (100 - changeThreshold)/100 || ratio > 1/((100 - changeThreshold)/100) ) {
                return i;
            }
        }
        return -1 // npt found   
    }




    //** main */ 
    function countDrops () {
        if (changeThreshold >= 100 || changeThreshold < 0) {
            setErr('Change threashold should be between 0 to 100')
            beep2()
            return;            
        }
      
        // first high before drop calc by dropRecovery    
        if (props.LOG)
        console.log ('highndex=', props.highIndex)  // found by dropRecovery

        //startDate
        var searchIndex = props.highIndex;
        const startDateArray = [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()];// // [1..31]
        const chartIndex = searchDateInArray (props.stockChartXValues, startDateArray, props.symbol, /*logFlags*/[])
        searchIndex = chartIndex;
        var nextIndex; 
        var dropsArray_ = []


        for (let i = 0; i < 300; i++) {
            if (searchMode) { // big Chanhe
                nextIndex = bigChange(searchIndex)
            } else {
                if (i % 2 === 0) {
                    nextIndex = searchLow (searchIndex)
                    if (props.LOG)
                    console.log ('searchLow', searchIndex, nextIndex)
                }
                else {
                    nextIndex = searchHigh (searchIndex)
                    if (props.LOG)
                    console.log ('searchHigh', searchIndex, nextIndex)
                }
            }
            if (nextIndex === -1)
                break;

            const changeRatio = props.stockChartYValues[nextIndex] / props.stockChartYValues[searchIndex];
            if (changeRatio < (100-changeThreshold)/100) {
                bigDropCount_ ++
            }
            const thresh = 1/((100-changeThreshold)/100)
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
            dropRiseRatioX.push(props.stockChartXValues[nextIndex])
            dropRiseRatioY.push((1-changeRatio) * 200 + 200)

            zigzagx.push(props.stockChartXValues[nextIndex])
            zigzagy.push(props.stockChartYValues[nextIndex])


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
            name: props.symbol,
            x: chartClippedX_temp,
            y: chartClippedY_temp,
            type: 'scatter',
            mode: 'lines',
            // marker: { color: 'green' }, 
            line: {
                color: 'green',
                width: 1 
            }
        },
        {
            name: 'rise_drop',
            x: zigzagx,
            y: zigzagy,
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'red', size: 3 },       
        },
        // {
        //     name: 'drop_rise_ratio',
        //     x: dropRiseRatioX,
        //     y: dropRiseRatioY,
        //     type: 'scatter',
        //     mode: 'lines+markers',
        //     // type: 'bar',
        //     marker: { color: 'blue' },       
        // },
        ]
        setChartData(dat)
    }

    function colorChange (col, change) {
        if (col !== 'change')
        return 'black'
        if (change < (100 - changeThreshold)/100) {
        return 'red'
        }
        const thresh = 1/((100 - changeThreshold)/100)
        if (change >  thresh ){
        return 'lightGreen'
        }
        return 'black'
    }


    return (
        <div>
    {/* <hr/>  */}
        <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {props.symbol} </div>  &nbsp; &nbsp;
            <h6 style={{color: 'blue'}}> DropsCount  </h6>  &nbsp; &nbsp;
            <div>{ props.daily? '(daily)' : '(weekly)'}</div>
          </div>

        <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Count market drops and rises</h6>
        <div style={{color: 'red'}}>{err}</div>

        {<div style={{display:'flex'}}>
            <ComboBoxSelect serv={searchMode} nameList={['range','threshold',]} setSelect={setSearchMode} title='' options={[false, true]} defaultValue={true}/> &nbsp; &nbsp;  &nbsp;
            <input  type="checkbox" checked={log}  onChange={()=>setLog(! log)} />&nbsp;log    
        </div>} 

        <GetInt init={changeThreshold} callBack={setChangeThreshold} title='change threshold %' type='Number' pattern="[0-9]+" width = '15%'/> 
        {! searchMode && <GetInt init={searchRange} callBack={setSearchRange} title='SearchRange' type='Number' pattern="[0-9]+" width = '15%'/> }

  
        <div>&nbsp;</div>
        Start-date {<DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> }

        <div>&nbsp;</div>

        <button  style={{background: 'aqua'}} type="button" onClick={()=>countDrops()}> Count drops   </button> &nbsp;
        {bigDropCount && bigRiseCount && <div>bigDropCount={bigDropCount} &nbsp; &nbsp;  bigRiseCount={bigRiseCount}</div>}
        
        <div>&nbsp;</div>

        {<div>       
        {dropsArray.length > 0 && 
        <div>
            {/* <div>&nbsp;</div> */}
            <div> <input  type="checkbox" checked={tableShow}  onChange={() => setTableShow (! tableShow)} />  drop-rise-table </div>

            {tableShow && <div style={{width: '450px', height: '45vh', 'overflowY': 'scroll'}}>
            <div> length={dropsArray.length} &nbsp;&nbsp; highIndex={props.highIndex} &nbsp;&nbsp; startDate={props.stockChartXValues[props.highIndex]}</div>
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
        </div>}

        {chartData && <Plot  data={chartData} layout={{ width: 550, height: 400, title: 'drop-rise-count',
            xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'price'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}

        </div>}
        </div>}
    </div>
  )

}


export {DropsCount}