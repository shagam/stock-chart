import React, {useState, } from 'react'
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from '../utils/Date'



const quasiTop = (symbol, initDate, stockChartXValues, stockChartYValues, logFlags, searchPeak) => {
    const LOG_FLAG = logFlags && logFlags.includes('peak2Peak');
    var dateIndex = searchDateInArray (stockChartXValues, initDate, symbol, logFlags)
    if(LOG_FLAG)
      console.log ( symbol, 'P2P quasyTop begin search', initDate, ' index=', dateIndex, 'price=', stockChartYValues[dateIndex], stockChartXValues[dateIndex])
    const range = 35;

    var startIndex = dateIndex - range > 0 ? dateIndex - range : 0
    var priceIndex = startIndex;
    var endIndex = dateIndex + range < stockChartYValues.length ? dateIndex + range : dateIndex;
    var highPrice = stockChartYValues[startIndex];

    if (! searchPeak)
      return dateIndex; // do not search

    for (let i = startIndex; i < endIndex; i++) { 
      if (LOG_FLAG && i === startIndex)
        console.log ('index=', i, 'first', stockChartXValues[startIndex])
      const price = Number(stockChartYValues[i]);
      if (highPrice < price) {  // at least weeks to recover
        highPrice  = price;
        priceIndex = i;
        // if (LOG_FLAG)
        //   console.log ('QuasyTop index=', i, 'date=', stockChartXValues[i], 'price=', price)
      }
      if (LOG_FLAG && i === endIndex - 1)
        console.log ('index=', i, 'last', stockChartXValues[endIndex], stockChartYValues[endIndex])// end of loop
    }
    if (LOG_FLAG)
    console.log ('Found quasy top  index=', priceIndex, 'last', stockChartXValues[priceIndex], stockChartYValues[priceIndex])
    return priceIndex;

  }



  export function peak2PeakCalc (symbol, rows, stockChartXValues, stockChartYValues,
     weekly, logFlags, searchPeak, d_2001_date, d_2008_date, d_2022_date, errorAdd, setResults, saveTable) {
      const LOG_FLAG = logFlags && logFlags.includes('peak2Peak');

      var results = {};

      // console.log ('calc')
      if (symbol === ''  || stockChartXValues.length === 0) {
        // alert ('Need to click <gain> for a symbol before calc peak2peak -')
          results['err'] = 'symbol Undefined. click <gain> for some symbol'
        return;
      }
    
      const d_2001_year = d_2001_date.getFullYear();
      const d_2001_mon = d_2001_date.getMonth() + 1;
      const d_2001_day = d_2001_date.getDate();
      var d_2001_dateArray = [d_2001_year, d_2001_mon, d_2001_day]

      const d_2008_year = d_2008_date.getFullYear();
      const d_2008_mon = d_2008_date.getMonth() + 1;
      const d_2008_day = d_2008_date.getDate();
      var d_2008_dateArray = [d_2008_year, d_2008_mon, d_2008_day]

      const d_2022_year = d_2022_date.getFullYear();
      const d_2022_mon = d_2022_date.getMonth() + 1;
      const d_2022_day = d_2022_date.getDate();

      // calc start day

      const lastDate = stockChartXValues[stockChartXValues.length - 1]
      const lastDateSplit = lastDate.split('-')
      const compDate = compareDate (d_2008_dateArray, lastDateSplit)
      if (compDate === -1) {
        if (searchPeak)
          d_2008_dateArray = lastDateSplit;
        else {
          const err =  ' peak2Peak, date beyond range; ';
          results['err'] = symbol + err  + ' searchFor=' + d_2008_dateArray + 'dateStart= ' + lastDateSplit;

          if (errorAdd)
            errorAdd([symbol, err, 'searchFor=', d_2008_dateArray, 'dateStarts=', lastDateSplit])
          console.log ('%c' + results['err'], 'color: red')
          return;            
        }

      }
      const d_2022_dateArray =[d_2022_year, d_2022_mon, d_2022_day]
      const index2001 = quasiTop (symbol, d_2001_dateArray, stockChartXValues, stockChartYValues, logFlags, true)
      const index2008 = quasiTop (symbol, d_2008_dateArray, stockChartXValues, stockChartYValues, logFlags, true)
      const index2022 = quasiTop (symbol, d_2022_dateArray, stockChartXValues, stockChartYValues, logFlags, true)

      //** calc yearlyGain for daily as well */
      const peak_2008_DateStr = stockChartXValues[index2008].split('-')
      const peak_2022_DateStr = stockChartXValues[index2022].split('-')

      const peak_2008_mili = new Date(peak_2008_DateStr[0], peak_2008_DateStr[1], peak_2008_DateStr[2]).getTime()
      const peak_2022_mili = new Date(peak_2022_DateStr[0], peak_2022_DateStr[1], peak_2022_DateStr[2]).getTime()
      const weeksDiff = (peak_2022_mili - peak_2008_mili) / (1000 * 3600 * 24 * 7)

      const yearsDiff = Number (weeksDiff/52).toFixed (2)
      const gain = Number (stockChartYValues[index2022] / stockChartYValues[index2008])

      const yearlyGain = Number (gain ** (1 / yearsDiff)).toFixed(3)
      const weeklyGain = Number (gain ** (1 / weeksDiff))
      const timeUnitGain = Number(gain ** (1 / (index2008 - index2022)))
      
      results['weekly'] = weekly;
      results['gain'] = gain.toFixed(3);
      results['yearlyGain'] = yearlyGain;
      results['yearlyGainPercent'] = ((yearlyGain - 1) * 100).toFixed(2);
      results['weeklyGain'] = weeklyGain.toFixed(5);
      results['timeUnitGain'] = timeUnitGain;  // weekly or daily
      results['yearsDiff'] = yearsDiff;

      results['d_2001_date'] = stockChartXValues[index2001];
      results['v_2001_value'] = stockChartYValues[index2001];
      results['i_2001_index'] = index2001;

      results['d_2008_date'] = stockChartXValues[index2008];
      results['v_2008_value'] = stockChartYValues[index2008];
      results['i_2008_index'] = index2008;

      results['d_2022_date'] = stockChartXValues[index2022];
      results['v_2022_value'] = stockChartYValues[index2022];
      results['i_2022_index'] = index2022;

      if (setResults)
        setResults(results)

      const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
      if (row_index !== -1) {
        rows[row_index].values.peak2Peak = yearlyGain;
        if (saveTable)
          saveTable(symbol);
      }
    }    

    export default peak2PeakCalc;