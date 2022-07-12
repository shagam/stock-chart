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

// https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__range__multiplier___timespan___from___to

export function polygon (sym, rows, date1, date2, freq, limit) {

  // date1 = '2021-06-01'
  // date2 = '2021-07-22'
  // limit = 120;
  // freq = 'week'
const apikey= 'apiKey=bh3xFki_SFP0L5Tf0iRmGakkChakq47_'

  var url = 'https://api.polygon.io/v2/aggs/ticker/'+ sym + '/range/1/' + freq + '/' + date1 + '/' + date2 +
  '?adjusted=true&sort=asc&limit=120?apiKey=bh3xFki_SFP0L5Tf0iRmGakkChakq47_'  

  // url = 'https://api.polygon.io/v2/aggs/ticker/'+ sym + '/range/1/week/2021-07-22/2021-08-22?adjusted=true&sort=asc&limit=120&apiKey=bh3xFki_SFP0L5Tf0iRmGakkChakq47_'

  url ='https://api.polygon.io/v2/aggs/ticker/' + sym + '/range/1/' +freq+ '/' + date1 + '/' + date2+'?adjusted=true&sort=asc&limit=' + limit +'&'+ apikey

  console.log (url)

  axios.get (url)
  .then ((result) => {
    console.dir (result.data)

    var pattern = "#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)";
    // pattern = "CCCCCC"
    const regex1 = new RegExp (pattern, 'g');

    const text = result.data;
    var count = 0;
    const splits = [];

    while ((result = regex1.exec(text)) !== null){
        count++
      const oneSplit = {
        stock: sym,
        jump: (Number(result[4] / result[5])).toFixed(4),
        year: Number(result [3]),
        month: Number(result[1]),
        day: Number(result[2]),
      }
      splits.push(oneSplit);

    };



    const row_index = rows.findIndex((row)=> row.values.symbol === sym); 


  })
  .catch ((err) => {
    console.log(err)
  })

  return [{},{}]
}





// {
//   "adjusted": true,
//   "queryCount": 2,
//   "request_id": "6a7e466379af0a71039d60cc78e72282",
//   "results": [
//    {
//     "c": 75.0875,
//     "h": 75.15,
//     "l": 73.7975,
//     "n": 1,
//     "o": 74.06,
//     "t": 1577941200000,
//     "v": 135647456,
//     "vw": 74.6099
//    },
//    {
//     "c": 74.3575,
//     "h": 75.145,
//     "l": 74.125,
//     "n": 1,
//     "o": 74.2875,
//     "t": 1578027600000,
//     "v": 146535512,
//     "vw": 74.7026
//    }
//   ],
//   "resultsCount": 2,
//   "status": "OK",
//   "ticker": "AAPL"
//  }



// https://coderrocketfuel.com/article/convert-a-unix-timestamp-to-a-date-in-vanilla-javascript
// Table of Contents
// Convert the Unix Timestamp to Milliseconds
// Create a Date Object Using new Date()
// Create Human-Friendly Date Strings With .toLocaleString()

// https://financialmodelingprep.com/api/v3/financial-statement-symbol-lists?apikey=abe76877b8d46e8ac06532061260f4d4


// https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ?window=6M

// https://www.google.com/finance/quote/AMZN:NASDAQ?window=6M

// https://www.google.com/finance/quote/AMZN:NASDAQ?window=1M

// https://www.google.com/finance/quote/IBM:NYSE?window=5Y
// https://www.google.com/finance/quote/TSLA:NASDAQ?window=5Y

{/* <title>AMZN $113.82 (▲0.53%) Amazon.com, Inc. | Google Finance</title>


<span jsname="Fe7oBc" class="NydbP nZQ6l tnNmPe" data-disable-percent-toggle="true" data-multiplier-for-price-change="1" aria-label="Up by 136.10%"><div jsname="m6NnIb" class="zWwE1"><div class="JwB6zf" style="font-size: 16px;"><span class="V53LMb" aria-hidden="true"><svg focusable="false" width="16" height="16" viewBox="0 0 24 24" class=" NMm5M"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></svg></span>136.10%</div></div></span>


<span jsname="V67aGc" class="VfPpkd-jY41G-V67aGc">5Y</span>

<span jsname="V67aGc" class="VfPpkd-jY41G-V67aGc">5Y</span> */}