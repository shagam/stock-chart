const dateStrToArray = (date) => {
  const dateSplit = date.split('-');
  return dateSplit;
  // const year = Number(dateSplit[0]);
  // const mon = Number(dateSplit[1]);
  // const day = Number(dateSplit[2]);
} 

// array [year, month, day] month 1..12
const monthsBack = (dateArray, months) => { // [y,m,d]
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
    dateArray_[2] = dateArray_[2] - days + 30;
    if ( dateArray_[1] > 1) {
      dateArray_[1] --;
      if (dateArray_[1] == 2 && dateArray_[0] > 2)
        dateArray_[0] -= 2
    }
    else {
      dateArray_[1] = dateArray[1] + 12 - 1;
      dateArray_[0] --;
    }
  }
  return dateArray_;
}

export {dateStrToArray, monthsBack, daysBack}