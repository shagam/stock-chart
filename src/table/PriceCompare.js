import axios from 'axios'
// import cors from 'cors'
import {dateSplit} from './Date'
// import {todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, getDate} from './Date'

// import {
  // todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack,
  //  compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, 
  //  getDate} from './Date'


export function PriceCompare (sym, rows, stockChartXValuesFunction, stockChartYValuesFunction, requestedEntry_) {
  
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
  console.log ('compare price, request=', requestedEntry, 'entry=', entry, 'limit:', stockChartXValuesFunction.length - 1)


  const oldestDate = stockChartXValuesFunction[entry];
  const oldestDateComponets = dateSplit(oldestDate) // [year, month, day]
  const year = oldestDateComponets[0]
  const mon = oldestDateComponets[1]
  const day = oldestDateComponets[2]

    var corsUrl = "http://84.228.164.65:5000/price?stock=" + sym +
    // var corsUrl = "http://localhost:5000/price?stock=" + sym +
     "&year=" + year + "&mon=" + mon + "&day=" + day;
    // console.log (getDate(), corsUrl)

    axios.get (corsUrl)
    .then ((result) => {
      // console.log ("Price Compare", getDate(), year, mon, day,
      // 'other=', result.data.open, 'alpha=', stockChartYValuesFunction[entry])
      const row_index = rows.findIndex((row)=> row.values.symbol === sym); 

      if (result.data !== '' || ! stockChartXValuesFunction) {
        rows[row_index].values.googDate = oldestDate;
        rows[row_index].values.googPrice = result.data.open;

        // const alphaPrice = stockChartYValuesFunction[stockChartYValuesFunction.length - backIndex]
        rows[row_index].values.alphaDate = stockChartXValuesFunction[entry];
        rows[row_index].values.alphaPrice = stockChartYValuesFunction[entry]
        
        var p = (rows[row_index].values.alphaPrice / rows[row_index].values.googPrice).toFixed(2)
        rows[row_index].values.GOOGCompare = p;
        const searcDate = year + '-' + mon + '-' + day;
        console.log (sym, 'priceCompare alpha:', rows[row_index].values.alphaDate, rows[row_index].values.alphaPrice, 'marketwatch:',
         rows[row_index].values.googDate, rows[row_index].values.googPrice, 'ratio=', p)
      }
      else
        rows[row_index].values.GOOGCompare = -1;
    })
    .catch ((err) => {
      console.log(err)
    })

}

export default PriceCompare;

// https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ?window=6M

// https://www.google.com/finance/quote/AMZN:NASDAQ?window=6M

// https://www.google.com/finance/quote/AMZN:NASDAQ?window=1M

// https://www.google.com/finance/quote/IBM:NYSE?window=5Y
// https://www.google.com/finance/quote/TSLA:NASDAQ?window=5Y

{/* <title>AMZN $113.82 (▲0.53%) Amazon.com, Inc. | Google Finance</title>


<span jsname="Fe7oBc" class="NydbP nZQ6l tnNmPe" data-disable-percent-toggle="true" data-multiplier-for-price-change="1" aria-label="Up by 136.10%"><div jsname="m6NnIb" class="zWwE1"><div class="JwB6zf" style="font-size: 16px;"><span class="V53LMb" aria-hidden="true"><svg focusable="false" width="16" height="16" viewBox="0 0 24 24" class=" NMm5M"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></svg></span>136.10%</div></div></span>


<span jsname="V67aGc" class="VfPpkd-jY41G-V67aGc">5Y</span>

<span jsname="V67aGc" class="VfPpkd-jY41G-V67aGc">5Y</span> */}