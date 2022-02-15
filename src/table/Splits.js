import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'

import {dateSplit, todayDate, todayDateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray, monthsBackTest} from './Date'


export const Splits = (props) => {
  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);



  const searchSplits = (sym, API_KEY) => {

    if (props.symbol !== undefined)
      sym = props.symbol;

    if (sym === '' || sym === undefined) {
      console.log (`Splits chart sym vanished (${sym})`);
      return;
    }

    // const API_KEY_ = props.API_KEY; //'BC9UV9YUBWM3KQGF';

    let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${sym}&outputsize=full&apikey=${API_KEY}`;
    //https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=IBM&apikey=demo
    //https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&outputsize=full&apikey=demo

    fetch(API_Call)
      .then(
          function(response) {
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
            
            // too frequent AlphaVantage api calls
            if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                alert (`${dataStr} (${sym}) \n\n${API_Call} `);
                //setChartData ('');
                return;
            }
            if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
              alert (dataStr.substring(0, 35) + ` symbol(${sym}) \n\n${API_Call}`);
              //setChartData ('');
              return;
            }

            var stockChartXValuesFunction = [];              
            var stockChartYValuesFunction = [];
            //let periodTag = 'Weekly Adjusted Time Series';
            let periodTag = "Time Series (Daily)"

            // prepare historical data for plotly chart
            let i = 0;
            var splits = "";
            var splitArray = [];
            for (var key in chartData[`${periodTag}`]) {
                stockChartXValuesFunction.push(key);
                stockChartYValuesFunction.push(Number (chartData[`${periodTag}`][key]['1. open']));
                if (i > 0) {
                  let ratio = stockChartYValuesFunction[i] / stockChartYValuesFunction[i-1];
                  if (ratio > 1.8 || ratio < 0.6) {
                    ratio = ratio.toFixed(2);
                    //splits += `date=${key}  ratio=${ratio} week=${i}, `;
                    const  split = {ratio: ratio, date: key, week: -1};
                    splitArray.push(split); 
                  }                        
                }
                i++;
            }

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


            try {
            const row_index = props.rows.findIndex((row)=> row.values.symbol === sym);
            if (row_index === -1) {
              console.log ('splits.js sym not found')
              return null;
            }
            const todaySplit = todayDateSplit();
            
            var dateBackSplit = daysBack (todaySplit, 7);
            var chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            var date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];            
              props.rows[row_index].values.wk = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];
            }

            dateBackSplit = daysBack (todaySplit, 14);
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.wk2 = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];
            }

            dateBackSplit = monthsBack (todaySplit, 1);
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.mon = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];           
            }

            dateBackSplit = monthsBack (todaySplit, 3);
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.mon3 = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];            
            }

            dateBackSplit = monthsBack (todaySplit, 6);
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.mon6 = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];            
            }

            dateBackSplit = monthsBack (todaySplit, 12);
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.year = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];            
            }

            dateBackSplit = monthsBack (todaySplit, 36); 
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.year2 = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];            
            }

            dateBackSplit = monthsBack (todaySplit, 60); // 5 years
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.year5 = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];            
            }

            dateBackSplit = monthsBack (todaySplit, 120); // 10 years
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            date = stockChartXValuesFunction[chartIndex];
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.year10 = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];            
            }

            dateBackSplit = monthsBack (todaySplit, 240); // 20 years
            chartIndex = searchDateInArray (stockChartXValuesFunction, dateBackSplit)
            if (chartIndex !== undefined) {
              date = stockChartXValuesFunction[chartIndex];
              props.rows[row_index].values.year20 = stockChartYValuesFunction[0] / stockChartYValuesFunction[chartIndex];            
            }


            if (splitArray.length > 0)
              props.rows[row_index].values.splits_list = JSON.stringify (splitArray);
            else
              props.rows[row_index].values.splits_list = undefined;
              //props.rows[row_index].values.splits_object = splitArray;

            } catch (e) {console.log (e)}

            props.saveTable();

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
       
            // search date
            // var testDateArray = [2020, 11, 1];
            // const foundIndex = searchDateInArray (stockChartXValuesFunction, testDateArray);
            // console.log (foundIndex);

          }
      )
  }
  //searchSplits (props.symbol)

  return (
    <>
      {
        props.admin && <button type="button" onClick={()=>searchSplits('NVDA', 'BC9UV9YUBWM3KQGF')}>searchSplitsDaily </button>
      }     
    </>
  )
}

export default Splits