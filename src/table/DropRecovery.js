import React, {useState, } from 'react'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {} from "date-fns";

import './DropRecovery.css'


const StockRecoveryCalc = (props) => {

  // props.StockSymbol
  // props.callBack 
  // props.stockChartYValues
  // props.stockChartXValues


  const [startDate, setStartDate] = useState(new Date(2020, 1, 5)); // feb 5 2020
  const [endDate, setEndDate] = useState(new Date(2020, 4, 15)); // may 15 2020
  const [displayFlag, setDisplayFlag] = useState (false); 
 //  2007, 11, 1  2008 deep

  
  const searchDeepValue = () => {

    const LOG_FLAG = false;

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
    var dropDate = 0;
    var highPriceAfterDeep = 0;
    var recoverWeek = 0;

    // search for deepPrice
    for (var i = startBeforeDropWeek; i > 0; i--) {
      // search for lowestPrrice 
      const price = Number(props.stockChartYValues[i]);
      if (dropPrice > price) {
        dropPrice = price;
        dropWeek = i;
        dropDate = props.stockChartXValues[i];
      }
    }

    if (LOG_FLAG) {
      console.log ('StockSymbol: ', props.StockSymbol, ' startDate_X_Array',  props.stockChartXValues[startBeforeDropWeek], dropDate);

      console.log ('startBeforeDropWeek:', startBeforeDropWeek, ' startPrice: ', props.stockChartYValues[startBeforeDropWeek]);
      console.log ('dropPrice: ', dropPrice, ' dropWeek: ', dropWeek);
    }

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
    if (LOG_FLAG) {
      console.log ('drop: ' + drop);
      console.log ('highPriceBeforeDeep: ', highPriceBeforeDeep, ' highPriceBeforeDeepWeek: ',  highPriceBeforeDeepWeek)
      console.log ('highPriceAfterDeep', highPriceAfterDeep, ' recoverWeek: ', recoverWeek);
    }

    // fill columns in stock table
    props.callBack (props.StockSymbol, drop, dropWeek, highPriceBeforeDeepWeek - recoverWeek, dropDate); //format(startDate, "yyyy-MMM-dd"));
  }

  function swap_period() {
    if (startDate.getFullYear() === 2020) {
      setStartDate (new Date(2007, 9, 15));
      setEndDate (new Date(2009, 1, 1));
    }
    else if (startDate.getFullYear() === 2007) {
      setStartDate (new Date(2020, 1, 5));
      setEndDate (new Date(2020, 4, 15));
    }
  }

  //  skip analysis if no symbol
  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.StockSymbol);
  if (row_index !== -1 && props.StockSymbol !== '' && props.StockSymbol !== undefined  
  && props.stockChartYValues.length !== 0)
    searchDeepValue (); 




    const styleObj = {
      border: '2px',
      //fontSize: 14,
      // color: "#4a54f1",
      // display: "grid",
      position: 'relative',
      // gridTemplateColumns: "1fr 1fr" 
      //textAlign: "center",
      //paddingTop: "100px",
  }

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

  return (
    <div id='dropRecovery_id' >
      <div>
            <input
              type="checkbox" checked={displayFlag}
              onChange={displayFlagChange}
            /> Drop-Recovery-analysis
      </div>
      {displayFlag && 
        <div>     
          <div color='yellow' >Stock drop and recovery. Choose date range and then click gain on few stocks </div>
          <DatePicker dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
          <DatePicker dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} /> 
          <button type="button" onClick={()=>swap_period()}>swap_period_2020_or_2007    </button>
        </div>
      }
    </div>
  )
}

export default StockRecoveryCalc;