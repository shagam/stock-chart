import React from 'react'


export const GainValidate = (symbol, rows, stockChartXValues, stockChartYValues, gain_validation_json, refreshCallBack) => {



  try {
  if (stockChartYValues === undefined || stockChartYValues.length === 0 || symbol === '')
    return null;
  const today = new Date();
  const todayYear = today.getFullYear() - 2000;
  const todayMon = today.getMonth();
  const todayDay = today.getDate();

  const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
  if (row_index === -1)
    return null;

  // if (rows[row_index].values.alphaPrice !== undefined)
  //   return;  // no need for duplicate verification

  const valiate_index = gain_validation_json.findIndex((dat)=> dat.symbol === symbol)
  if (valiate_index === -1) {
    rows[row_index].values.GOOGCompare = 'none';
    return null;
  }

  // if (props.rows[row_index].values.splits_list === '')
  //   return null;


    //const symbol_ = props.rows[row_index].values.symbol;
    // weeks in year 365.25 / 7 = 52.17857  
    // weeks in month 365.25 / 12 / 7

    var priceWeeks  = (gain_validation_json[valiate_index].year - 2000) * 52.17857 + gain_validation_json[valiate_index].month * 4.3452 + gain_validation_json[valiate_index].day / 7;
    const todayWeeks = todayYear * 52.17857 + todayMon * 4.3452 + todayDay / 7;
    var weeks = Math.round (todayWeeks - priceWeeks);

    if (weeks >= stockChartYValues.length) {
      rows[row_index].values.GOOGCompare = 'dateErr';
      console.log ('GainValidate calc weeks beyond alpha data', symbol, stockChartYValues.length, weeks)
      return null;
    }

    const AlphaHistoricPrice = stockChartYValues[weeks];
    try {
    var p = AlphaHistoricPrice / gain_validation_json[valiate_index].price;
    p = Number(p).toFixed(3)
    } catch (e) {alert ('p  ' + p)}
    // if (p > 1.1 || p < 0.9)
    //   props.rows[row_index].values.splits_calc = p;
    console.log (symbol, weeks, p, stockChartXValues[weeks], gain_validation_json[valiate_index], stockChartYValues[weeks]);

    var alphaPrice = Number (stockChartYValues[weeks]);
    try {
    if (alphaPrice !== undefined)
      alphaPrice = alphaPrice.toFixed(3)
    } catch (e) {alert (symbol, 'alphaprice ' + alphaPrice)}
    rows[row_index].values.alphaPrice = Number(alphaPrice);
    rows[row_index].values.alphaDate = stockChartXValues[weeks];

    rows[row_index].values.googDate =  gain_validation_json[valiate_index].year + "-" + (Number(gain_validation_json[valiate_index].month) + 1) + "-" + gain_validation_json[valiate_index].day
    rows[row_index].values.googPrice = gain_validation_json[valiate_index].price

    rows[row_index].values.GOOGCompare = p;
    return p; 
     //refreshCallBack (-1);
  } catch (e) { alert (e)}
  return null;
  
}

export default GainValidate;