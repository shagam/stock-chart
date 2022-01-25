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


  // if (props.rows[row_index].values.splits_list === '')
  //   return null;


    //const symbol_ = props.rows[row_index].values.symbol;
    // weeks in year 365.25 / 7 = 52.17857  
    // weeks in month 365.25 / 12 / 7

    var priceWeeks  = (data[symbol_index].year - 2000) * 52.17857 + data[symbol_index].month * 4.3452 + data[symbol_index].day / 7;
    const todayWeeks = todayYear * 52.17857 + todayMon * 4.3452 + todayDay / 7;
    var weeks = Math.round (todayWeeks - priceWeeks);

    if (weeks >= props.stockChartYValues.length) {
      console.log ('GainValidate calc weeks beyond alpha data', props.symbol, props.stockChartYValues.length, weeks)
      return null;
    }

    const AlphaHistoricPrice = props.stockChartYValues[weeks];
    // props.stockChartXValues,


    var p = AlphaHistoricPrice / data[symbol_index].price;
    p = p.toFixed(3)
    // if (p > 1.1 || p < 0.9)
    //   props.rows[row_index].values.splits_calc = p;
    console.log (props.symbol, weeks, p, props.stockChartXValues[weeks], data[symbol_index], props.stockChartYValues[weeks]);

    var alphaPrice = props.stockChartYValues[weeks];
    if (alphaPrice !== undefined)
      alphaPrice = alphaPrice.toFixed(3)

    props.rows[row_index].values.alphaPrice = alphaPrice;
    props.rows[row_index].values.alphaDate = props.stockChartXValues[weeks];

    props.rows[row_index].values.compareDate =  data[symbol_index].year + "-" + (Number(data[symbol_index].month) + 1) + "-" + data[symbol_index].day
    props.rows[row_index].values.comparePrice = data[symbol_index].price

    props.rows[row_index].values.compare = p;
  } catch (e) { alert (e)}
  return null;
  
}

export default GainValidate;