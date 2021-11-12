import React from 'react';

import './App.css';
import './react-tables.css';
import StockTable from './Stock-table';
//import StockChart from './StockChart';
// import Stock_chart from './Stock-chart';
// import AlphaVantage from './AlphaVantage';
import {c_stockSymbol as c_StockSymbol, c_API_KEY, c_callBack} from './Constants'

//<Stock StockSymbol="IBM" API_KEY = 'C542IZRPH683PFNZ' />
 
/*
      <div>
        <StockList API_KEY = 'C542IZRPH683PFNZ' />
      </div>
      <div>
         <Overview StockSymbol={StockSymbol} API_KEY = 'C542IZRPH683PFNZ' />
      </div>
      <div>
        <Overview StockSymbol={StockSymbol}  API_KEY = {API_KEY}  callBack = {handleCallBack}/>  
        <Overview StockSymbol={StockSymbol}  API_KEY = {API_KEY}  callBack = {handleCallBack}/> 
             <StockTable_ API_KEY = {API_KEY} WARN = {ALPHA_WARNING}/>
        </div>
*/

function App() {

  //const StockSymbol = window.$StockSymbol;
  const StockSymbol = localStorage.getItem('chartSymbol');
  var c_API_KEY = localStorage.getItem('alphaVantage');
  console.log (`read API_KEY: ${c_API_KEY}`)
  if (c_API_KEY === "")
    c_API_KEY='C542IZRPH683PFNZ';  

const handleCallBack = (childData) => {
  //this.setState({msg: childData})
  console.log (childData);
  // console.log (childData["Symbol"], childData["Exchange"], childData["Sector"], childData["EPS"],
  // childData["PERatio"], childData["PEGRatio"], childData["Beta"], childData["MarketCapitalization"]);
}

// const alphaCallBack = (key) => {
//   c_API_KEY = key;
//   //alert ('App. API_KEY: ' + c_API_KEY)
//   console.log (`callBack API_KEY: ${c_API_KEY}`);
// }

  return (
    <div className="App-continer">
      <div>       
        <StockTable />
      </div>
      <div>
         {/* <StockChart StockSymbol={StockSymbol} API_KEY = {API_KEY} callBack = {handleCallBack}  /> */}
      </div>      
      <div>
        {/* <AlphaVantage alphaCallBack = {alphaCallBack} /> */}
        {/* {AlphaVantage (alphaCallBack)} */}
      </div>

    </div>

);
}

export default App;
