import React, {useState} from 'react';
import './App.css';
import './react-tables.css';
import data from "./mock-data.json";


const StockTable = () => {  
    const date = new Date();
    let date1 = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const [contacts, setContacts] = useState(data);

    return (
      <div className="App-continer">
        <table>
          <thead>
            <tr>
              <th>symbol</th>
              <th>lastPrice</th>
              <th>PE</th>
              <th>GPE</th>
              <th>update</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr>
                <td>{contact.symbol}</td>
                <td>{contact.lastPrice}</td>
                <td>{contact.PE}</td>
                <td>{contact.GPE}</td>
                <td>{contact.update}</td>
              </tr>
           ))}
         </tbody>
        </table> 
      </div>
    ) 
  
}

export default StockTable;