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
    const [logExtra, setLogExtra] = useState (false);

    //** input */
    const [startDate, setStartDate] = useState(new Date(2019, 8, 1 ))   // start date for drop count
    const [changeThreshold, setChangeThreshold] = useState(5) // drop percentage, used for count number of drops
    const [searchRange, setSearchRange] = useState(props.daily? 400:80) // default a year search range
    const [searchMode, setSearchMode] = useState (true) // 'range','threshold',

    const [tableShow, setTableShow] = useState(false)
    const [chartData, setChartData] = useState()

    //** output display */
    const [dropsArray, setDropsArray] = useState([])
    const [bigDropCount, setBigDropsCount] = useState()
    const [bigRiseCount, setBigRiseCount] = useState();
    const [rawArrayLength, setRawArrayLength] = useState()


    var bigDropCount_ = 0;
    var bigRiseCount_ = 0;

    var dropRiseRatioX = []
    var dropRiseRatioY = []
    var zigzagx = []
    var zigzagy = [] 

    useEffect (() => { 
        setDropsArray([])
      }, [props.symbol,  props.daily]) 

    function extractOneStreak (dateArray, valArray, searchIndex, changeThreshold, streakArray) {
        // if (searchIndex === 1432) {
        //     console.log ('breakpoint searchIndex at 1432')  
        // }
        var virtualHighIndex = -1;
        var virtualHigh = valArray[searchIndex];
        var virtualLowIndex = -1;
        var virtualLow = valArray[searchIndex];
        const startValue = valArray[searchIndex];
        var direction = undefined;
        var next = -1;
        var rise_or_fall = 0
        var deepAfterRise = 0
        var topAfterDrop = 0

        for (let i = searchIndex; i > 0; i--) {

            // check for new high and low
            var value = valArray[i];
            if (value > virtualHigh) {
                virtualHighIndex = i;
                virtualHigh = valArray[virtualHighIndex];
            }
            if (value < virtualLow) {
                virtualLowIndex = i;
                virtualLow = valArray[virtualLowIndex];
            }

            const riseRatioThreshold = 1 + changeThreshold / 100
            // const riseThresholdVal = startValue * riseRatioThreshold;
            const riseEndRatioThreshold = 1 - changeThreshold / 100 / 4;
            // const riseEndThresholdVal = virtualHigh * (1 - changeThreshold / 100 / 4);

            if (virtualHigh > startValue * riseRatioThreshold) {
                rise_or_fall = 1
                deepAfterRise = value;
            }

            if (rise_or_fall === 1 && value < deepAfterRise)
                deepAfterRise = value

            if (rise_or_fall === 1 && deepAfterRise < virtualHigh * riseEndRatioThreshold) {
                direction = 'rise';
                next = virtualHighIndex;
            }

            // end of rise streak, start drop streak
            const dropRatioThreshold = 1 - changeThreshold / 100
            // const dropValThreshold = startValue * (1 - changeThreshold / 100);
            const dropEndRatioThreshold = 1 + changeThreshold / 100 / 4;
            // const dropEndThreshold = virtualLow * (1 + changeThreshold / 100 / 4);

            if (virtualLow <  startValue * dropRatioThreshold) {
                rise_or_fall = -1
                topAfterDrop = value;
            }

            if (rise_or_fall === -1 && value > topAfterDrop)
                topAfterDrop = value

            if (rise_or_fall  && topAfterDrop > virtualLow * dropEndRatioThreshold) { 
                direction = 'drop';
                next = virtualLowIndex;
            }

            const len = searchIndex - next
            const ratioEnd = direction === 'rise'? deepAfterRise / virtualHigh : topAfterDrop / virtualLow

            if (direction !== undefined) {
                var results = {
                    direction: direction,
                    len: len,
                    ratio: Number((valArray[next] / valArray[searchIndex]).toFixed(3)),
                    ratioEnd: ratioEnd.toFixed(3), //direction === 'rise'? deepAfterRise / virtualHigh : topAfterDrop / virtualLow,
                    
                    // searchIndex : searchIndex,
                    next: next,              
                    // drop_after_rise: deepAfterRise / virtualHigh,
                    // rise_after_drop: topAfterDrop / virtualLow,
       
                    startDate: dateArray[searchIndex],
                    endDate: dateArray[next],


                    };

                
                if (logExtra) {
                    const extra = {               
                        highIndex: virtualHighIndex,
                        lowIndex: virtualLowIndex,
                        virtualHigh: virtualHigh.toFixed(2),
                        virtualLow: virtualLow.toFixed(2),
                        
                        value: value.toFixed(2),
                    }
                    const merged = {...results, ...extra};
                    results = merged;

                    // console.log ('streak=', results);
                }
                streakArray.push (results);
            
                zigzagx.push(props.stockChartXValues[next])
                zigzagy.push(props.stockChartYValues[next])

                if (len === 1) {
                    console.log ('1-day streak')
                }
                return next; // last index of this streak
            }
        }
        return -1; // not found  
    }


    //** main */ 
    function countDrops () {

    
        if (changeThreshold >= 100 || changeThreshold < 0) {
            setErr('Change threashold should be between 0 to 100')
            beep2()
            return;            
        }
      
        // first high before drop calc by dropRecovery    
        if (log)
            console.log ('highndex=', props.highIndex)  // found by dropRecovery

        //startDate

        if (log)
            console.log ('startDate', startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate())
        const startDateArray = [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()];// // [1..31]
        const chartIndex = searchDateInArray (props.stockChartXValues, startDateArray, props.symbol, /*logFlags*/[])

        var searchIndex = chartIndex !== -1? chartIndex: props.stockChartXValues.length -1 //protect for date beyond array
        var nextIndex; 
        var dropsArray_ = []

        //** clipp main chart */
        var chartClippedX_temp = [];
        var chartClippedY_temp = [];
        for (let i = 0; i < searchIndex; i++) {
            chartClippedX_temp[i] = props.stockChartXValues[i];
            chartClippedY_temp[i] = props.stockChartYValues[i];
        }
        setRawArrayLength (chartClippedX_temp.length)

        // collect streakArray
        var streakArray = []
        var next_ = searchIndex - 1
        while (next_ !== -1) {
            next_ =  extractOneStreak (chartClippedX_temp, chartClippedY_temp, next_, changeThreshold, streakArray)
            // console.log ('nextIndex=', next_)
        }
        if (log)
            console.log ('streakArray=', streakArray)  

        for (let i = 0; i < streakArray.length; i++) {
            const streak = streakArray[i];
            if (streak.direction === 'drop') 
                bigDropCount_ += 1;
            
            if (streak.direction === 'rise') 
                bigRiseCount_ += 1;
        }
        console.log ('bigDropCount=', bigDropCount_, ' bigRiseCount=', bigRiseCount_, ' thershold=', changeThreshold)

        setDropsArray(streakArray)
        setBigDropsCount(bigDropCount_)
        setBigRiseCount(bigRiseCount_)


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

    // const ROW_SPACING = {padding: "0px 2px 0px 2px", margin: '0px', gap: '0', boarderSpacing: '0', boarderCollapse: 'collapse'};
   const ROW_SPACING = {padding: "0px 2px 0px 2px", margin: '0px'}
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

        {props.eliHome && <div style={{display:'flex'}}>
            <ComboBoxSelect serv={searchMode} nameList={['range','threshold',]} setSelect={setSearchMode} title='' options={[false, true]} defaultValue={true}/> &nbsp; &nbsp;  &nbsp;
            <input  type="checkbox" checked={log}  onChange={()=>setLog(! log)} />&nbsp;log  &nbsp; &nbsp; 
            <input  type="checkbox" checked={logExtra}  onChange={()=>setLogExtra(! logExtra)} />&nbsp;logExtra  
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

            {tableShow && <div style={{...ROW_SPACING, textAlign: 'left', maxWidth: '750px', height: '45vh', 'overflowY': 'scroll'}}>
            <div> length={dropsArray.length} &nbsp;&nbsp; highIndex={rawArrayLength} &nbsp;&nbsp; startDate={props.stockChartXValues[rawArrayLength - 1]}</div>
            <table>
                <thead>
                <tr style={ROW_SPACING}>
                    <th style={ROW_SPACING}>N</th>
                    {Object.keys(dropsArray[0]).map((h,h1) => {
                        return (
                            <th style={ROW_SPACING} key={h1}>{h}</th>
                        )
                    })}
                </tr>
                </thead>
                <tbody>
                    {dropsArray.map((s, s1) =>{
                        return (
                        <tr style={ROW_SPACING} key={s1}>
                            <td style={ROW_SPACING}>{s1}</td>
                            {Object.keys(dropsArray[s1]).map((a,a1) => {
                                return (
                                    <td key={a1} style={{...ROW_SPACING, color: colorChange(a,dropsArray[s1][a])}} >{dropsArray[s1][a]}</td>
                                )
                            })}
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>}

        {chartData && <Plot  data={chartData} layout={{ width: 750, height: 500, title: 'drop-rise-count',
            xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'price'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}

        </div>}
        </div>}
    </div>
  )

}


export {DropsCount}