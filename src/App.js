import React from 'react';
import './App.css';
import StockTable from './Stock-table';
import {BasicTable} from './table/BasicTable' 

function App() {

  const handleCallBack = (childData) => {
    //this.setState({msg: childData})
    console.log (childData);
    // console.log (childData["Symbol"], childData["Exchange"], childData["Sector"], childData["EPS"],
    // childData["PERatio"], childData["PEGRatio"], childData["Beta"], childData["MarketCapitalization"]);
  }

  return (
    <div className="App-continer">
      <div>       
        <StockTable />
      </div>
      <div>
        <BasicTable/>
      </div>
    </div>

);
}

export default App;
