import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {  useAuth, logout } from '../contexts/AuthContext';
import {IpContext} from '../contexts/IpContext';
// import { toDate } from "date-fns";
// import {format} from "date-fns"
// import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'
// import { columnIsLastLeftSticky } from 'react-table-sticky';
import peak2PeakCalc from './Peak2PeakCalc'

import LogFlags from '../utils/LogFlags'
import {beep2} from '../utils/ErrorList'


const Peak2PeakGui = (props) => {

  const { currentUser, admin, logout } = useAuth();
  const {localIp, localIpv4, eliHome, city, countryName, countryCode, regionName, ip, os} = IpContext();
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

    const [d_2000_date, set_2000_date] =   useState(new Date(2000, 0, 1)); // 2000 dec 1
    const [startDate, setStartDate] =  useState(new Date(2007, 10, 1)); // 2007 dec 1  base 0
    const [endDate, setEndDate] =   useState(new Date(2021, 11, 1)); // 2021 dec 1

    const [displayFlag, setDisplayFlag] = useState (false); 
    // const [calcResults, setCalcResults] = useState ();
    // const [calcInfo, setCalcInfo] = useState ();

    const [searchPeak, setSearchPeak] = useState (true);
    const [bubbleLineFlag, setBubbleLineFlag] = useState (false); // show that bubleLine calculated
    const [startFromPeakFlag, setStartFromPeakFlag] = useState (true); // start from oldestPeak


    const [results, setResults] = useState ();
    const [err, setErr] = useState ();
    const [bubbleLineRatio, setBubbleLineRatio] = useState ();
    const [histogram, setHistogram] = useState({})
    const [histogramShow, setHistogramShow] = useState ();
    const [peaksShow, setPeaksShow] = useState ();

    const [histogramLast, setHistogramLast] = useState({})
    var bubbleline = {}

    const [tableShowFlag, setTableShowFlag] = useState ();

    const LOG_FLAG = props.logFlags && props.logFlags.includes('peak2Peak');


    useEffect(() => {
      setHistogram({})
      setHistogramLast({})
      setResults();
      setErr()
      setBubbleLineFlag(false)
      setBubbleLineRatio()
      delete props.gainMap.bubbleLine
    },[props.symbol, props.gainMap]) 
   
  // style={{display:'flex'}}


  function histogramBuild () {
    histogram['> 1.20'] = 0
    histogram['> 1.15'] = 0
    histogram['> 1.10'] = 0
    histogram['> 1.05'] = 0
    histogram['> 1.00'] = 0
    histogram['> 0.95'] = 0
    histogram['> 0.90'] = 0
    histogram['> 0.85'] = 0
    histogram['> 0.80'] = 0
    histogram['> 0.75'] = 0
    histogram['> 0.70'] = 0
    histogram['> 0.65'] = 0
    histogram['> 0.60'] = 0
    histogram['> 0.55'] = 0
    histogram['> 0.50'] = 0 
    histogram['> 0.45'] = 0   
    histogram['> 0.40'] = 0   
    histogram['> 0.35'] = 0   
    histogram['< 0.35'] = 0

    for (let i = bubbleline.y.length - 1; i >= 0; i --) {
      const ratio = props.gainMap[props.symbol].y[i]  /  bubbleline.y[i]

      if (ratio >= 1.20) {
        histogram['> 1.20'] ++
        histogramLast['> 1.20'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio >= 1.15) {
        histogram['> 1.15'] ++
        histogramLast['> 1.15'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio >= 1.10) {
          histogram['> 1.10'] ++
          histogramLast['> 1.10'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio >= 1.05) {
        histogram['> 1.05'] ++
        histogramLast['> 1.05'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio >= 1) {
        histogram['> 1.00'] ++
        histogramLast['> 1.00'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.95) {
          histogram['> 0.95'] ++
          histogramLast['> 0.95'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.90) {
          histogram['> 0.90'] ++
          histogramLast['> 0.90'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.85) {
          histogram['> 0.85'] ++
          histogramLast['> 0.85'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.80) {
          histogram['> 0.80'] ++
          histogramLast['> 0.80'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.75) {
          histogram['> 0.75'] ++
          histogramLast['> 0.75'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.70) {
          histogram['> 0.70'] ++
          histogramLast['> 0.70'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.65) {
          histogram['> 0.65'] ++
          histogramLast['> 0.65'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.60) {
          histogram['> 0.60'] ++
          histogramLast['> 0.60'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.55) {
          histogram['> 0.55'] ++
          histogramLast['> 0.55'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.50) {
          histogram['> 0.50'] ++
          histogramLast['> 0.50'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.45) {
          histogram['> 0.45'] ++
          histogramLast['> 0.45'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.40) {
          histogram['> 0.40'] ++
          histogramLast['> 0.40'] = props.gainMap[props.symbol].x[i] 
      }
      else if (ratio > 0.35) {
          histogram['> 0.35'] ++
          histogramLast['> 0.35'] = props.gainMap[props.symbol].x[i] 
      }
      else {
          histogram['< 0.35'] ++
          histogramLast['< 0.35'] = props.gainMap[props.symbol].x[i] 
      }
    }

  } 

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}
  

  // temp save bubble crash baseline
  function calcBubbleLine (XValues, YValues) {  

    const stocks = Object.keys(props.gainMap)
    // if (stocks.length > 1) {
    //   setErr ('Bubble line only for a single etf: ' + JSON.stringify(stocks))
    //   beep2()
    // }

    var yBubbleLine = []

    //** extrapolate value of today */
    yBubbleLine[0] = results.v_2022_value * results.timeUnitGain ** results.i_2022_index // weekCount 

    const startDateMili = startDate.getTime()

    for (let i = 0; i < YValues.length - 1; i ++) {
      if (startFromPeakFlag) {
        const chartDateSplit = XValues[i].split('-')
        const date = (new Date([chartDateSplit[0], chartDateSplit[1], chartDateSplit[2]])); 
        const mili = date.getTime()

        if (Math.abs(startDateMili - mili)  < 1000 * 3600 * 24 * 8) { 
          break; // stop loop within 8 days of startDate (oldest bubble point)
        }
      }

      yBubbleLine.push(yBubbleLine[i] / results.timeUnitGain);
    }  

    if (! props.gainMap.bubbleLine) {
      bubbleline = {x: XValues, y: yBubbleLine}
      props.setBubbleLine (bubbleline)
      setBubbleLineFlag(true)

      if (Object.keys(props.gainMap).length > 1) {
        setErr('Bubble-line only for single stock. <reloadPage> and try again')
        // props.errorAdd(['Bubble-line only for single stock. <reloadPage> and try again'])
      }
    }

  
    //** calc ratio latestValue/bubbleline */
    const bubbleLineOver = (YValues[0] / yBubbleLine[0]).toFixed(3)
    setBubbleLineRatio(bubbleLineOver)
    if (results)
      results['CurrentPrice/bubbleLine'] = bubbleLineOver;
    console.log (props.symbol, ' / bubbleLine  =', bubbleLineOver, ';  sym_val=', YValues[0], 'bubbleLine_val=', yBubbleLine[0].toFixed(2))
    // console.log  (props.symbol, ' / bubbleLine ',  '  ', bubbleLineOver)

    histogramBuild ()
  }

  function colorHighRatio (ratio) {
    if (ratio >= 0.93)
      return 'red'
    return 'black'
  }

  const ROW_SPACING = {padding: '2px', margin: '2px'}

  return (
    <div style = {{border: '2px solid blue'}} id='deepRecovery_id' >
        <div> 

            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h6 style={{color: 'blue'}}> bubbleLine,  Peak2Peak (long term gain) &nbsp;  </h6>
            </div>
            
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> Calc {props.symbol} long-term-gain, and BubbleLine, according to 2008 & 2022 crashes  &nbsp;  </h6>

            <div style={{color: 'red'}}>{err}</div>

            
            {/* Choose dates for crashes 2001, 2008, 2022 */}

            {admin && <div  style={{display:'flex' }}> 
              <div style={{ color: 'black'}}  >2001_proximity_date:   </div>
              &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={d_2000_date} onChange={(date) => set_2000_date(date)} /> 
           </div>}

          <div  style={{display:'flex' }}> 
            <div style={{ color: 'black'}}  >2008_proximity_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
          </div>
      
          <div  style={{display:'flex' }}> 
            <div style={{ color: 'black'}}  > 2022_proximity_date:   </div>
            &nbsp; &nbsp;  <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />
          </div>

          {/* Buttons */}
          
           <div style={{display:'flex'}}> &nbsp; 
              {! results && <div><button style={{background: 'aqua'}} type="button" onClick={()=>peak2PeakCalc (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues,
               props.weekly, props.logFlags, props.searchPeak, d_2000_date, startDate, endDate, props.errorAdd, setResults, props.saveTable)}>Calc peak2peak gain </button> &nbsp; &nbsp;</div>}

              {results && ! bubbleLineRatio && ! props.gainMap.yBubbleLine &&  
                <button style={{background: 'aqua', fontWeight: 'bold', textDecoration: "underline overline"}}
                 type="button"  onClick={() => {calcBubbleLine (props.stockChartXValues, props.stockChartYValues)}}> calc Bubble-Line </button>}
              {props.gainMap.bubbleLine  &&  <div style={{color: 'magenta'}} >{props.symbol} currentPrice / bubbleLine = {bubbleLineRatio} </div>}
              {/* <div> Click </div> &nbsp;&nbsp;
              <div style={{color: 'magenta', fontWeight: "bold"}}> chart </div> */}
           </div>

            {/* config checkboxes  */}
           <div style={{display:'flex'}}> &nbsp; 
              {!  results && <div> <input  type="checkbox" checked={searchPeak}  onChange={() => {setSearchPeak (! searchPeak)}} />  searchPeak &nbsp;&nbsp; </div>}
              {! bubbleLineFlag && <div> <input  type="checkbox" checked={startFromPeakFlag}  onChange={() => {setStartFromPeakFlag (! startFromPeakFlag)}} />  startFromPeak  &nbsp;&nbsp; </div>}
          </div>

          {/* bubble info */}

           {results && <div>
             <div   style={{ color: 'green'}} >  <hr/> &nbsp;yearlyGain: {results.yearlyGain} &nbsp;&nbsp; ({results.yearlyGainPercent}%) </div>
             {/* <div> gain={results.gain} &nbsp;yearsDiff={results.yearsDiff}  &nbsp; from={results.from} ({results.fromValue}) &nbsp; to={results.to} ({results.toValue}) </div> */}
           </div>}

           <hr/>
            {/* Histogram of bubble proximity */}

            {Object.keys(histogram).length > 0 &&<div  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Bubble proximity Histogram  &nbsp; {props.symbol}_price / bubble_price;  &nbsp;</div>}

            {Object.keys(histogram).length > 0 && <div><input type="checkbox" checked={histogramShow}  onChange={() => setHistogramShow (! histogramShow)} /> &nbsp;histogram&nbsp;</div> }

            {histogramShow && Object.keys(histogram).length > 0 && <div style={{width: '450px', height:'300px', overflow:'auto'}}>

            {/* <pre>{JSON.stringify(histogram, null, 2)}</pre> */}
            <table>
              <thead>
                <tr>
                  <th>price / bubblePrice </th>
                  <th>frequency,count</th>
                  <th>lastDate</th>
                </tr>
              </thead>
              <tbody>
                  {Object.keys(histogram).map((s, s1) =>{
                      return (
                      <tr key={s1}>
                          {/* <td style={{width: '120px'}}>{props.gainMap.bubbleLine.x[s]}  </td>  */}
                          {<td style={ROW_SPACING}>{s}</td>}
                          {<td style={ROW_SPACING}>{histogram[s]}</td>}
                          {<td style={ROW_SPACING}>{histogramLast[s]}</td>}
                      </tr>
                    )
                  })}
              </tbody>
            </table>
           </div>}


            {/* Historical compare price/bubble */}

           {props.gainMap.bubbleLine && <div>
            <hr/>
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Hisorical {props.symbol} price / bubble_price  &nbsp;  </h6>
            <input  type="checkbox" checked={tableShowFlag}  onChange={() => setTableShowFlag (! tableShowFlag)} />&nbsp; compare Table &nbsp; 
           </div>}

            {tableShowFlag && props.gainMap.bubbleLine && props.gainMap[props.symbol] && <div style={{height:'300px', width: '400px', overflow:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>date </th>
                    <th>{props.symbol} price</th>
                    <th>bubbleLine price</th>
                    <th>ratio</th>
                  </tr>
                </thead>
                <tbody>
                    {Object.keys(props.gainMap.bubbleLine.y).map((s, s1) =>{
                        return (
                        <tr key={s1}>
                            <td style={{padding: '2px', margin: '2px', width: '120px'}}>{props.gainMap.bubbleLine.x[s1]}  </td> 
                            {<td style={{padding: '2px', margin: '2px'}}> {props.gainMap[props.symbol].y[s1].toFixed(2)}</td>}
                            {<td style={{padding: '2px', margin: '2px'}}>{props.gainMap.bubbleLine.y[s1].toFixed(2)}</td>}
                            {<td style = {{padding: '2px', margin: '2px', color: colorHighRatio(props.gainMap[props.symbol].y[s1] / props.gainMap.bubbleLine.y[s1])}}>
                              {(props.gainMap[props.symbol].y[s1] / props.gainMap.bubbleLine.y[s1]).toFixed(3)}</td>}
                        </tr>
                      )
                    })}
                </tbody>
            </table>
          </div>}  

          {/* Bubble info */}
          <hr/>
          {eliHome && results && <div><input type="checkbox" checked={peaksShow}  onChange={() => setPeaksShow (! peaksShow)} /> &nbsp;peaks list&nbsp; </div>}
          {eliHome && peaksShow && results && <div> 
           <hr/> 
            <div  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> {props.symbol}  Bubbles list info </div>
            <pre>{JSON.stringify(results, null, 2)}</pre>
           </div>}
           <hr/>
        </div>
    </div>
  )
}

export {Peak2PeakGui}