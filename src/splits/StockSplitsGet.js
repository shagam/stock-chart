
import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'

// http://84.228.164.65:5000/splits?stock=MSFT
// https://www.stocksplithistory.com/?symbol=MSFT

function getDate() {
  const today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  // var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
  return date + " " + time;    
}

export const StockSplitsGet = (sym, rows, saveTable, refreshCallBack) => {

      // const [splits, setSplits] = useState([])

      console.log (sym, rows.length)
      // function getSplits () {
            // sym = 'TSLA'
      // var url = "https://www.stocksplithistory.com/?symbol=" + sym;
      //  url = 'www.google.com'
      var corsUrl = "http://84.228.164.65:5000/splits?stock=" + sym;
      // corsUrl = "http://192.168.1.4:5000/splits?stock=" + sym;
      // corsUrl = "http://localhost:5000/splits?stock=" + sym;

      axios.get (corsUrl)
      // getDate()
      .then ((result) => {
        console.log (getDate(), result.data, result.status, corsUrl)
      })
      .catch ((err) => {
        console.log(err)
      })
    
        
}

export default StockSplitsGet

