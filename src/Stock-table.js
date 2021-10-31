import React, {useState, useEffect} from 'react';
//import { nanoid } from 'nanoid';
import './App.css';
import './react-tables.css';
import data from "./mock-data.json";
//import Overview from "./Overview.js";
import {useTable, useSortBy} from 'react-table'
//import {COLUMNS} from './columns'
import StockChart from "./StockChart";
import { findAllInRenderedTree } from 'react-dom/test-utils';
//<StockChart  ={StockSymbol} API_KEY = {API_KEY} />
//<Overview StockSymbol={StockSymbol}  API_KEY = {API_KEY}  callBack = {handleCallBack}/> 

const StockTable = (API_KEY, WARN) => { 
    var data1 = JSON.parse(localStorage.getItem('stockTable'));

    if (data1 === null || JSON.stringify(data1).length === 0)
      data1 = JSON.parse('[{"symbol": "goog"}]');
    const [stocks, setStocks] = useState(data1);
    const [chartSymbol, setChartSymbol] = useState("");
    
    const [stocksHistory, setStocksHistory] = useState({});
    const [stocksHistoryMili, setStocksHistoryMili] = useState({});

    const [stocksOverview, setStocksOverview] = useState({});
    const [stocksOverviewMili, setStocksOverviewMili] = useState({});

    const [addFormData, setAddFormData] = useState({
      symbol: '', update: '', now: -1, Exchange: '', /*Sector: '', lastPrice: 0,*/ PE: 0, PEG: 0,
       BETA: 0, gap: "", wk: -1, wk2: 20, mon: 0, mon3: 0, mon6: 0, year: 0, year2: 0, year5: 0, year10: 0            
    })

    const isEmpty = (str) => {
      if (str == null)
          return true;
      if (str === "")
          return true;
      return false;
    }

    function getDate() {
      const date = new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;      
    }
 
    // enter history values into table
    const handleCallBackForHistory = (childData, sym) => {
      console.log (`historyValues:  ${childData} chartSymbol  ${sym}`);
      const index = stocks.findIndex((stock)=> stock.symbol === sym);
      if (index === -1) {
        console.log (`invald chartSymbol (${sym})` );
        return chartSymbol;
      }
      const newStock = {
        symbol: sym, //stocks[index].symbol,
        update: getDate(),
        now: Date.now(),
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
        year10: childData[8] //stocks[index].year10  
      };

      const newStocks = [...stocks];
      newStocks.splice(index, 1, newStock);
      setStocks(newStocks); 
      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', `${stocksStr}`);
      if (! isEmpty (chartSymbol))
        stocksHistory [chartSymbol] = childData;
      const stocksHistoryStr = JSON.stringify(stocksHistory);
      localStorage.setItem('stocksHistory', `${stocksHistoryStr}`);
    }

    const handleOverview = (childData)  => {
      const symbol = childData["Symbol"];

      const index = stocks.findIndex((stock)=> stock.symbol === symbol);
      console.log (`Symbol (${symbol}) index (${index})`);      
      const newStock = {
        symbol: childData["Symbol"],
        update: getDate(),
        now: Date.now(),
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
        year10: stocks[index].year10  
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
      stocksOverviewMili [symbol] = Date.now();
      const stocksOverviewMiliStr = JSON.stringify(stocksOverviewMili);
      localStorage.setItem('stocksOverviewMili', stocksOverviewMiliStr);      
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

      const index = stocks.findIndex((stock)=> stock.symbol.toUpperCase() === addFormData.symbol.toUpperCase());
      if (index !== -1) {
        alert ('Trying to add duplicate symbol: (' + addFormData.symbol + ')');
        return;
      }

      const newStock = {
        symbol: addFormData.symbol.toUpperCase(),
        update: "_" + getDate(),
        now: Date.now(),
        //lastPrice: -1,
        wk: 1,
        wk2: 2,
        mon: 4,
        mon3: 13,
        mon6: 26,
        year: 52,
        year2: 104,
        year5: 260,
        year10: 520  
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
      //chartSymbol = symbol;
      setChartSymbol (symbol);

      //callBack ("tableCallBack");
      localStorage.setItem ('chartSymbol', symbol); // temp for App.js
      console.log(`symbol: ${symbol} chartSymbol: ${chartSymbol}`);      

      //document.cookie = `StockSymbol=${symbol}`
      //<StockChart StockSymbol={symbol} API_KEY = 'C542IZRPH683PFNZ' />
      //Overview('StockSymbol'=`${symbol}`, 'callBack' = {handleCallBack})


    let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    
    if (isEmpty(chartSymbol))
      console.log(`chartSymbol undef (${chartSymbol})`);
    else {
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
              if (isEmpty (chartSymbol))
                console.log(`chartSymbol undef (${chartSymbol})`);
              if (data != null) {
                  const dataStr = JSON.stringify(data);
                  //console.log(dataStr.substring(0, 200));
                  const index =  (dataStr.search('API call frequency'))
                  if (index !== -1) {
                    alert (dataStr);
                    console.log (`Alphvantage too frequent calls ${index}`);
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
        if ((chartSymbol != ""))
          return         <StockChart StockSymbol ={chartSymbol} API_KEY = {API_KEY} callBack = {handleCallBackForHistory} WARN = 'Alpha' /> 
          else
            return null;
      }

    return (
      <div className="App-continer">
        <div>
        {/* <h4> chartSymbol {chartSymbol}</h4> */}
        </div>
        <table>
          <thead>
            <tr>
              <th>symbol</th>
              <th>actions</th>
              <th>update</th>
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
              <th>3mon</th>
              <th>6mon</th>
              <th>year</th>
              <th>2year</th>
              <th>5year</th>
              <th>10year</th>            
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr>            
                <td>{stock.symbol}</td>
                <td>
                  <button type="button" onClick={()=>handleDeleteClick(stock.symbol)}>delete</button>
                  <button type="button" onClick={()=>handleChartClick(stock.symbol)}>chart</button>
                </td>
                <td>{stock.update}</td>
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
              </tr>
           ))}
         </tbody>
        </table>
        {/* <h3>Add stock symbol</h3> */}
        <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="requird"
            placeholder="enter stock symbol to add ..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add</button>
        </form>
          {conditionalChart()}

          {/* <StockChart StockSymbol ={chartSymbol} API_KEY = {API_KEY} callBack = {handleCallBackForHistory} WARN = 'Alpha' />  */}

      </div>
    ) 
}
export default StockTable;