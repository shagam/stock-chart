import React, {useState} from 'react';
//import { nanoid } from 'nanoid';
import './App.css';
import './react-tables.css';
import data from "./mock-data.json";
import Overview from "./Overview.js";

//import StockChart from './StockChart';



const StockTable = (StockSymbol) => {  
    //const date = new Date();
    //let date1 = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    
    var data1 = JSON.parse(localStorage.getItem('stockTable'));

    if (data1 === null || JSON.stringify(data1).length === 0)
      data1 = JSON.parse('[{"symbol": "qqq"}]');


    const [stocks, setStockss] = useState(data1);

    //console.log(`${data1}`);
    const [addFormData, setAddFormData] = useState({
      symbol: '',
      lastPrice: 0,
      PE: 0,
      GPE: 0,
      update: ''

    })

    const handleCallBack = (childData) => {
      //console.log (childData);
      console.log (childData["Symbol"], childData["Exchange"], childData["Sector"], childData["EPS"],
      childData["PERatio"], childData["PEGRatio"], childData["Beta"], childData["MarketCapitalization"]);
    }
    
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
        symbol: addFormData.symbol
        //lastPrice: 0,
        //PE: 0,
        //GPE: 0,
        //update: ""

      };

      const newStocks = [...stocks, newStock];
      setStockss(newStocks); 

      const stocksStr = JSON.stringify(newStocks);
      localStorage.setItem('stockTable', `${stocksStr}`);
      console.log (newStocks);
    }

    const handleDeleteClick = (symbol) => {
      const newStocks = [...stocks];

      const index = stocks.findIndex((stock)=> stock.symbol === symbol)
      newStocks.splice(index, 1);
      setStockss(newStocks);
    }

    const handleChartClick = (symbol) => {

      // graph
      console.log({symbol});
      window.$StockSymbol = `${symbol}`;
      localStorage.setItem ('StockChart', `${symbol}`);
      //document.cookie = `StockSymbol=${symbol}`
      //this.props.StockSymbol = {symbol};
      //<StockChart StockSymbol={symbol} API_KEY = 'C542IZRPH683PFNZ' />
      //Overview('StockSymbol'=`${symbol}`, 'callBack' = {handleCallBack})
    }


    return (
      <div className="App-continer">
        <table>
          <thead>
            <tr>
              <th>symbol</th>
              <th>actions</th>              
              <th>price</th>
              <th>PE</th>
              <th>GPE</th>
              <th>update</th>
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
                <td>{stock.price}</td>

                <td>{stock.PE}</td>
                <td>{stock.GPE}</td>
                <td>{stock.update}</td>
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
      </div>
    ) 
}
export default StockTable;