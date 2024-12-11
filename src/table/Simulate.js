import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr, yearsDifference} from '../utils/Date'

import LogFlags from '../utils/LogFlags'
import GetInt from '../utils/GetInt'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import {ErrorList, errorAdd, beep, beep2} from '../utils/ErrorList'
// import monthsToYears from 'date-fns/esm/fp/monthsToYears';
import {MonthGain, weekOfYearGet} from './MonthGain'
import Plot from 'react-plotly.js';

const Simulate = (props) => {

    const {localIp, localIpv4, eliHome, city, countryName, countryCode, regionName, ip, os} = IpContext();
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
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
    const [optimizeBubble, setOptimizeBubble] = useState (props.gainMap.bubbleLine ? true : false);
    const [optimizeWeekGain, setOptimizeWeekthGain] = useState (props.monthGainData.monthGainArray ? true : false);

    const [logTrade, setLogTrade] = useState (false);
    const [logOptimize, setLogOptimize] = useState (false);

    // bubbleLine aggressive level optimize Params
    const [chartShow, setChartShow] = useState(false)
    const [priceDivBubble_LOW, setPriceDivBubble_LOW] = useState(0.65)
    const [priceDivBubble_HIGH, setPriceDivBubble_HIGH] = useState(0.9)
    const [PORTION_HIGH, set_PORTION_HIGH] = useState(1)
    const [PORTION_LOW, set_PORTION_LOW] = useState(0.1)

    // weekGain params
    const [portionPercent, setPortionPercent] = useState (90); // default 80%
    const [weekGainEnhance, setWeekGainEnhance] = useState (7);
    const [weekGainAhead, setWeekGainAhead] = useState (3);


    const [accountValueInit, setAccountValue] = useState (1000); //
    const [startWeek, setStartWeek] = useState (0); // default oldest 
    const [thresholdPercent, setThresholdPercent] = useState (0.8);
    const [interestRate, setInterestRate] = useState (3.2);
    const [transactionFee, setTransactionFee] = useState (0);

    const [portionWeekGain, setPortionWeekGain] = useState (-1);

    const [logRecords, setLogRecords] = useState({}) // log of trades
    const [logRecordsKeys, setLogRecordsKeys] = useState([]) 

    const [results, setResults] = useState ();
    const [err, setErr] =  useState ();
    const [resultsArray, setResultsArray] = useState({})  //** holds all results for display in table */

    const [tradeInfoShow, setTradeInfoShow] = useState (true);
    const [tradeChartShow, setTradeChartShow] = useState (false);
    const [startDate, setStartDate] = useState(new Date(2007, 8, 1 )) // sep 1

    const historyLength = props.stockChartXValues.length;

    const LOG = props.logFlags && props.logFlags.includes('simulateTrade');

    useEffect(() => {
        // setResults()
        setErr()
        // setResultsArray({})

    },[props.symbol, accountValueInit, portionPercent, startWeek, thresholdPercent, interestRate, transactionFee]) 
   
    const aggressivePortionInit = portionPercent/100; // between 0 to 1
    var portionMin = aggressivePortionInit;
    var portionMax = aggressivePortionInit;

    var bubbleLine = props.gainMap.bubbleLine;
    var todayPriceDivBubbleLine = -1
    if (bubbleLine) {
        todayPriceDivBubbleLine = props.stockChartYValues[0] / props.gainMap.bubbleLine.y[0]
    }


    //** for optimize radio buttons */
    // const toolEnum = {
    //     None: 'optimize_None',
    //     BUBBLE_LINE: 'BUBBLE_LINE',
    //     MONTH_GAIN:  'WEEK_GAIN',
    //   };

    //   const [optimizeTool, setOptimizeTool] = useState('optimize_None')
    //   const onOptionChange = e => {
    //     const tool = e.target.value;
    //     setOptimizeTool(tool)
    //     if (tool === 'BUBBLE_LINE')
    //         setOptimizeBubble(true)
    //     else
    //         setOptimizeBubble(false)
    //     if (tool === 'WEEK_GAIN')
    //         setOptimizeWeekthGain(true)
    //     else
    //         setOptimizeWeekthGain(false)
    //     console.log(tool)
    //   }
    


    function optimizeMonGain_calc (XValues, i, aggressivePortionInit, price) {
       
        var targetPortion =  aggressivePortionInit; 

        // console.log ('optimizeMonthGain', i, props.monthGainData.weekGainArray)
        var weekGainFactor = 1;
        for (let j = 1; j < weekGainAhead; j++) {
            
            const index = i - j  // look in future
            if (index < 0)
                break; // byond array 
            const date = XValues[i] // date of gain  for debug
            var sign_1; // used to breal loop when sign flips
            const weekNum = weekOfYearGet (XValues, index, props.logFlags) 
            if (weekNum === -1) //** not found */
                continue;
            const weeklyGain = props.monthGainData.weekGainArray[weekNum];  // look forward closer to 0

            // break loop when growth flips direction
            const sign = Math.sign(Math.log(weeklyGain)) 
            if (j === 1) {
                sign_1 = sign;
            }
            else
                if (sign !== sign_1) {
                    if (logOptimize)
                        console.log ('sign flip, j=', j,  sign_1, sign)
                    break; // exit loop when sign flipps
                } 

            // enhance by exponent
            const weekGainFactor_temp = Math.pow (weeklyGain, weekGainEnhance) 
            if (targetPortion * weekGainFactor_temp > 0.98) {
                if (logOptimize)
                    console.log ('Portion too high,  targetPortion=', targetPortion.toFixed(3), 'weekGainFactor=', weekGainFactor.toFixed(3))                 
                break;
            }
            weekGainFactor = weekGainFactor_temp


            if (isNaN (weekGainFactor)) {
                console.log ('NaN')
            }
        }
   
        targetPortion *= weekGainFactor; // higher price prediction => reduce targetPortion

        if (targetPortion > 1) {
            console.log ('non valid portion,  targetPortion=', targetPortion.toFixed(3))
        }

        if (logOptimize)
            console.log (props.symbol, 'weekOptmz  i='+ i, XValues[i], 'price=' + price.toFixed(2), 'targetPortion=' + targetPortion.toFixed(3), 'factor=' + weekGainFactor.toFixed(3))
        return targetPortion;
    }

    function portionBubble_calc (priceDivBbubblePrice) {
        var targetPortion = -1;
        if (priceDivBbubblePrice <= priceDivBubble_LOW)  // low level set high portion
            targetPortion = Number(PORTION_HIGH) ;
        else if (priceDivBbubblePrice >= priceDivBubble_HIGH)  // high level set low portion
            targetPortion = Number(PORTION_LOW);
        else {// interpolate
            targetPortion =  Number(PORTION_HIGH) + (Number(PORTION_HIGH) - Number(PORTION_LOW)) / (priceDivBubble_LOW - priceDivBubble_HIGH) * (priceDivBbubblePrice - priceDivBubble_LOW)
        }
        return targetPortion
    }


    function optimizeBubble_calc (XValues, YValues, i, aggressivePortionInit, price, bubbleLine) {
    
        var targetPortion =  aggressivePortionInit; 
        if (i >= XValues.length) {
            console.log ('indexByond array i=', i)
        }
        const symdate =  XValues[i].split('-') // prepare search format [2003,9,12]
        const symVal = YValues[i]; 
        var bubbleIndex = searchDateInArray (bubbleLine.x, symdate, props.symbol, props.logFlags, setErr)
        if (bubbleIndex === -1) {
            console.log (props.symbol, i, 'failed to find date in bubble line')
            return aggressivePortionInit
        }

        //** optimize according to bubbleLine */
        var priceDivBbubblePrice = symVal / (bubbleLine.y[bubbleIndex]);
        if (priceDivBbubblePrice > 1) {
            console.log (props.symbol, 'price>bubbl i=' + i, XValues[i],
            'price='+ symVal.toFixed(2),
            'price/bubble=', priceDivBbubblePrice.toFixed(2),
            'bubblePrice=' + bubbleLine.y[bubbleIndex].toFixed(2))
            return PORTION_LOW; // minimum
        }

        if (false) { // experiment 
            const bubbleOver = 1 - priceDivBbubblePrice
            console.log (Math.pow (1 - aggressivePortionInit, bubbleOver))
            const factor = Math.pow (1 - aggressivePortionInit, bubbleOver)
            targetPortion *= 1 - factor;
            return targetPortion;
        }
    
        targetPortion = portionBubble_calc (priceDivBbubblePrice)

        if (logOptimize)
            console.log(props.symbol, 'bubblOptm', 'i=' + i, XValues[i], 'price=' + price.toFixed(2), 'price/bubble=' + priceDivBbubblePrice.toFixed(2),
            'portion=' + targetPortion.toFixed(3)) // , 'portionPriv=', portionPriv.toFixed(3)

        return targetPortion;
    }

    //** SIMULATE TRADE */
    function simulateTrade(XValues, YValues) {
        setErr()
        if (optimizeBubble && optimizeWeekGain) {
            setErr ('error, cannot optimize for both (buble-proximety and weelGain) turn off either ')
            beep2()
            return;
        }

        const startYear = startDate.getFullYear();
        const startMon = startDate.getMonth() + 1;
        const startDay = startDate.getDate();
        const startDateArray = [startYear, startMon, startDay]

        var startDateIndex = searchDateInArray (props.stockChartXValues, startDateArray, props.symbol, props.logFlags, setErr)
        if (startDateIndex === -1)
            startDateIndex = props.stockChartXValues.length - 1 // if date beyond valid dates use array size 
        if (props.gainMap.bubbleLine && bubbleLine && bubbleLine.y.length < startDateIndex)
            startDateIndex = bubbleLine.y.length;

        // var startDateIndex = searchDateInArray (props.gainMap.bubbleLine? bubbleLine.x: props.stockChartXValues, startDate, props.symbol, props.logFlags, setErr)
        const arrayLen = startDateIndex;

        if ((optimizeBubble && arrayLen - 1 - startWeek <= 0) || (!optimizeBubble && YValues.length - 1 - startWeek < 0) ) {
            setErr ('invalid start week= ', startWeek)
            beep2()
            return
        }

        var oldestIndex = startDateIndex !== -1 ? startDateIndex : arrayLen - 1; // if valid => startDateIndex means oldest

        var priceInit = YValues[oldestIndex]  // begining price // default oldest
        var price =  priceInit

        var accountVal =  accountValueInit;

        const stockCountInit = accountValueInit *  aggressivePortionInit / price;
        var stockCount = stockCountInit;

        const moneyMarketInit = accountValueInit * (1 -  aggressivePortionInit) // initial moneyMarket 
        var moneyMarket = moneyMarketInit


        //** calc today portion  bubble*/

        //** calc today portion  weekGain */
        if (props.monthGainData.monthGainArray) {
            const weekNumToday = weekOfYearGet (XValues, 0, props.logFlags);
            const weekGainFactorToday = props.monthGainData.weekGainArray[weekNumToday]
            setPortionWeekGain (aggressivePortionInit * weekGainFactorToday)
        }

        //** log initial data */
        const tradeInitInfo = {
            'trade_start_value_$': accountVal.toFixed(2),
            stocksCount: stockCount.toFixed(2),
            'moneyMarket_$': moneyMarket.toFixed(2),
            'price_$': price? price.toFixed(3) : -1,
            'portion': (portionPercent/100).toFixed(2),
            'threshold_%': thresholdPercent,
            'interestRate_%': interestRate,
            'transactionFee_$': transactionFee,
            startWeek: startWeek
        }
        console.log (props.symbol, getDate(), tradeInitInfo); 
          
             
        
        var timeUnitInterest = Math.pow(1 + interestRate / 100, 1/52)
        if (props.daily)
            timeUnitInterest = Math.pow(1 + interestRate / 100, 1/260)
        if (LOG)
            console.log ('weeklyInterest=', timeUnitInterest, 'interest=', interestRate) // on moneyMarket

        const stockGainDuringPeriod = YValues[0] / YValues[oldestIndex]// raw stock gain
        const yearsDiff = yearsDifference (XValues[oldestIndex], XValues[0])
        const stockGainYearly = stockGainDuringPeriod ** (1 / yearsDiff)

        var stockToTrade;
        var buyCount = 0;
        var sellCount = 0;
        var tradeSkipCount = 0;
        var sellSumTotal = 0;
        var buySumTotal = 0;
        // var buyMin;
        // var sellMin;
        var moneyMarketMin = accountValueInit;
        var moneyMarketMax = 0;        
        var portionPriv // updated in loop
        var targetPortion; // user param default, without optimize

        var portionMin = 2; // collect portion min, max
        var portionMax = 0;


        //**  optimize loop from oldest towards latest */
        if (optimizeWeekGain && oldestIndex > props.stockChartXValues.length)
            oldestIndex = props.stockChartXValues.length.lenght - 53 // skip first year


        // trade loop start
        for (let i = oldestIndex; i > 0; i--) {
            portionPriv = targetPortion; //save for log
            targetPortion =  aggressivePortionInit; 
            // try {
                //* monthGain weekGain optimize */
                if (optimizeWeekGain && props.monthGainData.weekGainArray) {
                    targetPortion =  optimizeMonGain_calc (props.stockChartXValues, i, aggressivePortionInit, price)         
                }

                if (bubbleLine && optimizeBubble) {
                    targetPortion =  optimizeBubble_calc (props.stockChartXValues, props.stockChartYValues, i, aggressivePortionInit, price, bubbleLine) 
                }
            const pricePrev = price;
            price = YValues[i] 
        
            if (portionMax < targetPortion)
                portionMax = targetPortion
            if (portionMin > targetPortion)
                portionMin = targetPortion

            const accountValPrev  = accountVal;
            accountVal = price*stockCount + moneyMarket;
            const accountValBeforeTrade = accountVal
            const portionCurrent = price*stockCount / accountVal // actual
            const portionDiff = targetPortion - portionCurrent;  //  recomended - actual 
            var buySell;
            if (tradeFlag && Math.abs(portionDiff) > (thresholdPercent / 100)
                 && Math.abs(portionDiff) > 5 * transactionFee) { // if less than predeined percent do not trade
                //** If up sell */
                stockToTrade = (stockCount * portionDiff);
                const tradeSum = (stockToTrade * price);

                if (portionDiff > 0) {
                    // buy stocks.
                    buySell = 'buy '
                    if (moneyMarket - tradeSum < 0) {
                        console.log (XValues[i], 'error, skipTrade,  tradeSum=', tradeSum.toFixed(2), ' is more than moneyMarket', moneyMarket.toFixed(2), 'targetPortion', targetPortion.toFixed(3))
                        continue;
                    }
                    stockCount += stockToTrade;
                    moneyMarket -= tradeSum;
                    moneyMarket -= transactionFee;
                    buyCount ++
                    buySumTotal += tradeSum;
                }

                else {
                     // sell stocks
                    buySell = 'sell'
                    if ((stockCount + stockToTrade ) < 0) {
                        console.log (XValues[i], 'error, skipTrade, stockToTrade=', stockToTrade.toFioxed(2), 'is more than stockCount=', stockCount, 'targetPortion', targetPortion.toFixed(3))
                        continue;
                    }
                     stockCount += stockToTrade; // negastive or 
                     moneyMarket -= tradeSum;
                     moneyMarket -= transactionFee; // for stocks trade only
                     sellCount ++;
                     sellSumTotal -= tradeSum;
                }

                if (moneyMarket < moneyMarketMin)
                    moneyMarketMin = moneyMarket;
                if (moneyMarket > moneyMarketMax)
                    moneyMarketMax = moneyMarket;

                //** verify transaction does not change account value. */
                accountVal = price*stockCount + moneyMarket;
                if (Math.abs(accountValBeforeTrade - accountVal) >  2*transactionFee + 0.01) {
                    console.log ('accountVal trade diff, before=', accountValBeforeTrade.toFixed(2), ' after=', accountVal.toFixed(2))
                }

                //** log transaction */                   
                var priceDivBubble = -1
                if (optimizeBubble && i < XValues.length && i < bubbleLine.y.length)
                    priceDivBubble = YValues[i] / bubbleLine.y[i]

                //     console.log (props.symbol, 'tradeInfo i=' + i, XValues[i], 'price=' + price.toFixed(2),
                //     //  'portionBefore=' + portionCurrent.toFixed(3),
                //         'price/bubble=' + priceDivBubble.toFixed(2),
                //         'portion=' + Number(targetPortion).toFixed(3),
                //         'accountVal='+ accountVal.toFixed(2),
                //     //  'stockValue=', stockCount * price,
                //     //  'moneyMarkt=', moneyMarket.toFixed(2),
                //     ' ' + buySell, 'tradeSum=' + (stockCount * portionDiff * price).toFixed(2),
                //     'stockCount=' + stockCount.toFixed(2)
                // )


                //** calc weekGain for week */
                var weekGain = -1
                if (optimizeWeekGain) {
                    const weekNum = weekOfYearGet (XValues, i, props.logFlags) 
                    if (weekNum !== -1) //** not found */
                        weekGain = props.monthGainData.weekGainArray[weekNum];  // look forward closer to 0
                }

                const rec = {
                    date:  XValues[i].replace(/-/g,'.'),
                    price:  price.toFixed(2),
                    'price / bubble': priceDivBubble.toFixed(2),
                    weekGain: weekGain.toFixed(4),
                    portion: Number(targetPortion).toFixed(3),
                    'account Value': accountVal.toFixed(2),
                    'buy Sell': buySell,
                    'stocks after': stockCount.toFixed(3),
                    'stocks Traded': stockToTrade.toFixed(3),

                    index: i,
                    // tradeSum: (stockCount * portionDiff * price).toFixed(2),   
                }
                
                // remove non relevant attributes from log
                if (! optimizeBubble)
                    delete rec['price / bubble']
                if (! optimizeWeekGain)
                    delete rec.weekGain

                logRecords[XValues[i]] = rec;
                
            }
            else
            tradeSkipCount ++;

            // //** weekly interest of money market */
            moneyMarket *= timeUnitInterest; 
       
            //** LOG loop start info */
            if (LOG &&  i > YValues.length - startWeek && i < YValues.length - startWeek - 10)
                console.log (props.symbol, 'middle i=', i, 'value=', accountVal.toFixed(2 ), 'count=', stockCount.toFixed(2),
                     'tradeCount=', stockToTrade.toFixed(2), 'price=', price, 'moneyMarket=', moneyMarket.toFixed(2))
        // } catch (e) {
        //     props.errorAdd([props.symbol, 'i=' + i,  XValues[i], 'symulate exception', e.message])
        //     console.log('exception i='+ i + '  %c' + e.message, 'background: #fff; color: #ee3344');
        //     break;
        // }
        } // loopEnd

        setLogRecordsKeys(Object.keys(logRecords))

        const gain =  (accountVal/(priceInit*stockCountInit+moneyMarketInit )).toFixed(2)
        // const yearsDiff = yearsDifference (XValues[oldestIndex], XValues[0])
        const yearlyGainDuringPeriod = gain ** (1/yearsDiff)

        console.log (props.symbol, 'trade end, ', 'acountGain=', gain, 'stockGain=', stockGainDuringPeriod.toFixed(2), 'buyCount=', buyCount, 'sellCount=', sellCount)

        // avoid exceptions when no trade
        // if (! buyMin) 
        //     buyMin = 0;
        // if (! sellMin)
        //     sellMin = 0;
        // // const buyAverage = buyCount === 0 ? 0 : (buySumTotal/buyCount).toFixed(2);
        // const sellAverage = sellCount === 0 ? 0 : (sellSumTotal/sellCount).toFixed(2)


        //** results */         
        setResults (
            {
                priceEnd_$: price.toFixed(2),
                priceInit_$: priceInit,
                // dateStart: XValues[oldestIndex],
                totalWeeksBack: oldestIndex,

                // buyCount: buyCount,
                // buyAverage_$: buyAverage, 
                // buyMin_$: buyMin.toFixed(2),
                // sellCount: sellCount,
                // sellAverage_$: sellAverage,
                // sellMin_$: sellMin.toFixed(2),
                // tradeSkipCount: tradeSkipCount,
                // moneyMarketMin: moneyMarketMin.toFixed(2),
                // moneyMarketMax: moneyMarketMax.toFixed(2),

            })

            if (! resultsArray.extraGain)  // calc gain obove stock
                resultsArray.extraGain = []
            resultsArray.extraGain.push ((gain / stockGainDuringPeriod).toFixed(3)) //** extra gain */


            if (! resultsArray.gainOfAccount)
                resultsArray.gainOfAccount = []
            resultsArray.gainOfAccount.push(gain)

            // if (! resultsArray.yearlyGain)
            //     resultsArray.yearlyGain = [] 
            // resultsArray.yearlyGain.push(yearlyGainDuringPeriod.toFixed(2))


            if (! resultsArray.rawGainOfStock)
                resultsArray.rawGainOfStock = []
            resultsArray.rawGainOfStock.push (stockGainDuringPeriod.toFixed(2))

            // if (! resultsArray.stockGainYearly)
            //     resultsArray.stockGainYearly = []
            // resultsArray.stockGainYearly.push(stockGainYearly.toFixed(2))
  
            // if (! resultsArray.portionMax)
            //     resultsArray.portionMax = [];
            // resultsArray.portionMax.push(portionMax.toFixed(3))

            // if (! resultsArray.portionMin)
            //     resultsArray.portionMin = [];
            // resultsArray.portionMin.push(portionMin.toFixed(3))


            
            //** input params */
            if (! resultsArray.params)
                resultsArray.params = [];
            resultsArray.params.push('====')

            if (! resultsArray.dateStart)
                resultsArray.dateStart = []
            resultsArray.dateStart.push(XValues[oldestIndex]);


            if (! resultsArray.tradeFlag)
                resultsArray.tradeFlag = []
            resultsArray.tradeFlag.push('' + tradeFlag)


            if (! resultsArray.optimizeBubble)
                resultsArray.optimizeBubble = []
            resultsArray.optimizeBubble.push ('' + optimizeBubble)

            if (! resultsArray.optimizeWeekGain)
                resultsArray.optimizeWeekGain = []
            resultsArray.optimizeWeekGain.push ('' + optimizeWeekGain)


            if (! resultsArray.weekGainEnhance)
                resultsArray.weekGainEnhance = [];
            resultsArray.weekGainEnhance.push (weekGainEnhance)

            if (! resultsArray.weekGainAhead)
                resultsArray.weekGainAhead = [];
            resultsArray.weekGainAhead.push (weekGainAhead)


            if (! resultsArray['price_/_bubble_high'])
                resultsArray['price_/_bubble_high'] = [];
            resultsArray['price_/_bubble_high'].push(priceDivBubble_HIGH)

            if (! resultsArray['price_/_bubble_low'])
                resultsArray['price_/_bubble_low'] = [];
            resultsArray['price_/_bubble_low'].push(priceDivBubble_LOW);

            if (eliHome) {
                if (! resultsArray.portion_high)
                    resultsArray.portion_high = [];
                resultsArray.portion_high.push(PORTION_HIGH)
                
                if (! resultsArray.portion_low)
                    resultsArray.portion_low = [];
                resultsArray.portion_low.push(PORTION_LOW);
            }


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


            if (eliHome) {
                if (! resultsArray.startWeek)
                    resultsArray.startWeek = [];
                resultsArray.startWeek.push(startWeek)

                if (! resultsArray.oldestIndex)
                    resultsArray.oldestIndex = [];
                resultsArray.oldestIndex.push(oldestIndex)
                // if (! resultsArray.accountValueEnd_$)
                //     resultsArray.accountValueEnd_$ = []
                // resultsArray.accountValueEnd_$.push(accountVal.toFixed(2))

                // if (! resultsArray.accountValInit_$)
                //     resultsArray.accountValInit_$ = [];
                // resultsArray.accountValInit_$.push(accountValueInit.toFixed(2))

                //** more info */
                if (! resultsArray.info)
                    resultsArray.info = [];
                resultsArray.info.push('====')


                if (! resultsArray.portionMin)
                    resultsArray.portionMin = [];
                resultsArray.portionMin.push(Number(portionMin).toFixed(3))
                
                if (! resultsArray.portionMax)
                    resultsArray.portionMax = [];
                resultsArray.portionMax.push(portionMax.toFixed(3))


                if (! resultsArray.stockCountEnd)
                    resultsArray.stockCountEnd = []
                resultsArray.stockCountEnd.push (stockCount.toFixed(2))

                if (! resultsArray.stockCountInit)
                    resultsArray.stockCountInit = [];
                resultsArray.stockCountInit.push(stockCountInit.toFixed(2))

                if (!resultsArray.moneyMarketEnd_$)
                    resultsArray.moneyMarketEnd_$ = [];
                resultsArray.moneyMarketEnd_$.push(moneyMarket.toFixed(0))

                if (! resultsArray.moneyMarketInit_$)
                    resultsArray.moneyMarketInit_$ = [];
                resultsArray.moneyMarketInit_$.push(moneyMarketInit.toFixed(1))
            }

            if (! resultsArray.buyCount)
                resultsArray.buyCount = [];
            resultsArray.buyCount.push(buyCount);

            if (! resultsArray.sellCount)
                resultsArray.sellCount = []
            resultsArray.sellCount.push(sellCount);

            if (! resultsArray.tradeSkipCount)
                resultsArray.tradeSkipCount = [];
            resultsArray.tradeSkipCount.push(tradeSkipCount)



            // if (! resultsArray.dateStart)
            //     resultsArray.dateStart = []
            // resultsArray.dateStart.push(XValues[oldestIndex])


            // if (! resultsArray.priceEnd_$)
            //     resultsArray.priceEnd_$ = [];
            // resultsArray.priceEnd_$.push( price.toFixed(2))

            // if (!resultsArray.priceInit_$)
            //     resultsArray.priceInit_$ = [];
            // resultsArray.priceInit_$.push(priceInit) 

    }

    const title = 'bubbleLine proximity => portion: buy/sell trigger'
    const chartData =
      [{
        name: title,
        nameSingle: title,
        x: [0, priceDivBubble_LOW, priceDivBubble_HIGH, 1],
        y:  [PORTION_HIGH, PORTION_HIGH, PORTION_LOW, PORTION_LOW],
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'green' },
      
      }]

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

    const ROW_SPACING = {padding: "0px 3px 0px 5px", margin: '0px'}
    //** top, right, bottom, left*/

    //** Prepare logTradeChart */
    const portionArray = [];
    const stocksCount = [];
    const accountValueArray = [];
    const clippedArrayX = []
    const clippedArrayY = []
    for (let i = 0; i < logRecordsKeys.length; i++) {
        clippedArrayX[i] = props.stockChartXValues[i]
        clippedArrayY[i] = props.stockChartYValues[i]
        portionArray[i] = logRecords[logRecordsKeys[i]].portion * 1000;
        stocksCount[i] = logRecords[logRecordsKeys[i]]['stocks after'] * 100;
        accountValueArray[i] = logRecords[logRecordsKeys[i]]['account Value']/10;

    }
    const a = logRecords
    const logTradeChartData =
    [
        {
            name: 'price',
            x: clippedArrayX,
            y: clippedArrayY,
            type: 'scatter',
            mode: 'lines',
        //   marker: { color: 'green' }, 
            line: {
            width: 1 
            }
        },
        {
            name: 'portion',
            x: logRecordsKeys,
            y: portionArray,
            type: 'scatter',
            mode: 'lines',
            //   marker: { color: 'green' }, 
            line: {
                width: 1 
                }
        },
        {
            name: 'accountValue',
            x: logRecordsKeys,
            y: accountValueArray,
            type: 'scatter',
            mode: 'lines',
            //   marker: { color: 'green' }, 
            line: {
                width: 1 
                }
        }
    ]

    return (
        <div style = {{border: '2px solid blue'}} id='deepRecovery_id' >
            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h5 style={{color: 'blue'}}> Simulate-trade &nbsp;  </h5> &nbsp; &nbsp;
              <div>{props.daily? '(daily)' : '(weekly)'}</div>
            </div>
            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> Simulate optimized trade according to distance from bubbleLine </h6>
            <div style={{color: 'red'}}> {err} </div>
            <div> &nbsp;</div>

            {bubbleLine && <div style={{display: 'flex', background: 'antiqueWhite'}}> 
                <div style={{ fontSize:'14px', fontStyle: "italic", fontWeight: "bold"}}>Proximity --- Portion: </div> &nbsp;&nbsp;&nbsp;
                    price / bubblePrice=<div style={{color: 'black', fontSize:'14px', fontStyle: "italic", fontWeight: "bold"}}>{todayPriceDivBubbleLine.toFixed(2)}  </div> &nbsp;&nbsp;
                Calculated portion= <div style={{ fontSize:'14px', fontStyle: "italic", fontWeight: "bold"}}> {portionBubble_calc(todayPriceDivBubbleLine).toFixed(2)} </div>
                <hr/> 
            </div>}


            <div style={{display: 'flex'}}>
                {/* Optimize checkboxes */}
                <input  type="checkbox" checked={tradeFlag}  onChange={() => setTradeFlag (! tradeFlag)} />&nbsp;tradeFlag &nbsp;  
       
                <div style={{display:'flex'}}>
                    {/* <div style={{color:'magenta'}}> Optimize: &nbsp;   </div>  */}

                    </div>
              
                  {/* log checkboxes */}

                { ! isMobile && (optimizeBubble || optimizeWeekGain) && <div><input type="checkbox" checked={logOptimize}  onChange={() => setLogOptimize (! logOptimize)} /> log_optimize &nbsp;</div>}
            </div>  
 
            {! optimizeBubble && ! optimizeWeekGain && <div style = {{display:'flex'}}>
            <hr/> 
                {<div  style={{color: 'green' }}> keep aggressive portion % </div>} &nbsp;&nbsp;&nbsp;
                {<GetInt init={portionPercent} callBack={setPortionPercent} title='' type='Number' pattern="[0-9]+" width = '20%'/>}
            </div>}

            {/* Bubble proximity */}
            <hr/> 
            <div style = {{ backgroundColor: '#FFE4E1'}}>
                {props.gainMap.bubbleLine && <div style = {{display:'flex'}}>
                    <input  type="checkbox" checked={optimizeBubble}  onChange={() => setOptimizeBubble (! optimizeBubble)} /> &nbsp;
                    <div style={{fontSize:'18px', fontStyle: "italic", fontWeight: "bold"}}>Bubble proximity optimize</div>
                </div>}

                {optimizeBubble && <div>
                    {optimizeBubble && <div  style={{color: 'green' }}> &nbsp; Decrease aggressive portion near the bubbleLine (and vice versa)</div>}
                    <div style = {{display:'flex'}}>
                        &nbsp;<GetInt init={priceDivBubble_HIGH} callBack={setPriceDivBubble_HIGH} title='Proximity:   &nbsp; &nbsp; High' type='text' pattern="[\\.0-9]+" width = '25%'/>
                        <GetInt init={priceDivBubble_LOW} callBack={setPriceDivBubble_LOW} title='Low' type='text' pattern="[\\.0-9]+" width = '25%'/> 
                    </div> 
                    <div style = {{display:'flex'}}>
                        &nbsp; <GetInt init={PORTION_HIGH} callBack={set_PORTION_HIGH} title='portion:  &nbsp; &nbsp; High' type='text' pattern="[\.0-9]+" width = '25%'/>
                        <GetInt init={PORTION_LOW} callBack={set_PORTION_LOW} title='Low' type='text' pattern="[\.0-9]+" width = '25%'/>
                    </div>
                </div>}
           
                {/* https://plotly.com/javascript/figure-labels/ */}
                {/* <hr/> */}
                {props.gainMap.bubbleLine && <div><input  type="checkbox" checked={chartShow}  onChange={() => setChartShow (! chartShow)} /> &nbsp; Show-chart&nbsp;</div>}
                <div>&nbsp;</div>
                {chartShow && optimizeBubble && <Plot  data={chartData} layout={{ width: 550, height: 400, title: title, staticPlot: true,
                    xaxis: {title: {text: 'price / bubblePrice'}}, yaxis: {title: {text: 'stock portion'}}}} config={{staticPlot: true, 'modeBarButtonsToRemove': []}}  />}
            </div>

            <hr/> 
            {/* week gain params */}
            <div style = {{backgroundColor: '#AFEEEE'}}>
                {props.monthGainData.monthGainArray && <div style = {{display:'flex'}}>
                    <input  type="checkbox" checked={optimizeWeekGain}  onChange={() => setOptimizeWeekthGain (! optimizeWeekGain)} /> &nbsp;
                    <div style={{fontSize:'18px', fontStyle: "italic", fontWeight: "bold"}}>Week gain optimize</div>
                </div>} 

                {optimizeWeekGain && <div >
                    <div  style = {{display:'flex'}}>
                        <GetInt init={portionPercent} callBack={setPortionPercent} title='aggressive %' type='Number' pattern="[0-9]+" width = '20%'/>
                        &nbsp; <GetInt init={weekGainEnhance} callBack={setWeekGainEnhance} title='Enhance' type='text' pattern="[\.0-9]+" width = '15%'/>
                        <GetInt init={weekGainAhead} callBack={setWeekGainAhead} title='weeksAhead' type='Number' pattern="[0-9]+" width = '20%'/>
                    </div>
                </div>}
            </div>

            <hr/> 

            <div style = {{display:'flex'}}>
                &nbsp; <GetInt init={thresholdPercent} callBack={setThresholdPercent} title='trade-threshold %' type='text' pattern="[\\.0-9]+" width = '15%'/>
                &nbsp; <GetInt init={interestRate} callBack={setInterestRate} title='interest-rate %' type='text' pattern="[0-9]+" width = '15%'/>
            </div>
            <div style = {{display:'flex'}}>
                &nbsp; <GetInt init={transactionFee} callBack={setTransactionFee} title='transaction-fee $' type='text' pattern="[\.0-9]+" width = '15%'/>
                <GetInt init={accountValueInit} callBack={setAccountValue} title='account-value $' type='Number' pattern="[0-9]+" width = '15%'/>               
            </div>

            <div> &nbsp;</div>
             &nbsp;startDate <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} />  &nbsp; &nbsp;
            <div> &nbsp;</div>

            {<button style={{background: 'lightGreen', fontSize: '22px'}} type="button"  onClick={() => {simulateTrade (props.stockChartXValues, props.stockChartYValues)}}> Simulate trade </button>}&nbsp;
            <div> &nbsp;</div>

            {/* Simulation results */}

            {Object.keys(resultsArray).length > 0 && <div> <input type="checkbox" checked={tradeInfoShow}  onChange={() => setTradeInfoShow (! tradeInfoShow)} /> &nbsp;tradeInfoShow &nbsp; </div>}
            {tradeInfoShow && <div style={{maxHeight:'300px', maxWidth:'100%', overflow:'auto'}}>
            <table>
                <thead>

                </thead>
                <tbody>
                    {Object.keys(resultsArray).map((s, s1) =>{
                        return (
                        <tr key={s1} style={{ hei_ght: '10', margin: '0px',  padding: 'dense',}}>
                            <td  style={{padding: '2px', margin: '2px', width: '8px'}}>{s1}</td>   
                            <td style={{padding: '2px', margin: '2px', width: '8px', background: colorfield(resultsArray[s])}}>{s}</td> 
                            {resultsArray[s].map((k,n)=>{
                            return (
                                <td key={n} style={{padding: '2px', margin: '2px'}}> {k} </td>
                            )
                            })
                        }
                        </tr>
                        )
                    })}
                </tbody>
            </table>
            </div>}

            <hr/> 

            {eliHome && results && <div> Last simulation info &nbsp;</div>}
            {eliHome && <pre>{JSON.stringify(results, null, 2)}</pre>}


            {/* Disply trade log */}
            {logRecordsKeys.length > 0 && <div> <input type="checkbox" checked={logTrade}  onChange={() => setLogTrade (! logTrade)} /> &nbsp;trade_log&nbsp; </div>}

            {logTrade && logRecordsKeys.length > 0 && <div  style={{height:'300px', overflow:'auto'}}> 
                <table>
                    <thead>
                        <tr>
                            <th>N</th>
                            {Object.keys(logRecords[logRecordsKeys[0]]).map((h,h1) => {
                                return (
                                    <th key={h1}>{h}</th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {logRecordsKeys.map((s, s1) =>{
                            return (
                            <tr key={s1}>
                                <td style={{padding: '1px', margin: '1px'}}>{s1}</td>
                                {Object.keys(logRecords[s]).map((a,a1) => {
                                    return (
                                        <td key={a1} style={{padding: '1px', margin: '1px'}} >{logRecords[s][a]}</td>
                                    )
                                })}
                            </tr>
                            )
                        })}
                    </tbody>

                </table>
            </div> }

            <hr/> 
            {eliHome && logRecordsKeys.length > 0 && <div> <input type="checkbox" checked={tradeChartShow} onChange={() => setTradeChartShow (! tradeChartShow)} /> &nbsp;trade_chart&nbsp; </div>}

            {logRecordsKeys.length > 0 && tradeChartShow && <Plot  data={logTradeChartData } layout={{ width: 650, height: 400, title: title, staticPlot: true,
                    xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'stocks portion'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}


        </div>
    )
 }

 export default Simulate