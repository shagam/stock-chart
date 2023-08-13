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


export function marketwatchGainValidate (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction,
   requestedEntry_, refreshCallBack, firebaseGainAdd, corsServer, ssl, logFlags, setError) {
 
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
  console.log (sym, 'compare price, requesIndx=', requestedEntry, 'entry=', entry, limitTxt)


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
      if (LOG)
      console.log (sym, result.data)
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
        rows[row_index].values.alphaPrice = stockChartYValuesFunction[entry]
        
        var p = Number(rows[row_index].values.alphaPrice / rows[row_index].values.verifyPrice).toFixed(2)
        rows[row_index].values.verify_1 = Number(p);
        rows[row_index].values.verifyUpdateMili = Date.now();

        const searcDate = year + '-' + mon + '-' + day;
        if (LOG)
        console.log (sym, 'alpha:', rows[row_index].values.alphaDate, rows[row_index].values.alphaPrice, 'marketwatch:', rows[row_index].values.verifyPrice, 'ratio=', p);
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
