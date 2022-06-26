
import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'

// http://84.228.164.65:5000/splits?stock=MSFT
// https://www.stocksplithistory.com/?symbol=MSFT

export const StockSplitsGet = (sym, rows, saveTable, refreshCallBack) => {

      // const [splits, setSplits] = useState([])
      var splitsArray = [];

      console.log (sym, rows.length)
      // function getSplits () {
            // sym = 'TSLA'
      // var url = "https://www.stocksplithistory.com/?symbol=" + sym;
      //  url = 'www.google.com'
      var corsUrl = "http://84.228.164.85:5000/splits?stock=" + sym;
      corsUrl = "http://192.168.1.4:5000/splits?stock=" + sym;
      corsUrl = "http://localhost:5000/splits?stock=" + sym;

      fetch(corsUrl, {mode:'cors'})
      .then(
            function(response) {
                  const respStr = JSON.stringify (response);
                  if (response.status !== 200)// (' status: 200, ok: true') !== -1)
                  console.log(response);
                  // return response;
            }
      )
      .then(
            function (data) {
            const dataStr = JSON.stringify(data);
            console.log (data);
            // console.log (dataStr.substring(0,150));
            }

      )
      return (splitsArray)
        
}

export default StockSplitsGet

