import React, {useState} from 'react';
import './App.css';
// import StockTable from './Stock-table';
import {BasicTable} from './table/BasicTable' 

function App() {
  const [count, setCount] = useState (0);
  
  const handleCallBack = (childData) => {
    setCount (count + childData);
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
