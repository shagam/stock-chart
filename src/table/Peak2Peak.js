import React, {useState, } from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from './Date'
import { columnIsLastLeftSticky } from 'react-table-sticky';
import LogFlags from '../LogFlags'



const Peak2PeakGui = (props) => {


  // props.symbol
  // props.rows
  // props.startDate
  // props.setStartDate
  // props.endDate
  // props.setEndDate
  // stockChartXValues
  // stockChartYValues

    const [startDate, setStartDate] =  useState(new Date(2007, 10, 1)); // 2007 dec 1  base 0
    const [endDate, setEndDate] =   useState(new Date(2021, 11, 1)); // 2021 dec 1

    const [displayFlag, setDisplayFlag] = useState (false); 
    const [calcResults, setCalcResults] = useState ();
    const [calcInfo, setCalcInfo] = useState ();
    const [searchPeak, setSearchPeak] = useState (true);

    const LOG_FLAG = props.logFlags.includes('peak2Peak');

    const quasiTop = (initDate) => {
      var dateIndex = searchDateInArray (props.stockChartXValues, initDate, props.symbol, props.logFlags)
      if(LOG_FLAG)
      console.log ('\nindex=', dateIndex, 'price=', props.stockChartYValues[dateIndex], props.stockChartXValues[dateIndex], 'start_index')
      const range = 35;

      var startIndex = dateIndex - range > 0 ? dateIndex -= range : 0
      var priceIndex = startIndex;
      var endIndex = dateIndex + range < props.stockChartYValues.length ? dateIndex + range : dateIndex;
      var highPrice = props.stockChartYValues[startIndex];

      if (! searchPeak)
        return dateIndex; // do not search

      for (let i = startIndex; i < endIndex; i++) { 
        if (LOG_FLAG && i === startIndex)
          console.log ('index=', i, 'first', props.stockChartXValues[startIndex])// end of loop
        const price = Number(props.stockChartYValues[i]);
        if (highPrice < price) {  // at least weeks to recover
          highPrice  = price;
          priceIndex = i;
          if (LOG_FLAG)
            console.log ('index=', i, 'price=', price, props.stockChartXValues[i])
        }
        if (LOG_FLAG && i === endIndex - 1)
          console.log ('index=', i, 'last', props.stockChartXValues[endIndex])// end of loop
      }
      return priceIndex;

    }



    function peak2PeakCalc () {
        setCalcResults(); 
        setCalcInfo()
        // console.log ('calc')
        if (props.symbol === ''  || props.stockChartXValues.length === 0) {
          // alert ('Need to click <gain> for a symbol before calc peak2peak -')
          setCalcResults('symbol Undefined. click <gain> for some symbol')
          setCalcInfo('.')
          return;
        }
        if (! props.weekly) {
          setCalcResults('calc only for weekly mode ')
          setCalcInfo('.')
          alert('calc only for weekly mode ')
          return;
        }

        const startYear = startDate.getFullYear();
        const startMon = startDate.getMonth() + 1;
        const startDay = startDate.getDay() + 1;
    
        const endYear = endDate.getFullYear();
        const endMon = endDate.getMonth() + 1;
        const endDay = endDate.getDay() + 1;

        // calc start day
        var startDateArray = [startYear, startMon, startDay]
        const lastDate = props.stockChartXValues[props.stockChartXValues.length - 1]
        const lastDateSplit = lastDate.split('-')
        const compDate = compareDate (startDateArray, lastDateSplit)
        if (compDate === -1) {
          if (searchPeak)
            startDateArray = lastDateSplit;
          else {
            setCalcResults('search peak disabled; date beyond range')
            setCalcInfo ('.')
            return;            
          }

        }
        const endDateArray =[endYear, endMon, endDay]
        const indexFirst = quasiTop (startDateArray)
        const indexEnd = quasiTop (endDateArray)

        const weeksDiff = indexFirst - indexEnd
        const yearsDiff = Number (weeksDiff/52).toFixed (2)
        const gain = Number (props.stockChartYValues[indexEnd] / props.stockChartYValues[indexFirst]).toFixed (3)

        const yearlyGain = Number (gain ** (1 / yearsDiff)).toFixed(3)
        const textResults = 'sym='+ props.symbol + ' \xa0 \xa0 yearlyGain=' + yearlyGain + ' \xa0\xa0' + ((yearlyGain - 1) * 100).toFixed(1) + '%'
        const textInfo = 'sym='+ props.symbol + ` \xa0 \xa0 (gain= ${gain}  \xa0  years= ${yearsDiff} \xa0 from= ${props.stockChartXValues[indexFirst]} \xa0 to= ${props.stockChartXValues[indexEnd]}  )`;
        
        console.log (textResults)
        console.log (textInfo)
        setCalcResults(textResults)
        setCalcInfo ( textInfo)

      }    

    // function swap_period_8_mon() {
    //     var date = new Date();
    //     var formattedDate = format(date, "yyyy-MM-dd");
    //     var dateArray = formattedDate.split('-');

    //     // date = date.split('T')[0];
    //     const dateArray1 = monthsBack (dateArray, 8);
    //     const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
    //     props.setDropStartDate (new Date(dateStr));
    //     // setEndDate (new Date());
    // }

  //  skip analysis if no symbol
  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.StockSymbol);
 
  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid green'
  };
  // style={{display:'flex'}}

  const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

  return (
    <div style = {style} id='deepRecovery_id' >
      <div>
        <input
            type="checkbox" checked={displayFlag}
            onChange={displayFlagChange}
        /> Peak2Peak
      </div>

      {displayFlag && 
        <div> 
            {props.symbol && <div> {props.symbol}</div>}
            {calcResults && calcResults.includes(props.symbol) && <div style={{ color: 'red'}} >  <hr/> {calcResults}  </div>}
            {calcInfo && calcResults.includes(props.symbol) && <div style={{ color: 'green'}} >  {calcInfo} <hr/> </div>}

           <div  style={{display:'flex' }}> 
            <div style={{ color: 'magenta'}}  >Start_date:   </div>
            &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
           </div>
      
           <div  style={{display:'flex' }}> 
            <div style={{ color: 'magenta'}}  > End_date:   </div>
            &nbsp; &nbsp;  <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={endDate} onChange={(date) => setEndDate(date)} />
           </div>
           
           <div> &nbsp; 
            <input  type="checkbox" checked={searchPeak}  onChange={() => {setSearchPeak (! searchPeak)}} />  searchPeak &nbsp;&nbsp;
           
            <button type="button" onClick={()=>peak2PeakCalc ()}>Calc peak2peak gain </button>           
           </div>


        </div>
      }
    </div>
  )
}

export {Peak2PeakGui}