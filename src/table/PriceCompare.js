import React from 'react'
import axios from 'axios'
import cors from 'cors'
import {getDate} from './Date'
// import {
  // todaySplit, todayDateSplit, dateSplit, monthsBack, daysBack,
  //  compareDate, daysFrom1970, searchDateInArray, monthsBackTest, daysBackTest, 
  //  getDate} from './Date'


function PriceCompare (sym, year, mon, day) {
    //var corsUrl = "http://84.228.164.65:5000/splits?stock=" + sym;
    var corsUrl = "http://localhost:5000/price?stock=" + sym +
     "&year=" + year + "&mon=" + mon + "&day=" + day;
    console.log (getDate(), corsUrl)

    axios.get (corsUrl)
    .then ((result) => {
      console.log ("\n", getDate(), "pageSize: ", result.data.length, result.data)

      // const regex = new RegExp (pattern, 'm');
      // var result1 = regex.exec(result.data)
      // console.log (result[0])
 
      // const info = {
      //   Open: result[1],
      //   close: result[2],
      // }
      // return info;
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