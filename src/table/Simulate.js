import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import LogFlags from '../utils/LogFlags'
import GetInt from '../utils/GetInt'
import transitions from '@material-ui/core/styles/transitions';
import monthsToYears from 'date-fns/esm/fp/monthsToYears';


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

    //** checkBoxes */
    const [tradeFlag, setTradeFlag] = useState (true);
    const [logTrade, setLogTrade] = useState (false);
    const [logOptimize, setLogOptimize] = useState (false);
    const [allowMargin, setAllowMargin] = useState (false);

    const [accountValueInit, setAccountValue] = useState (1000); //
    const [portionPercent, setPortionPercent] = useState (80); // default 80%
    const [startWeek, setStartWeek] = useState (200); // default oldest 
    // const [stockCountInit, setStockCount] =  useState (100);
    const [thresholdPercent, setThresholdPercent] = useState (0.8);
    const [interestRate, setInterestRate] = useState (3.2);
    const [transactionFee, setTransactionFee] = useState (0);
    const [scale, setScale] = useState (1.05); // defailt neutral
    const [optimize, setOptimize] = useState (true);

    const [results, setResults] =  useState ();
    const [counters, setCounters] =  useState ();

    const historyLength = props.stockChartXValues.length;

    const LOG = props.logFlags && props.logFlags.includes('simulateTrade');

    useEffect(() => {
        setResults()
        setCounters()

    },[props.symbol, accountValueInit, portionPercent, startWeek, thresholdPercent, interestRate, transactionFee]) 
   
  // style={{display:'flex'}}

//   const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

    function simulateTrade(XValues, YValues) {

        var price = YValues[YValues.length - 1 - startWeek]  // begining price // default oldest
        const priceInit = price

        var accountVal =  accountValueInit;
        const aggressivePortionInit = portionPercent/100; // between 0 to 1
        const stockCountInit = accountValueInit *  aggressivePortionInit / price;
        var stockCount = stockCountInit;

        const moneyMarketInit = accountValueInit * (1 -  aggressivePortionInit) // initial moneyMarket 
        var moneyMarket = moneyMarketInit

        //** log initial data */
        const tradeInitInfo = {
            'trade_start_value_$': accountVal.toFixed(2),
            stocksCount: stockCount.toFixed(2),
            'moneyMarket_$': moneyMarket.toFixed(2),
            'price_$': price,
            'portion_%': portionPercent,
            'threshold_%': thresholdPercent,
            'interestRate_%': interestRate,
            'transactionFee_$': transactionFee,
            startWeek: startWeek
        }
        console.log (props.symbol, getDate(), tradeInitInfo); 
          
             
        
        const weeklyInterest = Math.pow(1 + interestRate / 100, 1/52)
        if (LOG)
            console.log ('weeklyInterest=', weeklyInterest, 'interest=', interestRate) // on moneyMarket

        const oldestIndex = YValues.length - 1 - startWeek; // startIndex == 0 means oldest
        const stockGainDuringPeriod = YValues[0] / YValues[oldestIndex]// raw stock gain
        var stockToTrade;
        var buyCount = 0;
        var sellCount = 0;
        var tradeSkipCount = 0;
        var sellSumTotal = 0;
        var buySumTotal = 0;
        var buyMin;
        var sellMin;
        var moneyMarketMin = 0;
        var moneyMarketMax = 0;        


        for (let i = oldestIndex; i > 0; i--) {
            try {

                var targetPortion =  aggressivePortionInit; // user param default, without optimize

                //** search date in bubbleLine */
                const bubbleLine = props.gainMap.bubbleLine;
                var portionFactor = 1; // default neutral
                if (bubbleLine && optimize) {
                    portionFactor = scale; // defaut setup
                    const symdate =  XValues[i].split('-') // prepare search format [2003,9,12]
                    const symVal = YValues[i]; 
                    var bubbleIndex = searchDateInArray (bubbleLine.x, symdate, props.symbol, props.logFlags)
                    if (bubbleIndex!== -1) {

                        //** optimize according to bubbleLine */
                        const priceDivBbubblePrice = YValues[i] / bubbleLine.y[bubbleIndex];
                        targetPortion = 1 - ((1-targetPortion) * priceDivBbubblePrice / scale)


                        if (logOptimize)
                            console.log(props.symbol, 'optimize', symdate, ' i=', i, 'price=', price, 'price/bubble=', priceDivBbubblePrice.toFixed(3),
                         'aggresssivePortion=', targetPortion.toFixed(3))
                    }
                }
            const pricePrev = price;
            price = YValues[i] 
        
            const accountValPrev  = accountVal;
            accountVal = price*stockCount + moneyMarket;
            const accountValBeforeTrade = accountVal

            const portionDiff = price*stockCount / accountVal - targetPortion; 
            // if (Math.abs(portionDiff) > accountVal / 5000) {
            //     console.log (accountVal, portionDiff)
            // }

            if (tradeFlag && Math.abs(portionDiff) > (thresholdPercent / 100)
                 && Math.abs(portionDiff) > 5 * transactionFee) { // if less than predeined percent do not trade
                //** If up sell */
                stockToTrade = Math.abs(stockCount * portionDiff);
                const tradeSum = (stockToTrade * price);

                if (portionDiff < 0) {
                    // buy stocks.
                    stockCount += stockToTrade;
                    moneyMarket -= tradeSum;
                    moneyMarket -= transactionFee;
                    buyCount ++
                    buySumTotal += tradeSum;
                    if (buyMin === undefined || tradeSum < buyMin)
                        buyMin = tradeSum;
                }

                else {
                     // sell stocks
                     stockCount -= stockToTrade;
                     moneyMarket += tradeSum;
                     moneyMarket -= transactionFee; // for stocks trade only
                     sellCount ++;
                     sellSumTotal += tradeSum;
                     if (sellMin === undefined || tradeSum < sellMin)
                         sellMin = tradeSum;
                }

                if (moneyMarket < moneyMarketMin)
                    moneyMarketMin = moneyMarket;
                if (moneyMarket > moneyMarketMax)
                    moneyMarketMax = moneyMarket;

                //** verify transaction does not change account value. */
                accountVal = price*stockCount + moneyMarket;
                if (Math.abs(accountValBeforeTrade - accountVal) >  2*transactionFee + 0.01) {
                    console.log ('accountVal trade diff, before=', accountValPrev.toFixed(2), ' after=', accountVal.toFixed(2))
                }

                //** log transaction */
                if (logTrade) {
                    console.log (props.symbol, 'tradeInfo, i=', YValues.length - i, 'accountVal=', accountVal.toFixed(2), 'portionFactor=',
                     (portionFactor).toFixed(2), 'moneyMarkt=', moneyMarket.toFixed(2), 
                     'tradeSum=', (stockCount * portionDiff * price).toFixed(2), 'price=', price, 'targetPortion=', targetPortion.toFixed(3))
                }

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
        console.log (props.symbol, 'trade end, ', 'acountGain=', gain, 'stockGain=', stockGainDuringPeriod.toFixed(2), 'buyCount=', buyCount, 'sellCount=', sellCount)

        // avoid exceptions when no trade
        if (! buyMin) 
            buyMin = 0;
        if (! sellMin)
            sellMin = 0;
        const buyAverage = buyCount === 0 ? 0 : (buySumTotal/buyCount).toFixed(2);
        const sellAverage = sellCount === 0 ? 0 : (sellSumTotal/sellCount).toFixed(2)

        setResults (
            {
                gainOfAccount: gain, 
                rawGainOfStock: stockGainDuringPeriod.toFixed(2),

                accountValueEnd_$: accountVal.toFixed(2),
                accountValInit_$: accountValueInit.toFixed(2),

                stockCountEnd: stockCount.toFixed(2),
                stockCountInit: stockCountInit.toFixed(2),

                moneyMarketEnd_$: moneyMarket.toFixed(2),
                moneyMarketInit_$: moneyMarketInit.toFixed(2),

                priceEnd_$: price.toFixed(2),
                priceInit_$: priceInit,


                dateStart: XValues[oldestIndex],
                totalWeeksBack: oldestIndex,

                buyCount: buyCount,
                buyAverage_$: buyAverage, 
                buyMin_$: buyMin.toFixed(2),
                sellCount: sellCount,
                sellAverage_$: sellAverage,
                sellMin_$: sellMin.toFixed(2),
                tradeSkipCount: tradeSkipCount,
                moneyMarketMin: moneyMarketMin.toFixed(2),
                moneyMarketMax: moneyMarketMax.toFixed(2),

            })
        
    }


    return (
        <div style = {{border: '2px solid blue', width: '650px'}} id='deepRecovery_id' >
            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h5 style={{color: 'blue'}}> Simulate-trade (keep aggressive percentage) &nbsp;  </h5>
            </div>
            {props.gainMap.bubbleLine && optimize && <h6  style={{color: 'red' }}> Optimize, decrease aggressive portion when near bubbleLine (and vice versa)</h6>}

            {/* <h4>Simulate trade (keep portion)</h4> */}
            {/* <div> &nbsp;</div> */}
            <div style={{display: 'flex'}}>
                <input  type="checkbox" checked={tradeFlag}  onChange={() => setTradeFlag (! tradeFlag)} /> tradeFlag &nbsp;  
                {props.gainMap.bubbleLine&& <div><input  type="checkbox" checked={optimize}  onChange={() => setOptimize (! optimize)} />
                     optimize (price/bubble) &nbsp;</div>}
                {/* <input  type="checkbox" checked={allowMargin}  onChange={() => setAllowMargin  (! allowMargin)} /> allowMargin &nbsp; */}
                
                <input  type="checkbox" checked={logTrade}  onChange={() => setLogTrade (! logTrade)} /> log_trade &nbsp;
                <input  type="checkbox" checked={logOptimize}  onChange={() => setLogOptimize (! logOptimize)} /> log_optimize &nbsp;
            </div>  
            <div style = {{width: '70vw'}}>
                <GetInt init={accountValueInit} callBack={setAccountValue} title='account-value-init $' type='Number' pattern="[0-9]+"/>
                <GetInt init={portionPercent} callBack={setPortionPercent} title='aggressive-portion %' type='Number' pattern="[0-9]+"/>
                <GetInt init={scale} callBack={setScale} title='optimize-scale (0.7 .. 1.5) ' type='text' pattern="[\\.0-9]+"/>
                <GetInt init={thresholdPercent} callBack={setThresholdPercent} title='trade-threshold %' type='text' pattern="[\\.0-9]+"/>
                <GetInt init={interestRate} callBack={setInterestRate} title='interest-rate %' type='Number' pattern="[0-9]+"/>
                <GetInt init={transactionFee} callBack={setTransactionFee} title='transaction-fee $' type='text' pattern="[\.0-9]+"/>
                <GetInt init={startWeek} callBack={setStartWeek} title='startWeek (0 .. ~1000)' type='Number' pattern="[0-9]+"/>
            </div>
            <div> &nbsp;</div>

            {<button style={{background: 'lightGreen'}} type="button"  onClick={() => {simulateTrade (props.stockChartXValues, props.stockChartYValues)}}> Simulate trade </button>}&nbsp;
            {results && <div> Values &nbsp;</div>}
            <pre>{JSON.stringify(results, null, 2)}</pre>
            {results && <div> Counters &nbsp;</div>}
            <pre>{JSON.stringify(counters, null, 2)}</pre>
         </div>
    )
 }

 export default Simulate