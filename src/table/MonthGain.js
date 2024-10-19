import React, {useState, useMemo, useEffect} from 'react' 
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'

import {todaySplit, todayDate, todayDateSplit, dateSplit, rawDateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import { beep2 } from '../utils/ErrorList';


//** estimated week number in the year */
// function getWeekNumber(d) {
//     // Copy date so don't modify original
//     d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
//     // Set to nearest Thursday: current date + 4 - current day number
//     // Make Sunday's day number 7
//     d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
//     // Get first day of year
//     var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
//     // Calculate full weeks to nearest Thursday
//     var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
//     // Return array of year and week number
//     return [d.getUTCFullYear(), weekNo];
// }
  


 //** search for week number */
 const LOG_week_above_52 = false
 function weekOfYearGet (Xarray, i) {
    if (i + 52 > Xarray.length){
      console.log ('near oldest i=', i, 'date=', Xarray[i], 'oldest=', Xarray[Xarray.length - 1])
      return -1; // fail
    }
    const startDate = Xarray[i].split('-')
    for (let j = 0; j <= 54; j++) {
      const date = Xarray[i + j].split('-')
      if (startDate[0] !== date[0]) {
        if (j > 52) {
          if (LOG_week_above_52)
            console.log ('weekNum=', 51, 'j=', j, 'i=', i, 'startDate=', Xarray[i], 'flipDate=', Xarray[i + j])
          return 51
        }
        return (52 + j - 1) % 52;
      }
    }
    console.log ('overRun 53 i=', 'start=', startDate)
    return -1; // not found
}
  

function MonthGain (props) {
  const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
  const [status, setStatus] = useState (); 
  const {localIp, localIpv4, eliHome} = IpContext();
  const [LOG_Week, setLOG_Week] = useState (false);
  const [LOG_Month, setLOG_Month] = useState (false);

  const [mGainObj, setMgainObj] = useState ({});
  const [weekGainArray_, setWeekGainArray] = useState ([]);
  const [yearGain, setYearGain] = useState ();
  const [monthNames, setMonthNames] = useState(['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
  const [startDate, setStartDate] = useState (new Date(2002, 9, 15));
  const [yearsCollectedForAverage, setYearsCollectedForAverage] = useState(new Array(52).fill(0)) // calc years of average
  //** needed for disolay date in weekGain table */
  const symbols = Object.keys(props.gainMap)
  const [gainMapSym, setGainMapSym] = useState (symbols[0])

  const [weekNumberForDate_0, setWeekNumberForDate_0] = useState ();
  const [weekNumYearGain, setWeekNumYearGain] = useState(1);

  useEffect(() => {
    setStatus()
    setMgainObj({})
  },[props.symbol]) 

    function setLog_toggle_week () {
      setLOG_Week (! LOG_Week)
    }
    function setLog_toggle_month () {
      setLOG_Month (! LOG_Month)
    }

 // loop through months
  function nextMonthWeek (i, xArray) {
    const date = xArray[i];
    if(date === undefined) {
      var b = 1
    }
    const dateSplit_ = dateSplit (date);
    var monthNum = dateSplit_[1];

    for (let j = i; j < xArray.length; j++) {  // i, j week number
      const nextDate = xArray[j];
      const nextDateSplit = dateSplit (nextDate);
      const nextMonth = nextDateSplit[1];
      if (nextMonth !== monthNum)
        return j;
    }
    // console.log (monthNum)
    return -1; // error
  }


  var stockCount_ = -1

  // collect month gain over the history
  function monthGainCalc (gainMap, mGainObj, setMgainObj, setYearGain, logFlags, startDate) {    
    setStatus()
    const stocks = Object.keys (gainMap);
    if (stocks.length === 0) {
      setStatus ('wait a few seconds for gain data')
      beep2()
      return;
    }


    // const n = 1.05;
    // const l = Math.log(n) // natural log
    // const r = Math.exp(l) 
    // console.log (n, l, r)
    // const LOG = logFlags.includes('month')


    //* week gain arrays for all syms
    const weekGainArrayCollect = new Array(52).fill(1);
    const weekGainArrayCount = new Array(52).fill(0);

    //** used to display daste in weekgain table */
    const weekNumOfDate_temp = (gainMapSym && props.gainMap[gainMapSym]) ?  weekOfYearGet (props.gainMap[gainMapSym].x, 0) : null // get week num of first date
    if (weekNumOfDate_temp)
      setWeekNumberForDate_0 (weekNumOfDate_temp)


    // if (false) // temp by pass
    // week gain  collect for all symbols
    for (var symm_ in gainMap) {
      
      const gainMapSym = gainMap[symm_];
      const xArray = gainMapSym.x;
      const yArray = gainMapSym.y;
      const startDateSplit = rawDateSplit (startDate) 
      let oldestIndex = searchDateInArray (xArray, startDateSplit, symm_);
      
      if (oldestIndex === -1) {
        oldestIndex = xArray.length; // use shorter array
        console.log (symm_, 'Date not found')
        continue;
      }
      var errCount = 0;
      for (let i = 0; i < oldestIndex -1; i++) { // index into weekly x (date) y (price) arrays 

        var weekOfYear = weekOfYearGet (xArray, i) 
        if (weekOfYear === -1) {// fail
          continue;
        }

        if ( weekOfYear >= 52 && LOG_Week) {
          console.log ('weekOfYear=52', 'i=', i, 'weekOfYear', weekOfYear, 'date=', xArray[weekOfYear])
          // errCount ++;
          // weekOfYear %= 52;
          errCount++
          continue
        }

        var totalGain = 1;
        const weekGain = (yArray[i] / yArray[i + 1])
        weekGainArrayCollect[weekOfYear] *= weekGain;
        weekGainArrayCount[weekOfYear] ++;
        totalGain *= weekGain;
        if (weekOfYear === 51 && LOG_Week) {
          console.log ('debug 51,', xArray[i], 'weekOfYear=', weekOfYear, 'lastGain=', weekGain.toFixed(3),
           'GainOfWeekNum=', weekGainArrayCollect[weekOfYear].toFixed(3), 'totalGain=', totalGain.toFixed(3) )
        }
      }
    } // end of week loop one sym



    //** monthly gain */
    const mGain = [1,1,1,1,1,1, 1,1,1,1,1,1] // init value for gains

    stockCount_ = stocks.length;
    var arrayLen = 0; // collect average length in weeks

    for (var symm in gainMap) {
      const gainMapSym = gainMap[symm];
      const mGainForSymm = [1,1,1,1,1,1, 1,1,1,1,1,1] ;  // monthGainfor one stock
      const mGainForSymmShift = [] ;  // monthGainfor one stock
      const mCountForSymm = [0,0,0,0,0,0, 0,0,0,0,0,0] ; // how many gains per each month
      var oneStockYearGain = 1
      const xArray = gainMapSym.x;
      const yArray = gainMapSym.y;

      const startDateSplit = rawDateSplit (startDate) 
      var oldestIndex = searchDateInArray (xArray, startDateSplit, null);
      if (oldestIndex === -1) {
        oldestIndex = xArray.length; // use shorter array
        console.log (symm, 'Date not found')
        continue;
      }
      arrayLen += oldestIndex;
      if (oldestIndex >= xArray.length) // verify range
        oldestIndex = xArray.length

      var i = 0; // Jan Changed inside loop
      const debug = []

      for (; i < oldestIndex; ) { // index into weekly x (date) y (price) arrays 
        var weekOfNextMonth = nextMonthWeek(i, xArray); // 0..11
        if (weekOfNextMonth < 0) { // if not end of array
          setStatus('error', weekOfNextMonth, i)
          beep2()
          break;
        }
        if (weekOfNextMonth >= oldestIndex) {// avoid overflow array
          i++;
          continue;
        }

        const date = xArray[i];
        const dateSplit_ = dateSplit (date); // [year,mon,day]
        const mon = (Number(dateSplit_[1]) - 1 + 12) % 12; // month  0..11
        const year = Number(dateSplit_[0])
  
        const p = Number((yArray[i] / yArray[weekOfNextMonth]).toFixed(4))
        const debugObj = {d: xArray[i], m: mon, w: i, y: yArray[i], p: p}
        debug.push (debugObj) //  yr: year,
        // console.log (debugObj)

        if (yArray[weekOfNextMonth] === 0)
          console.log (symm, weekOfNextMonth, yArray[weekOfNextMonth])
        mGainForSymm[mon] *= Number(p)
        if (isNaN(mGainForSymm[mon])) {
          console.log (symm, NaN, yArray[weekOfNextMonth])
          const a = -1;
        }
        mCountForSymm[mon] ++;
        i = weekOfNextMonth; // next month
      } // end of one sym loop for months




      // average yearly  mon gain 
      if (LOG_Month)
      console.log(symm, 'mult array', mGainForSymm, mCountForSymm)
      if (mCountForSymm[0] === 0) {
          console.log (symm, 'NaN', mCountForSymm);
      }
      else  
      for (let i = 0; i < 12; i++) {
        const gainTemp = Number(Math.pow (mGainForSymm[i], 1 / mCountForSymm[i])).toFixed(5)
          if (! isNaN(gainTemp)) {
          mGainForSymmShift[i] = gainTemp;
          oneStockYearGain *= gainTemp;
        }
        else
          console.log (symm, 'NaN', mGainForSymm, mCountForSymm)
      }
      // if (LOG)
      // console.log(symm, debug)

      // add symbol to other
      if (LOG_Month)
        console.log (symm, 'yearly', mGainForSymmShift, mCountForSymm) // syngle sym 
      for (let j = 0; j < 12; j++) {
        if (! isNaN(mGainForSymmShift[j]))
        mGain[j] *= mGainForSymmShift[j]
        else {
          if (j=== 0)
            console.log (symm,'NaN',  mGainForSymmShift)
        }
      }
   
    } // end loop for sym



    
    // prepare for print results calc average stocks gain for few stocks
    var yearlyGain = 1;

    // calc average of stocks gain
    var monthGain = []
    var yearGain_ = 1;
    for (let i = 0; i < 12; i++) {
        monthGain[i] = Number(Math.pow(Number(mGain[i]), 1 / stockCount_).toFixed(3))
        yearGain_ *= monthGain[i]
    }
    if (LOG_Month)
        console.log(symm, 'agregate gainShiftBefore', ' yearlyGain', yearGain_.toFixed(3), monthGain)

    // shift gain from next month
    var monthGainShift = []
    for (let i = 0; i < 12; i++) {
        const nextMonth = (i + 1) % 12
        monthGainShift[i] = Number(Math.exp((Math.log (monthGain[i]) * 0.9) + Math.log (monthGain[nextMonth]) * 0.1).toFixed(3))
        yearlyGain *= monthGainShift[i];

    }
    if (LOG_Month)
        console.log(symm,'agregate gainShiftAfter', ' yearlyGain', yearlyGain.toFixed(3), monthGainShift, 'averageArrayLen=', (arrayLen/stockCount_).toFixed(1))

    // resultArray   monthGainShift

    mGainObj.Jan = monthGainShift[0]
    mGainObj.Feb = monthGainShift[1]
    mGainObj.Mar = monthGainShift[2]
    mGainObj.Apr = monthGainShift[3]
    mGainObj.May = monthGainShift[4]
    mGainObj.Jun = monthGainShift[5]     
    mGainObj.Jul = monthGainShift[6]
    mGainObj.Aug = monthGainShift[7]
    mGainObj.Sep = monthGainShift[8]
    mGainObj.Oct = monthGainShift[9]
    mGainObj.Nov = monthGainShift[10]
    mGainObj.Dec = monthGainShift[11]

    setYearGain (yearlyGain)


    // calculate week gain average
    const weekGainArray = [];

    var yearGain = 1;
    for (let i = 0; i < 52; i++) {
        weekGainArray[i] = Math.pow(weekGainArrayCollect[i], (1/weekGainArrayCount[i]))
        // if (i === 0 && isNaN (weekGainArray[0]))
        //   alert ('week gain calc fain; weekGain NaN')
        yearGain *= weekGainArray[i];
        yearsCollectedForAverage[i] = weekGainArrayCount[i] / symbols.length // calc years
    }
    setWeekNumYearGain (yearGain)

    if (LOG_Week)
      console.log ('yearGain=',  yearGain, 'weekGainArray=', weekGainArray, weekGainArrayCount, errCount)

    setWeekGainArray (weekGainArray)
    if (props.setMonthGainData) {
      props.setMonthGainData ({
        monthGainArray:  monthGainShift,
        monthNames: monthNames,
        weekGainArray: weekGainArray,
        yearsCollectedForAverage: yearsCollectedForAverage
      })
    }
  }

  //* color gain numbers according to gain
  function gainColor (gain, week) {
    if ((week && gain > 1.007) || (!week && gain > 1.015)) { // for month color for hiegher gain
      const diff = gain -1;
      return '#00ff00' // diff * 40 green
    }
    else if ((week && gain < 0.993) || (!week &&  gain < 0.98) ) {
      const diff = (1 - gain)
      return '#ff0000'// + diff * 256 * 40 red
    }
    else
     return '#0'  // black
  }

  const ROW_SPACING = {padding: '2px', margin: '2px'}

  return (
    <div>
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}> Week/Month-Gain </h6>
        </div>

        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Average monthly & weekly gain of {props.symbol}:  &nbsp; </h6>

        {/* &nbsp; &nbsp; */}
        <div style={{color:'red'}}>{status}</div>
        <div style = {{display: 'flex'}}>
          {props.symbol && Object.keys(props.gainMap).length > 0 && <button style={{background: 'aqua'}}  type="button" 
            onClick={()=>monthGainCalc(props.gainMap, mGainObj, setMgainObj, setYearGain, props.logFlags, startDate)}>week-month-gain</button>}
            &nbsp; &nbsp;
          <div style={{display:'flex'}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"md"}} 
              dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> &nbsp; &nbsp;  </div>
        </div>

        {! isMobile && eliHome &&  <div> &nbsp;
          <input type="checkbox" checked={LOG_Week}  onChange={setLog_toggle_week}  /> &nbsp;LOG_week &nbsp; &nbsp;
          <input type="checkbox" checked={LOG_Month}  onChange={setLog_toggle_month}  /> &nbsp;LOG_month &nbsp; &nbsp;
        </div>}

        {/* <br></br>  */}
        {Object.keys(mGainObj).length > 0 && <div>stockCount={Object.keys(props.gainMap).length} yearlyGain={yearGain.toFixed(3)} </div>}
        { Object.keys(mGainObj).map((oneKey,i)=>{
          return (
              <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {monthNames[i]}: </div>
                &nbsp; &nbsp; <div style={{color: gainColor (mGainObj[oneKey], false)}} > {mGainObj[oneKey]}</div> </div>
            )
        })}

 
        <br></br> 
        
        {weekNumYearGain !== 1 && <div> weekNumYearGain={weekNumYearGain.toFixed(3)}</div>}
        {weekGainArray_.length > 0  && <div style={{height:'450px', width: '400px', overflow:'auto'}}>
        <table>
          <thead>
            <tr>
              <th>week #</th>
              <th>last date of &nbsp; &nbsp;  week-number</th>
              <th>week gain</th>
              <th>years</th>

            </tr>
          </thead>
          <tbody>
              {weekGainArray_.map((s, s1) =>{
                  return (
                  <tr key={s1}>
                      <td style={{padding: '2px', margin: '2px', width: '80px'}}>{s1}  </td> 
                      {props.gainMap && props.gainMap[gainMapSym] && <td  style={{padding: '2px', margin: '2px'}}>{props.gainMap[gainMapSym].x[(52 * 30 + weekNumberForDate_0 - s1)%52]}</td>}
                      <td style= {{padding: '2px', margin: '2px', color: gainColor (s, true)}} color> {s.toFixed(4)} </td>
                      <td style={{padding: '2px', margin: '2px'}}>{yearsCollectedForAverage[s1]}</td>

                  </tr>
                )
              })}
          </tbody>
      </table>
      </div>}  
    </div>
  )

}

export {MonthGain, weekOfYearGet}