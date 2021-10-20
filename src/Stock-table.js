import React, {useState} from 'react';
//import { nanoid } from 'nanoid';
import './App.css';
import './react-tables.css';
import data from "./mock-data.json";
import Overview from "./Overview.js";

import StockChart from "./StockChart";
//<StockChart StockSymbol={StockSymbol} API_KEY = {API_KEY} />
//<Overview StockSymbol={StockSymbol}  API_KEY = {API_KEY}  callBack = {handleCallBack}/> 

const StockTable = (API_KEY) => {  
    //const date = new Date();
    //let date1 = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    var chartSymbol = '';
  
    var data1 = JSON.parse(localStorage.getItem('stockTable'));

    if (data1 === null || JSON.stringify(data1).length === 0)
      data1 = JSON.parse('[{"symbol": "qqq"}]');


    const [stocks, setStocks] = useState(data1);

    //console.log(`${data1}`);
    const [addFormData, setAddFormData] = useState({
      symbol: '', update: '', Exchange: '', Sector: '', lastPrice: 0, PE: 0, PEG: 0, BETA: 0,      
      wk: -1, wk2: 20, mon: 0, mon3: 0, mon6: 0, year: 0, year2: 0, year5: 0, year10: 0            
    })

    function getDate() {
      const date = new Date();
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;      
    }

    const handleCallBack = (childData) => {
      //console.log (childData);
      const symbol = childData["Symbol"];

      const index = stocks.findIndex((stock)=> stock.symbol === symbol);      
      const newStock = {
        symbol: childData["Symbol"],
        update: getDate(),
        Exchange: childData["Exchange"],
        Sector: childData["Sector"],
        lastPrice: "0",
        PE: childData["PERatio"],
        PEG: childData["PEGRatio"],
        BETA: childData["Beta"],
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

      console.log (stocks[0]);
      const newStocks = [...stocks];
      newStocks.splice(index, 1);
      const newStocks__ = [...newStocks, newStock];
      setStocks(newStocks__); 
      const stocksStr = JSON.stringify(newStocks__);
      localStorage.setItem('stockTable', `${stocksStr}`);
      
      // console.log (childData["Symbol"], childData["Exchange"], childData["Sector"], 
      //   childData["PERatio"], childData["PEGRatio"], childData["Beta"]);
        //stocks[index].PE, stocks[index].PEG );
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

      const newStock = {
        symbol: addFormData.symbol,
        update: "_" + getDate()  
      };

      const newStocks = [...stocks, newStock];
      setStocks(newStocks); 

      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', `${stocksStr}`);
      console.log (newStocks);
    }

    const handleDeleteClick = (symbol) => {
      const newStocks = [...stocks];

      const index = stocks.findIndex((stock)=> stock.symbol === symbol)
      newStocks.splice(index, 1);
      setStocks(newStocks);
      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', `${stocksStr}`);
    }

    const handleChartClick = (symbol) => {
      chartSymbol = `${symbol}`;
      console.log('chartSymbol ' + `${chartSymbol}`);      
      localStorage.setItem ('StockChart', `${symbol}`); // temp for App.js
      //document.cookie = `StockSymbol=${symbol}`
      //<StockChart StockSymbol={symbol} API_KEY = 'C542IZRPH683PFNZ' />
      //Overview('StockSymbol'=`${symbol}`, 'callBack' = {handleCallBack})


    let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${chartSymbol}&apikey=${API_KEY}`
    
    fetch(API_Call)
        .then(
            function(response) {
                if (response != null) {
                  console.log(response);
                  return response.json();
                }
            }
        )
        .then(
            function (data) {
                if (data != null)
                  console.log(data);
                if (`${chartSymbol}` != null && data['Symbol'] != null) {
                  const dataStr = JSON.stringify(data);
                  localStorage.setItem(`${chartSymbol}` + '_overview', `${dataStr}`);
                  handleCallBack (data);
                }
                else
                    console.log ('fetch no data');
            }
        )
      }

    return (
      <div className="App-continer">
        <table>
          <thead>
            <tr>
              <th>symbol</th>
              <th>actions</th>
              <th>update</th>
              <th>Exchange</th>          
              <th>Sector</th>              
              <th>Price</th>
              <th>PE</th>
              <th>PEG</th>
              <th>BETA</th>              
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
                <td>{stock.Sector}</td>                
                <td>{stock.price}</td>
                <td>{stock.PE}</td>
                <td>{stock.PEG}</td>
                <td>{stock.BETA}</td>                
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
        <h3>Add stock symbol</h3>
        <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="requird"
            placeholder="enter stock symbol..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add</button>
        </form>
        <div>

         
        </div>
      </div>
    ) 
}
export default StockTable;