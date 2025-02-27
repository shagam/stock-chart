import React, {useState} from 'react';

import Plot from 'react-plotly.js';
import GetInt from '../utils/GetInt'
import {beep2} from '../utils/ErrorList'
import MobileContext from '../contexts/MobileContext'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

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
  const [data, setData] = useState()
  const [signalsBuy, setSignalsBuy] = useState()
  const [signalsSell, setSignalsSell] = useState()

  const [histLength, setHistLength] = useState(35)
  const [maxHistLength, setMaxHistLength] = useState()
  const [err, setErr] = useState()

  const {isMobile} = MobileContext();

  const [frozen, setFrozen] = useState(true)

  const [buyDates, setBuyDates] = useState([])
  const [sellDates, setSellDates] = useState([])
  // const [yBuy, setYBuy] = useState([])
  const [chartMarkers, setChartMarkers] = useState(false)

  // const [chartData, setChartData] = useState({});  //needed for dropREcovery
  
  // const period = ['TIME_SERIES_INTRADAY', 'TIME_SERIES_DAILY_ADJUSTED']
  const [periodIndex, setPeriodIndex] = useState('2')
  const intervalOptionsNames = ['Monthly', 'Weekly', 'Daily', '60min', '30min', '15min', '5min', '1min']  // adjusted=true
  const indexOptions = ['0','1','2','3','4','5','6','7']
  // const intervalStamp = ["Time Series (Daily)", "Time Series (15min)"]
  


  // const [periodTag, setPeriodTag] = useState('Time Series (Daily)')


  //  outputsize=compact or full
  //  https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo

  // &interval=5min
  function get () {
    var funct = 'TIME_SERIES_INTRADAY'
    var periodTag = 'Time Series (' + intervalOptionsNames[periodIndex] + ')'

    if (periodIndex === '2') {
      funct = 'TIME_SERIES_DAILY_ADJUSTED';
    } 
    if (periodIndex === '1') {
      periodTag = 'Weekly Adjusted Time Series'
      funct = 'TIME_SERIES_WEEKLY_ADJUSTED'
    }
    if (periodIndex === '0') {
      periodTag = 'Monthly Adjusted Time Series'
      funct = 'TIME_SERIES_MONTHLY_ADJUSTED'
    }


    var API_Call = 'https://www.alphavantage.co/query'
    API_Call += '?function=' + funct;
    API_Call += '&symbol=' + props.symbol + '&apikey=' + props.API_KEY
    API_Call += '&outputsize=full' 
    if (periodIndex !== '0')
      API_Call += '&interval=' + intervalOptionsNames[periodIndex]
    var dates = [], high = [], low = [], open = [], close = [];
    if(log)
      console.log ('API_Call', API_Call)

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
          setMaxHistLength(keys.length)
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

            getSignals (candles)

            console.log ('counters', counters) // type of signals
          if (log)
            console.log ('candles', candles)
          if (log_1) {
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

  function getSignals (candles) {
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
          if (log_1)
            console.log (sig)
        }
      }
      {
        const sig  = three_black_crows_sell (candles, i)
        if (sig) {
          signal_sell = sig
          sell_count++
          if (log_1)
            console.log (sig)
        }
      }
      {
        const sig  = hammer_buy (candles, i) 
        if (sig) {
          signal_buy = sig 
          buy_count++
          if (log_1)
            console.log (sig)
        }
      }
      {
        const sig  = bull_engulfing_buy (candles, i)
        if (sig) {
          signal_buy = sig
          buy_count++
          if (log_1)
            console.log (sig)
        }
      }
      {
        const sig  = bear_engulfing_sell (candles, i) 
        if (sig) { 
          signal_sell = sig
          sell_count++
          if (log_1)
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
        console.log (candles[i].date, 'both signals', signal_buy, signal_sell) 
    }
    
    if (log_1)
      console.log ('signals', signals)
    if (log_1)
      console.log ('buyDates', buyDates)
    if (log_1) 
      console.log ('sellDates', sellDates)
  } 



  function prepareChart (close, high, low, open, xClipped) {

    //** find max y for markers */
    var max_y = 0;  // for markers
    for (let i = 0; i < close.length; i++) 
      if (close[i] > max_y) max_y = close[i]

    const MARKER_FACTOR = 1
    var max_y_array = []
    for (let j = 0; j < high.length; j++)
        max_y_array[j] = max_y * MARKER_FACTOR

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
    setData(dat)

      const signBuy = {
      x: buyDates,
      y: max_y_array,
      mode: 'markers',
      marker: {
        color: 'green',
        size: 7,
        symbol: 'triangle-up'
      },
      name: 'Buy'
    }
    setSignalsBuy(signBuy)
    

    // Sell markers
    const signSell =
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
    }
    setSignalsSell(signSell)

  }

  // aatach siunals to display
  function attackBuySell () { 
    if (data.length === 1) {
      data.push(signalsBuy)
      data.push(signalsSell)
      props.refreshByToggleColumns()
      console.log (data)
    }
  }



  return (
    <div style = {{ border: '2px solid green'}}>
        <h6 style={{color: 'blue'}}>candleStick  &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Under development (Experimental) &nbsp; </h6>
        <div  style={{color: 'magenta' }}>  {props.symbol} </div> 
        {err && <div style={{color:'red'}}>{err}</div>}

        <div>  &nbsp; 
          <div style={{display:'flex'}}>
            <GetInt init={histLength} callBack={setHistLength} title='historySize' type='Number' pattern="[0-9]+" width = '20%'/>
            {maxHistLength && <div style={{paddingTop:'9px'}}>&nbsp; &nbsp; max={maxHistLength} </div>}
          </div>

          <div style={{display:'flex'}}>
             <ComboBoxSelect serv={periodIndex} nameList={intervalOptionsNames} setSelect={setPeriodIndex}
                                        title='resolution' options={indexOptions} defaultValue={periodIndex}/> &nbsp; &nbsp; 

            {data && <div><input  type="checkbox" checked={frozen}  onChange={() => setFrozen (! frozen)} /> &nbsp;frozen &nbsp;&nbsp;</div>}
            {props.eliHome && <div><input type="checkbox" checked={log}  onChange={()=> setLog( ! log)}  />  &nbsp;Log &nbsp; &nbsp; </div>}
            {props.eliHome && <div><input type="checkbox" checked={log_1}  onChange={()=> setLog_1( ! log_1)}  />  &nbsp;Log_extra &nbsp; &nbsp; </div>} &nbsp;&nbsp;&nbsp;

            {props.eliHome && <button onClick={() => attackBuySell()}> signals </button>}
          </div>
          <div>&nbsp;</div>

            <button  style={{background: 'aqua'}} onClick={() => get()}> CandleStick get</button>&nbsp;

          </div>          
          {data && <Plot  data={data} layout={{ width: 650, height: 600, title:  'Candlestick Chart ' + props.symbol,
                   xaxis:{title: 'Date'}, yaxis: {title: 'Price'}}} config={{staticPlot: frozen, 'modeBarButtonsToRemove': []}}  />}
                   {/* xaxis-rangeslider-visible=false */}
                   {/* {isMobile && <div>mobile</div>} */}
    </div>
  );
};

  
 
  


 
export { CandlestickChart, }