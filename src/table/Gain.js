import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
  
import peak2PeakCalc from './Peak2PeakCalc'
import {dropRecovery, DropRecoveryButtons} from './DropRecovery'
import searchURL from '../utils/SearchURL'
import {targetPriceAdd} from './TargetPrice'
import  {CommonDatabase, GainWrite} from './CommonDatabase'

let periodTag;

const HIGH_LIMIT_KEY = process.env.REACT_APP_ALPHAVANTAGE_KEY

const   updateTableGain_ = (sym, rows, splits, updateDate, updateMili, mon3, mon6, year, year2, year5, year10, year20, price,
   saveTabl, ssl, PORT, servSelect, errorAdd, logFlags, saveTable, os, ip, city, countryName, countryCode, regionName) => {

  const LOG_API = logFlags && logFlags.includes('api');
  const LOG_DROP = logFlags && logFlags.includes('drop_');


  //console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
  const row_index = rows.findIndex((row)=> row.values.symbol === sym);            
  if (row_index === -1) {
    alert (`stock-table, history call back, invalid chartSymbol (${sym}) trying to updatehistory values` );
    return;
  }

  rows[row_index].values.gain_mili = updateMili;
  // rows[row_index].values.gain_date = updateDate;
  rows[row_index].values.mon3 = mon3;
  rows[row_index].values.mon6 = mon6; 
  rows[row_index].values.year = year; 
  rows[row_index].values.year2 = year2; 
  rows[row_index].values.year5 = year5; 
  rows[row_index].values.year10 = year10;
  rows[row_index].values.year20 = year20;
  // rows[row_index].values.peak2Peak = peak2Peak;
  rows[row_index].values.price = price;

  rows[row_index].values.sym = sym; // added field
  rows[row_index].values.splits_list = splits;
  // console.log (splits)
  
  targetPriceAdd (sym, rows[row_index].values.target_raw, price, logFlags, errorAdd, 'gain', ssl, PORT, servSelect) 

  try {
  if (splits) {
    if (splits.startsWith('u')) {
      alert ('bad splits json ' + splits + ' ' + sym)
    }
    const splitsParse = JSON.parse(splits);
    const splitsCount = splits.length;
  }
  } catch (e) {console.log('Bad splits', e, sym.splits) }

  if (LOG_API)
  console.dir (rows[row_index].values)
  if (rows[row_index].values.target_raw !== undefined && rows[row_index].values.price !== undefined)
    rows[row_index].values.target = Number((rows[row_index].values.target_raw/rows[row_index].values.price).toFixed(2))
  if (LOG_DROP)
    console.log(sym,'to firebase deep:', rows[row_index].values.deep, 'recoverIndex:', rows[row_index].values.recoverWeek,
    rows[row_index].values.deepDate, rows[row_index].values.priceDivHigh)

  GainWrite (sym, rows, errorAdd, servSelect, PORT, ssl, logFlags, os, ip, city, countryName, countryCode, regionName)

  if (saveTabl)
    saveTable(sym);
}


  export function gain (sym, rows, errorAdd, logFlags, API_KEY, weekly, openMarketFlag, gainRawDividand, setGainData, smoothSpikes,
    splitsCalcFlag, saveTabl, setStockChartXValues, setStockChartYValues, gainMap, deepStartDate, ssl, PORT, servSelect, saveTable, os, ip, city, countryName, countryCode, regionName) {

    function isAdjusted () {
      return (API_KEY === HIGH_LIMIT_KEY) 
    }

    function spikesSmooth (sym, stockChartXValues, stockChartYValues, logFlags) {
      for (let i = 0; i <  stockChartYValues.length - 2; i++) {
          const ratio = Number (stockChartYValues[i+1] / stockChartYValues[i]);
          const ratio_1 = Number (stockChartYValues[i+1] / stockChartYValues[i+2]);
      
          if (ratio > 1.7 && ratio_1 > 1.7) {
              stockChartYValues[i+1] = (stockChartYValues[i] + stockChartYValues[i + 2]) / 2;
              const info = {
                  symbol: sym,
                  date: stockChartXValues[i],
                  jump: ratio.toFixed(2),
                  jump_back: (1/ratio_1).toFixed(2),
                  index: i,
              }
              
              if (logFlags.includes ('spikes'))
                  console.log ('spike smoothed:',  info)
          }
      }
    }

    
    function getYValue (chartData, key, openMarketFlag) {
      const openVal = Number (Number (chartData[`${periodTag}`][key]['1. open']))
      const closeVal = Number (Number (chartData[`${periodTag}`][key]['4. close']))
      var yValue;
      if (isAdjusted()) {
        const adjustedCloseValue = Number (Number (chartData[`${periodTag}`][key]['5. adjusted close']))
        if (openMarketFlag)
          yValue = adjustedCloseValue / closeVal * openVal;
        else
          yValue = adjustedCloseValue
      } else { // not adjusted
        if (openMarketFlag)
          yValue = openVal;
        else
          yValue = closeVal;
      }
      return yValue;
    }
  
    if (weekly)
      periodTag = 'Weekly Adjusted Time Series';
    else
      periodTag = "Time Series (Daily)"

    const LOG_FLAG = logFlags && logFlags.includes('aux');
    const LOG_API = logFlags && logFlags.includes('api');
    const LOG_SPLITS = logFlags && logFlags.includes('splits');

    const LOG_DROP = logFlags && logFlags.includes('drop_');

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    const oneDayMili = 1000 * 3600 + 24;

    if (LOG_FLAG)
      console.log(sym, 'gain/chart (symbol)'); 
    if (sym === '' || sym === undefined) {
      alert (`bug, chart sym vanished (${sym})`);
      return;
    }

    const period = [['DAILY', 'Daily'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
    let periodCapital = period[1][0];  

  
  // 1. open: '87.7500'
  // 2. high: '97.7300'
  // 3. low:  '86.7500'
  // 4. close: '90.6200'
  // 5. adjusted close: '0.6867'
  // 6. volume: '25776200'
  // 7. dividend amount:'0.0000'

  // const openOrCloseText = openMarketFlag ? '1. open' : '4. close';

    let API_Call;
    if (weekly)
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${sym}&outputsize=compact&apikey=${API_KEY}`;
    else
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${sym}&outputsize=full&apikey=${API_KEY}`;
    
    fetch(API_Call)
        .then(
            function(response) {
                const respStr = JSON.stringify (response);
                if (response.status !== 200 || ! response.ok)
                    console.log(response);
                return response.json();
            }
        )
        .then(
            (chartData) => {
              const dataStr = JSON.stringify(chartData);
              if (dataStr === "{}") {
                errorAdd([sym, 'Invalid symbol'])
                // alert (`Invalid symbol: (${sym})`)
                return;
              }
              if (LOG_API) {
                console.log (API_Call);
                console.dir (chartData)
                // console.log (dataStr.substring(0,150));
              }
              
              // too frequent AlphaVantage api calls
              if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                  alert (`${dataStr} (${sym}) \n\n${API_Call} ${API_KEY}  `);
                  //setChartData ('');
                  return;
              }
              const limit_100_PerDay = 'You have reached the 100 requests/day limit for your free API key'
              if (dataStr.indexOf (limit_100_PerDay) !== -1) {
                alert (`${limit_100_PerDay} (${sym}) \n\n${API_Call}  ${API_KEY} ` );
                return;
              }              
              if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
                alert (dataStr.substring(0, 35) + ` symbol(${sym}) \n\n${API_Call}`);
                //setChartData ('');
                return;
              }

              var stockChartXValuesFunction = [];              
              var stockChartYValuesFunction = [];
      
              var gainArrayTxt = "";
              // prepare historical data for plotly chart
              let i = 0; // line number
              var splitArray = rows[row_index].values.splits_list;
              // if (LOG_SPLITS && splitArray && splitArray.length > 0)
              //   console.dir (splitArray);
              var splitArrayList = [];
              if (splitArray && splitArray.length > 0)
                splitArrayList = JSON.parse(splitArray)

              // get chart arrays from data
              for (var key in chartData[`${periodTag}`]) {
                var str = JSON.stringify(chartData[periodTag][key])
                // str = str.replace (/00"/g, '')
                gainArrayTxt += key + '  ' + i + ' ' + str + '\n' // prepare for gain display

                i++
                stockChartXValuesFunction.push(key);
                const yValue = Number(getYValue (chartData, key, openMarketFlag))

                if (yValue > 0.1)
                  stockChartYValuesFunction.push(yValue);
                else
                  stockChartYValuesFunction.push(yValue);
                if (isNaN (yValue)) {
                  console.log (sym, i, yValue)
                }
              }
              if (gainRawDividand) { // filter volume and 
                gainArrayTxt = gainArrayTxt.replace (/,"6. volume":"\d*"/g, '')      
              }
              gainArrayTxt = gainArrayTxt.replace (/,"7. dividend amount":"0.000*"/g, '')  
              setGainData(gainArrayTxt)

              if (smoothSpikes)
                spikesSmooth (sym, stockChartXValuesFunction, stockChartYValuesFunction, logFlags)


              // collect compensation vars
              var splitsIndexArray = [];

              // compensate for splits
              if (! isAdjusted ()) {// high limit no need for compensation
                console.log ('adjustSplits')
                for (let splitNum = 0; splitNum < splitArrayList.length; splitNum++) {
                  var jump = splitArrayList[splitNum].ratio;
                  // console.log (JSON.stringify (splitArrayList[splitNum]));
                  const splitDate = dateSplit (splitArrayList[splitNum].date);
                  if (splitArrayList[splitNum].date == null)
                    alert (sym, 'wrong split info', splitNum)
                  var chartIndex = searchDateInArray (stockChartXValuesFunction, splitDate, sym, logFlags)
                  if (chartIndex < 1) {// error not fount
                    if (LOG_SPLITS)
                      console.log (sym, "Split drop/jump date not found", splitNum, JSON.stringify (splitArrayList[splitNum]), chartIndex)
                    continue;
                  }
                  // find max jump of split index
                  if (true || chartIndex < stockChartXValuesFunction.length - 5) {
                    var maxJump = 1;
                    var maxJumpWeekNum = chartIndex;
                    const chartIndexOrg = chartIndex;
                    var m = chartIndex >= 4 ?  chartIndex - 4 : 0;
                    const maxEnd = chartIndex + 5 < stockChartYValuesFunction.length - 2 ? chartIndex + 5 : stockChartYValuesFunction.length - 2
                    for (; m <  chartIndex + 5; m ++) {
                      var jump_ = Math.abs (stockChartYValuesFunction[m] / stockChartYValuesFunction[m + 1]);
                      if (jump_ > maxJump) {
                        maxJump = jump_;
                        maxJumpWeekNum = m + 1; // adjust maxJumpWeekNum (add 1 for the first need to change)
                      }
                      if (1 / jump_ > maxJump ) {
                        maxJump = 1 / jump_;
                        maxJumpWeekNum = m + 1;
                      }
                    }

                    if (chartIndexOrg !== maxJumpWeekNum && LOG_SPLITS)
                      console.log (sym, 'index corrected org=', chartIndexOrg, ' changed to=', maxJumpWeekNum);

                    var valuesBefore='';
                    for (var j = chartIndex - 3; j < chartIndex + 3; j++) {
                      valuesBefore += stockChartYValuesFunction[j] + ' '
                    }
                    // console.log ('SplitIndex corrected=', weekNum, 'uncorrected=', chartIndex, stockChartYValuesFunction[weekNum])
                    if (LOG_SPLITS) {
                      console.log(sym, 'Max Jump weekMum=', maxJumpWeekNum, 'dateAtJmp=', stockChartXValuesFunction[maxJumpWeekNum], 'priceAtJmp=', stockChartYValuesFunction[maxJumpWeekNum])
                      console.log(sym, 'before compensation (' + chartIndex + ', ' + stockChartYValuesFunction[chartIndex] + ') ' + valuesBefore);
                    }

                  }
                  else
                    console.log ('wrong dislay index, split close to end', chartIndex, stockChartXValuesFunction.length)
                  splitsIndexArray.push (chartIndex);

                  // compensation calc
                  if (LOG_SPLITS)
                    console.log (sym, 'compensate split', splitNum, splitArrayList[splitNum])
                  if (splitsCalcFlag) {  // if flag is off do not compensate
                    for ( let k = maxJumpWeekNum; k < stockChartYValuesFunction.length; k++) {
                        (stockChartYValuesFunction[k] = Number (Number (Number (stockChartYValuesFunction[k]) / jump).toFixed(3)));
                    }
                  } else
                     if (LOG_SPLITS) console.log ('no compensation')
                  // print after compensation
                  var valuesAfter='';
                  for (var l = chartIndex - 3; l < chartIndex + 3; l++) {
                    valuesAfter += stockChartYValuesFunction[l] + ' '
                  }
                  if (LOG_SPLITS)
                    console.log (sym, 'after compensation (', chartIndex + ', ' + stockChartYValuesFunction[chartIndex] + ') ' + valuesAfter)
                  // console.log ('loop end ', splitNum);
                }            
              }
              if (stockChartXValuesFunction.length === 0) {
                console.log (sym, 'stockChartXValuesFunction  empty')
                return;
              }
              setStockChartXValues (stockChartXValuesFunction);  // save for plotly chart
              setStockChartYValues (stockChartYValuesFunction);

              gainMap[sym]  = {'x': stockChartXValuesFunction, 'y': stockChartYValuesFunction}
          
              if (logFlags.includes('xyValue')) {
                console.log (stockChartXValuesFunction)
                console.log (stockChartYValuesFunction)
                console.log (chartData)
              } 
              // const ind = allColumns.findIndex((column)=> column.Header === 'verify_1');
              // if (allColumns[ind].isVisible || ! isAdjusted) {
              //   marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, verifyDateOffset,refreshByToggleColumns, firebaseGainAdd, servSelect, ssl, logFlags, errorAdd, null);
              // }
    
              peak2PeakCalc (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction,
                  weekly, logFlags, true,  new Date(2007, 10, 1), new Date(2021, 11, 1), errorAdd, null, false)  //setCalcResults, setCalcInfo

              const updateMili = Date.now();
              const updateDate = getDate();
              // var date;
              const todaySplit = todayDateSplit();

              var mon3 = Number(-1);
              var mon6 = Number(-1);
              var year = Number(-1);
              var year2 = Number(-1);
              var year5 = Number(-1);
              var year10 = Number(-1);
              var year20 = Number(-1);

              if (weekly) {
                if (stockChartYValuesFunction.length > 13)
                  mon3 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[13]).toFixed(2));
                if (stockChartYValuesFunction.length > 26)
                  mon6 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[26]).toFixed(2));
                if (stockChartYValuesFunction.length > 52)
                  year = (stockChartYValuesFunction[0] / stockChartYValuesFunction[52]).toFixed(2);
                if (stockChartYValuesFunction.length > 104)
                  year2 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[104]).toFixed(2));
                if (stockChartYValuesFunction.length > 260)
                  year5 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[260]).toFixed(2));
                if (stockChartYValuesFunction.length > 520)
                  year10 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[520]).toFixed(2));
                if (stockChartYValuesFunction.length > 1024)
                  year20 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[1024]).toFixed(2));
              }
              else {
                var dateBackSplit = daysBack (todaySplit, 7);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex === undefined)
                  return
              
                dateBackSplit = monthsBack (todaySplit, 3, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  mon3 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            
          
                dateBackSplit = monthsBack (todaySplit, 6, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  mon6 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 12, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year = (stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2);

                dateBackSplit = monthsBack (todaySplit, 24, sym); 
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year2 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 60, sym); // 5 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year5 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 120, sym); // 10 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined) 
                  year10 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));            

                dateBackSplit = monthsBack (todaySplit, 240, sym); // 20 years
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  year20 = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));         
              }

              var count = 3;
              const mon3_ = Number(mon3) ** 4;
              const mon6_ = Number(mon6) ** 2;
              const year_ = Number(year)

              var year2_ = 1;   // if missing use netral '1'
              if (year2 !== -1) {
                year2_ = Number(year2) ** 0.5;
                count ++;
              }

              var year5_ = 1;
              if (year5 !== -1) {
                year5_ = Number (year5) ** 0.2;
                count ++;
              }

              var year10_ = 1;
                if (year10 !== -1){
                  year10_ = Number (year10) ** 0.1;
                  count ++;
                }

              var year20_ = 1;
              if (year20 !== -1) {
                year20_ = Number (year20) ** 0.05
                count ++;
              }
              var short = (mon3_ * mon6_ * year_ * year2_ * year5_ * year10_ * year20_) ** (1/count)

              if (LOG_FLAG)
              console.log ('sym short gain,  agrgate=', short.toFixed(3), '3mon=', mon3_.toFixed(3), '6mon=', mon6_.toFixed(3), 'year=', year_.toFixed(3), '2year=', year2_.toFixed(3),
               '5year=', year5_.toFixed(3), '10year=', year10_.toFixed(3), '20year=', (year20_ ).toFixed(3), 'count=', count)
              rows[row_index].values.short = short.toFixed(3);

              var price = stockChartYValuesFunction[0];
              if (price === undefined)
                price = -1;
              // if (LOG_SPLITS)
              // console.log (splitArray); 
              dropRecovery (rows, sym, stockChartXValuesFunction, stockChartYValuesFunction, deepStartDate, logFlags, weekly, chartData[`${periodTag}`], errorAdd)
              updateTableGain_  (sym, rows, splitArray, updateDate, updateMili, mon3, mon6, year, year2, year5, year10, year20, price,
                 saveTabl, ssl, PORT, servSelect, errorAdd, logFlags, saveTable, os, ip, city, countryName, countryCode, regionName)  

            }
        )
        // handleInfoClick(sym, false);
  }
