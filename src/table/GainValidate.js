import React, {useState, useMemo } from 'react'
import GAIN from './GainValidate.json'





export const GainValidate = (props) => {

  var  data = useMemo(() => GAIN, []);

  try {
  if (props.stockChartYValues.length === 0 || props.symbol === '')
    return null;
  const today = new Date();
  const todayYear = today.getFullYear() - 2000;
  const todayMon = today.getMonth();
  const todayDay = today.getDate();

  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
  if (row_index === -1)
    return null;

  const symbol_index = data.findIndex((dat)=> dat.symbol === props.symbol)
  if (symbol_index === -1)
    return null;


  if (props.rows[row_index].values.splits_list === '')
    return null;


    //const symbol_ = props.rows[row_index].values.symbol;
    
    var priceWeeks  = (data[symbol_index].year - 2000) * 52.16 + data[symbol_index].month * 4.34 + data[symbol_index].day / 7;
    const todayWeeks = todayYear * 52.16 + todayMon * 4.34 + todayDay / 7;
    var weeks = Math.round (todayWeeks - priceWeeks);
    //weeks += 7;

    if (weeks >= props.stockChartYValues.length) {
      alert ('GainValidate wrong weeks', props.symbol, props.stockChartYValues.length, weeks)
      return null;
    }

    const historicPrice = props.stockChartYValues[weeks];
    // props.stockChartXValues,


    var p = historicPrice / data[symbol_index].price;
    p = p.toFixed(3)
    if (p > 1.1 || p < 0.9)
      props.rows[row_index].values.splits_calc = p;
    console.log (props.symbol, weeks, p, props.stockChartXValues[weeks], data[symbol_index]);

  } catch (e) { console.log (e)}
  return null;
  
}

export default GainValidate;