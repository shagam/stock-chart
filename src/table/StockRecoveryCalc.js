import React, {useState, } from 'react'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";


const StockRecoveryCalc = (props) => {

  // props.StockSymbol
  // props.callBack 
  // props.stockChartYValues
  // props.stockChartXValues


  const [startDate, setStartDate] = useState(new Date(2020, 1, 5)); // feb 5 2020

 //  2007, 11, 1  2008 deep

  
  const searchDeepValue = () => {

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMon = today.getMonth();
    const todayDay = today.getDay();

    const startYear = startDate.getFullYear();
    const startMon = startDate.getMonth();
    const startDay = startDate.getDay();

    var startBeforeDropWeek = (todayYear - startYear) * 52 + (todayMon - startMon) * 4.34 + (todayDay - startDay) / 4.34;
    startBeforeDropWeek = Math.round(startBeforeDropWeek);

    //console.log (startDate.getFullYear(), startDate.getMonth(), startDate.getDay())    
    //console.log (props.StockSymbol, props.stockChartXValues[beforeDropWeek]);

    if (startBeforeDropWeek < 10 && startBeforeDropWeek > 52*20) {
      alert ('Not allowed before 20 years, and not less than 10 weeks');
      return -1;
    }
    var highPriceBeforeDeep = 0;
    var highPriceBeforeDeepWeek = 0;

    var dropPrice = Number(props.stockChartYValues[startBeforeDropWeek]);
    var dropWeek = 0;
    
    var highPriceAfterDeep = 0;
    var recoverWeek = 0;

    // search for deepPrice
    for (var i = startBeforeDropWeek; i > 0; i--) {
      // search for lowestPrrice 
      const price = Number(props.stockChartYValues[i]);
      if (dropPrice > price) {
        dropPrice = price;
        dropWeek = i;
      }
    }
    console.log ('StockSymbol: ', props.StockSymbol, ' startDate_X_Array',  props.stockChartXValues[startBeforeDropWeek]);

    console.log ('startBeforeDropWeek:', startBeforeDropWeek, ' startPrice: ', props.stockChartYValues[startBeforeDropWeek]);
    console.log ('dropPrice: ', dropPrice, ' dropWeek: ', dropWeek);

    // search for higest befor deep
    for (let i = dropWeek; i <= startBeforeDropWeek; i++) { 
      const price = Number(props.stockChartYValues[i]);
      if (highPriceBeforeDeep < price) {  // at least weeks to recover
        highPriceBeforeDeep  = price;
        highPriceBeforeDeepWeek = i;
      }
    }


    // check for highest price after drop
    for (let i = dropWeek; i > 0; i--) {      
      const price = Number(props.stockChartYValues[i]);
      if (highPriceAfterDeep < price) {
        highPriceAfterDeep = price;
        recoverWeek = i;
        if (price > Number (props.stockChartYValues[highPriceBeforeDeepWeek]))
          break; // recovery found
      }
    }

    const drop = Math.round (dropPrice / highPriceBeforeDeep * 1000, 3) / 1000;
 
    console.log ('drop: ' + drop);
    console.log ('highPriceBeforeDeep: ', highPriceBeforeDeep, ' highPriceBeforeDeepWeek: ',  highPriceBeforeDeepWeek)
    console.log ('highPriceAfterDeep', highPriceAfterDeep, ' recoverWeek: ', recoverWeek);

    props.callBack (props.StockSymbol, drop, dropWeek, highPriceBeforeDeepWeek - recoverWeek);
  }

  //  skip search if no symbol
  if (props.StockSymbol !== '' && props.StockSymbol !== undefined  
  && props.stockChartYValues.length !== 0)
    searchDeepValue (); 


  return (
    <div>
       Date before crash
      <DatePicker dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
    </div>
  )
}

export default StockRecoveryCalc;