import React, {useState} from 'react';

import Plot from 'react-plotly.js';
import GetInt from '../utils/GetInt'
import {beep2} from '../utils/ErrorList'
import MobileContext from '../contexts/MobileContext'

// import yfinance from 'yahoo-finance2'
// const df = yfinance.download('AAPL', '2021-01-01', '2021-12-31')
// console.log (df)

// import { CandlestickSeries } from 'react-financial-charts';
// import { ChartCanvas, Chart } from 'react-financial-charts';
// import { XAxis, YAxis } from 'react-financial-charts';
// import { timeIntervalBarWidth } from 'react-financial-charts';
// import { scaleTime } from 'd3-scale';
// import { utcDay } from 'd3-time';
// import { format } from 'd3-format';
// import { timeFormat } from 'd3-time-format';




//* chatgpt 3

const CandlestickChart = (props) => {
  const [log, setLog] = useState(false)
  const [log_1, setLog_1] = useState(false)
  const [data, setData] = useState(null)
  const [histLength, setHistLength] = useState(35)
  const [err, setErr] = useState()

  const {isMobile} = MobileContext();

  const [static_, setStatic] = useState(true)

  const [buyDates, setBuyDates] = useState([])
  const [sellDates, setSellDates] = useState([])
  const [yBuy, setYBuy] = useState([])
  const [chartMarkers, setChartMarkers] = useState(false)

  const [chartData, setChartData] = useState({});  //needed for dropREcovery
  
  // const period = ['TIME_SERIES_INTRADAY', 'TIME_SERIES_DAILY_ADJUSTED']
  const periodIndex = 0
  const intervalOPtions = ['Daily', '1min', '5min', '15min', '30min', '60min']  // adjusted=true
  const intervalStamp = ["Time Series (Daily)", "Time Series (15min)"]



  // const [periodTag, setPeriodTag] = useState('Time Series (Daily)')


  //  outputsize=compact or full
  //  https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo

  // &interval=5min
  function get () {

    var periodTag = 'Time Series (' + intervalOPtions[periodIndex] + ')'
    
    var funct = 'TIME_SERIES_INTRADAY'
    if (periodIndex === 0) 
      funct = 'TIME_SERIES_DAILY_ADJUSTED';


    var API_Call = 'https://www.alphavantage.co/query'
    API_Call += '?function=' + funct;
    API_Call += '&symbol=' + props.symbol + '&apikey=' + props.API_KEY
    API_Call += '&outputsize=full' 
    if (periodIndex !== 0)
      API_Call += '&interval=' + intervalOPtions[periodIndex]
    var dates = [], high = [], low = [], open = [], close = [];

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
            props.errorAdd([props.symbol, 'Invalid symbol, or fail to fetch historical data'])
            // alert (`Invalid symbol: (${sym})`)
            return;
          }
   
          const keys = Object.keys(chartData[`${periodTag}`])
          if(log)
            console.log ('chartData', keys.length, chartData)
          var candles = []

          var i= 0;
          for (var key in chartData[`${periodTag}`]) {
            if (i >= histLength) break;
            // const period_ = chartData[`${periodTag}`][key]
            // console.log (key, chartData[`${periodTag}`][key])
            const candle = {
              open: chartData[periodTag][key]['1. open'],
              high: chartData[periodTag][key]['2. high'],
              low: chartData[periodTag][key]['3. low'],
              close: chartData[periodTag][key]['4. close'],
              date: key
            }
            high.push(candle.high)
            low.push(candle.low)
            open.push(candle.open)
            close.push(candle.close)
            dates.push(key)

            candles.push (candle)
            i++;
          } 

          if (chartMarkers)
            for (var k = 0; k < histLength - 3; k++) { 
              if (k >= histLength) break;
              getSignal (candles, k)
            }
      
          console.log ('counters', counters) // type of signals
          if (log) {
            console.log ('candles', candles)
            console.log ('high', high)
            console.log ('low', low)
            console.log ('open', open)
            console.log ('close', close)
          }
          // setChartData(chartData[periodTag]);

          prepareChart (close, high, low, open, dates)

        })
        // .catch((error) => {console.log(error.message) })
  }



  var counters = {bear_3: 0, bull_3: 0, hammer_buy: 0, bear_engulfing: 0, bull_engulfing: 0} //* count signal types

  function bull_engulfing_buy (candles, i) {
    const sig =
      candles[i].open < candles[i+1].close &&  // bear
      candles[i+1].open < candles[i].close   // bull 
    if (sig) {
      counters.bull_engulfing += 1
      buyDates.push(candles[i].date)

      return { index: i, signal: 'BUY', reason: 'Bullish Engulfing Pattern (Buy Signal)' };
    }
    else return null
  }

  function bear_engulfing_sell (candles, i) {
    const sig =
      candles[i].open > candles[i+1].close  &&  // bear
      candles[i].close < candles[i+1].open   // bear
    if (sig) {
      counters.bear_engulfing += 1
      sellDates.push(candles[i].date )

      return { index: i, signal:  'SELL', reason: 'Bearish Engulfing Pattern (Sell Signal)' };
    }
    return null
  }

  const THRESHOLD = 1.0075
  function three_white_soldiers_buy (candles, i) {
    if ( ! candles[i].close) {
      console.log ('candles[i].close not found', i)
      return null
    }
    // Strong Bullish Signal (Multiple Bullish Candles)
    const sig = (/*candles[i+3].close / candles[i+3].open > THRESHOLD && */ candles[i+2].close / candles[i+2].open > THRESHOLD &&
       /*candles[i+1].close / candles[i+1].open > THRESHOLD &&*/ candles[i].close / candles[i].open > THRESHOLD ) 
    if (sig) {
      counters.bull_3 += 1
      buyDates.push(candles[i].date)
      return { index: i, signal: 'BUY', reason: 'Three Consecutive Bullish Candles' };
    }
    return null
  }


  //** check for signals */

  function three_black_crows_sell (candles, i) {
    // // Strong Bearish Signal (Multiple Bearish Candles)
    const sig = /*candles[i+3].close / candles[i+3].open < 1/THRESHOLD && */ candles[i+2].close / candles[i+2].open < 1/THRESHOLD &&
     candles[i+1].close / candles[i+1].open < 1/THRESHOLD && candles[i].close / candles[i].open < 1/THRESHOLD
    if (sig) {
      counters.bear_3 += 1
      sellDates.push(candles[i].date) 
      return { index: i, signal: 'SELL', reason: 'Three Consecutive Bearish Candles' };
    }
    return null
  }

  function hammer_buy (candles, i) {
    // if (!candles || ! candles[i+1]) {
    //   console.log (' candles or candles[i] not found', i)
    //   return null 
    // } 
    // Candle body is small: 
    const sig =  Math.abs(candles[i].close - candles[i].open) < (candles[i].high - candles[i].low) * 0.3
    const sig1 = Math.min(candles[i].open, candles[i].close) - candles[i].low > (candles[i].high - candles[i].low) * 0.7
    //  Upper shadow is small or nonexistent.
    if(sig && sig1) {
      counters.hammer_buy += 1
      buyDates.push(candles[i].date)
      return { index: i, signal: 'BUY', reason: 'Hammer Pattern (Buy Signal)' };
    }
    else return null
  }

  function getSignal (candles, i) {
    const signals = {}
    var buy_count = 0, sell_count= 0

    while (buyDates.length > 0) buyDates.pop()
    while (sellDates.length > 0) sellDates.pop()
    for (let i = 0 ; i < histLength-3; i++)  { 
      var signal_buy = null
      var signal_sell = null
      {
        const sig = three_white_soldiers_buy (candles, i)
        if (sig) {
          signal_buy = sig
          buy_count++;
          if (log)
            console.log (sig)
        }
      }
      {
        const sig  = three_black_crows_sell (candles, i)
        if (sig) {
          signal_sell = sig
          sell_count++
          if (log)
            console.log (sig)
        }
      }
      {
        const sig  = hammer_buy (candles, i) 
        if (sig) {
          signal_buy = sig 
          buy_count++
          if (log)
            console.log (sig)
        }
      }
      {
        const sig  = bull_engulfing_buy (candles, i)
        if (sig) {
          signal_buy = sig
          buy_count++
          if (log)
            console.log (sig)
        }
      }
      {
        const sig  = bear_engulfing_sell (candles, i) 
        if (sig) { 
          signal_sell = sig
          sell_count++
          if (log)
            console.log (sig)
        }
      }

      if (signal_buy && ! signal_sell) {
        signals[candles[i].date] = signal_buy 
      }
      if (! signal_buy && signal_sell) {
        signals[candles[i].date] = signal_sell 
      }
      if (signal_buy && signal_sell)
        console.log ('both signals', signal_buy, signal_sell) 
    }
    
    if (log_1)
      console.log ('signals', signals)
    if (log_1)
      console.log ('buyDates', buyDates)
    if (log_1) 
      console.log ('sellDates', sellDates)
  } 



  function calc () {
    setErr()
    if (! props.daily) {
      setErr('need daily mode')
      beep2()
      return
    }
    const x = Object.keys (props.chartData)
    if (histLength >= x.length) {
      setErr('historySize >= data length')
      return
    }

    while (buyDates.length > 0) buyDates.pop()
    while (sellDates.length > 0) sellDates.pop()

    // console.log('calc')
    var xClipped = [], high = [], low = [], open = [], close = [];
     //x.length; 
    const candles = []
    for (var i = 0; i < histLength; i++) {
      xClipped.push(x[i])
      const candle = {
        open: props.chartData[x[i]]['1. open'],
        high: props.chartData[x[i]]['2. high'],
        low: props.chartData[x[i]]['3. low'],
        close: props.chartData[x[i]]['4. close'],
        date: xClipped[i]
      }
      candles.push(candle)

      high.push(candle.high)
      low.push(candle.low)
      open.push(candle.open)
      close.push(candle.close)
    }
    if (log)
      console.log ('candles', candles)
 
    for (var j = 0; j < histLength - 3; j++) { 
      getSignal (candles, j)
    }

   
    console.log ('counters', counters) // type of signals
  

    prepareChart (close, high, low, open, xClipped)
  }

  function prepareChart (close, high, low, open, xClipped) {

    //** find max y for markers */
    var max_y = 0;  // for markers
    for (var i = 0; i < close.length; i++) 
      if (close[i] > max_y) max_y = close[i]

    const MARKER_FACTOR = 1
    var max_y_array = []
    for (var i = 0; i < high.length; i++)
        max_y_array[i] = max_y * MARKER_FACTOR

    const dat = [
        {
        x: xClipped,
        close: close,
        decreasing: { line: { color: 'red' } },
        high: high,
        increasing: { line: { color: 'green' } },
        low: low,
        open: open,
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
      },      
    ];

    if (chartMarkers)
      dat.push ({
      x: buyDates,
      y: max_y_array,
      mode: 'markers',
      marker: {
        color: 'green',
        size: 7,
        symbol: 'triangle-up'
      },
      name: 'Buy'
    })
    
    if (chartMarkers)
      dat.push (
    // Sell markers
    {
      x: sellDates,
      y:  max_y_array,
      mode: 'markers',
      marker: {
        color: 'red',
        size: 7,
        symbol: 'triangle-down'
      },
      name: 'Sell'
    })

    setData(dat)
  }

    // if (log)
    //   console.log ('candleStick data', dat)

  

  return (
    <div style = {{ border: '2px solid green'}}>
        <h6 style={{color: 'blue'}}>candleStick  &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Under development (Experimental) &nbsp; </h6>
        <div  style={{color: 'magenta' }}>  {props.symbol} </div> 
        {err && <div style={{color:'red'}}>{err}</div>}

        <div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <GetInt init={histLength} callBack={setHistLength} title='historySize' type='Number' pattern="[0-9]+" width = '20%'/>
            {props.eliHome && <div><input type="checkbox" checked={log}  onChange={()=> setLog( ! log)}  />  &nbsp;Log &nbsp; &nbsp; </div>}
            {props.eliHome && <div><input type="checkbox" checked={log_1}  onChange={()=> setLog_1( ! log_1)}  />  &nbsp;Log_extra &nbsp; &nbsp; </div>}
            <input  type="checkbox" checked={static_}  onChange={() => setStatic (! static_)} />static &nbsp;&nbsp;
            <input  type="checkbox" checked={chartMarkers}  onChange={() => setChartMarkers (! chartMarkers)} />chartMarkers &nbsp;&nbsp;
          </div>
          <div>&nbsp;</div>
          <button  style={{background: 'aqua'}} onClick={() => calc()}> CandleStick calc</button>&nbsp; &nbsp;
          <button  style={{background: 'aqua'}} onClick={() => get()}> CandleStick get</button>&nbsp;

          </div>          
          {data && <Plot  data={data} layout={{ width: 650, height: 600, title:  'Candlestick Chart ' + props.symbol,
                   xaxis:{title: 'Date'}, yaxis: {title: 'Price'}}} config={{staticPlot: static_, 'modeBarButtonsToRemove': []}}  />}
                   {/* xaxis-rangeslider-visible=false */}
                   {/* {isMobile && <div>mobile</div>} */}
    </div>
  );
};

  
 
  


 
export { CandlestickChart, }