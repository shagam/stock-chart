// import React from 'react'
import {todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, getDate} from './Date'

export const GainValidate = (symbol, rows, stockChartXValues, stockChartYValues, gain_validation_json) => {
  //symbol, rows, stockChartXValues, stockChartYValues, gain_validation_json, refreshCallBack


  const LOG_FLAG = false;

  try {
  if (stockChartYValues === undefined || stockChartYValues.length === 0 || symbol === '') {
    if (LOG_FLAG)
    console.log ('GainValidate noArray', symbol);
    return null; //"noArray";
  }

  if (LOG_FLAG)
    console.log (symbol, rows.length, stockChartXValues.length, stockChartYValues.length );

  
  // const today = new Date();
  // const todayYear = today.getFullYear() - 2000;
  // const todayMon = today.getMonth();
  // const todayDay = today.getDate();

  const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
  if (row_index === -1) {
    rows[row_index].values.GOOGCompare = -1;
    return;
  }

  // if (rows[row_index].values.alphaPrice !== undefined)
  //   return;  // no need for duplicate verification

  const valiate_index = gain_validation_json.findIndex((dat)=> dat.symbol === symbol)
  if (valiate_index === -1) {
    rows[row_index].values.GOOGCompare = -1;
    if (LOG_FLAG)
      console.log ('GainValidate none', symbol, valiate_index);
    return;
  }


  // if (rows[row_index].values.splits_list === '')
  //   return null;
    //const symbol_ = props.rows[row_index].values.symbol;
    // weeks in year 365.25 / 7 = 52.17857  
    // weeks in month 365.25 / 12 / 7
    const googDateSplit = [gain_validation_json[valiate_index].year, gain_validation_json[valiate_index].month + 1, gain_validation_json[valiate_index].day + 1];
    const chartIndex = searchDateInArray (stockChartXValues, googDateSplit, symbol);

    //var priceWeeks  = (gain_validation_json[valiate_index].year - 2000) * 52.17857 + gain_validation_json[valiate_index].month * 4.3452 + gain_validation_json[valiate_index].day / 7;
    // const todayWeeks = todayYear * 52.17857 + todayMon * 4.3452 + todayDay / 7;
    // var weeks = Math.round (todayWeeks - priceWeeks);

 
    const googDate =  gain_validation_json[valiate_index].year + "-" + (Number(gain_validation_json[valiate_index].month) + 1) + "-" + 
  gain_validation_json[valiate_index].day;
    if (googDate === rows[row_index].values.googDate)
      return '';

    rows[row_index].values.googDate = googDate;

    rows[row_index].values.googPrice = gain_validation_json[valiate_index].price

    var p = -1;
    var AlphaHistoricPrice = -1
    if (chartIndex !== undefined) {
      AlphaHistoricPrice = stockChartYValues[chartIndex];
      try {
        p = AlphaHistoricPrice / gain_validation_json[valiate_index].price;
      p = Number(p).toFixed(3)
      } catch (e) {alert ('p  ' + p)}
    
      // if (p > 1.1 || p < 0.9)
      //   rows[row_index].values.splits_calc = p;
      console.log (symbol, chartIndex, p, stockChartXValues[chartIndex], gain_validation_json[valiate_index], stockChartYValues[chartIndex]);

      var alphaPrice = Number (stockChartYValues[chartIndex]);
      try {
      if (alphaPrice !== undefined)
        alphaPrice = alphaPrice.toFixed(3)
      } catch (e) {alert (symbol, 'alphaprice ' + alphaPrice)}
      rows[row_index].values.alphaPrice = Number(alphaPrice);
      rows[row_index].values.alphaDate = stockChartXValues[chartIndex];
    }

    rows[row_index].values.GOOGCompare = p;
    return null; 
     //refreshCallBack (-1);
  } catch (e) { alert (e)}
  return null;
  
}

export default GainValidate;