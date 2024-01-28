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



    const LOG = logFlags.includes('month')

    const mGain = [1,1,1,1,1,1, 1,1,1,1,1,1] // init value for gains
    const stocks = Object.keys (gainMap);

    stockCount_ = stocks.length;

    for (var symm in gainMap) {
      const gainMapSym = gainMap[symm];
      const mGainForSymm = [1,1,1,1,1,1, 1,1,1,1,1,1] ;  // monthGainfor one stock
      const mCountForSymm = [0,0,0,0,0,0, 0,0,0,0,0,0] ; // how many gains per each month
      const xArray = gainMapSym.x;
      const yArray = gainMapSym.y;
      var i = 0; // Jan
      
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
            if (LOG)
              console.log (xArray[weekOfNextMonth], ' ', xArray[i],  '  month:', mon, 'gain:', p.toFixed(2))
          }
          else
            console.log (symm, 'weekOfNextMonth=', weekOfNextMonth, 'i=', i)
          i = weekOfNextMonth;
        }
        else {
          var OneStockYearGain = 1;

          // no,alize values average
          for (let i = 0; i < 12; i++) {
            if (mCountForSymm[i] === 0) {
              console.log (symm + ' devide by zero ' + ' month=' + i)
            }
            else
              OneStockYearGain *= Math.pow(mGainForSymm[i], 1 / mCountForSymm[i]);
            mGainForSymm[i] = Math.pow (mGainForSymm[i], 1 / mCountForSymm[i]).toFixed(3)
          }
          // if (LOG)
          console.log (symm, 'yearlyGain: ', OneStockYearGain.toFixed(2), mGainForSymm)
          break // end of one stock
        }
      }
      for (let j = 0; j < 12; j++) {
        mGain[j] *= mGainForSymm[j]
      }
  } 
  
  // prepare for print results calc average stocks gain for 
  var yearlyGain = 1;
  mGainObj.Jan = Number(Math.pow(Number(mGain[0]), 1 / stockCount_)).toFixed(3);
  if (isNaN(mGainObj.Jan)) // debug error
    console.log (symm, NaN)
  else
    yearlyGain *= mGainObj.Jan;
  mGainObj.Feb = Number(Math.pow(Number(mGain[1]), 1 / stockCount_)).toFixed(3);
  if (isNaN(mGainObj.Jan)) // debug error
    console.log (symm, NaN)
  else
    yearlyGain *= mGainObj.Feb;
  mGainObj.Mar = Number(Math.pow(Number(mGain[2]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Mar;
  mGainObj.Apr = Number(Math.pow(Number(mGain[3]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Apr;
  mGainObj.May = Number(Math.pow(Number(mGain[4]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.May;
  mGainObj.Jun = Number(Math.pow(Number(mGain[5]), 1 / stockCount_)).toFixed(3);       
  yearlyGain*= mGainObj.Jun;
  mGainObj.Jul = Number(Math.pow(Number(mGain[6]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Jul;
  mGainObj.Aug = Number(Math.pow(Number(mGain[7]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Aug;
  mGainObj.Sep = Number(Math.pow(Number(mGain[8]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Sep;
  mGainObj.Oct = Number(Math.pow(Number(mGain[9]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Oct;
  mGainObj.Nov = Number(Math.pow(Number(mGain[10]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Nov;
  mGainObj.Dec = Number(Math.pow(Number(mGain[11]), 1 / stockCount_)).toFixed(3);
  yearlyGain *= mGainObj.Dec;

  setYearGain (yearlyGain)
}

export {monthGain}