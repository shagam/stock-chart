import { getMonth } from 'date-fns';
import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import {dateStrToArray, monthsBack, daysBack} from './Date';

export const MarketstackApi = (props) => {
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  console.log ('MarketstackApi', props);

  const searchSplits = (sym) => {

    if (sym === '' || sym === undefined) {
      console.log (`Splits chart sym vanished (${sym})`);
      return;
    }

  const date0 = monthsBack ([2020, 1, 1], 1);
  const date1 = daysBack ([2020, 1, 1], 7);
// End-of-Day Data API Endpoint

//{"pagination":{"limit":100,"offset":0,"count":100,"total":253},"data":[{"open":171.73,"high":175.35,"low":171.43,"close":174.83,"volume":73516656.0,"adj_high":null,"adj_low":null,"adj_close":174.83,"adj_open":null,"adj_volume":null,"split_factor":1.0,"dividend":0.0,"symbol":"AAPL","exchange":"XNAS","date":"2022-02-08T00:00:00+0000"},{"open":172.86,"high":173.95,"low":170.95,"close":171.66,"volume":77045100.0,"adj_high":null,"adj_low":null,"adj_close":171.66,"adj_open":null,"adj_volume":null,"split_factor":1.0,"dividend":0.0,"symbol":"AAPL","exchange":"XNAS","date":"2022-02-07T00:00:00+0000"},

// http://api.marketstack.com/v1/eod
//     ? access_key = YOUR_ACCESS_KEY
//     & symbols = AAPL
    
// optional parameters: 

    // & sort = DESC
    // & date_from = YYYY-MM-DD
    // & date_to = YYYY-MM-DD
    // & limit = 100
    // & offset = 0

    //const API_KEY = '46bea3e9fabc17363dbbe15839cb0fe3';  // eli.shagam.gmail.com
    const API_KEY = '2b5394f2ced526a03a5a7886403a22ce'; // Goldstein.dina@gmail.com
    const date = new Date();

    var DATE = Number(date.getFullYear()) - 1;
    if (date.getMonth() > 11)
      DATE += '-' + Number(date.getMonth()) + 1
    + '-' + date.getMonth() + '-' + date.getDate(); //'2020-03-01'
    //1000 per month
    // End-of-Day Data API Endpoint
    //http://api.marketstack.com/v1/

    //let API_Call =`http://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${sym}&date_from=${DATE}&limit=1&offset=100`

    let API_Call =`http://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${sym}&date_to=${DATE}&limit=1`

    // & date_to = YYYY-MM-DD

    fetch(API_Call)
      .then(
          function(response) {
            if (response.status === 429) {
              console.log (response);
              alert ('marketstack too Many Requests (allowed 1000 per month) ');
              return null;
            }
            const respStr = JSON.stringify (response);
            if (respStr.indexOf (' status: 200, ok: true') !== -1)
                console.log(response);
            return response.json();
          }
      )
      .then(
          (chartData) => {
            if (chartData === undefined)
              return null;
            const dataStr = JSON.stringify(chartData);
            if (dataStr === "{}") {
              alert (`Invalid symbol: (${sym})`)
              return;
            }
            console.log(API_Call);
            console.log (dataStr.substring(0,150));
                
            var stockChartXValuesFunction = [];              
            var stockChartYValuesFunction = [];
            try {
              for (let i = 0; i < chartData.data.length; i++) {
                var date = chartData.data[i].date;
                date = date.split('T')[0];
                const open = chartData.data[i].open;
                stockChartXValuesFunction.push(date);
                stockChartYValuesFunction.push(open);
              }
            } catch (e) {console.log(e)}

            // prepare historical data for plotly chart
            // let i = 0;
            var splits = "";
            var splitArray = [];
            // for (var key in chartData[`${periodTag}`]) {
            //     stockChartXValuesFunction.push(key);
            //     stockChartYValuesFunction.push(Number (chartData[`${periodTag}`][key]['1. open']));
            //     if (i > 0) {
            //       let ratio = stockChartYValuesFunction[i] / stockChartYValuesFunction[i-1];
            //       if (ratio > 1.8 || ratio < 0.6) {
            //         ratio = ratio.toFixed(2);
            //         //splits += `date=${key}  ratio=${ratio} week=${i}, `;
            //         const  split = {ratio: ratio, date: key, week: -1};
            //         splitArray.push(split); 
            //       }                        
            //     }
            //     i++;
            // }

            // compensate for splits
            // if (splitArray.length > 0) {
            //   for (let i = 0; i < splitArray.length; i++) {
            //     var ratio = splitArray[i].ratio;
            //     if (ratio > 1)
            //       ratio = Math.round (ratio);
            //     else
            //       ratio = 1 / Math.round (1/ratio);                  
            //     for ( let j = splitArray[i].week; j < stockChartYValuesFunction.length; j++) {
            //         stockChartYValuesFunction[j] /= ratio;
            //         chartData[`${periodTag}`][key]['1. open'] /= ratio;
            //     }
            //   }
            // }
            setStockChartXValues (stockChartXValuesFunction);
            setStockChartYValues (stockChartYValuesFunction);

            if (splitArray.length > 0)
              splits = JSON.stringify(splitArray);
            else
              splits = '';  
            // if (splitArray.length > 1 && (splitArray[splitArray.length - 1].week - splitArray[0].week) < 100)
            //   splits = '';
            //const updateMili = Date.now();
            //const updateDate = getDate();
         }
      )
  }
  //searchSplits (props.symbol)

  return (
    <>
      {
        props.admin && <button type="button" onClick={()=>searchSplits('NVDA')}>marketStack </button>
      }     
    </>
  )
}

export default MarketstackApi