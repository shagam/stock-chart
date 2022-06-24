
import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'

export const StockSplitsGet = (sym) => {

      // const [splits, setSplits] = useState([])
      var splitsArray = [];

      console.log (sym)
      // function getSplits () {
            // sym = 'TSLA'
      var url = "https://www.stocksplithistory.com/?symbol=" + sym;
      //  url = 'www.google.com'
      const corsUrl = "https://localhost:5000/splits?stock=" + sym;
      try{
      fetch(corsUrl)
      .then(
            function(response) {
                  const respStr = JSON.stringify (response);
                  if (respStr.indexOf (' status: 200, ok: true') !== -1)
                  console.log(response);
                  // return response();
            }
      )
      .then(
            (chartData) => {
            const dataStr = JSON.stringify(chartData);
            console.log (url);
            // console.log (dataStr.substring(0,150));

// Pattern pattern = Pattern.compile("#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)");

            const pattern = "/#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)/g";
            }

      )
      } catch (e) {console.log (e)}
      return (splitsArray)
        
}

export default StockSplitsGet







//     System.out.println("lines: " + count + " : " +  " sym: " + sym
//             // + matcher.start() + " - " + matcher.end() + " " + buff.substring(matcher.start(), matcher.end())
//              + " " + matcher.group(1) + " " + matcher.group(2) + " " + matcher.group(3) + " " + matcher.group(4)+ " " + matcher.group(5));
//     //{"key": "NVDA_2021", "symbol": "NVDA", "jump": 4, "year": 2010, "month": 7, "day": 20 },
//     int year = Integer.parseInt(matcher.group(3));
//     if (year >= 2000) {
//       try {
//       int mon = Integer.parseInt(matcher.group(1));
//       int day = Integer.parseInt(matcher.group(2));

//         Double cnt4 = Double.parseDouble(matcher.group(4)); // jump factor
//         Double cnt5 = Double.parseDouble(matcher.group(5)); // jump factor

//       Double jump = cnt4 / cnt5;
//       jump = Math.round (jump * 10000) / 10000.0;
