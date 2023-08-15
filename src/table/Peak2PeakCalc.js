import React, {useState, } from 'react'
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'



const quasiTop = (symbol, initDate, stockChartXValues, stockChartYValues, logFlags, searchPeak) => {
    const LOG_FLAG = logFlags.includes('peak2Peak');
    var dateIndex = searchDateInArray (stockChartXValues, initDate, symbol, logFlags)
    if(LOG_FLAG)
      console.log ( symbol, 'P2P quasyTop ', initDate, ' index=', dateIndex, 'price=', stockChartYValues[dateIndex], stockChartXValues[dateIndex])
    const range = 35;

    var startIndex = dateIndex - range > 0 ? dateIndex -= range : 0
    var priceIndex = startIndex;
    var endIndex = dateIndex + range < stockChartYValues.length ? dateIndex + range : dateIndex;
    var highPrice = stockChartYValues[startIndex];

    if (! searchPeak)
      return dateIndex; // do not search

    for (let i = startIndex; i < endIndex; i++) { 
      if (LOG_FLAG && i === startIndex)
        console.log ('index=', i, 'first', stockChartXValues[startIndex])// end of loop
      const price = Number(stockChartYValues[i]);
      if (highPrice < price) {  // at least weeks to recover
        highPrice  = price;
        priceIndex = i;
        if (LOG_FLAG)
          console.log ('index=', i, 'price=', price, stockChartXValues[i])
      }
      if (LOG_FLAG && i === endIndex - 1)
        console.log ('index=', i, 'last', stockChartXValues[endIndex])// end of loop
    }
    return priceIndex;

  }



  export function peak2PeakCalc (symbol, rows, stockChartXValues, stockChartYValues,
     weekly, logFlags, searchPeak, startDate, endDate, errorAdd, setCalcResults, setCalcInfo) {
      const LOG_FLAG = logFlags.includes('peak2Peak');
      if (setCalcResults) {
        setCalcResults(); 
        setCalcInfo()
      }

      // console.log ('calc')
      if (symbol === ''  || stockChartXValues.length === 0) {
        // alert ('Need to click <gain> for a symbol before calc peak2peak -')
        if (setCalcResults) {
            setCalcResults('symbol Undefined. click <gain> for some symbol')
        }
        return;
      }
      if (! weekly) {
        if (setCalcResults) {
            setCalcResults('calc only for weekly mode ')
        }
        alert('calc only for weekly mode ')
        return;
      }

      const startYear = startDate.getFullYear();
      const startMon = startDate.getMonth() + 1;
      const startDay = startDate.getDay() + 1;
  
      const endYear = endDate.getFullYear();
      const endMon = endDate.getMonth() + 1;
      const endDay = endDate.getDay() + 1;

      // calc start day
      var startDateArray = [startYear, startMon, startDay]
      const lastDate = stockChartXValues[stockChartXValues.length - 1]
      const lastDateSplit = lastDate.split('-')
      const compDate = compareDate (startDateArray, lastDateSplit)
      if (compDate === -1) {
        if (searchPeak)
          startDateArray = lastDateSplit;
        else {
            if (setCalcResults) {
                const err = symbol + ' peak2Peak, search peak fail; date beyond range ' + startDateArray + '  ' + lastDateSplit;
                setCalcResults(err)
                if (errorAdd)
                  errorAdd(err)
                console.log ('%c' + err, 'color: red')
                setCalcInfo ('.')
            }
          return;            
        }

      }
      const endDateArray =[endYear, endMon, endDay]
      const indexFirst = quasiTop (symbol, startDateArray, stockChartXValues, stockChartYValues, logFlags)
      const indexEnd = quasiTop (symbol, endDateArray, stockChartXValues, stockChartYValues, logFlags)

      const weeksDiff = indexFirst - indexEnd
      const yearsDiff = Number (weeksDiff/52).toFixed (2)
      const gain = Number (stockChartYValues[indexEnd] / stockChartYValues[indexFirst]).toFixed (3)

      const yearlyGain = Number (gain ** (1 / yearsDiff)).toFixed(3)
      const textResults =  symbol + ' \xa0 \xa0 yearlyGain=' + yearlyGain + ' \xa0\xa0' + ((yearlyGain - 1) * 100).toFixed(1) + '%'
      const textInfo = symbol + ` \xa0 \xa0 (gain= ${gain}  \xa0  years= ${yearsDiff} \xa0 from= ${stockChartXValues[indexFirst]} \xa0 to= ${stockChartXValues[indexEnd]}  )`;
     
      if (LOG_FLAG) {
        console.log (textResults, textInfo)

      }
      if (setCalcResults) {
        setCalcResults(textResults)
        setCalcInfo ( textInfo)
      }
      const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
      if (row_index !== -1)
        rows[row_index].values.peak2Peak = yearlyGain;
    }    

    export default peak2PeakCalc;