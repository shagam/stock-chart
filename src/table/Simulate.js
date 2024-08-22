import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import LogFlags from '../utils/LogFlags'
import GetInt from '../utils/GetInt'
import transitions from '@material-ui/core/styles/transitions';


const Simulate = (props) => {


  // props.symbol
  // props.rows
  // props.startDate
  // props.setStartDate
  // props.endDate
  // props.setEndDate
  // stockChartXValues
  // stockChartYValues
  // logFlags
  // weekly

    //** for symulate */
    const [tradeFlag, setTradeFlag] = useState (true);
    const [accountValueInit, setAccountValue] = useState (1000); //
    const [portionPercent, setPortionPercent] = useState (80); // default 80%
    const [startWeek, setStartWeek] = useState (0); // default oldest 
    // const [stockCountInit, setStockCount] =  useState (100);
    const [thresholdPercent, setThresholdPercent] = useState (0.1);
    const [interestRate, setInterestRate]  = useState (5);
    const [transactionFee, setTransactionFee]  =  useState (0);

    const [results, setResults] =  useState ();


    const LOG = props.logFlags && props.logFlags.includes('peak2Peak');

    useEffect(() => {
        setResults()

    },[props.symbol, accountValueInit, portionPercent, startWeek, thresholdPercent, interestRate, transactionFee]) 
   
  // style={{display:'flex'}}

//   const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

    function simulateTrade(XValues, YValues) {


        var price = YValues[YValues.length - 1 - startWeek]  // begining price // default oldest
        const priceInit = price

        var accountVal =  accountValueInit;

        const stockCountInit = accountValueInit * portionPercent/100 / price;
        var stockCount = stockCountInit;

        const moneyMarketInit = accountValueInit * (1 - portionPercent/100) // initial moneyMarket 
        var moneyMarket = moneyMarketInit

        //** log initial data */
        console.log (props.symbol, getDate(), 'trade-start value=', accountVal.toFixed(2), 'stocksCount=', stockCount.toFixed(2),
         'price=', price, 'moneyMarket=', moneyMarket.toFixed(2), 'portionPercent=', portionPercent,
          'thresholdPercent=', thresholdPercent, 'interestRate=', interestRate, 'transactionFee=', transactionFee, 'startWeek=', startWeek)
        
        const weeklyInterest = Math.pow(1 + interestRate / 100, 1/52)
        console.log ('weeklyInterest=', weeklyInterest) // on moneyMarket

        const oldestIndex = YValues.length - 1 - startWeek; // startIndex == 0 means oldest
        const stockGainDuringPeriod = YValues[0] / YValues[oldestIndex]// raw stock gain
        var stockToTrade;
        var tradeCount = 0;
        var tradeSkipCount = 0;
        for (let i = oldestIndex; i > 0; i--) {
            try {
            const pricePrev = price;
            price = YValues[i] 
        
            const accountValPrev  = accountVal;
            accountVal = price*stockCount + moneyMarket;
            const accountValBeforeTrade = accountVal
            // if (Math.abs(accountValPrev - accountVal) > 1.1) {
            //     console.log ('accountVal diff', accountValPrev, accountVal)
            // }
            // const tradeCount =  thresholdPercent / 100 * stockCount;  

            const portionDiff = price*stockCount / accountVal - portionPercent / 100; 

            if (tradeFlag && Math.abs(portionDiff) > thresholdPercent / 100) { // if less than one percent do not trade
                //** If up sell */
                stockToTrade = Math.abs(stockCount * portionDiff);
                if (portionDiff > 0) {
                    stockCount -= stockToTrade;
                    moneyMarket += (stockToTrade * price);
                    moneyMarket -= transactionFee; // for stocks trade only
                }

                //** if down buy */
                else {
                    stockCount += stockToTrade;
                    moneyMarket -= (stockToTrade * price);
                    moneyMarket -= transactionFee;
                }
                tradeCount++;

                //** Trade should not change account value */
                accountVal = price*stockCount + moneyMarket;
                if (Math.abs(accountValBeforeTrade - accountVal) >  2*transactionFee + 0.01) {
                    console.log ('accountVal trade diff, before=', accountValPrev.toFixed(2), ' after=', accountVal.toFixed(2))
                }
                // const portionPer = price*stockCount / (price*stockCount + moneyMarket)

                //** log first 10 */
                if (LOG && i > oldestIndex -10 )
                    console.log ('valBefore=', accountVal.toFixed(2), 'stockVal=', (price*stockCount).toFixed(2), 'moneyMarkt=', moneyMarket.toFixed(2), 'price=', price)

                //** Check out of range */
                // const currentPercent = price*stockCount /  accountVal;
                // const EPICS = 1.02;
                // if (currentPercent * EPICS < portionPercent / 100 || currentPercent / EPICS > portionPercent / 100) // portion 3% off
                //     console.log(props.symbol, 'out of range, index=', i, 'percentage=', (currentPercent * 100).toFixed(2), 'portionPercent', portionPercent,
                // // 'stocksVal=', (price*stockCount).toFixed(2),  'moneyMarket', moneyMarket.toFixed(2)
                // )    
            }
            else
            tradeSkipCount ++;

            // //** weekly interest of money market */
            moneyMarket *= weeklyInterest; 
       
            //** LOG loop start info */
            if (LOG &&  i > YValues.length - startWeek && i < YValues.length - startWeek - 10)
                console.log (props.symbol, 'middle i=', i, 'value=', accountVal.toFixed(2 ), 'count=', stockCount.toFixed(2),
                     'tradeCount=', stockToTrade.toFixed(2), 'price=', price, 'moneyMarket=', moneyMarket.toFixed(2))
        } catch (e) {
            console.log ('exception index=', i, e.message, ' portionPercent=', portionPercent)
            break;
        }
        }

        const gain =  (accountVal/(priceInit*stockCountInit+moneyMarketInit )).toFixed(2)
        console.log (props.symbol, 'trade end, ', 'acountGain=', gain, 'stockGain=', stockGainDuringPeriod.toFixed(2), 'tradeCount=', tradeCount)

        setResults (
            {
                gainOfAccount: gain, 
                gainOfStock: stockGainDuringPeriod.toFixed(2),

                accountValueEnd: accountVal.toFixed(2),
                accountValInit: accountValueInit.toFixed(2),

                stockCountEnd: stockCount.toFixed(2),
                stockCountInit: stockCountInit.toFixed(2),

                moneyMarketEnd: moneyMarket.toFixed(2),
                moneyMarketInit: moneyMarketInit.toFixed(2),

                priceEnd: price.toFixed(2),
                priceInit: priceInit,

                tradeCount: tradeCount,
                tradeSkipCount: tradeSkipCount,

                dateStart: XValues[oldestIndex],
                totalWeeksBack: oldestIndex,
            }
        )
    }


    return (
        <div>
            <h4>Simulate trade (keep portion)</h4>
            {/* <div> &nbsp;</div> */}
            {<div> <input  type="checkbox" checked={tradeFlag}  onChange={() => setTradeFlag (!tradeFlag)} /> tradeFlag &nbsp;</div>}     

            <GetInt init={accountValueInit} callBack={setAccountValue} title='accountValue $' type='Number' pattern="[0-9]+"/>
            <GetInt init={portionPercent} callBack={setPortionPercent} title='portion %' type='Number' pattern="[0-9]+"/>
            <GetInt init={thresholdPercent} callBack={setThresholdPercent} title='threshold %' type='text' pattern="[\\.0-9]+"/>
            <GetInt init={interestRate} callBack={setInterestRate} title='interestRate %' type='Number' pattern="[0-9]+"/>
            <GetInt init={transactionFee} callBack={setTransactionFee} title='transactionFee $' type='text' pattern="[\.0-9]+"/>
            <GetInt init={startWeek} callBack={setStartWeek} title='startWeek' type='Number' pattern="[0-9]+"/>

            <div> &nbsp;</div>

            {<button style={{background: 'lightGreen'}} type="button"  onClick={() => {simulateTrade (props.stockChartXValues, props.stockChartYValues)}}> Simulate trade </button>}&nbsp;
            {results && <div> Values &nbsp;</div>}
            <pre>{JSON.stringify(results, null, 2)}</pre>
         </div>
    )
 }

 export default Simulate