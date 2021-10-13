import React, {useState} from 'react';
import { nanoid } from 'nanoid';
import './App.css';
import './react-tables.css';
import data from "./mock-data.json";
//import StockChart from './StockChart';



const StockTable = (StockSymbol) => {  
    //const date = new Date();
    //let date1 = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    
    const data1 = JSON.parse(localStorage.getItem('stockTable'));

    const [contacts, setContacts] = useState(data);

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
        id: nanoid(),
        symbol: addFormData.symbol
        //lastPrice: 0,
        //PE: 0,
        //GPE: 0,
        //update: ""

      };

      const newContacts = [...contacts, newContact];
      setContacts(newContacts); 

      localStorage.setItem('testKey', 'testVal');
      const contactStr = JSON.stringify(newContacts);
      localStorage.setItem('stockTable', `${contactStr}`);
      console.log (newContacts);
    }

    const handleDeleteClick = (contactId) => {
      const newContacts = [...contacts];

      const index = contacts.findIndex((contact)=> contact.id === contactId)
      newContacts.splice(index, 1);
      setContacts(newContacts);
    }

    const handleChartClick = (contactId) => {
      //const newContacts = [...contacts];

      const index = contacts.findIndex((contact)=> contact.id === contactId);
      const symbol = contacts[index].symbol;

      // graph
      console.log({symbol});
      window.$StockSymbol = `${symbol}`;
      localStorage.setItem ('StockSymbol', `${symbol}`);
      document.cookie = `StockSymbol=${symbol}`
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
                  <button type="button" onClick={()=>handleDeleteClick(contact.id)}>delete</button>
                  <button type="button" onClick={()=>handleChartClick(contact.id)}>chart</button>
                </td>
                <td>{contact.lastPrice}</td>

                <td>{contact.PE}</td>
                <td>{contact.GPE}</td>
                <td>{contact.update}</td>
              </tr>
           ))}
         </tbody>
        </table>
        <h2>Add stock symbol</h2>
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