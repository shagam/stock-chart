import axios from 'axios'
// import cors from 'cors'
import {dateSplit} from '../utils/Date'
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
   requestedEntry_, refreshCallBack, firebaseGainAdd, corsServer, PORT, ssl, logFlags, setError, setText, nasdaq, setErr, ignoreSaved) {
 
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
  if (ssl) 
    corsUrl = "https://";
  else 
    corsUrl = "http://"; 

  if (! nasdaq)
    corsUrl += corsServer + ":" + PORT + "/price?stock=" + sym
  else
    corsUrl += corsServer + ":" + PORT + "/priceNasdaq?stock=" + sym

  // var corsUrl = "http://62.0.92.49:5000/price?stock=" + sym
    //corsUrl = "http://localhost:5000/price?stock=" + sym
    corsUrl += "&year=" + year + "&mon=" + mon + "&day=" + day;
    // console.log (getDate(), corsUrl)
    
    if (ignoreSaved)
      corsUrl += '&ignoreSaved=true';

  if (LOG)
  console.log (sym, corsUrl)
    axios.get (corsUrl)
    .then ((result) => {
      setErr()
      if (LOG && result.data)
      console.log (sym, JSON.stringify(result.data))
      if (result.data.err === "No data") {
        setError([sym, 'verify marketwatch', result.data.err])
        return;
      }
      // console.log ("Price Compare", getDate(), year, mon, day,
      // 'other=', result.data.open, 'alpha=', stockChartYValuesFunction[entry])
      const row_index = rows.findIndex((row)=> row.values.symbol === sym);
      if (result.data.err)
        console.log (sym, result.data, corsUrl) 
      var closeValue = result.data.close;
      if ((result.data !== '' || ! stockChartXValuesFunction) && ! result.data.err) {
        // if (nasdaq) {
        //   const splitsArray = JSON.parse(rows[row_index].values.splits_list)
        //   // compensate for splits
        //   const oldestDateSplit = dateSplit(oldestDate)
        //   for (let i = 0; i < splitsArray.length; i++) {
        //     const oneSplit = splitsArray[i];
        //     const oneSplitDate = dateSplit (oneSplit.date)
        //     if (oneSplitDate[0] < oldestDateSplit[0])  // skip old splits
        //       continue;
        //     if (oneSplitDate[1] < oldestDateSplit[1])
        //       continue;
        //     if (oneSplitDate[2] < oldestDateSplit[2])
        //       continue;
        //     closeValue /= oneSplit.ratio;
        //   }
        // }

        const alphaDate = stockChartXValuesFunction[entry];
        const alphaPrice = Number(stockChartYValuesFunction[entry]).toFixed(2);

        rows[row_index].values.verifyDate = oldestDate;
        rows[row_index].values.verifyPrice = closeValue;

        // const alphaPrice = stockChartYValuesFunction[stockChartYValuesFunction.length - backIndex]
        rows[row_index].values.alphaDate = alphaDate;
        rows[row_index].values.alphaPrice = alphaPrice;
 
        var p = Number(alphaPrice / closeValue).toFixed(2)

        //MarketWatch fail whenReverse split
         if (reverseSplit(rows[row_index].values.splits_list)) {
          rows[row_index].values.verify_1 = 'Rv-split';
        }
        else  
          rows[row_index].values.verify_1 = Number(p);
        rows[row_index].values.verifyUpdateMili = Date.now();

        const searcDate = year + '-' + mon + '-' + day;
   
        // build return object
        const ver = {};

        ver['sym'] = sym;
        ver['date'] = alphaDate

        ver['alphaPrice'] = alphaPrice

        if (!nasdaq)
          ver['verifyPrice'] = rows[row_index].values.verifyPrice;
        else
          ver['nasdaqPrice'] = rows[row_index].values.verifyPrice;

        ver['week'] = entry;
        ver['max'] = stockChartXValuesFunction.length - 1
        ver['verify_1'] = p

        if (p < 0.85 || p > 1.2)
          setErr('Verify_1 mismatch. Too far from "1" ')

        if (LOG) {
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
      setError([err.message])
    })

    refreshCallBack();
}

export function nasdaqTest () {
  const url='https://data.nasdaq.com/api/v3/datasets/WIKI/NVDA/data.json?start_date=2010-05-01&end_date=2024-2-2&limit=1'
  axios.get (url)
  .then ((result) => {
    const res_date = result.data.dataset_data.data[0][0];
    const res_open = result.data.dataset_data.data[0][8].toFixed(2);
    const res_close = result.data.dataset_data.data[0][11].toFixed(2);
    console.log("\n",result.data.dataset_data.column_names, result.data.dataset_data.data,
        res_date, res_open, res_close)

  })
}