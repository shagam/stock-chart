import React, {useState, useMemo, useEffect} from 'react' 
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import {IpContext} from '../contexts/IpContext';
import {todaySplit, todayDate, todayDateSplit, dateSplit, rawDateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import { beep2 } from '../utils/ErrorList';


//** estimated week number in the year */
function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
}
  

function MonthGain (props) {
  const [status, setStatus] = useState (); 
  const {localIp, localIpv4, eliHome} = IpContext();

  const [mGainObj, setMgainObj] = useState ({});
  const [yearGain, setYearGain] = useState ();
  const [monthNames, setMonthNames] = useState(['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
  const [startDate, setStartDate] = useState (new Date(2002, 9, 15));


  useEffect(() => {
    setStatus()
    setMgainObj({})
  },[props.symbol]) 



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

  function weekOfYearGet (array, i) {
    if (i + 52 > array.lngth)
      return -1; // fail
    const startDate = array[i].split('-')
      for (let j = i; j < 53; j++) {
        const date = array[j].split('-')
        if (startDate[0] !== date[0]) {
          return j - i
        }
      }
      return -1; // not found
    // if (i > array.length)
  }

  var stockCount_ = -1

  // collect month gain over the history
  function monthGainCalc (gainMap, mGainObj, setMgainObj, setYearGain, logFlags, startDate) {    

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

    const LOG = logFlags.includes('month')




    //* week gain arrays
    const weekGainArrayCollect = new Array(52).fill(1);
    const weekGainArrayCount = new Array(52).fill(0);

    if (false) // temp by pass
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

      for (let i = 0; i < oldestIndex; i++) { // index into weekly x (date) y (price) arrays 
        if (i === 52)
          break;

        const week_ = weekOfYearGet (xArray[i], i) 
        if (week_ === -1) // fail
          continue;
        // const weekNumber = new Date(xArray[i]).isoWeek();
        const dateSplit = xArray[i].split('-')
        const days = (dateSplit[1] - 1) * 30.41 + (dateSplit[2] - 1) // month and day need to subtract 1
        var week = days / 7;
        week = Math.round(week)
        week = week_;

        //collect week of year gain
        let dateOfInfo = new Date (xArray[i])
        // let onejan = new Date(dateOfInfo.getFullYear(), 0, 1);
        // let weekOfYear = Math.ceil((((dateOfInfo.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
      
        //  var getWeek = new Date(xArray[i]).getWeekNumber()// get WeekIn year
         var weekOfYear = getWeekNumber(new Date (xArray[i])) - 1;
        if (weekOfYear === 52) {
          weekOfYear -= 1
          setStatus('weekOfYear=', weekOfYear)
        }
        if (weekOfYear > 52) {
          setStatus('weekOfYear=', weekOfYear)
          return;
        }

        if (i < 55)
          console.log(xArray[i], weekOfYear)

        if (weekOfYear === 0) {
          setStatus('weekOfYear=', weekOfYear)
        }

        var nextWeekNum = (weekOfYear + 1) % 52;
        weekGainArrayCollect[weekOfYear] *= (yArray[nextWeekNum] / yArray[weekOfYear]);
        weekGainArrayCount[weekOfYear] ++;            
      }
    }



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
      } // end of one sym loop




      // average yearly  mon gain 
      if (LOG)
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
      // if (LOG)
        console.log (symm, 'yearly', mGainForSymmShift, mCountForSymm) // syngle sym 
      for (let j = 0; j < 12; j++) {
        if (! isNaN(mGainForSymmShift[j]))
        mGain[j] *= mGainForSymmShift[j]
        else {
          if (j=== 0)
            console.log (symm,'NaN',  mGainForSymmShift)
        }
      }
   
    } 



    
    // prepare for print results calc average stocks gain for few stocks
    var yearlyGain = 1;

    // calc average of stocks gain
    var monthGain = []
    var yearGain_ = 1;
    for (let i = 0; i < 12; i++) {
        monthGain[i] = Number(Math.pow(Number(mGain[i]), 1 / stockCount_).toFixed(3))
        yearGain_ *= monthGain[i]
    }
    // if (LOG)
        console.log(symm, 'agregate gainShiftBefore', ' yearlyGain', yearGain_.toFixed(3), monthGain)

    // shift gain from next month
    var monthGainShift = []
    for (let i = 0; i < 12; i++) {
        const nextMonth = (i + 1) % 12
        monthGainShift[i] = Number(Math.exp((Math.log (monthGain[i]) * 0.9) + Math.log (monthGain[nextMonth]) * 0.1).toFixed(3))
        yearlyGain *= monthGainShift[i];

    }
    // if (LOG)
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
        yearGain *= weekGainArray[i];
    }

    console.log ('yeearGain=', yearGain, 'weekGainArray=', weekGainArray, weekGainArrayCount)

    if (props.setMonthGainData) {
      props.setMonthGainData ({
        monthGainArray:  monthGainShift,
        monthNames: monthNames,
        weekGainArray: weekGainArray
      })
    }
  }

  return (
    <div>
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}> MonthGain </h6>
        </div>

        {/* &nbsp; &nbsp; */}
        <div style={{color:'red'}}>{status}</div>
        <div style={{display:'flex'}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"md"}} 
          dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> &nbsp; &nbsp; 
          {props.symbol && <button style={{background: 'aqua'}}  type="button" onClick={()=>monthGainCalc(props.gainMap, mGainObj, setMgainObj, setYearGain, props.logFlags, startDate)}>monthGain</button>}
        </div>
        
        {/* <br></br>  */}
        { Object.keys(mGainObj).map((oneKey,i)=>{
          return (
              <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {monthNames[i]}:  </div> &nbsp; &nbsp; {mGainObj[oneKey]}</div>
            )
        })}

        {Object.keys(mGainObj).length > 0 && <div>stockCount={Object.keys(props.gainMap).length} yearlyGain={yearGain.toFixed(3)} </div>}
        <br></br>           
    </div>
  )

}

export {MonthGain}