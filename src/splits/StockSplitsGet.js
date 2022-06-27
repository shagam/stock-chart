
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

      console.log ('req params ', sym, rows.length)

      //  url = 'www.google.com'
      var corsUrl = "http://84.228.164.65:5000/splits?stock=" + sym;
      // corsUrl = "http://192.168.1.4:5000/splits?stock=" + sym;
      // corsUrl = "http://localhost:5000/splits?stock=" + sym;
      // corsUrl = "https://www.stocksplithistory.com/?symbol=" + sym;

      axios.get (corsUrl)
      // getDate()
      .then ((result) => {
        if (result.status !== 200)
          return;

          const splits = result.data;
          console.log (splits[0]);
          const row_index = rows.findIndex((row)=> row.values.symbol === sym);
          if (row_index === -1) {
            alert ('stock missing: ' + sym)
            return;
          }

          // const splitArray_build = [];
          // for (let i = 0; i < rows.length; i++) {
          //   if (rows[i].values.symbol !== sym)
          //     continue;
          //     const date = rows[i].values.year + '-' + rows[i].values.month + '-' + rows[i].values.day;
          //     const split = {ratio: Number (rows[i].values.jump), date: date};
          //     splitArray_build.push (split);
          // }    


        console.log (getDate(), result.data, result.status, corsUrl)
      })
      .catch ((err) => {
        console.log(err)
      })
    
        
}

export default StockSplitsGet

