
import {format} from "date-fns"


const todayDate = () => {
  const date = new Date();
  const formattedDate = format(date, "yyyy-MM-dd");
  return formattedDate;
}


const dateSplit = (date) => {
  const dateSplit = date.split('-');
  dateSplit[0] = Number(dateSplit[0]);
  dateSplit[1] = Number(dateSplit[1]);
  dateSplit[2] = Number(dateSplit[2]);
  return dateSplit;
} 

const monNameToNumber = (monStr) => {
  switch (monStr) {
    case 'Jan': return 1;
    case 'Feb': return 2;
    case 'Mar': return 3;
    case 'Apr': return 4;
    case 'May': return 5;
    case 'Jun': return 6;
    case 'Jul': return 7;
    case 'Aug': return 8;
    case 'Sep': return 9;
    case 'Oct': return 10;
    case 'Nov': return 11;
    case 'Fec': return 12;
    default: alert ('wrong month str, cannot convert')
  }
}

// array [year, month, day] month 1..12
const monthsBack = (dateArray, months) => { // [y,m,d]
  dateArray[0] = Number(dateArray[0]);
  dateArray[1] = Number(dateArray[1]);
  dateArray[2] = Number(dateArray[2]);
  var dateArray_ =  [...dateArray];
  if (dateArray [1] - months > 0)
    dateArray_ [1] --;
  else {
    dateArray_[0] --;
    dateArray_[1] = dateArray[1] + 12 - months;
  }
  return dateArray_;
}

const daysBack = (dateArray, days) => {  // [y,m,d] days bacck limit to 14
  var dateArray_ =  [...dateArray];
  if (dateArray_ [2] - days > 0)
    dateArray_ [2] -= days;
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
const dateDiff = (dateArray1, dateArray2) => {
  const diff = daysFrom1970 (dateArray1) - daysFrom1970 (dateArray2)
  return Math.abs(diff);
}

// return index of dataArray closest
const searchDateInArray = (stockChartXValuesFunction, testDateArray) => {

  //var testDateArray = [2020, 11, 1];

  var newestIndx = 0;
  var oldestIndx = stockChartXValuesFunction.length -1;

  while (true) {
    var searchIndex = Math.round ((newestIndx + oldestIndx) / 2);
    var searchArray = stockChartXValuesFunction [searchIndex].split('-');

    if (Math.abs (daysFrom1970 ( searchArray ) - daysFrom1970(testDateArray)) <= 4){
      return searchIndex;
    }

    const comp = compareDate (testDateArray, searchArray);
    switch (comp) {
      case 0:
        return searchIndex;
      //  alert (`date found__, ${searchIndex}`);
      //  break;
      case 1:
        oldestIndx = Math.round ((oldestIndx + searchIndex) / 2);
        continue;
      case -1:
        newestIndx = Math.round ((newestIndx + searchIndex) / 2); 
        break;
      default:
        alert ('invalid campareDate result: ', comp);
    }
    console.log (oldestIndx, newestIndx, searchIndex);
  }



}



export {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray}