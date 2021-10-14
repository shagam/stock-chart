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


    const [contacts, setContacts] = useState(data1);

    //console.log(`${data1}`);
    const [addFormData, setAddFormData] = useState({
      symbol: '',
      lastPrice: 0,
      PE: 0,
      GPE: 0,
      update: ''

    })


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

      const newContact = {
        symbol: addFormData.symbol
        //lastPrice: 0,
        //PE: 0,
        //GPE: 0,
        //update: ""

      };

      const newContacts = [...contacts, newContact];
      setContacts(newContacts); 

      const contactStr = JSON.stringify(newContacts);
      localStorage.setItem('stockChart', `${contactStr}`);
      console.log (newContacts);
    }

    const handleDeleteClick = (symbol) => {
      const newContacts = [...contacts];

      const index = contacts.findIndex((contact)=> contact.symbol === symbol)
      newContacts.splice(index, 1);
      setContacts(newContacts);
    }

    const handleChartClick = (symbol) => {
      //const newContacts = [...contacts];

      //const index = contacts.findIndex((contact)=> contact.symbol === symbol);
      //const symbol = contacts[index].symbol;

      // graph
      console.log({symbol});
      window.$StockSymbol = `${symbol}`;
      localStorage.setItem ('StockChart', `${symbol}`);
      //document.cookie = `StockSymbol=${symbol}`
      //this.props.StockSymbol = {symbol};
      //<StockChart StockSymbol={symbol} API_KEY = 'C542IZRPH683PFNZ' />
      
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
            {contacts.map((contact) => (
              <tr>               
                <td>{contact.symbol}</td>
                <td>
                  <button type="button" onClick={()=>handleDeleteClick(contact.symbol)}>delete</button>
                  <button type="button" onClick={()=>handleChartClick(contact.symbol)}>chart</button>
                </td>
                <td>{contact.price}</td>

                <td>{contact.PE}</td>
                <td>{contact.GPE}</td>
                <td>{contact.update}</td>
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