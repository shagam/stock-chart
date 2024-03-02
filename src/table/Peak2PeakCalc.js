import React, {useState, } from 'react'
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'



const quasiTop = (symbol, initDate, stockChartXValues, stockChartYValues, logFlags, searchPeak) => {
    const LOG_FLAG = logFlags && logFlags.includes('peak2Peak');
    var dateIndex = searchDateInArray (stockChartXValues, initDate, symbol, logFlags)
    if(LOG_FLAG)
      console.log ( symbol, 'P2P quasyTop begin search', initDate, ' index=', dateIndex, 'price=', stockChartYValues[dateIndex], stockChartXValues[dateIndex])
    const range = 35;

    var startIndex = dateIndex - range > 0 ? dateIndex -= range : 0
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
        if (LOG_FLAG)
          console.log ('index=', i, 'date=', stockChartXValues[i], 'price=', price)
      }
      if (LOG_FLAG && i === endIndex - 1)
        console.log ('index=', i, 'last', stockChartXValues[endIndex], stockChartYValues[endIndex])// end of loop
    }
    console.log ('Found top  index=', priceIndex, 'last', stockChartXValues[priceIndex], stockChartYValues[priceIndex])
    return priceIndex;

  }



  export function peak2PeakCalc (symbol, rows, stockChartXValues, stockChartYValues,
     weekly, logFlags, searchPeak, startDate, endDate, errorAdd, setResults) {
      const LOG_FLAG = logFlags && logFlags.includes('peak2Peak');

      var results = {};

      // console.log ('calc')
      if (symbol === ''  || stockChartXValues.length === 0) {
        // alert ('Need to click <gain> for a symbol before calc peak2peak -')
          results['err'] = 'symbol Undefined. click <gain> for some symbol'
        return;
      }
      if (! weekly) {
          results['err'] = 'calc only for weekly mode '
        alert('calc only for weekly mode ')
        return;
      }

      const startYear = startDate.getFullYear();
      const startMon = startDate.getMonth() + 1;
      const startDay = startDate.getDate();
  
      const endYear = endDate.getFullYear();
      const endMon = endDate.getMonth() + 1;
      const endDay = endDate.getDate();

      // calc start day
      var startDateArray = [startYear, startMon, startDay]
      const lastDate = stockChartXValues[stockChartXValues.length - 1]
      const lastDateSplit = lastDate.split('-')
      const compDate = compareDate (startDateArray, lastDateSplit)
      if (compDate === -1) {
        if (searchPeak)
          startDateArray = lastDateSplit;
        else {
          const err =  ' peak2Peak, date beyond range; ';
          results['err'] = symbol + err  + ' ' + startDateArray + '  ' + lastDateSplit;

          if (errorAdd)
            errorAdd([symbol, err, 'searchFor=', startDateArray, 'symStarts=', lastDateSplit])
          console.log ('%c' + results['err'], 'color: red')
          return;            
        }

      }
      const endDateArray =[endYear, endMon, endDay]
      const indexFirst = quasiTop (symbol, startDateArray, stockChartXValues, stockChartYValues, logFlags, true)
      const indexEnd = quasiTop (symbol, endDateArray, stockChartXValues, stockChartYValues, logFlags, true)

      const weeksDiff = indexFirst - indexEnd
      const yearsDiff = Number (weeksDiff/52).toFixed (2)
      const gain = Number (stockChartYValues[indexEnd] / stockChartYValues[indexFirst])

      const yearlyGain = Number (gain ** (1 / yearsDiff)).toFixed(3)
      const weeklyGain = Number (gain ** (1 / weeksDiff))
           
      results['indexFirst'] = indexFirst;
      results['indexEnd'] = indexEnd;
      results['yearlyGain'] = yearlyGain;
      results['yearlyGainPercent'] = ((yearlyGain - 1) * 100).toFixed(2);
      results['weeklyGain'] = weeklyGain;
      results['gain'] = gain.toFixed(3);
      results['yearsDiff'] = yearsDiff;
      results['from'] = stockChartXValues[indexFirst];
      results['to'] = stockChartXValues[indexEnd];
      results['fromValue'] = stockChartYValues[indexFirst];
      results['toValue'] = stockChartYValues[indexEnd];

      if (setResults)
        setResults(results)

      const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
      if (row_index !== -1)
        rows[row_index].values.peak2Peak = yearlyGain;
    }    

    export default peak2PeakCalc;