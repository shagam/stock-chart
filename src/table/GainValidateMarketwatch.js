import axios from 'axios'
// import cors from 'cors'
import {dateSplit} from './Date'
import {format} from "date-fns"
// import {todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, getDate} from './Date'

// import {
  // todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack,
  //  compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, 
  //  getDate} from './Date'
  // var url = "https://bigcharts.marketwatch.com/historical/default.asp?symb=" + req.query.stock
  // url += '&closeDate=' + req.query.mon
  // url += '%2F' + req.query.day
  // url += '%2F' + req.query.year

  // if reverse split MarkeWatch fail
  function reverseSplit (splits) {
    if (! splits)
      return false;
    const splits_list = JSON.parse(splits)
    for (let n = 0; n < splits_list.length; n++) { 
      if (splits_list[n].ratio < 1)
        return true;
    }
    return false;
  }

export function marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction,
   requestedEntry_, refreshCallBack, firebaseGainAdd, corsServer, ssl, logFlags, setError, setText) {
 
  const LOG = logFlags.includes("verify_1");
  // setError();

  // choose entry for compare
  var entry = stockChartXValuesFunction.length - 1;
  var requestedEntry = Number(requestedEntry_)
  if (requestedEntry === 0)
    entry = stockChartXValuesFunction.length - 1;
  if (requestedEntry < 0) { // negative go back from end
    if (requestedEntry + stockChartXValuesFunction.length > 0)
      entry = stockChartXValuesFunction.length + requestedEntry;
    else {
      entry = 0;
      console.log ('out of range', stockChartXValuesFunction.length - 1);
    }
  }
  else { // positive: use requested entry if possible.
    if (requestedEntry < stockChartXValuesFunction.length)
      entry = requestedEntry;
    else {
      entry = stockChartXValuesFunction.length - 1;
      console.log ('out of range', stockChartXValuesFunction.length - 1);
    }
  }

  const limitTxt = entry === stockChartXValuesFunction.length - 1 ? '' :  'limit: ' + (stockChartXValuesFunction.length - 1)
  if (LOG)
  console.log (sym, 'AlphaVantage price, requesIndx=', requestedEntry, 'entry=', entry, stockChartXValuesFunction[entry], 'val', stockChartYValuesFunction[entry], limitTxt)


  const oldestDate = stockChartXValuesFunction[entry];
  const oldestDateComponets = dateSplit(oldestDate) // [year, month, day]
  const year = oldestDateComponets[0]
  const mon = oldestDateComponets[1]
  const day = oldestDateComponets[2]

  var corsUrl;
  // if (corsServer === 'serv.dinagold.org')
  if (ssl) {
    corsUrl = "https://";
    corsUrl += corsServer + ":5000/price?stock=" + sym
  }
  else {
    corsUrl = "http://"; 
    corsUrl += corsServer + ":5000/price?stock=" + sym
  }

  // var corsUrl = "http://62.90.44.227:5000/price?stock=" + sym
    //corsUrl = "http://localhost:5000/price?stock=" + sym
    corsUrl += "&year=" + year + "&mon=" + mon + "&day=" + day;
    // console.log (getDate(), corsUrl)
  if (LOG)
  console.log (sym, corsUrl)
    axios.get (corsUrl)
    .then ((result) => {
      if (LOG && result.data)
      console.log (sym, JSON.stringify(result.data))
      // console.log ("Price Compare", getDate(), year, mon, day,
      // 'other=', result.data.open, 'alpha=', stockChartYValuesFunction[entry])
      const row_index = rows.findIndex((row)=> row.values.symbol === sym);
      if (result.data.err)
        console.log (sym, result.data.err, corsUrl) 

      if ((result.data !== '' || ! stockChartXValuesFunction) && ! result.data.err) {
        rows[row_index].values.verifyDate = oldestDate;
        rows[row_index].values.verifyPrice = result.data.open;

        // const alphaPrice = stockChartYValuesFunction[stockChartYValuesFunction.length - backIndex]
        rows[row_index].values.alphaDate = stockChartXValuesFunction[entry];
        rows[row_index].values.alphaPrice = Number(stockChartYValuesFunction[entry]).toFixed(2);
        
        var p = Number(rows[row_index].values.alphaPrice / rows[row_index].values.verifyPrice).toFixed(2)

        //MarketWatch fail whenReverse split
         if (reverseSplit(rows[row_index].values.splits_list)) {
          rows[row_index].values.verify_1 = 'Rv-split';
        }
        else  
          rows[row_index].values.verify_1 = Number(p);
        rows[row_index].values.verifyUpdateMili = Date.now();

        const searcDate = year + '-' + mon + '-' + day;
        var alphaPrice = rows[row_index].values.alphaPrice;
        const ver = {};
        // var txt = sym + ' date: ' + rows[row_index].values.alphaDate;
        ver['sym'] = sym;
        ver['date'] = rows[row_index].values.alphaDate;
        if (alphaPrice)
          alphaPrice = Number(alphaPrice).toFixed(2)
        // txt += '  alpha-price: ' + alphaPrice; 
        ver['alphaPrice'] = alphaPrice
        // txt +=  ' marketwatch-price: ' + rows[row_index].values.verifyPrice;
        ver['marketwatchPrice'] = rows[row_index].values.verifyPrice;
        // txt += ' entry: ' + entry + ' (' + (stockChartXValuesFunction.length - 1) + ')'
        ver['entry'] = entry;
        ver['max'] = stockChartXValuesFunction.length - 1
        // txt += ' verify_1='+ p;
        ver['verify_1'] = p
        // '  %cstock compare start', 'background: #fff; color: #22ef11')
        if (LOG) {
          // console.log (txt);
          console.log (ver)
        }
        if (setText) {
          setText(ver)
        }
        if (rows[row_index].values.verifyDate !== rows[row_index].values.alphaDate) {
          console.log (rows[row_index].values.verifyDate) }
          
        // firebaseGainAdd(sym, 'validate');
      }
      else {
        rows[row_index].values.verify_1 = -1;
        rows[row_index].values.verifyUpdateMili = Date.now(); // update fresh info even if no data
      }
    })
    .catch ((err) => {
      console.log(err, corsUrl)
      setError([err.message, corsUrl])
    })

    refreshCallBack();
}
