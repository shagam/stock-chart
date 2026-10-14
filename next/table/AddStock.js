import {nanoid} from 'nanoid';

export function addStock (rows, symbol, warnDuplicate) {

  const re = new RegExp('^[a-zA-Z0-9^._=-]*$');  // Verify valid symbol in englis letters
  if (! re.test (symbol)) {
    alert (`Invalid letters: ${symbol}`);
    return;
  }

  // check for duplicate symbol

    const index = rows.findIndex((row)=> row.values.symbol.toUpperCase() === symbol.toUpperCase());
    if (index !== -1) {
        if (warnDuplicate)
            alert ('Trying to add duplicate symbol: (' + symbol + ')');
        return;
    }

  var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
//   prepareRow(newStock);

  newStock.id = nanoid();
  newStock.values.symbol = symbol.toUpperCase();
  newStock.original.symbol = symbol.toUpperCase();
  newStock.values.sym = symbol.toUpperCase();
  newStock.original.sym = symbol.toUpperCase();
  newStock.cells = null;
  newStock.allCells = [];
  
  rows.push (newStock);
  //firebaseGetAndFill();      
//   saveTable(newStock.values.symbol);

}