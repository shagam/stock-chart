import React, {useState, useEffect} from 'react'
// import Picker from 'react-month-picker'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import LogFlags from '../utils/LogFlags'
import GetInt from '../utils/GetInt'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'

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
    const [optimizeBubble, setOptimizeBubble] = useState (false) // (props.gainMap.bubbleLine ? true : false);
    const [optimizeWeekGain, setOptimizeWeekthGain] = useState (false) // (props.monthGainData.monthGainArray ? true : false);

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

    const [portionWeekGain, setPortionWeekGain] = useState (-1);
    const [portionBubbleLine, setPortionBubbleLine] = useState (-1);

    const [weekGainScale, setWeekGainScale] = useState (1.4);
    const [weekGainForward, setWeekGainForward] = useState (2);

    const [results, setResults] =  useState ();

    const [resultsArray, setResultsArray] = useState({})  //** holds all results for display in table */


    const historyLength = props.stockChartXValues.length;

    const LOG = props.logFlags && props.logFlags.includes('simulateTrade');

    useEffect(() => {
        setResults()
        // resultsArray()

    },[props.symbol, accountValueInit, portionPercent, startWeek, thresholdPercent, interestRate, transactionFee]) 
   
    const aggressivePortionInit = portionPercent/100; // between 0 to 1
    var portionMin = aggressivePortionInit;
    var portionMax = aggressivePortionInit;

    //** for optimize radio buttons */
    const toolEnum = {
        None: 'optimize_None',
        BUBBLE_LINE: 'BUBBLE_LINE',
        MONTH_GAIN:  'WEEK_GAIN',
      };

      const [optimizeTool, setOptimizeTool] = useState('optimize_None')
      const onOptionChange = e => {
        const tool = e.target.value;
        setOptimizeTool(tool)
        if (tool === 'BUBBLE_LINE')
            setOptimizeBubble(true)
        else
            setOptimizeBubble(false)
        if (tool === 'WEEK_GAIN')
            setOptimizeWeekthGain(true)
        else
            setOptimizeWeekthGain(false)
        console.log(tool)
      }
    


    function optimizeMonGain_calc (XValues, i, aggressivePortionInit, price) {
       
        var targetPortion =  aggressivePortionInit; 
        const weekNum = weekOfYearGet (XValues, i) 

        // console.log ('optimizeMonthGain', i, props.monthGainData.weekGainArray)
        var weekGainFactor = 1;
        for (let j = 0; j < weekGainForward; j++) {
            const index = (52 + weekNum - j) % 52
            if (index >= 0 && index < props.monthGainData.weekGainArray.length) {
                const weeklyGain = props.monthGainData.weekGainArray[index];  // look forward closer to 0
                weekGainFactor *= Math.pow (weeklyGain, weekGainScale) 
                targetPortion *= weekGainFactor; // higher price prediction => reduce targetPortion
            }
        }

        if (logOptimize)
            console.log (props.symbol, 'weekGain optimize  i=', i, 'date=', XValues[i], 'factor=', weekGainFactor.toFixed(3), 'targetPortion=', targetPortion.toFixed(3), 'price=', price)
        return targetPortion;
    }

    function portionBubble_calc (priceDivBbubblePrice) {
        var targetPortion = -1;
        if (priceDivBbubblePrice <= LEVEL_LOW)  // low level set high portion
            targetPortion = Number(PORTION_HIGH) ;
        else if (priceDivBbubblePrice >= LEVEL_HIGH)  // high level set low portion
            targetPortion = Number(PORTION_LOW);
        else {// interpolate
            targetPortion =  Number(PORTION_HIGH) + (Number(PORTION_HIGH) - Number(PORTION_LOW)) / (LEVEL_LOW - LEVEL_HIGH) * (priceDivBbubblePrice - LEVEL_LOW)
        }
        return targetPortion
    }


    function optimizeBubble_calc (XValues, YValues, i, aggressivePortionInit, price, bubbleLine) {
    


        var targetPortion =  aggressivePortionInit; 
        const symdate =  XValues[i].split('-') // prepare search format [2003,9,12]
        const symVal = YValues[i]; 
        var bubbleIndex = searchDateInArray (bubbleLine.x, symdate, props.symbol, props.logFlags)
        if (bubbleIndex!== -1) {

            //** optimize according to bubbleLine */
            var priceDivBbubblePrice = symVal / (bubbleLine.y[bubbleIndex]);
            if (priceDivBbubblePrice > 1) {
                console.log ('price above bubble')
            }

            targetPortion = portionBubble_calc (priceDivBbubblePrice)

            // save portion min/max
            if (portionMin > targetPortion)
                portionMin = targetPortion
            if (portionMax < targetPortion)
                portionMax = targetPortion

            if (logOptimize)
                console.log(props.symbol, 'bubble optimize', 'i=', i, XValues[i], 'price=', price, 'price/bubble=', priceDivBbubblePrice.toFixed(3),
             'portion=', targetPortion.toFixed(3)) // , 'portionPriv=', portionPriv.toFixed(3)
        }
    }

    //** SIMULATE TRADE */
    function simulateTrade(XValues, YValues) {

        var price = YValues[YValues.length - 1 - startWeek]  // begining price // default oldest
        const priceInit = price

        var accountVal =  accountValueInit;

        const stockCountInit = accountValueInit *  aggressivePortionInit / price;
        var stockCount = stockCountInit;

        const moneyMarketInit = accountValueInit * (1 -  aggressivePortionInit) // initial moneyMarket 
        var moneyMarket = moneyMarketInit
        const bubbleLine = props.gainMap.bubbleLine;


        //** calc today portion  bubble*/
        if (bubbleLine) {
            const portion = YValues[0] / bubbleLine.y[0]
            setPortionBubbleLine (portionBubble_calc(portion))
        }

        //** calc today portion  weekGain */
        if (props.monthGainData) {
            const weekNumToday = weekOfYearGet (XValues, 0);
            const weekGainFactorToday = props.monthGainData.weekGainArray[weekNumToday]
            setPortionWeekGain (aggressivePortionInit * weekGainFactorToday)
        }

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
        var targetPortion; // user param default, without optimize


        //** WEEK GAIN: optimize trade on week gain */
        for (let i = oldestIndex; i > 0; i--) {
            portionPriv = targetPortion; //save for log
            targetPortion =  aggressivePortionInit; 
            try {
                //* monthGain weekGain optimize */
                if (optimizeWeekGain && props.monthGainData.weekGainArray) {
                    targetPortion =  optimizeMonGain_calc (props.stockChartXValues, i, aggressivePortionInit, price)         
                }

                //** optimize bubbleLine */

                //** search date in bubbleLine */

                if (bubbleLine && optimizeBubble) {
                    targetPortion =  optimizeBubble_calc (props.stockChartXValues, props.stockChartYValues, i, aggressivePortionInit, price, bubbleLine) 
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
                    console.log (props.symbol, 'tradeInfo, i=', YValues.length - i, XValues[i], 'portion=', targetPortion.toFixed(3),
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


        //** results */         
        setResults (
            {
                priceEnd_$: price.toFixed(2),
                priceInit_$: priceInit,
                dateStart: XValues[oldestIndex],
                totalWeeksBack: oldestIndex,

                // buyCount: buyCount,
                buyAverage_$: buyAverage, 
                buyMin_$: buyMin.toFixed(2),
                // sellCount: sellCount,
                sellAverage_$: sellAverage,
                sellMin_$: sellMin.toFixed(2),
                // tradeSkipCount: tradeSkipCount,
                // moneyMarketMin: moneyMarketMin.toFixed(2),
                // moneyMarketMax: moneyMarketMax.toFixed(2),

            })

            
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


            if (! resultsArray.optimizeBubble)
                resultsArray.optimizeBubble = []
            resultsArray.optimizeBubble.push ('' + optimizeBubble)

            if (! resultsArray.optimizeWeekGain)
                resultsArray.optimizeWeekGain = []
            resultsArray.optimizeWeekGain.push ('' + optimizeWeekGain)


            if (! resultsArray.weekGainScale)
                resultsArray.weekGainScale = [];
            resultsArray.weekGainScale.push (weekGainScale)

            if (! resultsArray.weekGainForward)
                resultsArray.weekGainForward = [];
            resultsArray.weekGainForward.push (weekGainForward)


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

            
            if (! resultsArray.buyCount)
                resultsArray.buyCount = [];
            resultsArray.buyCount.push(buyCount);

            if (! resultsArray.sellCount)
                resultsArray.sellCount = []
            resultsArray.sellCount.push(sellCount);

            if (! resultsArray.tradeSkipCount)
                resultsArray.tradeSkipCount = [];
            resultsArray.tradeSkipCount.push(tradeSkipCount)



            // if (! resultsArray.priceEnd_$)
            //     resultsArray.priceEnd_$ = [];
            // resultsArray.priceEnd_$.push( price.toFixed(2))

            // if (!resultsArray.priceInit_$)
            //     resultsArray.priceInit_$ = [];
            // resultsArray.priceInit_$.push(priceInit) 

    }

    const title = 'trade_portion: buy/sell function'
    const chartData =
      [{
        name: title,
        nameSingle: title,
        x: [0, LEVEL_LOW, LEVEL_HIGH, 1],
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


    return (
        <div style = {{border: '2px solid blue', width: '750px'}} id='deepRecovery_id' >
            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h5 style={{color: 'blue'}}> Simulate-trade &nbsp;  </h5>
            </div>
 
            <div style={{display: 'flex'}}> <div style={{color: 'black', fontSize:'14px', fontStyle: "italic", fontWeight: "bold"}}>Aggressive-Portion</div> &nbsp;
                defined=<div style={{color: 'black', fontSize:'14px', fontStyle: "italic", fontWeight: "bold"}}>{portionPercent/100}</div> &nbsp; Today calc, &nbsp;
                bubble-proximity-factor=<div style={{color: 'black', fontSize:'14px', fontStyle: "italic", fontWeight: "bold"}}>{portionBubbleLine.toFixed(3)}</div> &nbsp;
                weekGain-factor=<div style={{color: 'black', fontSize:'14px', fontStyle: "italic", fontWeight: "bold"}}>{portionWeekGain.toFixed(3)}</div>  </div>

            <div style={{display: 'flex'}}>
                {/* Optimize checkboxes */}
                <input  type="checkbox" checked={tradeFlag}  onChange={() => setTradeFlag (! tradeFlag)} />&nbsp;tradeFlag &nbsp;  
       
                <div style={{display:'flex', color:'magenta'}}>
                    {/* <div style={{color:'magenta'}}> Optimize: &nbsp;   </div>  */}
                    {<div style={{display:'flex'}}><input style={{marginLeft: '5px'}}  type="radio" name="opt" value='optimize_None' id='2' checked={optimizeTool==='optimize_None'} onChange={onOptionChange}/> 
                        No_optimize </div>}

                    {props.gainMap.bubbleLine && <div style={{display:'flex'}}><input style={{marginLeft: '5px'}}  type="radio" name="opt" value='BUBBLE_LINE' id='0' checked={optimizeTool==='BUBBLE_LINE'} onChange={onOptionChange}/>
                        <div > Bubble_Line  </div> </div>}

                    {props.monthGainData.monthGainArray && <div style={{display:'flex'}}><input style={{marginLeft: '5px'}}  type="radio" name="opt" value='WEEK_GAIN' id='1' checked={optimizeTool==='WEEK_GAIN'} onChange={onOptionChange}/>         
                        <div > Week_Gain   </div> </div>} &nbsp;&nbsp;&nbsp;
                </div>
              
                  {/* log checkboxes */}
                {! props.isMobile && <input type="checkbox" checked={logTrade}  onChange={() => setLogTrade (! logTrade)} />} &nbsp;log_trade&nbsp;  
                {! props.isMobile && (optimizeBubble || optimizeWeekGain) && <div><input  type="checkbox" checked={logOptimize}  onChange={() => setLogOptimize (! logOptimize)} /> log_optimize &nbsp;</div>}
            </div>  
 
            {optimizeBubble && <div  style={{color: 'green' }}> Optimize, decrease aggressive portion when near the bubbleLine (and vice versa)</div>}
            {! optimizeBubble && <div  style={{color: 'green' }}> keep aggressive portion </div>}

            {optimizeBubble && <div style = {{display:'flex'}}>
                &nbsp;<GetInt init={LEVEL_HIGH} callBack={set_LEVEL_HIGH} title='levelHigh' type='text' pattern="[\\.0-9]+" width = '25%'/>
                &nbsp; <GetInt init={LEVEL_LOW} callBack={set_LEVEL_LOW} title='levelLow' type='text' pattern="[\\.0-9]+" width = '25%'/> 
            {/* </div>  
            <div style = {{display:'flex'}}> */}
                &nbsp; <GetInt init={PORTION_HIGH} callBack={set_PORTION_HIGH} title='portionHigh' type='text' pattern="[\.0-9]+" width = '25%'/>
                &nbsp; <GetInt init={PORTION_LOW} callBack={set_PORTION_LOW} title='portionLow' type='text' pattern="[\.0-9]+" width = '25%'/>
            </div>}
            
            {/* week gain params */}
            <div style = {{display:'flex', width: '800px'}}>
                &nbsp; {optimizeWeekGain && <GetInt init={weekGainScale} callBack={setWeekGainScale} title='weekGainScale' type='text' pattern="[\.0-9]+" width = '20%'/>}
                &nbsp; {optimizeWeekGain && <GetInt init={weekGainForward} callBack={setWeekGainForward} title='weekGainForward' type='Number' pattern="[0-9]+" width = '20%'/>}
            </div>

            <div style = {{display:'flex', width: '800px'}}>
                &nbsp; {! optimizeBubble && <GetInt init={portionPercent} callBack={setPortionPercent} title='aggressive %' type='Number' pattern="[0-9]+" width = '15%'/>}
                &nbsp; <GetInt init={accountValueInit} callBack={setAccountValue} title='account-value $' type='Number' pattern="[0-9]+" width = '20%'/>
            </div>

            <div style = {{display:'flex', width: '800px'}}>
                &nbsp; <GetInt init={thresholdPercent} callBack={setThresholdPercent} title='trade-threshold %' type='text' pattern="[\\.0-9]+" width = '15%'/>
                &nbsp; <GetInt init={interestRate} callBack={setInterestRate} title='interest-rate %' type='text' pattern="[0-9]+" width = '15%'/>
            </div>
            <div style = {{display:'flex', width: '800px'}}>
                &nbsp; <GetInt init={transactionFee} callBack={setTransactionFee} title='transaction-fee $' type='text' pattern="[\.0-9]+" width = '15%'/>
                &nbsp; <GetInt init={startWeek} callBack={setStartWeek} title='startWeek' type='Number' pattern="[0-9]+" width = '20%'/>
            </div>
            <div> &nbsp;</div>

            {<button style={{background: 'lightGreen', fontSize: '22px'}} type="button"  onClick={() => {simulateTrade (props.stockChartXValues, props.stockChartYValues)}}> Simulate trade </button>}&nbsp;
            <div> &nbsp;</div>
  
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
            
             {/* https://plotly.com/javascript/figure-labels/ */}

            {optimizeBubble && <Plot  data={chartData} layout={{ width: 650, height: 400, title: title, staticPlot: true,
                 xaxis: {title: {text: 'price / bubblePrice'}}, yaxis: {title: {text: 'stock portion'}}}} config={{staticPlot: true, 'modeBarButtonsToRemove': []}}  />}

        </div>
    )
 }

 export default Simulate