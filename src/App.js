import React from 'react';

import './App.css';
import './react-tables.css';
import StockTable from './Stock-table';
import StockChart from './StockChart';
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
  const ALPHA_WARNING = 'Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day';
  
  //const StockSymbol = window.$StockSymbol;
  const StockSymbol = localStorage.getItem('StockChart');
  const API_KEY='C542IZRPH683PFNZ';  
  //let url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${StockSymbol}&apikey=${API_KEY}`
  //const date = new Date();
  //let date1 = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  //             <td>{Moment(this.props.stat.dateFrom).format('yyy-MM-DD')}</td>

const handleCallBack = (childData) => {
  //this.setState({msg: childData})
  console.log (childData);
  // console.log (childData["Symbol"], childData["Exchange"], childData["Sector"], childData["EPS"],
  // childData["PERatio"], childData["PEGRatio"], childData["Beta"], childData["MarketCapitalization"]);
}

  return (
    <div className="App-continer">
      <div>       
        <StockTable API_KEY = {API_KEY} WARN = {ALPHA_WARNING}/>
      </div>
      <div>
         <StockChart StockSymbol={StockSymbol} API_KEY = {API_KEY} callBack = {handleCallBack} WARN = {ALPHA_WARNING} />
      </div>      
      <div>

      </div>

    </div>

);
}

export default App;
