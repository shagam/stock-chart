
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

export const StockSplitsGet = (sym, rows, setError, corsServer, ssl) => {

      // const [splits, setSplits] = useState([])
      const LOG = false; 
      if (LOG)
      console.log ('req params ', sym, rows.length)

      var corsUrl;
      // if (corsServer === 'serv.dinagold.org')
      if (ssl)
        corsUrl = "https://";
      else
        corsUrl = "http://"

      corsUrl += corsServer+ ":5000/splits?stock=" + sym;

      // corsUrl = "http://192.168.1.4:5000/splits?stock=" + sym;
      // corsUrl = "http://localhost:5000/splits?stock=" + sym;
      // corsUrl = "https://www.stocksplithistory.com/?symbol=" + sym;

      axios.get (corsUrl)
      // getDate()
      .then ((result) => {
        if (result.status !== 200)
          return;
        setError('');
        const splits = result.data;
        if (splits.length > 0 && LOG) {
          console.log (getDate(), sym, result.data, result.status, corsUrl)
          console.dir ("splits from server", splits)
          // console.log ('last web split: ', splits[splits.length - 1]);
        }

        const row_index = rows.findIndex((row)=> row.values.symbol === sym);
        if (row_index === -1) {
          alert ('stock missing: ' + sym)
          return;
        }

        if (rows[row_index].values.splits_list !== undefined) {
          // console.log ('old split: ', rows[row_index].values.splitsCount)
          if (LOG && rows[row_index].values.splits_list)
          console.dir (rows[row_index].values.splits_list);
        }

        var splitArray = [];
        for (let i = 0; i < splits.length; i++) {
          if (splits[i].jump === undefined) //skip first entry whish contains update mili only.
            continue;
          // if (splits[i].year < 2000)
          //   continue;
          const date = splits[i].year + '-' + splits[i].month + '-' + splits[i].day;
          const split = {ratio: Number (splits[i].jump), date: date};
          // splitArray = [...splitArray, split]
          splitArray.push (split);
        }

        if (splitArray.length > 0) {
          // console.dir (splitArray);
          const stringify = JSON.stringify(splitArray)
          if (LOG && rows[row_index].values.splits_list !== stringify) {
          console.log ("old splits", rows[row_index].values.splits_list)
          }
          rows[row_index].values.splits_list = stringify;
          rows[row_index].values.splitsCount = splitArray.length;
          rows[row_index].values.splitsUpdateMili = Date.now();
        }
        else {
          if (LOG)
          console.log ("delete obsolete splits")
          rows[row_index].values.splits_list = '';
          rows[row_index].values.splitsCount = '';
          rows[row_index].values.splitsUpdateMili = Date.now();
        }

      })
      .catch ((err) => {
        setError(err.message + '   url: ' + corsUrl)
        console.log(err, corsUrl)
      })
    
        
}

export default StockSplitsGet

