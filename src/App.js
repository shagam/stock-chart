import React, {useState} from 'react';
import './App.css';
// import StockTable from './Stock-table';
import {BasicTable} from './table/BasicTable' 

function App() {
  const [count, setCount] = useState (0);
  const handleCallBack = (childData) => {
    setCount (count + childData);
    //this.setState({msg: childData})
    //console.log (childData);
    // console.log (childData["Symbol"], childData["Exchange"], childData["Sector"], childData["EPS"],
    // childData["PERatio"], childData["PEGRatio"], childData["Beta"], childData["MarketCapitalization"]);
  }

  return (
    <div className="App-continer">
      <div>       
        {/* <StockTable /> */}
      </div>
      <div>
        <BasicTable callBack = {handleCallBack} />
        <label count = {count} />
      </div>
    </div>

);
}

export default App;
