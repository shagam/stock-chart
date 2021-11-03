import React from 'react';

import './App.css';
import './react-tables.css';
import StockTable from './Stock-table';
import StockChart from './StockChart';
// import Stock_chart from './Stock-chart';
import AlphaVantage from './AlphaVantage';

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
  var API_KEY = localStorage.getItem('alphaVantage');
  console.log (`read API_KEY: ${API_KEY}`)
  if (API_KEY === "")
    API_KEY='C542IZRPH683PFNZ';  

const handleCallBack = (childData) => {
  //this.setState({msg: childData})
  console.log (childData);
  // console.log (childData["Symbol"], childData["Exchange"], childData["Sector"], childData["EPS"],
  // childData["PERatio"], childData["PEGRatio"], childData["Beta"], childData["MarketCapitalization"]);
}

const alphaCallBack = (key) => {
  API_KEY = key;
  console.log (`callBack API_KEY: ${API_KEY}`);
}

  return (
    <div className="App-continer">
      <div>       
        <StockTable API_KEY = {API_KEY} />
      </div>
      <div>
         {/* <StockChart StockSymbol={StockSymbol} API_KEY = {API_KEY} callBack = {handleCallBack}  /> */}
      </div>      
      <div>
        <AlphaVantage alphaCallBack = {alphaCallBack} />
      </div>

    </div>

);
}

export default App;
