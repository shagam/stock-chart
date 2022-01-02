import React, {useState} from 'react'
//import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import {nanoid} from 'nanoid';
import {format} from "date-fns"

const AddSymbolToTable = (props) => {
  
  const [addFormData, setAddFormData] = useState('');

  function getDate() {
    const date = new Date();
    var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
    return formattedDate;  
  }

  // two handlers for adding new symbol
  const handleAddFormChange = (event) => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value.toUpperCase();

    const newFormData = { ...addFormData};
    newFormData[fieldName] = fieldValue;
    setAddFormData(newFormData);
  }

  const handleAddFormSubmit = (event) => {
    event.preventDefault();
    var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');

    //console.log (addFormData.symbol)
    const re = new RegExp('^[a-zA-Z0-9]*$');  // Verify valid symbol in englis letters
    if (! re.test (addFormData.symbol)) {
      alert (`Invalid symbol: ${addFormData.symbol}`);
      return;
    }

    //var newStock = cloneDeep (rows[0]);
    //newStock.id = getUniqueId();
    newStock.id = nanoid();
    newStock.values.symbol = addFormData.symbol.toUpperCase();
    newStock.original.symbol = addFormData.symbol.toUpperCase();
    newStock.cells = null;
    newStock.allCells = [];

    const updateDate = Date.now();
    const updateMili = getDate();


  }

  return (
    <>
    <div>
        {/* <label>Add stock symbol </label> */}
        <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="required"
            placeholder="Add stock symbol ..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add</button>
        </form>
      </div>
    </>
  )
}

export default AddSymbolToTable;