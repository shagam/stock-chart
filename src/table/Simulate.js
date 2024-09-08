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
    const [optimize, setOptimize] = useState (props.gainMap.bubbleLine ? true : false);

    const [logTrade, setLogTrade] = useState (false);
    const [logOptimize, setLogOptimize] = useState (false);

    // bubbleLine aggressive level optimize Params
    const [LEVEL_LOW, set_LEVEL_LOW] = useState(0.65)
    const [LEVEL_HIGH, set_LEVEL_HIGH] = useState(0.9)
    const [PORTION_HIGH, set_PORTION_HIGH] = useState(1.0)
    const [PORTION_LOW, set_PORTION_LOW] = useState(0.5)


    const [accountValueInit, setAccountValue] = useState (1000); //
    const [portionPercent, setPortionPercent] = useState (80); // default 80%
    const [startWeek, setStartWeek] = useState (200); // default oldest 
    const [thresholdPercent, setThresholdPercent] = useState (0.8);
    const [interestRate, setInterestRate] = useState (3.2);
    const [transactionFee, setTransactionFee] = useState (0);


    const [results, setResults] =  useState ();

    const [resultsArray, setResultsArray] = useState({})  //** holds all results for display in table */


    const historyLength = props.stockChartXValues.length;

    const LOG = props.logFlags && props.logFlags.includes('simulateTrade');

    useEffect(() => {
        setResults()
        // resultsArray()

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

        var portionMin = aggressivePortionInit;
        var portionMax = aggressivePortionInit;

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
        var moneyMarketMin = accountValueInit;
        var moneyMarketMax = 0;        
        var portionPriv // updated in loop
        var targetPortion =  aggressivePortionInit; // user param default, without optimize

        for (let i = oldestIndex; i > 0; i--) {
            try {

                portionPriv = targetPortion; //save for log


                //** search date in bubbleLine */
                const bubbleLine = props.gainMap.bubbleLine;

                if (bubbleLine && optimize) {
                    const symdate =  XValues[i].split('-') // prepare search format [2003,9,12]
                    const symVal = YValues[i]; 
                    var bubbleIndex = searchDateInArray (bubbleLine.x, symdate, props.symbol, props.logFlags)
                    if (bubbleIndex!== -1) {

                        //** optimize according to bubbleLine */
                        var priceDivBbubblePrice = symVal / (bubbleLine.y[bubbleIndex]);
                        if (priceDivBbubblePrice > 1) {
                            console.log ('price above bubble')
                        }

                        if (priceDivBbubblePrice <= LEVEL_LOW)  // low level set high portion
                            targetPortion = Number(PORTION_HIGH) ;
                        else if (priceDivBbubblePrice >= LEVEL_HIGH)  // high level set low portion
                            targetPortion = Number(PORTION_LOW);
                        else {// interpolate
                            targetPortion =  Number(PORTION_HIGH) + (Number(PORTION_HIGH) - Number(PORTION_LOW)) / (LEVEL_LOW - LEVEL_HIGH) * (priceDivBbubblePrice - LEVEL_LOW)
                        }

                        // save portion min/max
                        if (portionMin > targetPortion)
                            portionMin = targetPortion
                        if (portionMax < targetPortion)
                            portionMax = targetPortion

                        if (logOptimize)
                            console.log(props.symbol, 'optimize', 'i=', i, XValues[i], 'price=', price, 'price/bubble=', priceDivBbubblePrice.toFixed(3),
                         'portion=', targetPortion.toFixed(3), 'portionPriv=', portionPriv.toFixed(3))
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
                    console.log (props.symbol, 'tradeInfo, i=', YValues.length - i, 'portion=', targetPortion.toFixed(3),
                    'accountVal=', accountVal.toFixed(2),
                    //   'stockValue=', stockCount * price, 'moneyMarkt=', moneyMarket.toFixed(2),
                     'tradeSum=', (stockCount * portionDiff * price).toFixed(2), 'price=', price.toFixed(2))
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
                // moneyMarketMin: moneyMarketMin.toFixed(2),
                // moneyMarketMax: moneyMarketMax.toFixed(2),

            })


            //** results */

            
            if (! resultsArray.gainOfAccount)
                resultsArray.gainOfAccount = []
            resultsArray.gainOfAccount.push(gain)

            if (! resultsArray.rawGainOfStock)
                resultsArray.rawGainOfStock = []
            resultsArray.rawGainOfStock.push (stockGainDuringPeriod.toFixed(2))

            // if (! resultsArray.portionMax)
            //     resultsArray.portionMax = [];
            // resultsArray.portionMax.push(portionMax.toFixed(3))

            // if (! resultsArray.portionMin)
            //     resultsArray.portionMin = [];
            // resultsArray.portionMin.push(portionMin.toFixed(3))


            
            //** input params */
            if (! resultsArray.params)
                resultsArray.params = [];
            resultsArray.params.push('=====')


            if (! resultsArray.tradeFlag)
                resultsArray.tradeFlag = []
            resultsArray.tradeFlag.push('' + tradeFlag)

            if (! resultsArray.optimize)
                resultsArray.optimize = []
            resultsArray.optimize.push ('' + optimize)


            if (! resultsArray.LEVEL_HIGH)
                resultsArray.LEVEL_HIGH = [];
            resultsArray.LEVEL_HIGH.push(LEVEL_HIGH)

            if (! resultsArray.LEVEL_LOW)
                resultsArray.LEVEL_LOW = [];
            resultsArray.LEVEL_LOW.push(LEVEL_LOW);

            if (! resultsArray.PORTION_HIGH)
                resultsArray.PORTION_HIGH = [];
            resultsArray.PORTION_HIGH.push(PORTION_HIGH)
            
            if (! resultsArray.PORTION_LOW)
                resultsArray.PORTION_LOW = [];
            resultsArray.PORTION_LOW.push(PORTION_LOW);



            if (! resultsArray.portionPercent)
                resultsArray.portionPercent = [];
            resultsArray.portionPercent.push(portionPercent)

            // if (! resultsArray.optimizeScale)
            //     resultsArray.optimizeScale = [];
            // resultsArray.optimizeScale.push(optimizeScale)

            if (! resultsArray.thresholdPercent)
                resultsArray.thresholdPercent =[];
            resultsArray.thresholdPercent.push(thresholdPercent)

            if (! resultsArray.interestRate)
                resultsArray.interestRate = [];
            resultsArray.interestRate.push(interestRate)

            if (! resultsArray.transactionFee)
                resultsArray.transactionFee = [];
            resultsArray.transactionFee.push(transactionFee)

            // if (! resultsArray.accountValueEnd_$)
            //     resultsArray.accountValueEnd_$ = []
            // resultsArray.accountValueEnd_$.push(accountVal.toFixed(2))

            // if (! resultsArray.accountValInit_$)
            //     resultsArray.accountValInit_$ = [];
            // resultsArray.accountValInit_$.push(accountValueInit.toFixed(2))

            //** more info */
            if (! resultsArray.info)
                resultsArray.info = [];
            resultsArray.info.push('=====')

            if (! resultsArray.stockCountEnd)
                resultsArray.stockCountEnd = []
            resultsArray.stockCountEnd.push (stockCount.toFixed(2))

            if (! resultsArray.stockCountInit)
                resultsArray.stockCountInit = [];
            resultsArray.stockCountInit.push(stockCountInit.toFixed(2))

            if (!resultsArray.moneyMarketEnd_$)
                resultsArray.moneyMarketEnd_$ = [];
            resultsArray.moneyMarketEnd_$.push(moneyMarket.toFixed(2))

            if (! resultsArray.moneyMarketInit_$)
                resultsArray.moneyMarketInit_$ = [];
            resultsArray.moneyMarketInit_$.push(moneyMarketInit.toFixed(2))



            // if (! resultsArray.priceEnd_$)
            //     resultsArray.priceEnd_$ = [];
            // resultsArray.priceEnd_$.push( price.toFixed(2))

            // if (!resultsArray.priceInit_$)
            //     resultsArray.priceInit_$ = [];
            // resultsArray.priceInit_$.push(priceInit) 

    }

    // color header if arr values differ
    function colorfield (arr) {
        if (arr.length === 0)
            return 'white';
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] !== arr[0]) {
                return 'pink'
            }
        }
    }


    return (
        <div style = {{border: '2px solid blue', width: '750px'}} id='deepRecovery_id' >
            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h5 style={{color: 'blue'}}> Simulate-trade (keep aggressive percentage) &nbsp;  </h5>
            </div>
            {props.gainMap.bubbleLine && optimize && <h6  style={{color: 'red' }}> Optimize, decrease aggressive portion when near bubbleLine (and vice versa)</h6>}

            <div style={{display: 'flex'}}>
                <input  type="checkbox" checked={tradeFlag}  onChange={() => setTradeFlag (! tradeFlag)} /> tradeFlag &nbsp;  
                {props.gainMap.bubbleLine && <div><input  type="checkbox" checked={optimize}  onChange={() => setOptimize (! optimize)} />
                     optimize (price/bubble) &nbsp;</div>}  &nbsp;

                
                <input  type="checkbox" checked={logTrade}  onChange={() => setLogTrade (! logTrade)} /> log_trade &nbsp;  
                {props.gainMap.bubbleLine && optimize && <div><input  type="checkbox" checked={logOptimize}  onChange={() => setLogOptimize (! logOptimize)} /> log_optimize &nbsp;</div>}
            </div>  
            {optimize && <div style = {{display:'flex'}}>
                &nbsp;<GetInt init={LEVEL_HIGH} callBack={set_LEVEL_HIGH} title='levelHigh' type='text' pattern="[\\.0-9]+"/>
                &nbsp; <GetInt init={LEVEL_LOW} callBack={set_LEVEL_LOW} title='levelLow' type='text' pattern="[\\.0-9]+"/> 
            {/* </div>  
            <div style = {{display:'flex'}}> */}
                &nbsp; <GetInt init={PORTION_HIGH} callBack={set_PORTION_HIGH} title='portionHigh' type='text' pattern="[\.0-9]+"/>
                &nbsp; <GetInt init={PORTION_LOW} callBack={set_PORTION_LOW} title='portionLow' type='text' pattern="[\.0-9]+"/>
            </div>}
            <div style = {{display:'flex', width: '800px'}}>
                &nbsp; <GetInt init={accountValueInit} callBack={setAccountValue} title='account-value $' type='Number' pattern="[0-9]+"/>
                &nbsp; {! optimize && <GetInt init={portionPercent} callBack={setPortionPercent} title='aggressive %' type='Number' pattern="[0-9]+"/>}
            </div>
            <div style = {{display:'flex', width: '800px'}}>
                &nbsp; <GetInt init={thresholdPercent} callBack={setThresholdPercent} title='trade-threshold %' type='text' pattern="[\\.0-9]+"/>
                &nbsp; <GetInt init={interestRate} callBack={setInterestRate} title='interest-rate %' type='text' pattern="[0-9]+"/>
            </div>
            <div style = {{display:'flex', width: '800px'}}>
                &nbsp; <GetInt init={transactionFee} callBack={setTransactionFee} title='transaction-fee $' type='text' pattern="[\.0-9]+"/>
                &nbsp; <GetInt init={startWeek} callBack={setStartWeek} title='startWeek' type='Number' pattern="[0-9]+"/>
            </div>
            <div> &nbsp;</div>

            {<button style={{background: 'lightGreen'}} type="button"  onClick={() => {simulateTrade (props.stockChartXValues, props.stockChartYValues)}}> Simulate trade </button>}&nbsp;

  
            <table>
                <thead>

                </thead>
                <tbody>
                    {Object.keys(resultsArray).map((s, s1) =>{
                        return (
                        <tr key={s1}>
                            <td style={{width: '8px', background: colorfield(resultsArray[s])}}>{s}</td>                 
                            {resultsArray[s].map((k,n)=>{
                            return (
                                <td key={n}> {k} </td>
                            )
                            })
                        }
                        </tr>
                        )
                    })}
                </tbody>
            </table>
            
            {results && <div> Last simulation info &nbsp;</div>}
             <pre>{JSON.stringify(results, null, 2)}</pre>
         </div>
    )
 }

 export default Simulate