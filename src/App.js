
import React from 'react';

import StockChart from './StockChart';
//import StockList from './StockList';
//import Overview from './Overview'
//import GetURLInfo from "./GetURLInfo";
import './App.css';
import './react-tables.css';
import StockTable from './Stock-table';

//<Stock StockSymbol="IBM" API_KEY = 'C542IZRPH683PFNZ' />

/*
      <div>
        <StockList API_KEY = 'C542IZRPH683PFNZ' />
      </div>
      <div>
         <Overview StockSymbol="IBM" API_KEY = 'C542IZRPH683PFNZ' />
      </div>


*/

function App() {
  //const StockSymbol = window.$StockSymbol;
  const StockSymbol = localStorage.getItem('StockSymbol');
  const API_KEY='C542IZRPH683PFNZ';  
  //let url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${StockSymbol}&apikey=${API_KEY}`
  //const date = new Date();
  //let date1 = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
//             <td>{Moment(this.props.stat.dateFrom).format('yyy-MM-DD')}</td>
  
  return (
    <div className="App-continer">
      <div>
        <StockTable StockSymbol={StockSymbol} API_KEY = 'C542IZRPH683PFNZ'/>
      </div>
      <div>
         <StockChart StockSymbol={StockSymbol} API_KEY = {API_KEY} />
      </div>      


    </div>

);
}

export default App;
