import React, {useState, useMemo, useEffect} from 'react' 

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'

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
  function monthGain (gainMap, mGainObj, setMgainObj, setYearGain, logFlags) {    

    // const n = 1.05;
    // const l = Math.log(n) // natural log
    // const r = Math.exp(l) 
    // console.log (n, l, r)
    // const LOG = logFlags.includes('month')

    const LOG = logFlags.includes('month')

    const mGain = [1,1,1,1,1,1, 1,1,1,1,1,1] // init value for gains
    const stocks = Object.keys (gainMap);

    stockCount_ = stocks.length;

    for (var symm in gainMap) {
      const gainMapSym = gainMap[symm];
      const mGainForSymm = [1,1,1,1,1,1, 1,1,1,1,1,1] ;  // monthGainfor one stock
      const mGainForSymmShift = [] ;  // monthGainfor one stock
      const mCountForSymm = [0,0,0,0,0,0, 0,0,0,0,0,0] ; // how many gains per each month
      var oneStockYearGain = 1
      const xArray = gainMapSym.x;
      const yArray = gainMapSym.y;
      var i = 0; // Jan Changed inside loop
      
      for (; i < yArray.length; ) { // index into weekly x (date) y (price) arrays 
        var weekOfNextMonth = nextMonthWeek(i, xArray); // 0..11
        if (weekOfNextMonth >= 0) { // if not end of array

          const date = xArray[i];
          const dateSplit_ = dateSplit (date); // [year,mon,day]
          const mon = (Number(dateSplit_[1]) - 1 + 12) % 12; // month  0..11
    
    
          if (weekOfNextMonth - i >= 3) {
            const p = yArray[i] / yArray[weekOfNextMonth]
            if (yArray[weekOfNextMonth] === 0)
              console.log (symm, weekOfNextMonth, yArray[weekOfNextMonth])
            mGainForSymm[mon] *= Number(p)
            if (isNaN(mGainForSymm[mon])) {
              console.log (symm, NaN, yArray[weekOfNextMonth])
              const a = -1;
            }
            mCountForSymm[mon] ++;
            // mGainForSymm[mon] = mGainForSymm[mon].toFixed(2)
            // mGain[mon] = mGainForSymm[mon];
            // if (LOG)
            //   console.log (xArray[weekOfNextMonth], ' ', xArray[i],  '  month:', mon, 'gain:', p.toFixed(2))
          }
          else
            console.log (symm, 'weekOfNextMonth=', weekOfNextMonth, 'i=', i)
          i = weekOfNextMonth;
        }
        else {
          // noralize values average
          for (let i = 0; i < 12; i++) {
            const gainTemp = Number(Math.pow (mGainForSymm[i], 1 / mCountForSymm[i]).toFixed(3))
            mGainForSymmShift[i] = gainTemp;
            oneStockYearGain *= gainTemp;
          }
          if (LOG)
            console.log (symm, 'yearlyGainForSym: ', oneStockYearGain.toFixed(3), mGainForSymmShift)
          break // end of one stock
        }
      }

      // add symbol to other
      for (let j = 0; j < 12; j++) {
        mGain[j] *= mGainForSymmShift[j]
      }
    } // end one symm
    
    // prepare for print results calc average stocks gain for 
    var yearlyGain = 1;

    // calc average
    var monthGain = []
    for (let i = 0; i < 12; i++)
        monthGain[i] = Number(Math.pow(Number(mGain[i]), 1 / stockCount_).toFixed(3))
    if (LOG)
        console.log('agregate gainShiftBefore', monthGain)

    // shift gain from next month
    var monthGainShift = []
    for (let i = 0; i < 12; i++) {
        const nextMonth = (i + 1) % 12
        monthGainShift[i] = Number(Math.exp((Math.log (monthGain[i]) * 0.9) + Math.log (monthGain[nextMonth]) * 0.1).toFixed(3))
        yearlyGain *= monthGainShift[i];
    }
    if (LOG)
        console.log('agregate gainShiftAfter', yearlyGain.toFixed(3), monthGainShift)


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


// compensate for month shift





  setYearGain (yearlyGain)
}

export {monthGain}