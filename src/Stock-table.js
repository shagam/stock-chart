
import React, {useState} from 'react';
//import { nanoid } from 'nanoid';
import './App.css';
import './react-tables.css';
//import data from "./mock-data.json";
//import Overview from "./Overview.js";
import {useTable, useSortBy} from 'react-table'
//import {COLUMNS} from './columns'
import StockChart from "./StockChart";
import Stock_chart from "./Stock-chart";

import AlphaVantage from './AlphaVantage';

const StockTable = () => { 
    var data1 = JSON.parse(localStorage.getItem('stockTable'));

    if (data1 === null || JSON.stringify(data1).length === 0)
      data1 = JSON.parse('[{"symbol": "GOOG"},{"symbol": "FB"},{"symbol": "AMZN"},{"symbol": "QQQ"}]');


    const [stocks, setStocks] = useState(data1);
    const [chartSymbol, setChartSymbol] = useState("");
    const [infoSymbol, setInfoSymbol] = useState("");
    const [flag, setFlag] = useState("");
    const [chartData, setChartData] = useState ({});
    const API_KEY_array=['C542IZRPH683PFNZ','BC9UV9YUBWM3KQGF'];  
    const [stocksOverview, setStocksOverview] = useState({});
    //const [, setChartData] = useState ();
    //var chartData = {};
    var index = 0;

    const [addFormData, setAddFormData] = useState({
      symbol: '', update: '', nowInfo: -1, nowHist: -1, Exchange: '', /*Sector: '', lastPrice: 0,*/ PE: 0, PEG: 0,
       BETA: 0, gap: "", wk: -1, wk2: 20, mon: 0, mon3: 0, mon6: 0, year: 0, year2: 0, year5: 0, year10: 0, year20: 0          
    })

    const getAPI_KEY = () => {
      const index = Math.floor (Math.random () * API_KEY_array.length);
      console.log ('API_KEY: ' + API_KEY_array[index]); 
      return API_KEY_array[index];
    }

    var API_KEY = 'C542IZRPH683PFNZ';
    const isEmpty = (str) => {
      if (str == null)
          return true;
      if (str === "")
          return true;
      return false;
    }

    const alphaCallBack = (key) => {
      API_KEY = key;
      //alert ('App. API_KEY: ' + c_API_KEY)
      console.log (`callBack API_KEY: ${API_KEY}`);
    }
    
    function getDate() {
      const date = new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;      
    }
    //console.log (React.version);

    // enter history values into table
    const handleCallBackForHistory = (childData, sym) => {
      console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
      const index = stocks.findIndex((stock)=> stock.symbol === sym);
      if (index === -1) {
        alert (`stock-table, history call back, invalid chartSymbol (${sym}) trying to updatehistory values` );
        return chartSymbol;
      }
      const newStock = {
        symbol: sym, //stocks[index].symbol,
        update: getDate(),
        nowHist: Date.now(),
        Exchange: stocks[index].Exchange,
        // Sector: stocks[index].Sector,
        // lastPrice: stocks[index].lastPrice,
        PE: stocks[index].PE,
        PEG: stocks[index].PEG,
        BETA: stocks[index].BETA,
        // gap
        wk: childData[0], //stocks[index].wk,
        wk2: childData[1], //stocks[index].wk2,
        mon: childData[2], //stocks[index].mon,
        mon3: childData[3], //stocks[index].mon3,
        mon6: childData[4], //stocks[index].mon6,
        year: childData[5], //stocks[index].year,
        year2: childData[6], //stocks[index].year2,
        year5: childData[7], //stocks[index].year5,
        year10: childData[8], //stocks[index].year10,
        year20: childData[9] //stocks[index].year20 
      };

      const newStocks = [...stocks];
      newStocks.splice(index, 1, newStock);
      setStocks(newStocks); 

      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', `${stocksStr}`);
      // if (! isEmpty (chartSymbol))
      //   stocksHistory [chartSymbol] = childData;
      // const stocksHistoryStr = JSON.stringify(stocksHistory);
      // localStorage.setItem('stocksHistory', `${stocksHistoryStr}`);
    }

    const handleOverview = (childData)  => {
      console.log (JSON.stringify(childData).substring(0,100));
      const symbol = childData["Symbol"];

      const index = stocks.findIndex((stock)=> stock.symbol === symbol);
      //console.log (`Symbol (${symbol}) index (${index})`);      
      const newStock = {
        symbol: childData["Symbol"],
        update: getDate(),
        nowOverview: Date.now(),
        Exchange: childData["Exchange"],
        // Sector: childData["Sector"],
        // lastPrice: stocks[index].lastPrice,
        PE: childData["PERatio"],
        PEG: childData["PEGRatio"],
        BETA: childData["Beta"],
        // gap
        wk: stocks[index].wk,
        wk2: stocks[index].wk2,
        mon: stocks[index].mon,
        mon3: stocks[index].mon3,
        mon6: stocks[index].mon6,
        year: stocks[index].year,
        year2: stocks[index].year2,
        year5: stocks[index].year5,
        year10: stocks[index].year10,
        year20: stocks[index].year20 
      };

      //console.log (stocks[index]);
      const newStocks = [...stocks];
      newStocks.splice(index, 1, newStock);
      //const newStocks__ = [...newStocks, newStock];
      setStocks(newStocks); 

      //console.log (stocks[index]);
      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', stocksStr);

      // save overview per symbol
      stocksOverview [symbol] = childData;
      const stocksOverviewStr = JSON.stringify(stocksOverview);
      localStorage.setItem('stocksOverview', stocksOverviewStr);

      // save time of overview
      // stocksOverviewMili [symbol] = Date.now();
      // const stocksOverviewMiliStr = JSON.stringify(stocksOverviewMili);
      // localStorage.setItem('stocksOverviewMili', stocksOverviewMiliStr);      
     }

    // two handlers for adding new symbol
    const handleAddFormChange = (event) => {
      event.preventDefault();
      const fieldName = event.target.getAttribute("name");
      const fieldValue = event.target.value;

      const newFormData = { ...addFormData};
      newFormData[fieldName] = fieldValue;
      setAddFormData(newFormData);
    }

    const handleAddFormSubmit = (event) => {
      event.preventDefault();

      //index is used also to get time of history update
      index = stocks.findIndex((stock)=> stock.symbol === addFormData.symbol.toUpperCase());
      //console.log (addFormData.symbol)
      if (index !== -1) {
        alert ('Trying to add duplicate symbol: (' + addFormData.symbol + ')');
        return;
      }

      const newStock = {
        symbol: addFormData.symbol.toUpperCase(),
        update: "_" + getDate(),

        // wk: 1,
        // wk2: 2,
        // mon: 4,
        // mon3: 13,
        // mon6: 26,
        // year: 52,
        // year2: 104,
        // year5: 260,
        // year10: 520  
      };

      const newStocks = [...stocks, newStock];
      setStocks(newStocks); 

      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', stocksStr);
      console.log (newStocks);
    }

    const handleDeleteClick = (symbol) => {
      const newStocks = [...stocks];

      const index = stocks.findIndex((stock)=> stock.symbol === symbol)
      newStocks.splice(index, 1);
      setStocks(newStocks);
      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', stocksStr);
    }

    // click chart button
    const handleChartClick = (symbol) => {
      setChartSymbol (symbol);
      localStorage.setItem ('chartSymbol', symbol);

      // let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${API_KEY}`;

      // fetch(API_Call)
      // .then(
      //     function(response) {
      //         const respStr = JSON.stringify (response);
      //         if (respStr.indexOf (' status: 100, ok: true') !== -1)
      //             console.log(response);
      //         return response.json();
      //     }
      // )
      // .then(
      //     (data) => {
      //         const dataStr = JSON.stringify(data);
      //         if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
      //             alert (`${dataStr} (${this.props.StockSymbol}) ${API_Call} `);
      //             return;
      //         }
              
      //         if (dataStr.search('Error Message":"Invalid API call. Please retry or visit the documentation') !== -1) {
      //             alert (`Chart invalid symbol (${this.props.StockSymbol}) \n${dataStr}`);
      //         }

      //         setChartData (data); // pass raw data to Stock-chart.js
      //         //console.log (JSON.stringify (chartData));
      //       }
      // )
    }

    // get stock overview
    const handleInfoClick = (symbol) => {
      setInfoSymbol (symbol);
      //callBack ("tableCallBack");
      localStorage.setItem ('infoSymbol', symbol); 
      console.log(`symbol: ${symbol} chartSymbol: ${infoSymbol}`);      

    let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    
    index = stocks.findIndex((stock)=> stock.symbol === symbol)

    if (isEmpty(infoSymbol))
      console.log(`chartSymbol undef (${infoSymbol})`);
    // else if (Date.now() - stocks[index].now < 1000 * 10)  // is overview info older than an hour
    //   alert ("Overview info still fresh (less than ten sec old) (" + `${symbol})`);
    else {
      console.log(`Overview info (${symbol})`);
    console.log (`${API_Call}`);            
    fetch(API_Call)
        .then(
            function(response) {
                if (response != null) {
                  const respStr = JSON.stringify (response);
                  if (respStr.indexOf('redirected: false, status: 200, ok:') !== -1)
                    console.log(response);
                  return response.json();
                }
            }
        )
        .then(
            function (data) {
              if (data != null) {
                  const dataStr = JSON.stringify(data);
                  if (dataStr === '{}')
                    console.log (`info invalid symbol=${symbol} data="${dataStr}"`);
                  const index =  (dataStr.search('API call frequency is 5 calls per minute'))
                  if (index !== -1) {
                    alert (dataStr + `\n\n${API_Call}`);
                    //alert (dataStr);
                    return;
                  }

                  if (isEmpty (data['Symbol'])) {
                    console.log(`Symbol undef (${data['Symbol']})`);                  
                    return;
                  }

                  handleOverview (data);
                }
            }
        )
       }
      }
  
      const conditionalChart = () => {

        if ((chartSymbol === ""))  {
          console.log ('chartSymbol undef');
          return null;
        }
        // return  <StockChart StockSymbol ={chartSymbol} API_KEY = {c_API_KEY} callBack = {handleCallBackForHistory} /> 

        return <Stock_chart StockSymbol ={chartSymbol} API_KEY = {API_KEY} callBack = {handleCallBackForHistory} lastTime = {stocks[index].nowHist}   data1 = {chartData} /> 
      }

    return (
      <div className="App-container">
        <div className="tbl">
        {/* <h4> chartSymbol {chartSymbol}</h4> */}
        <table className="stickyHead">
          <thead>
            <tr>
              <th>symbol</th>
              <th>actions</th>
              {/* <th>update</th> */}
              <th>Exchange</th>          
              {/* <th>Sector</th>              
              <th>Price</th> */}
              <th>PE</th>
              <th>PEG</th>
              <th>BETA</th>
              <th>gap</th> 
              <th>wk</th>
              <th>2wk</th>
              <th>mon</th>
              <th>3mn</th>
              <th>6mn</th>
              <th>year</th>
              <th>2yr</th>
              <th>5yr</th>
              <th>10yr</th>            
              <th>20yr</th>              
            </tr>
          </thead>

          <tbody>
            {stocks.map((stock) => (
              <tr>            
                <td>{stock.symbol}</td>
                <td>
                  <button type="button" onClick={()=>handleInfoClick(stock.symbol)}>info</button>     
                  <button type="button" onClick={()=>handleChartClick(stock.symbol)}>chart</button>
                  <button type="button" onClick={()=>handleDeleteClick(stock.symbol)}>del</button>                  
                </td>
                {/* <td>{stock.update}</td> */}
                <td>{stock.Exchange}</td>
                {/* <td>{stock.Sector}</td>                
                <td>{stock.price}</td> */}
                <td>{stock.PE}</td>
                <td>{stock.PEG}</td>
                <td>{stock.BETA}</td>                
                <td></td>
                <td>{stock.wk}</td>
                <td>{stock.wk2}</td>
                <td>{stock.mon}</td>
                <td>{stock.mon3}</td>
                <td>{stock.mon6}</td>
                <td>{stock.year}</td>
                <td>{stock.year2}</td>
                <td>{stock.year5}</td>
                <td>{stock.year10}</td>
                <td>{stock.year20}</td> 
              </tr>
           ))}
         </tbody>
        </table>
        </div>
        <label>Add stock symbol</label>
        <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="required"
            placeholder="stock symbol to add ..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add</button>
        </form>

        {conditionalChart()}
        {AlphaVantage (alphaCallBack)}
      </div>
    ) 
}
export default StockTable;