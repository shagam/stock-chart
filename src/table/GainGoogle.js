import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'

export const GainGoogle = (props) => {
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);

  const searchSplits = (sym) => {

    if (sym === '' || sym === undefined) {
      console.log (`Splits chart sym vanished (${sym})`);
      return;
    }

    const API_KEY = '46bea3e9fabc17363dbbe15839cb0fe3';

    //1000 per month
    // End-of-Day Data API Endpoint
    //http://api.marketstack.com/v1/

    let API_Call =`http://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${sym}`

    fetch(API_Call)
      .then(
          function(response) {
            if (response.status === 429) {
              console.log('Too Many Requests', response);
              return;
            }
            const respStr = JSON.stringify (response);
            if (respStr.indexOf (' status: 200, ok: true') !== -1)
                console.log(response);
            return response.json();
          }
      )
      .then(
          (chartData) => {
            const dataStr = JSON.stringify(chartData);
            if (dataStr === "{}") {
              alert (`Invalid symbol: (${sym})`)
              return;
            }
            console.log(API_Call);
            console.log (dataStr.substring(0,150));
            
            //too frequent AlphaVantage api calls
            if (dataStr.indexOf ('Your monthly usage limit has been reached') !== -1) {
                alert (`${dataStr} (${sym}) \n\n${API_Call} `);
                //setChartData ('');
                return;
            }
            // if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
            //   alert (dataStr.substring(0, 35) + ` symbol(${sym}) \n\n${API_Call}`);
            //   //setChartData ('');
            //   return;
            // }

            var stockChartXValuesFunction = [];              
            var stockChartYValuesFunction = [];
            //let periodTag = 'Weekly Adjusted Time Series';
            let periodTag = "Time Series (Daily)"

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
        props.admin && <button type="button" onClick={()=>searchSplits('NVDA')}>gainGoogle </button>
      }     
    </>
  )
}

export default GainGoogle