// import React from 'react'
import {todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, getDate} from './Date'

export const GainValidate = (props) => {
  //symbol, rows, stockChartXValues, stockChartYValues, gain_validation_json, refreshCallBack


  const LOG_FLAG = false;

  try {
  if (props.stockChartYValues === undefined || props.stockChartYValues.length === 0 || props.symbol === '') {
    if (LOG_FLAG)
    console.log ('GainValidate noArray', props.symbol);
    return null; //"noArray";
  }

  if (LOG_FLAG)
    console.log (props.symbol, props.rows.length, props.stockChartXValues.length, props.stockChartYValues.length );

  
  // const today = new Date();
  // const todayYear = today.getFullYear() - 2000;
  // const todayMon = today.getMonth();
  // const todayDay = today.getDate();

  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
  if (row_index === -1) {
    props.rows[row_index].values.GOOGCompare = "symMiss";
    return null;
  }

  // if (rows[row_index].values.alphaPrice !== undefined)
  //   return;  // no need for duplicate verification

  const valiate_index = props.gain_validation_json.findIndex((dat)=> dat.symbol === props.symbol)
  if (valiate_index === -1) {
    props.rows[row_index].values.GOOGCompare = 'none';
    if (LOG_FLAG)
      console.log ('GainValidate none', props.symbol, valiate_index);
    return null;
  }


  // if (props.rows[row_index].values.splits_list === '')
  //   return null;
    //const symbol_ = props.rows[row_index].values.symbol;
    // weeks in year 365.25 / 7 = 52.17857  
    // weeks in month 365.25 / 12 / 7
    const googDateSplit = [props.gain_validation_json[valiate_index].year, props.gain_validation_json[valiate_index].month + 1, props.gain_validation_json[valiate_index].day + 1];
    const chartIndex = searchDateInArray (props.stockChartXValues, googDateSplit);

    //var priceWeeks  = (props.gain_validation_json[valiate_index].year - 2000) * 52.17857 + props.gain_validation_json[valiate_index].month * 4.3452 + props.gain_validation_json[valiate_index].day / 7;
    // const todayWeeks = todayYear * 52.17857 + todayMon * 4.3452 + todayDay / 7;
    // var weeks = Math.round (todayWeeks - priceWeeks);

 
    const googDate =  props.gain_validation_json[valiate_index].year + "-" + (Number(props.gain_validation_json[valiate_index].month) + 1) + "-" + props.
    gain_validation_json[valiate_index].day;
    if (googDate === props.rows[row_index].values.googDate)
      return '';

    props.rows[row_index].values.googDate = googDate;

    props.rows[row_index].values.googPrice = props.gain_validation_json[valiate_index].price

    var p = -1;
    var AlphaHistoricPrice = -1
    if (chartIndex !== undefined) {
      AlphaHistoricPrice = props.stockChartYValues[chartIndex];
      try {
        p = AlphaHistoricPrice / props.gain_validation_json[valiate_index].price;
      p = Number(p).toFixed(3)
      } catch (e) {alert ('p  ' + p)}
    
      // if (p > 1.1 || p < 0.9)
      //   props.rows[row_index].values.splits_calc = p;
      console.log (props.symbol, chartIndex, p, props.stockChartXValues[chartIndex], props.gain_validation_json[valiate_index], props.stockChartYValues[chartIndex]);

      var alphaPrice = Number (props.stockChartYValues[chartIndex]);
      try {
      if (alphaPrice !== undefined)
        alphaPrice = alphaPrice.toFixed(3)
      } catch (e) {alert (props.symbol, 'alphaprice ' + alphaPrice)}
      props.rows[row_index].values.alphaPrice = Number(alphaPrice);
      props.rows[row_index].values.alphaDate = props.stockChartXValues[chartIndex];
    }

    props.rows[row_index].values.GOOGCompare = p;
    return null; 
     //refreshCallBack (-1);
  } catch (e) { alert (e)}
  return null;
  
}

export default GainValidate;