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

    var dropPrice = props.stockChartYValues[startBeforeDropWeek];
    var dropWeek = 0;
    
    var highPriceAfterDeep = 0;
    var recoverWeek = 0;

    
    if (props.stockChartYValues.length === 0)
      return 'recover no props yValues';
    if (props.StockSymbol === '')
      return 'recover no props.symbol';


    // search for deepPrice
    for (let i = startBeforeDropWeek; i > 0; i--) {
      // search for lowestPrrice 
      if (dropPrice > props.stockChartYValues[i]) {
        dropPrice = props.stockChartYValues[i];
        dropWeek = i;
      }
    }
    console.log ('StockSymbol: ', props.StockSymbol);
    console.log ('dropPrice: ', dropPrice, ' dropWeek: ', dropWeek);

    // search for higest befor deep
    for (let i = dropWeek; i <= startBeforeDropWeek; i++) {    
      // searc for recover week
      if (highPriceBeforeDeep < props.stockChartYValues[i]) {  // at least weeks to recover
        highPriceBeforeDeep  = props.stockChartYValues[i];
        highPriceBeforeDeepWeek = i;
      }
    }
    console.log ('startBeforeDropWeek:', startBeforeDropWeek, ' startPrice: ', props.stockChartYValues[startBeforeDropWeek]);

    // check for highest price after drop
    for (let i = dropWeek; i > 0; i--) {      
      if (highPriceAfterDeep < props.stockChartYValues[i]) {
        highPriceAfterDeep = props.stockChartYValues[i];
        recoverWeek = i;
        if (props.stockChartYValues[i] > props.stockChartYValues[highPriceBeforeDeepWeek])
          break; // recovery found
      }
    }

    const drop = Math.round (dropPrice / highPriceBeforeDeep * 1000, 3) / 1000;
 
    console.log ('drop: ' + drop);
    console.log ('highPriceBeforeDeep: ', highPriceBeforeDeep, ' highPriceBeforeDeepWeek: ',  highPriceBeforeDeepWeek)
    console.log ('highPriceAfterDeep', highPriceAfterDeep, ' recoverWeek: ', recoverWeek);

    props.callBack (props.StockSymbol, drop, dropWeek, highPriceBeforeDeepWeek - recoverWeek);
  }

  searchDeepValue (); 
  // format("yyyy-MM-dd");
  return (
    <div>
      <label>Before crash  </label>
      <DatePicker dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
    </div>
  )
}

export default StockRecoveryCalc;