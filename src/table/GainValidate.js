// import React from 'react'


export const GainValidate = (props) => {
  //symbol, rows, stockChartXValues, stockChartYValues, gain_validation_json, refreshCallBack


  const LOG_FLAG = false;

  if (LOG_FLAG)
    console.log (props.symbol, props.rows.length, props.stockChartXValues.length, props.stockChartYValues.length );

  try {
  if (props.stockChartYValues === undefined || props.stockChartYValues.length === 0 || props.symbol === '') {
    if (LOG_FLAG)
    console.log ('GainValidate noArray', props.symbol, props.stockChartYValues.length);
    return "noArray";
  }
  const today = new Date();
  const todayYear = today.getFullYear() - 2000;
  const todayMon = today.getMonth();
  const todayDay = today.getDate();

  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
  if (row_index === -1)
    return "symMiss";

  // if (rows[row_index].values.alphaPrice !== undefined)
  //   return;  // no need for duplicate verification

  const valiate_index = props.gain_validation_json.findIndex((dat)=> dat.symbol === props.symbol)
  if (valiate_index === -1) {
    props.rows[row_index].values.GOOGCompare = 'none';
    if (LOG_FLAG)
      console.log ('GainValidate none', props.symbol, valiate_index);
    return "none";
  }

  // if (props.rows[row_index].values.splits_list === '')
  //   return null;


    //const symbol_ = props.rows[row_index].values.symbol;
    // weeks in year 365.25 / 7 = 52.17857  
    // weeks in month 365.25 / 12 / 7

    var priceWeeks  = (props.gain_validation_json[valiate_index].year - 2000) * 52.17857 + props.gain_validation_json[valiate_index].month * 4.3452 + props.gain_validation_json[valiate_index].day / 7;
    const todayWeeks = todayYear * 52.17857 + todayMon * 4.3452 + todayDay / 7;
    var weeks = Math.round (todayWeeks - priceWeeks);

    props.rows[row_index].values.googDate =  props.gain_validation_json[valiate_index].year + "-" + (Number(props.gain_validation_json[valiate_index].month) + 1) + "-" + props.gain_validation_json[valiate_index].day;
    props.rows[row_index].values.googPrice = props.gain_validation_json[valiate_index].price

    if (weeks >= props.stockChartYValues.length) {
      props.rows[row_index].values.GOOGCompare = 'dateErr';
        if (LOG_FLAG)
          console.log ('GainValidate dateErr', props.symbol, weeks, props.stockChartXValues.length, props.stockChartYValues.length);
      return "dateErr";
    }

    const AlphaHistoricPrice = props.stockChartYValues[weeks];
    try {
    var p = AlphaHistoricPrice / props.gain_validation_json[valiate_index].price;
    p = Number(p).toFixed(3)
    } catch (e) {alert ('p  ' + p)}
    // if (p > 1.1 || p < 0.9)
    //   props.rows[row_index].values.splits_calc = p;
    console.log (props.symbol, weeks, p, props.stockChartXValues[weeks], props.gain_validation_json[valiate_index], props.stockChartYValues[weeks]);

    var alphaPrice = Number (props.stockChartYValues[weeks]);
    try {
    if (alphaPrice !== undefined)
      alphaPrice = alphaPrice.toFixed(3)
    } catch (e) {alert (props.symbol, 'alphaprice ' + alphaPrice)}
    props.rows[row_index].values.alphaPrice = Number(alphaPrice);
    props.rows[row_index].values.alphaDate = props.stockChartXValues[weeks];

    props.rows[row_index].values.GOOGCompare = p;
    return p; 
     //refreshCallBack (-1);
  } catch (e) { alert (e)}
  return null;
  
}

export default GainValidate;