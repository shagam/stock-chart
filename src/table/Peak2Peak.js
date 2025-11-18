import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker'
import GetInt from '../utils/GetInt';
import "react-datepicker/dist/react-datepicker.css";
import {  useAuth, logout } from '../contexts/AuthContext';
import {IpContext} from '../contexts/IpContext';
// import { toDate } from "date-fns";
// import {format} from "date-fns"
// import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'
// import { columnIsLastLeftSticky } from 'react-table-sticky';
import {peak2PeakCalc} from './Peak2PeakCalc'
import {miliDifferenceFromToday} from '../utils/Date'

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

    const [bubbleCalcSinglePeak, setBubbleCalcSinglePeak] = useState (false)
    const [yearlyGainSinglePeak, setYearlyGainSinglePeak] = useState (1.16)  // manual estimate of yearl gain

    const [searchPeak, setSearchPeak] = useState (true);
    const [bubbleLineFlag, setBubbleLineFlag] = useState (false); // show that bubleLine calculated
    const [startFromPeakFlag, setStartFromPeakFlag] = useState (true); // start from oldestPeak


    const [results, setResults] = useState ();
    const [err, setErr] = useState ();
    const [bubbleLineRatio, setBubbleLineRatio] = useState (false);
    const [percentBelow, setPercentBelow] = useState ();
    const [belowHigh, setBelowHigh] = useState ();
    const [belowHighPercent, setBelowHighPercent] = useState ();
    const [histogram, setHistogram] = useState({})
    const [histogramShow, setHistogramShow] = useState (false);
    const [peaksShow, setPeaksShow] = useState (false);

    const [histogramLast, setHistogramLast] = useState({})
    const [log,setLog] = useState (false);

    var bubbleline = {}

    const [tableShowFlag, setTableShowFlag] = useState (false);

    const LOG_FLAG = log; //props.logFlags && props.logFlags.includes('peak2Peak');
    const row_index_eeee = props.rows.findIndex((row)=> row.values.symbol === process.env.REACT_APP_ELI_HOME_S)

    function clear () {
      setHistogram({})
      bubbleline = {}
      setHistogramLast({})
      setErr()
      setBubbleLineFlag(false)
      setBubbleLineRatio()
      delete props.gainMap.bubbleLine
    }

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
    // if (! bubbleline.y)
    //   return;
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
    clear()
    const stocks = Object.keys(props.gainMap)
    // if (stocks.length > 1) {
    //   setErr ('Bubble line only for a single etf: ' + JSON.stringify(stocks))
    //   beep2()
    // }

    //** calc gain in a time unit (week or day) */
    const miliDiff = Date.now() - miliDifferenceFromToday(XValues[XValues.length - 1])
    const yearsDiff = miliDiff / (1000 * 3600 * 24 * 365.25)
    const timeUnitInYear = XValues.length / yearsDiff 

    var yBubbleLine = []

    //** extrapolate value of today */
    var timeUnitGain;
    if (bubbleCalcSinglePeak) {
      timeUnitGain = yearlyGainSinglePeak ** (1 / timeUnitInYear)  // calc weekly or daily gain, from yearly gain by user
    }
    else 
      timeUnitGain = results.timeUnitGain 

    // calc estimate latest bubble value
    yBubbleLine[0] = results.v_2022_value * timeUnitGain ** results.i_2022_index // weekCount 

    const startDateMili = startDate.getTime()

    // fill in bubble value from lates to oldest
    var high = 0;
    if (YValues.length > 0)
    for (let i = 0; i < YValues.length - 1; i ++) {
      if (YValues[i] > high)
        high = YValues[i]

      if (startFromPeakFlag) {
        const chartDateSplit = XValues[i].split('-')
        const date = (new Date([chartDateSplit[0], chartDateSplit[1], chartDateSplit[2]])); 
        const mili = date.getTime()

        if (Math.abs(startDateMili - mili)  < 1000 * 3600 * 24 * 8) { 
          break; // stop loop within 8 days of startDate (oldest bubble point)
        }
      }

      if (bubbleCalcSinglePeak)
        yBubbleLine.push(yBubbleLine[i] / timeUnitGain);  // slope according to user number
      else
        yBubbleLine.push(yBubbleLine[i] / results.timeUnitGain);  // slope according to 2 peaks 2008 2022
    }  


      bubbleline = {x: XValues, y: yBubbleLine}
      props.setBubbleLine (bubbleline)
      setBubbleLineFlag(true)

    const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
    if (row_index === -1) {
      alert ('stock missing (bubbleLine): ' + props.symbol)
      return;
    }
    // const price_ = props.price;
    var price = props.rows[row_index].values.price;
    if (! price || props.rows[row_index].values.price_mili < props.rows[row_index].values.gain_mili) {
      price = YValues[0]
      console.log (props.symbol, 'price missing, using latest close value')
    }
    //** calc ratio latestValue/bubbleline */
    const bubbleLineOver = (price / yBubbleLine[0]).toFixed(3)
    const percent = (bubbleLineOver - 1) * 100 
    setPercentBelow(percent.toFixed(2))
    setBubbleLineRatio(bubbleLineOver)
    setBelowHigh(props.rows[row_index].values.priceDivHigh)
    const priceDivHigh = (price / high).toFixed(4);
    if (high !== 0)
      props.rows[row_index].values.priceDivHigh = priceDivHigh;
    const belowHigh = ((priceDivHigh - 1) * 100)
    if (props.rows[row_index].values.priceDivHigh)
      setBelowHighPercent(belowHigh.toFixed(2))
    if (results)
      results['CurrentPrice/bubbleLine'] = bubbleLineOver;
    console.log (props.symbol, ' / bubbleLine  =', bubbleLineOver, ';  sym_val=', YValues[0], 'price=', props.price, 'bubbleLine_val=', yBubbleLine[0].toFixed(2))
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
              <h6 style={{color: 'blue'}}> bubbleLine,  Peak2Peak (long term gain) &nbsp;  </h6> &nbsp; &nbsp;
            </div>
            
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> Calc {props.symbol} long-term-gain, and BubbleLine, according to 2008 & 2022 bubbles &nbsp;  </h6>

            <div style={{color: 'red'}}>{err}</div>

            {props.eliHome && <div><input type="checkbox" checked={log}  onChange={()=> setLog( ! log)}  />  &nbsp;Log &nbsp; &nbsp; </div>}
  
            {/* Choose dates for crashes 2001, 2008, 2022 */}

            {admin && <div  style={{display:'flex' }}> 
              <div style={{ color: 'black'}}  >2001_proximity_date:   </div>
              &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={d_2000_date} onChange={(date) => set_2000_date(date)} /> 
           </div>}

          <div  style={{display:'flex' }}> 
            <div style={{ color: 'black'}}  >2008_proximity_date:   </div>
            &nbsp; &nbsp;<DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
          </div>
      
          <div  style={{display:'flex' }}> 
            <div style={{ color: 'black'}}  > 2022_proximity_date:   </div>
            &nbsp; &nbsp;  <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />
          </div>


          {/* Single peak and estimate yearly gaiin bubble override gain */}
          <hr/>
          {((eliHome &&  row_index_eeee !== -1) || (results && ! results.timeUnitGain)) && <div>
            <h6 style={{color:'#33ee33', fontWeight: 'bold'}}> Calc {props.symbol} bubble line based on 2022 peak and your estimated yearly gain &nbsp;  </h6>
            <div style={{display: 'flex'}}>
              <input  type="checkbox" checked={bubbleCalcSinglePeak}  onChange={() => {setBubbleCalcSinglePeak (! bubbleCalcSinglePeak)}} /> 
              <div style={{paddingTop: '6px'}}> &nbsp; single-Peak &nbsp;&nbsp; </div>
              {bubbleCalcSinglePeak && <GetInt init={yearlyGainSinglePeak} callBack={setYearlyGainSinglePeak} title='yearlGain' type='text' pattern="[\\.0-9]+" width = '25%'/>}
            </div>
          </div>}


          {/* Buttons peak2PeakCalc  */}

            {! results && <div><button style={{background: 'aqua'}} type="button" onClick={()=>peak2PeakCalc (props.symbol, props.rows, props.stockChartXValues, props.stockChartYValues,
              props.weekly, props.logFlags, props.searchPeak, d_2000_date, startDate, endDate, props.errorAdd, setResults, props.saveTable, setErr)}>Calc peak2peak gain </button> &nbsp; &nbsp;</div>}
    
           <div style={{display_:'flex'}}> &nbsp; 
      
              {(bubbleCalcSinglePeak || (results && results.timeUnitGain && ! bubbleLineRatio && ! props.gainMap.yBubbleLine) ) && 
                  <button style={{background: 'magenta', fontWeight: 'bold', textDecoration: "underline overline"}}
                  type="button"  onClick={() => {calcBubbleLine (props.stockChartXValues, props.stockChartYValues)}}> calc Bubble-Line </button>
              }

              {props.gainMap.bubbleLine  &&  <div>{props.symbol} price: {props.price} &nbsp;
                <div style={{display: 'flex'}} >
                  belowBubbleLine= <div style={{color: 'magenta'}} >{bubbleLineRatio}  ({percentBelow}%)</div> &nbsp; &nbsp;
                  belowHigh= <div style={{color: 'magenta'}}>{belowHigh} ({belowHighPercent}%)</div>
                </div>
               </div>}
              {/* <div> Click </div> &nbsp;&nbsp;
              <div style={{color: 'magenta', fontWeight: "bold"}}> chart </div> */}
           </div>

            {/* config checkboxes  */}
           <div style={{display:'flex'}}> &nbsp; 
              {!  results && <div> <input  type="checkbox" checked={searchPeak}  onChange={() => {setSearchPeak (! searchPeak)}} />  searchPeak &nbsp;&nbsp; </div>}
              {! bubbleLineFlag && props.gainMap.bubbleLine && <div> <input  type="checkbox" checked={startFromPeakFlag}  onChange={() => {setStartFromPeakFlag (! startFromPeakFlag)}} />  startFromPeak  &nbsp;&nbsp; </div>}
          </div>

          {/* bubble info */}

           {results && <div>
             {results.yearlyGainPercent && <div   style={{ color: 'green'}} >  <hr/> &nbsp;yearlyGain: {results.yearlyGain} &nbsp;&nbsp; ({results.yearlyGainPercent}%) </div>}
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
                    <th>N</th>
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
                          <td style={{padding: '2px', margin: '2px'}}>{s1}</td>
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


            {/* <pre>{JSON.stringify(results, null, 2)}</pre> */}
            {results && <div style={{width: '300px'}}>
              <div  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> {props.symbol}  Peak list </div>
              <table border="1" >
                  <tbody>
                    {Object.entries(results).map(([key, value]) => (   
                      <tr key={key}>
                        <td style={{...ROW_SPACING, fontWeight: 'bold', background: '#ddddff'}}>{key}</td>
                        <td style={{...ROW_SPACING, textAlign: 'right',}}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}


           </div>}
           <hr/>
        </div>
    </div>
  )
}

export {Peak2PeakGui}