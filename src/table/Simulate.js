import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import LogFlags from '../utils/LogFlags'
import GetInt from '../utils/GetInt'


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
    const [accountValueInit, setAccountValue] = useState (10000); //
    const [portionPercent, setPortionPercent] = useState (80); // default 80%
    const [startIndex, setStartIndex] = useState (0); // default oldest 
    // const [stockCountInit, setStockCount] =  useState (100);
    const [thresholdPercent, setThresholdPercent] = useState (0.5);
    const [interestRate, setInterestRate]  = useState (5);
    const [transactionFee, setTransactionFee]  =  useState (0);

    const [startNumbers, setStartNumbers] =  useState ();
    const [results, setResults] =  useState ();


    const LOG = props.logFlags && props.logFlags.includes('peak2Peak');

    useEffect(() => {
        setResults()
        setStartNumbers()
    },[props.symbol, accountValueInit, portionPercent, startIndex, thresholdPercent, interestRate, transactionFee]) 
   
  // style={{display:'flex'}}

//   const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

    function simulateTrade(XValues, YValues) {


        var price = YValues[YValues.length - 1 - startIndex]  // begining price // default oldest
        const priceInit = price

        var accountVal =  accountValueInit;

        const stockCountInit = accountValueInit * portionPercent/100 / price;
        var stockCount = stockCountInit;

        const moneyMarketInit = accountValueInit * (1 - portionPercent/100) // initial moneyMarket 
        var moneyMarket = moneyMarketInit

        const weeklyInterest = Math.pow(1 + interestRate / 100, 1/52)
        console.log ('weeklyInterest=', weeklyInterest.toFixed(2)) // on moneyMarket

        //** log initial data */
        console.log (props.symbol, getDate(), 'start value=', accountVal.toFixed(2), 'count=', stockCount.toFixed(2),
         'price=', price, 'moneyMarket=', moneyMarket.toFixed(2))
        
        const oldestIndex = YValues.length - 1 - startIndex; // startIndex == 0 means oldest
        for (let i = oldestIndex; i > 0; i--) {
            try {
            price = YValues[i] 
        
            accountVal = price*stockCount + moneyMarket;

            const tradeCount =  thresholdPercent / 100 * stockCount;  

            const portionDiff = price*stockCount / accountVal - portionPercent / 100;

            if (tradeFlag) {
                //** If up sell */
                if (price*stockCount / accountVal >  (portionPercent + thresholdPercent) /100) {
                    stockCount -= tradeCount;
                    moneyMarket += tradeCount * price;
                }

                //** if down buy */
                else if (price*stockCount / accountVal < (portionPercent - thresholdPercent)) {
                    if (moneyMarket > tradeCount * price) { // negative moneyMarket not allowed
                        stockCount += tradeCount;
                        moneyMarket -= tradeCount * price;
                    }
                }
   
                //** Check out of range */
                const currentPercent = price*stockCount /  accountVal;
                if (currentPercent * 1.03 < portionPercent / 100 || currentPercent / 1.03 > portionPercent / 100) // portion 3% off
                    console.log(props.symbol, 'out of range, index=', i, 'percentage=', (currentPercent * 100).toFixed(2), 'portionPercent', portionPercent,
                // 'stocksVal=', (price*stockCount).toFixed(2),  'moneyMarket', moneyMarket.toFixed(2)
                )    
            }

            // //** weekly interest of money market */
            moneyMarket *= weeklyInterest; 
       
            //** LOG loop start */
            if (LOG &&  i > YValues.length - startIndex && i < YValues.length - startIndex - 10)
                console.log (props.symbol, 'middle i=', i, 'value=', accountVal.toFixed(2 ), 'count=', stockCount.toFixed(2), 'tradeCount=', tradeCount.toFixed(2), 'price=', price, 'moneyMarket=', moneyMarket.toFixed(2))
        } catch (e) {
            console.log ('exception index=', i, e.message, ' portionPercent=', portionPercent)
            break;
        }
        }

        const gain =  (accountVal/(priceInit*stockCountInit+moneyMarketInit )).toFixed(2)
        console.log (props.symbol, 'end accountValue=', accountVal.toFixed(2), 'stockCount=', stockCount.toFixed(2), 'price=', price.toFixed(2),
        'moneyMarket=', moneyMarket.toFixed(2), 'gain=', gain)

        setResults (
            {
              accountValueEnd: accountVal.toFixed(2),
              stockCountEnd: stockCount.toFixed(2),
              moneyMarketEnd: moneyMarket.toFixed(2),
              priceEnd: price.toFixed(2),

              gainOfAccount: gain, 
              gainOfStock: (YValues[0]/YValues[YValues.length - 1 - startIndex]).toFixed(2),
            }
        )

        setStartNumbers({
            accountValInit: accountValueInit.toFixed(2),
            stockCountInit: stockCountInit.toFixed(2),
            moneyMarketInit: moneyMarketInit.toFixed(2),

            dateStart: XValues[oldestIndex],
            totalWeeksBack: oldestIndex,
            // 'gain/stockGain': (accountVal/accountValInit).toFixed(2)
        })


    }


    return (
        <div>
            <div> &nbsp;</div>
            {<div> <input  type="checkbox" checked={tradeFlag}  onChange={() => setTradeFlag (!tradeFlag)} /> tradeFlag &nbsp;</div>}     

            <GetInt init={accountValueInit} callBack={setAccountValue} title='accountValue $' type='Number' pattern="[0-9]+"/>
            <GetInt init={portionPercent} callBack={setPortionPercent} title='portion %' type='Number' pattern="[0-9]+"/>
            <GetInt init={startIndex} callBack={setStartIndex} title='startWeek' type='Number' pattern="[0-9]+"/>
            <GetInt init={thresholdPercent} callBack={setThresholdPercent} title='threshold %' type='text' pattern="[\\.0-9]+"/>
            <GetInt init={interestRate} callBack={setInterestRate} title='interestRate' type='Number' pattern="[0-9]+"/>
            <GetInt init={transactionFee} callBack={setTransactionFee} title='transactionFee' type='Number' pattern="[0-9]+"/>
            
            <div> &nbsp;</div>

            {<button type="button"  onClick={() => {simulateTrade (props.stockChartXValues, props.stockChartYValues)}}> Simulate trade </button>}&nbsp;
            {results && <div> End values &nbsp;</div>}
            <pre>{JSON.stringify(results, null, 2)}</pre>
            {startNumbers && <div> Begin values &nbsp;</div>}
            <pre>{JSON.stringify(startNumbers, null, 2)}</pre>
        </div>
    )
 }

 export default Simulate