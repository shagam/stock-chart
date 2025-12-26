import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
  
import {peak2PeakCalc} from './Peak2PeakCalc'
// import {dropRecovery, DropRecoveryButtons} from './DropRecovery'
import searchURL from '../utils/SearchURL'
import {targetPriceAdd} from './TargetPrice'
import  {CommonDatabase, GainWrite} from './CommonDatabase'
import {PriceAlert, priceAlertCheck} from './PriceAlert'
import  {dividendCalc} from './StockGain'

let periodTag;

const HIGH_LIMIT_KEY = process.env.REACT_APP_ALPHAVANTAGE_KEY



export function gain (sym, rows, errorAdd, logFlags, API_KEY, weekly, openMarketFlag, gainRawDividand, setGainData, smoothSpikes,
    splitsCalcFlag, saveTabl, setStockChartXValues, setStockChartYValues, gainMap, deepStartDate, ssl, PORT, servSelect, saveTable,
     os, ip, city, countryName, countryCode, regionName, setChartData, yearlyPercent, set_QQQ_gain, priceAlertTable, refreshByToggleColumns) {

    function isAdjusted () {
      return (API_KEY === HIGH_LIMIT_KEY) 
    }

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);            
    if (row_index === -1) {
      errorAdd  ([sym, 'stock-table, history call back, invalid chartSymbol  trying to updatehistory values'] );
      return;
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

    const LOG_FLAG = true; // logFlags && logFlags.includes('gain');
    const LOG_API = logFlags && logFlags.includes('api');

    const LOG_DROP = logFlags && logFlags.includes('drop_');

    const oneDayMili = 1000 * 3600 + 24;

    if (LOG_FLAG)
      console.log(sym, 'gain/chart (symbol)'); 
    if (sym === '' || sym === undefined) {
      errorAdd ([sym, 'bug, chart sym vanished']);
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
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED`;
    else
      API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED`;

    API_Call += `&symbol=${sym}&outputsize=full&apikey=${API_KEY}`

    API_Call += `&extended_hours=true`

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
                errorAdd([sym, 'Invalid symbol, or fail to fetch historical data'])
                return;
              }
              if (dataStr && dataStr.includes('Burst pattern detected')) {
                errorAdd([sym, dataStr.substring(0, 100)]);
                return;
              }
              if (LOG_API) {
                console.log (API_Call);
                console.dir (chartData)
                // console.log (dataStr.substring(0,150));
              }
              
              // too frequent AlphaVantage api calls
              if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                  errorAdd([sym, dataStr, API_Call]);
                  //setChartData ('');
                  return;
              }
              const limit_100_PerDay = 'You have reached the 100 requests/day limit for your free API key'
              if (dataStr.indexOf (limit_100_PerDay) !== -1) {
                errorAdd ([sym, 'limit_100_PerDay', API_Call]);
                return;
              }              
              if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
                errorAdd([sym, 'Gain, Invalid API call or wrong symbol']);
                //setChartData ('');
                return;
              }
              setChartData(chartData[periodTag]); 
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
              var chartIndex;


              if (stockChartXValuesFunction.length === 0) {
                errorAdd ([sym, 'stockChartXValuesFunction  empty'])
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
          
              // if ( weekly)
              peak2PeakCalc (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction,
                  weekly, logFlags, true, new Date(2000, 1, 1),  new Date(2007, 10, 1), new Date(2021, 11, 1), errorAdd, null, false, null)  //setCalcResults, setCalcInfo

              const updateMili = Date.now();
              const updateDate = getDate();
              // var date;
              const todaySplit = todayDateSplit();
              var mon = Number(-1);
              var mon3 = Number(-1);
              var mon6 = Number(-1);
              var year = Number(-1);
              var year2 = Number(-1);
              var year5 = Number(-1);
              var year10 = Number(-1);
              var year20 = Number(-1);

              if (weekly) {
                if (stockChartYValuesFunction.length > 4)
                  mon = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[13]).toFixed(2));
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

                dateBackSplit = monthsBack (todaySplit, 1, sym);
                chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit, sym, logFlags)
                if (chartIndex !== undefined)
                  mon = ((stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex]).toFixed(2));                

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


              //** calc short term yearly gain. latest val given higher wieght, because they are moredense */
              var count = 0;
              var mon_ = 1;
              if (mon !== -1) {
                mon_ = Number(mon) ** 12; //** calc yearly gain */
                count ++;
              }
              var mon3_ = 1;
              if (mon3 !== -1) {
                mon3_ = Number(mon3) ** 4; //** calc yearly gain */
                count ++;
              }

              var mon6_ = 1;
              if (mon6 !== -1) {
                const mon6_ = Number(mon6) ** 2; //** calc yearly gain */
                count ++
              }

              var year_ = 1
              if (year !== -1 && ! isNaN(year)) {
                year_ = Number(year)
                count ++;
              }

              var year2_ = 1;   // if missing use netral '1'
              if (year2 && ! isNaN(year2) && year2 !== -1) {
                year2_ = Number(year2) ** (1/2); //** calc yearly gain */
                count ++;
              }

              var year5_ = 1;
              if (year5 && ! isNaN(year5) && year5 !== -1) {
                year5_ = Number (year5) ** (1/5); //** calc yearly gain */
                count ++;
              }

              var year10_ = 1;
                if (year10 && ! isNaN(year10) && year10 !== -1){
                  year10_ = Number (year10) ** (1/10); //** calc yearly gain */
                   count ++;
                }

              var year20_ = 1;
              if (year20 && ! isNaN(year20) && year20 !== -1) {
                year20_ = Number (year20) ** (1/20) //** calc yearly gain */
                count ++;
              }

              var short
              if (count !== 0)
                short = (mon_ + mon3_ * mon6_ * year_ * year2_ * year5_ * year10_ * year20_) ** (1/count)
              else
                short = -1

              if (LOG_FLAG)
              console.log (sym, 'sym short gain,  agrgate=', short.toFixed(3), 'mon=', mon_.toFixed(3), '3mon=', mon3_.toFixed(3), '6mon=', mon6_.toFixed(3), 'year=', year_.toFixed(3), '2year=', year2_.toFixed(3),
               '5year=', year5_.toFixed(3), '10year=', year10_.toFixed(3), '20year=', (year20_ ).toFixed(3), 'count=', count)
              rows[row_index].values.short = short.toFixed(3);
            
              var price = stockChartYValuesFunction[0];
              if (price === undefined)
                price = -1;
                       
              //** Compare latest price to highest  */
              var highestPrice = -1; // highest price
              for (let i = 0; i < stockChartYValuesFunction.length; i++) {
                const val = stockChartYValuesFunction[i];
                if (val > highestPrice)
                  highestPrice = val;
              }
              var priceDivHigh = -1
              if (highestPrice !== -1)
                priceDivHigh = (price/ highestPrice).toFixed(4)
            
              //console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
               
              rows[row_index].values.gain_mili = updateMili;
              // rows[row_index].values.gain_date = updateDate;

              //** if (yearlyGain) then will be overiden */
              if (mon !== -1)
                rows[row_index].values.mon = mon;
              if (mon3 !== -1)
              rows[row_index].values.mon3 = mon3;
              if (mon3 !== -1)
              rows[row_index].values.mon6 = mon6; 
              if (year !== -1)
              rows[row_index].values.year = year;
              if (year2 !== -1) 
              rows[row_index].values.year2 = year2; 
              if (year5 !== -1)
              rows[row_index].values.year5 = year5; 
              if (year10 !== -1)
              rows[row_index].values.year10 = year10;
              if (year20 !== -1)
                rows[row_index].values.year20 = year20;
              else
                delete rows[row_index].values.year20
              if (isNaN (rows[row_index].values.year20) && LOG_FLAG)  // debug log
                console.log (sym, 'gain year20', rows[row_index].values.year20)
  
              // rows[row_index].values.peak2Peak = peak2Peak;
              if (rows[row_index].values.price === undefined || ! rows[row_index].values.price_mili ||
                 Date.now() - rows[row_index].values.price_mili > 1000 * 60 * 60 * 2) {
                rows[row_index].values.price = price;
                rows[row_index].values.priceDivHigh = priceDivHigh;
              }
              rows[row_index].values.sym = sym; // added field
              rows[row_index].values.splits_list = splitArray;
              // console.log (splits)
              
              set_QQQ_gain({mon: mon, mon3: mon3, mon6: mon6, year: year, year2: year2, year5: year5}) // save gain for commonDatabase gain filter

              try {
              if (splitArray) {
                if (splitArray.startsWith('u')) {
                  errorAdd ([sym, 'bad splits json ', + splitArray])
                }
                const splitsParse = JSON.parse(splitArray);
                const splitsCount = splitArray.length;
              }
              } catch (e) {console.log('Bad splits', e, sym.splitArray) }
            
              if (LOG_API)
              console.dir (rows[row_index].values)
              if (rows[row_index].values.target_raw !== undefined && price !== undefined) {
                rows[row_index].values.target = Number((rows[row_index].values.target_raw/price).toFixed(2))
                targetPriceAdd (sym, rows[row_index].values.target_raw, price, logFlags, errorAdd, 'gain', ssl, PORT, servSelect) 
                if (! rows[row_index].values.price)
                  rows[row_index].values.price = price
              }
              if (LOG_DROP)
                console.log(sym,'to firebase deep:', rows[row_index].values.deep, 'recoverIndex:', rows[row_index].values.recoverWeek,
                rows[row_index].values.deepDate, rows[row_index].values.priceDivHigh)
            
              GainWrite (sym, rows, errorAdd, servSelect, PORT, ssl, logFlags, os, ip, city, countryName, countryCode, regionName)
            
              //** Overide  */
              if (yearlyPercent) {
                if (mon3 !== -1)
                rows[row_index].values.mon3 = ((mon3 ** 4 -1) * 100).toFixed(1);
                if (mon6 !== -1)
                rows[row_index].values.mon6 = ((mon6 ** 2 -1) * 100).toFixed(1);
                if (year !== -1)
                rows[row_index].values.year = ((year - 1) * 100).toFixed(1);
              
                if (year2 !== -1) {
                  rows[row_index].values.year2 = ((year2 ** (1/2) -1) * 100).toFixed(1); 
                } else
                  delete rows[row_index].values.year2

                if (year5 !== -1) {
                rows[row_index].values.year5 = ((year5 ** (1/5) - 1) * 100).toFixed(1); 
                } else 
                  delete rows[row_index].values.year5

                if (year10 !== -1) {
                  rows[row_index].values.year10 = ((year10 ** (1/10) - 1) * 100).toFixed(1);
                } else
                  delete rows[row_index].values.year10

                if (year20 !== -1){
                  rows[row_index].values.year20 = ((year20 ** (1/20) - 1) * 100).toFixed(1);
                } else
                  delete rows[row_index].values.year20
                if (isNaN (rows[row_index].values.year20) && LOG_FLAG)  // debug log
                  console.log (sym, 'gain year20', rows[row_index].values.year20)  // debug log
              }

              priceAlertCheck (sym, priceAlertTable, price, errorAdd, stockChartXValuesFunction, stockChartYValuesFunction) 
              if (saveTabl)
                saveTable(sym);
              dividendCalc (sym, null, LOG_FLAG, chartData[periodTag], rows, refreshByToggleColumns)             
            }        
        )
        .catch(error => {
          // Do something on error 
          errorAdd([sym, ' gain ', error.message])
          // console.log (sym, 'gain', error.message)
      })


  }
