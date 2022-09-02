// https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__range__multiplier___timespan___from___to

     // {
      //     "c": 75.0875,
      //     "h": 75.15,
      //     "l": 73.7975,
      //     "n": 1,
      //     "o": 74.06,
      //     "t": 1577941200000,
      //     "v": 135647456,
      //     "vw": 74.6099
      //    },

import axios from 'axios'
import {format} from "date-fns"
const LOG = true;

export function polygon (sym, rows, date1, date2, freq, limit) {
// const apikey= 'apiKey=bh3xFki_SFP0L5Tf0iRmGakkChakq47_'  // eli.shagam
// const apikey = '_JxNU63UZg5QpyMpqQiomqbTeZwgRJqw'
const apikey = '_kvdb0t_WnviFFV2TsT1gJ6ir6YANlpe' // j321111

  // var url = 'https://api.polygon.io/v2/aggs/ticker/'+ sym + '/range/1/' + freq + '/' + date1 + '/' + date2 +
  // '?adjusted=true&sort=asc&limit=120?apiKey=bh3xFki_SFP0L5Tf0iRmGakkChakq47_'  

  const url ='https://api.polygon.io/v2/aggs/ticker/' + sym + '/range/1/' +freq+ '/' + date1 + '/' + date2+'?adjusted=true&sort=asc&limit=' + limit +'&'+ apikey
  if (LOG)
    console.log (url)
  var gain = [];
  axios.get (url)
  .then ((result) => {
    if (LOG)
      console.dir (result.data)
      
    for (var i = 0; i < result.data.results.length; i++) {
      const mili = result.data.results[i].t
      const close = result.data.results[i].c.toFixed(2)
      const open = result.data.results[i].o.toFixed(2)
      const date = new Date(result.data.results[i].t) //.toLocaleString())
      const date1 = format(date, "yyyy-MMM-dd")
      // const date1 = date.toLocaleString()
      // console.log(open, close, date1, mili)
      const gain1 = {
        date: date1,
        mili: mili,
        open: open,
        close: close
      }

      gain.push(gain1);
    }

    console.dir(gain)
 
    const row_index = rows.findIndex((row)=> row.values.symbol === sym); 

  })
  .catch ((err) => {
    console.log(err)
  })

  return gain;
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

// {
//   "ticker": "AAPL",
//   "queryCount": 19,
//   "resultsCount": 4,
//   "adjusted": true,
//   "results": [
//    {
//     "v": 320829680,
//     "vw": 136.816,
//     "o": 133.41,
//     "c": 139.96,
//     "h": 140,
//     "l": 133.35,
//     "t": 1624766400000,
//     "n": 2226399
//    },
//    {
//     "v": 417097822,
//     "vw": 143.2431,
//     "o": 140.07,
//     "c": 145.11,
//     "h": 145.65,
//     "l": 140.07,
//     "t": 1625371200000,
//     "n": 2874832
//    },
//    {
//     "v": 503869440,
//     "vw": 147.3555,
//     "o": 146.21,
//     "c": 146.39,
//     "h": 150,
//     "l": 143.63,
//     "t": 1625976000000,
//     "n": 3322910
//    },
//    {
//     "v": 440525239,
//     "vw": 145.3705,
//     "o": 143.75,
//     "c": 148.56,
//     "h": 148.7177,
//     "l": 141.67,
//     "t": 1626580800000,
//     "n": 2964909
//    }
//   ],
//   "status": "OK",
//   "request_id": "6533ede33e0051ecd9df76c83d1c0e1f",
//   "count": 4
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

// {/* <title>AMZN $113.82 (▲0.53%) Amazon.com, Inc. | Google Finance</title>


// <span jsname="Fe7oBc" class="NydbP nZQ6l tnNmPe" data-disable-percent-toggle="true" data-multiplier-for-price-change="1" aria-label="Up by 136.10%"><div jsname="m6NnIb" class="zWwE1"><div class="JwB6zf" style="font-size: 16px;"><span class="V53LMb" aria-hidden="true"><svg focusable="false" width="16" height="16" viewBox="0 0 24 24" class=" NMm5M"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></svg></span>136.10%</div></div></span>


// <span jsname="V67aGc" class="VfPpkd-jY41G-V67aGc">5Y</span>

// <span jsna