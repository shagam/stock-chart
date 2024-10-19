import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toDate } from "date-fns";
import {format} from "date-fns"
import {todayDate, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, searchDateInArray} from '../utils/Date'


function MarketOpenPrice (props) {

    var gainObj = {}
    const [dateArray, setDateArray] = useState([])
    var dateArray_ = [];
    const [openDivPrevCloseAverage, setOpenDivPrevCloseAverage] = useState()
    const [openDivPrevClose, setOpenDivPrevClose] = useState([])
    const [openArr, setOpenArr] = useState([])
    const [closeArr, setCloseArr]= useState([])
    const [weekly, setWeekly] = useState()


    const END_OF_DAY = false;
    const LOG_DROP = props.logFlags && props.logFlags.includes('drop_');

    useEffect (() => { 
        setDateArray()
        setOpenDivPrevCloseAverage()
        // openDivPrevClose()
        setOpenArr()
        setCloseArr()
    }, [props.symbol]) 
  

    var periodTag;
    if (weekly)
      periodTag = 'Weekly Adjusted Time Series';
    else
      periodTag = "Time Series (Daily)"
  
    function gainOpen(i) {
        if (dateArray_.length === 0) {
            return -1 // not ready yet
        }
        if (i < 0 || i >= dateArray_.length)
            return -1;
        const dayGainObj = gainObj[dateArray_[i]];
        const open = Number(dayGainObj['1. open']);
        const adjustedClose = Number(dayGainObj['5. adjusted close'])
        const close = Number(dayGainObj['4. close']);
        const open_calc = open * adjustedClose / close
        return open_calc.toFixed(2)
      }
    
    function gainHigh(i) {
        if (dateArray.length === 0)
            return -1 // not ready yet
        const dayGainObj = gainObj[dateArray_[i]];
        const high = Number(dayGainObj['2. high'])
        const adjustedClose = Number(dayGainObj['5. adjusted close'])
        const close = Number(dayGainObj['4. close']);
        return (high * adjustedClose / close).toFixed(2);
      }
  
      function gainLow(i) {
        if (dateArray.length === 0)
            return -1 // not ready yet
        const dayGainObj = gainObj[dateArray_[i]];
        const low = Number(dayGainObj['3. low'])  // * 
        const adjustedClose = Number(dayGainObj['5. adjusted close']) 
        const close = Number(dayGainObj['4. close']) 
        return low.toFixed(2);
      }
  
      function gainClose(i) {
        const dayGainObj = gainObj[dateArray_[i]];
        if (dateArray_.length === 0)
            return -1 // not ready yet
        if (i < 0)
            return -1
        const close = Number(dayGainObj['5. adjusted close']) 
        return close.toFixed(2)
    }



    // if (LOG_DROP) {
    //     console.log (gainObj[props.stockChartXValues[props.stockChartXValues.length-1]])
    //     console.log ('high=', gainHigh(props.stockChartXValues.length-1), 'low=', gainLow(props.stockChartXValues.length-1), 'close=', gainClose(props.stockChartXValues.length-1))
    // }
       
      // if (weekly)
      //   periodTag = 'Weekly Adjusted Time Series';
      // else
      //   periodTag = "Time Series (Daily)"
  
      const LOG_FLAG = props.logFlags && props.logFlags.includes('aux');
      const LOG_API = props.logFlags && props.logFlags.includes('api');
  
    //   const LOG_DROP = logFlags && logFlags.includes('drop_');
  
      const oneDayMili = 1000 * 3600 + 24;
  
      if (LOG_FLAG)
        console.log(props.symbol, 'gain/chart (symbol)'); 
      if (props.symbol === '' || props.symbol === undefined) {
        alert (`bug, chart sym vanished (${props.symbol})`);
        return;
      }
    
    // 1. open: '87.7500'
    // 2. high: '97.7300'
    // 3. low:  '86.7500'
    // 4. close: '90.6200'
    // 5. adjusted close: '0.6867'
    // 6. volume: '25776200'
    // 7. dividend amount:'0.0000'
  
    // const openOrCloseText = openMarketFlag ? '1. open' : '4. close';
    function getGainArray () {

      let API_Call;
      if (weekly)
        API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED`;
      else
        API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED`;

    API_Call += `&symbol=${props.symbol}&outputsize=full&apikey=${props.API_KEY}`

    // API_Call += '&adjusted'=true 

      fetch(API_Call)
          .then(
              function(response) {
                  const respStr = JSON.stringify (response);
                  if (response.status !== 200 || ! response.ok)
                      console.log(response);
                  return response.json();
              }
          )
          .then(
              (chartData) => {
                const dataStr = JSON.stringify(chartData);
                if (dataStr === "{}") {
                    props.errorAdd([props.symbol, 'Invalid symbol'])
                  // alert (`Invalid symbol: (${sym})`)
                  return;
                }
                if (LOG_API) {
                  console.log (API_Call);
                  console.dir (chartData)
                  // console.log (dataStr.substring(0,150));
                }
                
                // too frequent AlphaVantage api calls
                if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                    alert (`${dataStr} (${props.symbol}) \n\n${API_Call} ${props.API_KEY}  `);
                    //setChartData ('');
                    return;
                }
                const limit_100_PerDay = 'You have reached the 100 requests/day limit for your free API key'
                if (dataStr.indexOf (limit_100_PerDay) !== -1) {
                  alert (`${limit_100_PerDay} (${props.symbol}) \n\n${API_Call}  ${props.API_KEY} ` );
                  return;
                }              
                if (dataStr.indexOf ('Error Message":"Invalid API call') !== -1) {
                  alert (dataStr.substring(0, 35) + ` symbol(${props.symbol}) \n\n${API_Call}`);
                  //setChartData ('');
                  return;
                }
                const obj = chartData[`${periodTag}`]; 

                gainObj = obj
                const dateArr = Object.keys(obj);
                setDateArray(dateArr)
                dateArray_ = dateArr;

                // calc array of open vs prevClose
                var openArray = [];
                var closeArray = [];

                var openDivCloseMul = 1;
                var openDivCloseCount = 0;
                var openDivPrevClose_ = [];
                openDivPrevClose_[0] = -1
                var upCount = 0;
                var downCnt = 0;
                for (let i = 0; i < dateArray_.length; i++) {
                    openArray[i] = gainOpen(i)
                    closeArray[i] = gainClose(i)
                    if (i > 0) {
                        openDivPrevClose_[i] = openArray[i] / closeArray[i - 1];
                        openDivCloseMul *= openDivPrevClose_[i];
                        openDivCloseCount ++;
                        
                        if (openDivPrevClose_[i] > 1)
                            upCount ++;
                        else if (openDivPrevClose_[i] < 1)
                            downCnt ++;

                    }
                }
                setOpenArr (openArray)
                setCloseArr (closeArray)
                setOpenDivPrevClose(openDivPrevClose_)
                const average = Math.pow (openDivCloseMul, (1/openDivCloseCount))
                console.log (props.symbol, 'open vs prevClose  average=', average, 'openDivCloseCount', openDivCloseCount, 'openDivCloseMul', openDivCloseMul)
                console.log (props.symbol, 'open vs prevClose  upCnt=' + upCount, 'downCnt=', downCnt)
                setOpenDivPrevCloseAverage(average.toFixed(6))
            }
        )
    }



    // console.log ('open='+ gainOpen(0), 'gainClose=' + gainClose(0),  gainLow(0), gainHigh(0))

       //* color gain numbers according to gain
    function gainColor (gain) {
        const PERCENT_DIFF = 1;
        if (gain > 1 + PERCENT_DIFF / 100) { // for month color for hiegher gain
            const diff = gain -1;
            return '#00ff00' // diff * 40 green
        }
        else if (gain < 1 - PERCENT_DIFF / 100) {
            const diff = (1 - gain)
            return '#ff0000'// + diff * 256 * 40 red
        }
        else
            return '#0'  // black
    }


    return (
        <div>

            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.symbol} </div>  &nbsp; &nbsp;
                <h6 style={{color: 'blue'}}> MarketOpenPrice  </h6>
            </div>

            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> Tool for revealing after hour reshuffle (Expenses) of lavarage ETF like TQQQ </h6>

            <div>
              <button style={{background: 'aqua'}} onClick={getGainArray} > getPriceHistory </button>  &nbsp;  &nbsp; 
              <input type="checkbox" checked={weekly} onChange={() => setWeekly(! weekly)}  />&nbsp;weekly &nbsp; &nbsp;
            </div>

            {/* Market open_price / Perevious_close Table */}

            <div>&nbsp;</div>
            {openDivPrevCloseAverage && dateArray.length > 0 && <div> count={dateArray.length} &nbsp; &nbsp; 
                firstDate={dateArray[dateArray.length - 1]}  &nbsp; &nbsp;  open / prevClose-average={openDivPrevCloseAverage}</div>}

            {openDivPrevCloseAverage && openDivPrevClose.length > 0 && <div style={{height:'450px', width: '630px', overflow:'auto'}}>
                <table>
                    <thead>
                        <tr>
                        <th>date</th>
                        <th>open</th>
                        <th>close</th>
                        <th>dailyGain</th>
                        <th>open / prevClose</th>
                        {/* <th>nextOpen</th> */}

                        </tr>
                    </thead>
                    <tbody>
                        {dateArray && dateArray.map((date, index) =>{
                            return (
                            <tr key={index}>
                                <td style={{padding: '2px', margin: '2px', width: '100px'}}>{date}  </td> 
                                <td style={{padding: '2px', margin: '2px'}}> {openArr[index]}</td>
                                <td style={{padding: '2px', margin: '2px'}}> {closeArr[index]}</td>
                                <td style={{padding: '2px', margin: '2px', color: gainColor((closeArr[index] / openArr[index]))}}>   {(closeArr[index] / openArr[index]).toFixed(4)}</td>
                                <td style={{padding: '2px', margin: '2px', color: gainColor(openDivPrevClose[index])}}>   {openDivPrevClose[index].toFixed(5)}</td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>}  
        </div>
    )

}


export {MarketOpenPrice}