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
    const [streakThreshold, setStreakThreshold] = useState(6) // drop percentage, used for count number of drops
    const [streakEndReverseThreshold, setStreakEndReverseThreshold] = useState(2) // percentage to reverse the streak
    const [searchRange, setSearchRange] = useState(props.daily? 400:80) // default a year search range
    const [searchMode, setSearchMode] = useState (true) // 'range','threshold',

    const [tableShow, setTableShow] = useState(false)
    const [chartData, setChartData] = useState()

    //** output display */
    const [dropsArray, setDropsArray] = useState([])
    
    const [bigDropCount, setBigDropsCount] = useState()
    const [bigRiseCount, setBigRiseCount] = useState();
    const [bigDropsPerYear, setBigDropsPerYear] = useState();
    const [bigRisesPerYear, setBigRisesPerYear] = useState();

    const [rawArrayLength, setRawArrayLength] = useState()


    var bigDropCount_ = 0;
    var bigRiseCount_ = 0;

    var dropRiseRatioX = []
    var dropRiseRatioY = []
    var zigzagx_rise = []
    var zigzagx_drop = []
    var zigzagy_rise = [] 
    var zigzagy_drop = [] 

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
            const riseEndRatioThreshold = 1 - streakEndReverseThreshold / 100;
            // const riseEndThresholdVal = virtualHigh * (1 - changeThreshold / 100 / 4);

            if (virtualHigh > startValue * riseRatioThreshold) {
                rise_or_fall = 1
                deepAfterRise = value;
            }

            if (rise_or_fall === 1 && value < deepAfterRise)
                deepAfterRise = value

            if (rise_or_fall === 1 && (deepAfterRise < virtualHigh * riseEndRatioThreshold || i === 1)) {  // i === 1 meand end of search
                direction = 'rise'; // end of streak
                next = virtualHighIndex;
            }

            // end of rise streak, start drop streak
            const dropRatioThreshold = 1 - changeThreshold / 100
            // const dropValThreshold = startValue * (1 - changeThreshold / 100);
            const dropEndRatioThreshold = 1 + streakEndReverseThreshold / 100;
            // const dropEndThreshold = virtualLow * (1 + changeThreshold / 100 / 4);

            if (virtualLow <  startValue * dropRatioThreshold) {
                rise_or_fall = -1
                topAfterDrop = value;
            }

            if (rise_or_fall === -1 && value > topAfterDrop)
                topAfterDrop = value

            if (rise_or_fall === -1 && (topAfterDrop > virtualLow * dropEndRatioThreshold || i === 1)) { // i === 1 meand end of search
                direction = 'drop'; // end of streak
                next = virtualLowIndex;
            }

            const len = searchIndex - next
            const ratioEnd = direction === 'rise'? deepAfterRise / virtualHigh : topAfterDrop / virtualLow

            if (direction !== undefined) {
                var results = {
                    direction: direction,

                    ratio: Number((valArray[next] / valArray[searchIndex]).toFixed(3)),
                    ratioEnd: ratioEnd.toFixed(3), //direction === 'rise'? deepAfterRise / virtualHigh : topAfterDrop / virtualLow,
                    
                    index : searchIndex,
                    // next: next,              
                    // drop_after_rise: deepAfterRise / virtualHigh,
                    // rise_after_drop: topAfterDrop / virtualLow,
       
                    startDate: dateArray[searchIndex],
                    // endDate: dateArray[next],
                    len: len,
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
            

                if (rise_or_fall === 1) {
                    zigzagx_rise.push(props.stockChartXValues[next])
                    zigzagy_rise.push(props.stockChartYValues[next])
                }
                else {
                    zigzagx_drop.push(props.stockChartXValues[next])
                    zigzagy_drop.push(props.stockChartYValues[next])
                }
                if (len === 1) {
                    console.log ('1-day streak, index=' + searchIndex,  '  ', props.stockChartXValues[searchIndex], '  ratio=', results.ratio)
                }
                return next; // last index of this streak
            }
        }
        return -1; // not found  
    }


    //** main */ 
    function countDrops () {

    
        if (streakThreshold >= 100 || streakThreshold < 0) {
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
            next_ =  extractOneStreak (chartClippedX_temp, chartClippedY_temp, next_, streakThreshold, streakArray)
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
        console.log ('bigDropCount=', bigDropCount_, ' bigRiseCount=', bigRiseCount_, ' thershold=', streakThreshold)

        setDropsArray(streakArray)
        setBigDropsCount(bigDropCount_)
        setBigRiseCount(bigRiseCount_)

        // years_span
        var years_span = (new Date(chartClippedX_temp[0]) - new Date(chartClippedX_temp[chartClippedX_temp.length -1])) / (1000 * 60 * 60 * 24 * 365)
        setBigDropsPerYear ( (bigDropCount_ / years_span).toFixed(2))
        setBigRisesPerYear ( (bigRiseCount_ / years_span).toFixed(2))

        const dat =
        [
        {
            name: props.symbol,
            x: chartClippedX_temp,
            y: chartClippedY_temp,
            type: 'scatter',
            mode: 'lines',
            // marker: { color: 'black' }, 
            line: {
                color: 'lightGrey',
                width: 1 
            }
        },
        {
            name: 'rise',
            x: zigzagx_rise,
            y: zigzagy_rise,
            type: 'scatter',
            mode: 'markers',      
            marker: { color: 'darkGreen', size: 3 }, 
        },
        {
            name: 'drop',
            x: zigzagx_drop,
            y: zigzagy_drop,
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
        if (change < (100 - streakThreshold)/100) {
        return 'red'
        }
        const thresh = 1/((100 - streakThreshold)/100)
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
            {/* <ComboBoxSelect serv={searchMode} nameList={['range','threshold',]} setSelect={setSearchMode} title='' options={[false, true]} defaultValue={true}/> &nbsp; &nbsp;  &nbsp; */}
            <input  type="checkbox" checked={log}  onChange={()=>setLog(! log)} />&nbsp;log  &nbsp; &nbsp; 
            <input  type="checkbox" checked={logExtra}  onChange={()=>setLogExtra(! logExtra)} />&nbsp;logExtra  
        </div>} 


        <GetInt init={streakThreshold} callBack={setStreakThreshold} title='streak threshold %' type='text' pattern="[0-9\.]+" width = '60px'/> 
        <GetInt init={streakEndReverseThreshold} callBack={setStreakEndReverseThreshold} title='streak end reverse threshold %' type='text' pattern="[0-9\.]+" width = '60px'/> 

        <button  style={{background: '#e6eee6ff'}} type="button" onClick={()=>{setStreakThreshold (6);  setStreakEndReverseThreshold(2)}}> 6%  2%   </button> &nbsp; 
        <button  style={{background: '#e6eee6ff'}} type="button" onClick={()=>{setStreakThreshold (10); setStreakEndReverseThreshold(3.5)}}> 10%  3.5%   </button> &nbsp; 
        <button  style={{background: '#e6eee6ff'}} type="button" onClick={()=>{setStreakThreshold (15); setStreakEndReverseThreshold(5)}}> 15%  5%   </button> &nbsp; 
        <button  style={{background: '#e6eee6ff'}} type="button" onClick={()=>{setStreakThreshold (25); setStreakEndReverseThreshold(8)}}> 25%  8%   </button> &nbsp; 
        <button  style={{background: '#e6eee6ff'}} type="button" onClick={()=>{setStreakThreshold (35); setStreakEndReverseThreshold(12)}}> 35%  12%   </button> &nbsp; 
            
        {! searchMode && <GetInt init={searchRange} callBack={setSearchRange} title='SearchRange' type='Number' pattern="[0-9]+" width = '15%'/> }

  
        <div>&nbsp;</div>
        Start-date {<DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> }
        {/* <div>&nbsp;</div> */}
        <div>
        <button  style={{background: '#d1f7d1ff'}} type="button" onClick={()=>{setStartDate(new Date(2001, 0, 1))}}>2001 jan 1</button> &nbsp; 
        <button  style={{background: '#d1f7d1ff'}} type="button" onClick={()=>{setStartDate(new Date(2007, 7, 1))}}>2007 aug 1</button> &nbsp; 
        <button  style={{background: '#d1f7d1ff'}} type="button" onClick={()=>{setStartDate(new Date(2019, 7, 1))}}>2019 aug 1</button> &nbsp; 
        <button  style={{background: '#d1f7d1ff'}} type="button" onClick={()=>{setStartDate(new Date(2021, 7, 1))}}>2021 aug 1</button> &nbsp; 
        <button  style={{background: '#d1f7d1ff'}} type="button" onClick={()=>{setStartDate(new Date(2022, 7, 1))}}>2022 aug 1</button> &nbsp; 
        </div>
        <div>&nbsp;</div>

        <button  style={{background: 'aqua'}} type="button" onClick={()=>countDrops()}> Count streaks of drops, rises   </button>  &nbsp; 
       <div>&nbsp;</div>

        {chartData && <div>rise_streaks={bigRiseCount} &nbsp; &nbsp; rises_per_year={bigRisesPerYear}  </div>}
        {chartData && <div>drop_streaks={bigDropCount} &nbsp; &nbsp; drops_per_Year={bigDropsPerYear}  </div>}

        
        <div>&nbsp;</div>

       {chartData && <Plot  data={chartData} layout={{ margin: {l:40, r:0, t:0, b:40}, width: 750, height: 500, title: 'drop-rise-count',
             autosixe: true,
             legend: {
                orientation: 'v',
                x: 9.5,
                y: 6.5,
                xanchor: 'left',
                yanchor: 'top'
                },
             xaxis: {title: {text: 'date'}},
             yaxis: {title: {text: 'price'}}
            }} 
            config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}

        {<div>       
        {dropsArray.length > 0 && 
        <div>
            {/* <div>&nbsp;</div> */}
            <div> <input  type="checkbox" checked={tableShow}  onChange={() => setTableShow (! tableShow)} />  drop-rise-table (streaks) </div>

            {tableShow && <div style={{...ROW_SPACING, textAlign: 'left', height: '45vh', 'overflowY': 'scroll'}}>
            <div> length={dropsArray.length} &nbsp;&nbsp; highIndex={rawArrayLength} &nbsp;&nbsp; startDate={props.stockChartXValues[rawArrayLength - 1]}</div>
            <table>
                <thead>
                <tr style={{...ROW_SPACING}}>
                    <th style={{width: '15px', ...ROW_SPACING}}>N</th>
                    {Object.keys(dropsArray[0]).map((h,h1) => {
                        return (
                            <th style={{width: '15px', ...ROW_SPACING}} key={h1}>{h}</th>
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

         </div>}
        </div>}
    </div>
  )

}


export {DropsCount}