
import {format} from "date-fns"


const todayDate = () => {
  const date = new Date();
  const formattedDate = format(date, "yyyy-MM-dd");
  return formattedDate;
}

const todayDateSplit = () => {
  const date = new Date();
  const formattedDate = format(date, "yyyy-MM-dd");
  const dateArraySplit = formattedDate.split('-');
  dateArraySplit[0] = Number(dateArraySplit[0]);
  dateArraySplit[1] = Number(dateArraySplit[1]);
  dateArraySplit[2] = Number(dateArraySplit[2]);
  return dateArraySplit;
}

function getDate() {
  const date = new Date();
  var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
  return formattedDate;    
}


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
  dateArray[0] = Number(dateArray[0]);
  dateArray[1] = Number(dateArray[1]);
  dateArray[2] = Number(dateArray[2]);
  var dateArray_ =  [...dateArray];
  if (dateArray[1] - months >= 1)
    dateArray_[1] -= months;
  else {
    dateArray_[0] -= (Math.floor((months + 12 - dateArray_[1]) /12));
    dateArray_[1] = (dateArray_[1] + 12 - months) % 12;
    if (dateArray_[1] < 0)
      dateArray_[1] += 12;
    if (dateArray_[1] === 0)
      dateArray_[1] = 12;
  }
  return dateArray_;
}

const monthsBackTest = () => {
   var date = monthsBack ([2022, 2, 15], 2);
    date = monthsBack ([2022, 2, 15], 3);
    date = monthsBack ([2022, 2, 15], 5);
    date = monthsBack ([2022, 2, 15], 8);
    date = monthsBack ([2022, 2, 15], 12);
    date = monthsBack ([2022, 2, 15], 13);
    date = monthsBack ([2022, 2, 15], 14);
    date = monthsBack ([2022, 2, 15], 36);
    date = monthsBack ([2022, 2, 15], 72);
    date = monthsBack ([2022, 2, 15], 144);
    console.log (date)
}


const daysBack = (dateArray, days) => {  // [y,m,d] days bacck limit to 14
  dateArray[0] = Number(dateArray[0]);
  dateArray[1] = Number(dateArray[1]);
  dateArray[2] = Number(dateArray[2]);
  var dateArray_ =  [...dateArray];

  if (dateArray_[2] - days >= 1)
    dateArray_[2] -= days;
  else {
    dateArray_[2] = dateArray_[2] - days + 31; // assume 30 days + one day
    if ( dateArray_[1] > 1) {
      dateArray_[1] --;
      if (dateArray_[1] === 2 && dateArray_[0] > 2)
        dateArray_[0] -= 2
    }
    else {
      dateArray_[1] = dateArray[1] + 12 - 1;
      dateArray_[0] --;
    }
  }
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

const daysFrom1970 = (dateArray) => {
  const dateDays = (dateArray[0] - 1970) * 365.25 + dateArray[1] * 30.416 + dateArray[2];
  return dateDays;
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
const searchDateInArray = (stockChartXValuesFunction, testDateArray) => {

  if (stockChartXValuesFunction === undefined || stockChartXValuesFunction.length === 0)
  return undefined;

  //var testDateArray = [2020, 11, 1];
  let i = 0;
  var newestIndx = 0;
  var oldestIndx = stockChartXValuesFunction.length -1;

  if (compareDate (testDateArray, stockChartXValuesFunction[stockChartXValuesFunction.length-1].split('-')) === -1)
    return undefined;

  for (i = 0; i < stockChartXValuesFunction.length/2; i++) {
    var searchIndex = Math.round ((newestIndx + oldestIndx) / 2);
    var searchArray = dateSplit (stockChartXValuesFunction[searchIndex]);

    if (oldestIndx - newestIndx <= 1)
      return searchIndex;

    // if (same( searchArray, testDateArray))
    //   return searchIndex;
    // if (Math.abs (daysFrom1970 ( searchArray ) - daysFrom1970(testDateArray)) <= 3){
    //   return searchIndex;
    // }

    const comp = compareDate (testDateArray, searchArray);
    switch (comp) {
      case 0:
        return searchIndex;
      //  alert (`date found__, ${searchIndex}`);
      //  break;
      case 1:
        oldestIndx = searchIndex;
        continue;
      case -1:
        newestIndx = searchIndex; 
        continue;
      default:
        alert ('invalid campareDate result: ', comp);
    }
    console.log (oldestIndx, newestIndx, searchIndex);
  }
  alert (`searchDateInArray loop newest=${newestIndx} oldest=${oldestIndx} i =${i} searchArray=${searchArray}`);
}



export {getDate, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, monthsBackTest}