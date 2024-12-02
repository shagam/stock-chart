import { getMonth } from 'date-fns';
import React, {useState, useMemo, useEffect} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import {dateSplit, monthsBack, daysBack, getDate} from '../utils/Date';

import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {} from "date-fns";
import {format} from "date-fns"
import Plot from 'react-plotly.js';

export const MarketstackApi = (props) => {

  const [startDate, setStartDate] = useState(new Date(2022, 9, 15));
  const [displayFlag, setDisplayFlag] = useState (false); 


  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);
  const [title, setTitle] = useState()
  const [gainChart, setGainChart] = useState()

  

  const getData = (sym) => {

    if (props.symbol !== undefined)
      sym = props.symbol;
    console.log ('MarketstackApi', props);
    if (sym === '' || sym === undefined) {
      alert ('Need to click <gain> for  a symbol' );
      return;
    }

  // const date0 = monthsBack ([2020, 1, 1], 1);
  // const date1 = daysBack ([2020, 1, 1], 7);
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
    var DATE = '2021-07-15'
    //var DATE = startDate;
    const startYear = startDate.getFullYear();
    const startMon = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    DATE = startYear + '-' +  startMon + '-' + startDay;
    const limit = 1000 
    const date = new Date();
    // var DATE = Number(date.getFullYear()) - 1;
    // if (date.getMonth() > 11)
    //   DATE += '-' + Number(date.getMonth()) + 1
    // + '-' + date.getMonth() + '-' + date.getDate(); //'2020-03-01'
    //1000 per month
    // End-of-Day Data API Endpoint
    //http://api.marketstack.com/v1/

    //let API_Call =`http://api.marketstack.com/v1/eod?access_key=${API_KEY}&symbols=${sym}&date_from=${DATE}&limit=1&offset=100`

    let API_Call = 'http://api.marketstack.com/v1/eod?access_key=' + API_KEY + '&symbols=' + sym + '&date_from=' + DATE + '&limit=' + limit

    // & date_to = YYYY-MM-DD

    fetch(API_Call)
      .then(
          function(response) {
            if (response.status === 429 || response.status === 422) {
              console.log (response);
              alert ('marketstack too Many Requests (allowed 1000 per month) ' + response.status + ' ' +
              response.statusText);
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
            if (chartData.error) {
              console.log (chartData.error, chartData.message, )
              props.errorAdd([props.symbol, chartData.error.code, ', Use Firefox'])
              return;
            }
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
                const close = chartData.data[i].close;
                stockChartXValuesFunction.push(date);
                stockChartYValuesFunction.push(close);
              }
            } catch (e) {console.log(e)}

            // prepare historical data for plotly chart
            // let i = 0;
            var splits = "";
            var splitArray = [];
            setStockChartXValues (stockChartXValuesFunction);
            setStockChartYValues (stockChartYValuesFunction);

            console.dir (stockChartXValuesFunction)
            console.dir (stockChartYValuesFunction)

            const chartObj =
            {
              name: props.symbol,
              nameSingle: props.symbol,
              x: stockChartXValuesFunction,
              y: stockChartYValuesFunction,
              type: 'scatter',
              mode: 'lines',
              line: { width: 1 }
              //    marker: { color: 'green' },
            }
            setGainChart (chartObj)
            //const updateMili = Date.now();
            //const updateDate = getDate();
         }
      )
      .catch(error => {
        props.errorAdd([props.symbol, 'marketStack', error.message])
        console.log(props.symbol, 'marketStack', error.message)
    })
  }
  //searchSplits (props.symbol)
  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}


  return (
    <>
      <div>
            <input
              type="checkbox" checked={displayFlag}
              onChange={displayFlagChange}
            /> marketStack
      </div>
      {displayFlag && <div>
       <div style={{display:'flex'}} >
          <button type="button" onClick={()=>getData(props.symbol)}>marketStackInfo </button>
          &nbsp;&nbsp;
          <DatePicker dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)}  /> &nbsp; (Limited to one year, use firefox)

   
        </div>
          <div>
            {console.dir(gainChart)}
          {stockChartXValues.length > 0  && <Plot  data={[gainChart]} 
            layout={{ width: 850, height: 500, title: title, yaxis: {autorange: true, }  }}
             />}
       </div>
       </div>
      } 
    </>
  )
}

export default MarketstackApi