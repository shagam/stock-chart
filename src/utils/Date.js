
// import React from 'react'
import {format} from "date-fns"

const LOG = false;

//** date format YYYY-MM-DD */
function miliDifferenceFromToday (date) {
  const dateStartSplit = date.split('-')
  const dateStartMili = new Date(dateStartSplit[0], dateStartSplit[1], dateStartSplit[2]).getTime()
  return dateStartMili;
}



//** date format YYYY-MM-DD */
function yearsDifference (date0, date1) {
  const dateStartSplit = date0.split('-')
  const dateLastSplit = date1.split('-')
  const dateStartMili = new Date(dateStartSplit[0], dateStartSplit[1], dateStartSplit[2]).getTime()
  const dateLastMili = new Date(dateLastSplit[0], dateLastSplit[1], dateLastSplit[2]).getTime()
  const yearsDiff = (dateLastMili - dateStartMili) / (1000 * 3600 * 24 * 365)   // calc years between 2 values
  return yearsDiff;
}


const todayDate = () => {
  const date = new Date();
  const formattedDate = format(date, "yyyy-MM-dd");
  return formattedDate;
}

// [year, mon, day]
const todayDateSplit = () => {
  const date = new Date();
  const formattedDate = format(date, "yyyy-MM-dd");
  const dateArraySplit = formattedDate.split('-');
  dateArraySplit[0] = Number(dateArraySplit[0]);
  dateArraySplit[1] = Number(dateArraySplit[1]);
  dateArraySplit[2] = Number(dateArraySplit[2]);
  return dateArraySplit;
}

const rawDateSplit = (date) => {
  const formattedDate = format(date, "yyyy-MM-dd");
  const dateArraySplit = formattedDate.split('-');
  dateArraySplit[0] = Number(dateArraySplit[0]);
  dateArraySplit[1] = Number(dateArraySplit[1]);
  dateArraySplit[2] = Number(dateArraySplit[2]);
  return dateArraySplit;
}

function getDate() {
  const date = new Date();
  var formattedDate = format(date, "yyyy-MMM-dd  HH:mm");
  return formattedDate;    
}

function formatDate(date) {
  // const date = new Date();
  var formattedDate = format(date, "yyyy-MMM-dd  HH:mm");
  return formattedDate;    
}

function getDateSec() {
  const date = new Date();
  var formattedDate = format(date, "yyyy-MMM-dd  HH:mm:ss");
  return formattedDate;    
}

// [year, mon, day]
const dateSplit = (date) => {
  const dateSplit = date.split('-');
  dateSplit[0] = Number(dateSplit[0]);
  dateSplit[1] = Number(dateSplit[1]);
  dateSplit[2] = Number(dateSplit[2]);
  return dateSplit;
} 

// const monNameToNumber = (monStr) => {
//   switch (monStr) {
//     case 'Jan': return 1;
//     case 'Feb': return 2;
//     case 'Mar': return 3;
//     case 'Apr': return 4;
//     case 'May': return 5;
//     case 'Jun': return 6;
//     case 'Jul': return 7;
//     case 'Aug': return 8;
//     case 'Sep': return 9;
//     case 'Oct': return 10;
//     case 'Nov': return 11;
//     case 'Fec': return 12;
//     default: alert ('wrong month str, cannot convert')
//   }
// }

// array [year, month, day] month 1..12
const monthsBack = (dateArray, months) => { // [y,m,d]
  var dateArray_ =  [...dateArray];
  dateArray_[0] = Number(dateArray_[0]);
  dateArray_[1] = Number(dateArray_[1]);
  dateArray_[2] = Number(dateArray_[2]);

  if (dateArray_[1] - months >= 1)
    dateArray_[1] -= months;
  else {
    dateArray_[0] -= (Math.floor((months + 12 - dateArray_[1]) /12));
    dateArray_[1] = (dateArray_[1] + 12 - months) % 12;
    if (dateArray_[1] < 0)
      dateArray_[1] += 12;
    if (dateArray_[1] === 0)
      dateArray_[1] = 12;
  }
  if (dateArray_[1] === 0) {
    console.log('err')
  }
  return dateArray_;
}

const monthsBackTest = () => {
    var testDate = [2022, 2, 15];
    
    var back = 6;
    var date = monthsBack ([2022, 6, 30], back);
    console.log (testDate, back, date)

    back = 3;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)
    
    back = 5;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)
    
    back = 6;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)
    
    back = 12;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)

    back = 13;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)
  
    back = 14;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)

    back = 36;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)

    back = 144;
    date = monthsBack (testDate, back);
    console.log (testDate, back, date)

  }
  
function daysBackTest() {
  var testDate = [2022, 2, 15];
  var back = 60;
  var date = daysBack(testDate, back);
  console.log(testDate, back, date);

  back = 15;
  date = daysBack(testDate, back);
  console.log(testDate, back, date);

  back = 30;
  date = daysBack(testDate, back);
  console.log(testDate, back, date);

  back = 60;
  date = daysBack(testDate, back);
  console.log(testDate, back, date);

  back = 10;
  date = daysBack([2022, 3, 5], back);
  console.log(testDate, back, date);

}

const daysBack = (dateArray, days) => {  // [y,m,d] days bacck limit to 14

  var dateArray_ =  [...dateArray];
  dateArray_[0] = Number(dateArray_[0]);
  dateArray_[1] = Number(dateArray_[1] - 1);
  dateArray_[2] = Number(dateArray_[2] - 1);
  const years = Math.floor (days / 365.25);
  const daysYearRemain = Math.floor (days % 365);
  const months = Math.floor (daysYearRemain / 30);
  const dayRemain = daysYearRemain  % 30;

  dateArray_[2] -= dayRemain;
  if (dateArray_[2] < 0) {
    dateArray_[2] += 31;
    dateArray_[1] -= 1;
  }
  dateArray_[1] -= months;
  if (dateArray_[1] < 0) {
    dateArray_[1] += 12;
    dateArray_[0] -= 1;
    dateArray_[0] -= years;
  }
   
  dateArray_[1] += 1
  dateArray_[2] += 1
  return dateArray_;
}

// recieves 2 arrays [y,m,d]
const compareDate = (date1, date2) => {
  // compare year
  if (date1[0] > date2[0])
    return 1;
  if (date1[0] < date2[0])
    return -1;
    
  // ecompare month
  if (date1[1] > date2[1])
    return 1;
  if (date1[1] < date2[1])
    return -1;    

    // compare day
  if (date1[2] > date2[2])
    return 1;
  if (date1[2] < date2[2])
    return -1;

  return 0;
}

function dateStr (date1Split) {
  var date =  date1Split[0] + '-';
  if (date1Split[1] < 9) date += '0';
  date += date1Split[1];
  date += '-'
  if (date1Split[2] < 9) date += '0';
  date += date1Split[2]
  return date
}

const daysFrom1970_ios = (dateArray) => {
  const dateDays = (dateArray[0] - 1970) * 365.25 + (dateArray[1] -1) * 30.416 + dateArray[2] - 1;
  return Number(dateDays).toFixed(0);
}

const daysFrom1970 = (dateArray) => {
  const dateStr = dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2]
  const dateMili = new Date(dateStr).getTime();
  const days = (dateMili  / 24 / 3600 / 1000).toFixed(0)
  // const dateDays = ((dateArray[0] - 1970) * 365.25 + (dateArray[1] -1) * 30.416 + dateArray[2]).toFixed(0);
  if (isNaN (days)) {
    return daysFrom1970_ios (dateArray);  // ios does not support Date(dateStr).getTime();
  }
  return Number(days);

}
// const dateDiff = (dateArray1, dateArray2) => {
//   const diff = daysFrom1970 (dateArray1) - daysFrom1970 (dateArray2)
//   return Math.abs(diff);
// }

// const same = (date1Split, date2Split) => {
//   if (date1Split[0] === date2Split[0] && date1Split[1] === date2Split[1] && date1Split[2] === date2Split[2])
//     return true;
//   else
//     return false;
// }

// return index of dataArray closest
function searchDateInArray(stockChartXValuesFunction, testDateArray, sym, logFlags, setErr) {

  if (stockChartXValuesFunction === undefined || stockChartXValuesFunction.length === 0) {
    console.log (sym, 'xArtray invalid')
    return -2;
  }
  //var testDateArray = [2020, 11, 1];
  let i = 0;
  var newestIndx = 0;
  var oldestIndx = stockChartXValuesFunction.length - 1;

  if (compareDate(testDateArray, stockChartXValuesFunction[stockChartXValuesFunction.length - 1].split('-')) === -1)
    return -1;
  // if (LOG)
  //   console.log ('\nsearch date: ', testDateArray, sym)
  //   console.log('\nsearch date: ', JSON.stringify(testDateArray), sym);

  var collectedLog = "";
  const loopLimit = Math.round(Math.log2(stockChartXValuesFunction.length * 8));
  for (i = 0; i < loopLimit; i++) {

    var searchIndex = Math.round((newestIndx + oldestIndx) / 2);
    var movingDate = dateSplit(stockChartXValuesFunction[searchIndex]);

    const daysDiff = daysFrom1970(testDateArray) - daysFrom1970(movingDate);
    collectedLog += '\nold: ' + oldestIndx + ' new: ' + newestIndx + ' moving: ' + searchIndex + ' daysDiff: ' + daysDiff;

    if (Math.abs(oldestIndx - newestIndx) <= 1) {
      if (logFlags && logFlags.includes('date'))
        console.log(sym, 'found_: ', stockChartXValuesFunction[oldestIndx], 'search=', JSON.stringify(testDateArray), 'index:', oldestIndx);
      if (oldestIndx === 1)
        oldestIndx --; // force edge
      return oldestIndx;
    }

    if (daysDiff === 0) {
      if (logFlags && logFlags.includes('date'))
        console.log(sym, 'found_0: ', stockChartXValuesFunction[searchIndex], 'search=', JSON.stringify(testDateArray), 'index:', searchIndex);
      return searchIndex;
    }
    if (daysDiff > 0) {
      if (daysDiff < 2) {
        if (logFlags && logFlags.includes('date'))
          console.log(sym, 'found+: ', stockChartXValuesFunction[searchIndex], 'search=', JSON.stringify(testDateArray), 'index:', searchIndex);
        return searchIndex;
      }

      else
        oldestIndx = searchIndex;
    }
    if (daysDiff < 0)
      newestIndx = searchIndex;

  }
  const log = 'searchDateInArray loop newest=' + newestIndx + ' oldest=' + oldestIndx + ' i=' + i + ' loopLimit=' + loopLimit + 
  ' movingDate=' + movingDate + ' ' + sym + ' length=' + stockChartXValuesFunction.length ;
  console.log(log + collectedLog);
  if (setErr)
    setErr(log)
  else
    alert(log);
  return -1; // not found
}

function dateToArray (date) {
  const year = date.getFullYear();
  const mon = date.getMonth() + 1;
  const day = date.getDate();
  return [year,mon,day]
}

function year2Date () {
  var date =  new Date();
  const startYear = date.getFullYear();
  const startMon = 1;
  const startDay = 1;
  const y2d_date = new Date ([startYear, startMon, startDay])
  return y2d_date;
}

function isDailyXArray (stockChartXValues) {
  if (stockChartXValues.length < 6) {
    return false;
  }
  const miliToday = new Date (stockChartXValues[0]).getTime();
  const miliBefore = new Date (stockChartXValues[5]).getTime();

  const daysDiff =  (miliToday - miliBefore) / (1000 * 60 * 60 * 24); 
  const isDailyXArray = daysDiff < 10;
  return isDailyXArray;
}




export {yearsDifference, miliDifferenceFromToday, getDate, getDateSec, todayDate, todayDateSplit, dateSplit, rawDateSplit, monthsBack, daysBack,
   compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, dateStr, formatDate, dateToArray, year2Date, isDailyXArray}