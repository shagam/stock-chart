
import React from 'react';

import StockChart from './StockChart';
//import StockList from './StockList';
//import Overview from './Overview'
//import GetURLInfo from "./GetURLInfo";
import './App.css';
import './react-tables.css';



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
  const StockSymbol = "IBM";
  const API_KEY='C542IZRPH683PFNZ';  
  let url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${StockSymbol}&apikey=${API_KEY}`
  const date = new Date();
  let date1 = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
//             <td>{Moment(this.props.stat.dateFrom).format('yyy-MM-DD')}</td>

  return (
    <div className="App">
      <table>
        <thead>
          <tr>
            <th>Symnol</th>
            <th>Name</th>
            <th>Lasr price</th>
            <th>PE</th>
            <th>GPE</th>
            <th>update</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>IBM</td>
            <td>International Business Machines</td>
            <td>100</td>
            <td>30</td>
            <td>50</td>
            <td>{date1}</td>
          </tr>
        </tbody>
      </table>  

      <div>
         <StockChart StockSymbol="IBM" API_KEY = 'C542IZRPH683PFNZ' />
      </div>      


    </div>

);
}

export default App;
