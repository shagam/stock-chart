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

//* react-financial-charts copilot
const CandleStick = ({ data, width, height }) => {
    // const xAccessor = d => d.date;
    // const xExtents = [xAccessor(data[data.length - 1]), xAccessor(data[0])];

    // return (
    //     <ChartCanvas
    //         height={height}
    //         width={width}
    //         ratio={1}
    //         margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
    //         type="svg"
    //         seriesName="MSFT"
    //         data={data}
    //         xScale={scaleTime()}
    //         xAccessor={xAccessor}
    //         xExtents={xExtents}
    //     >
    //         <Chart id={1} yExtents={d => [d.high, d.low]}>
    //             <XAxis axisAt="bottom" orient="bottom" ticks={6} />
    //             <YAxis axisAt="left" orient="left" ticks={5} />
    //             <CandlestickSeries width={timeIntervalBarWidth(utcDay)} />
    //         </Chart>
    //     </ChartCanvas>
    // );
};


//* chatgpt 3

const CandlestickChart = (props) => {
  const [log, setLog] = useState(false)
  const [data, setData] = useState(null)
  const [histLength, setHistLength] = useState(35)
  const [err, setErr] = useState()

  const {isMobile} = MobileContext();

  const [static_, setStatic] = useState(true)

  const [buyDates, setBuyDates] = useState([])
  const [sellDates, setSellDates] = useState([])

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

  
  function three_white_soldiers_buy (candles, i) {
    // Strong Bullish Signal (Multiple Bullish Candles)
    const sig = (candles[i+3].close > candles[i+3].open && candles[i+2].close > candles[i+2].open && candles[i+3].close > candles[i+3].open && candles[i].close > candles[i].open ) 
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
    const sig = candles[i+3].close < candles[i+3].open && candles[i+2].close < candles[i+2].open && candles[i+3].close < candles[i+3].open && candles[i].close < candles[i].open 
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

      high.push(props.chartData[x[i]]['2. high'])
      low.push(props.chartData[x[i]]['3. low'])
      open.push(props.chartData[x[i]]['1. open'])
      close.push(props.chartData[x[i]]['4. close'])
    }
    if (log)
      console.log ('candles', candles)
 

    const signals = {}

    for (let i = 0 ; i < histLength-3; i++)  { 
      var signal = null
      if (!signal)
         signal = three_white_soldiers_buy (candles, i)
      if (!signal)
         signal = three_black_crows_sell (candles, i)
      if (!signal)
         signal = hammer_buy (candles, i)  
      if (!signal)
         signal = bull_engulfing_buy (candles, i)
      if (!signal)
         signal = bear_engulfing_sell (candles, i)  

      if (signal){
        signals[candles[i].date] = signal 
        // if (log) console.log ('signal', signal)
      }
    }
    if (log)
       console.log ('signals', signals)
    if (log)
      console.log ('buyDates', buyDates)
    if (log) 
      console.log ('sellDates', sellDates)

    console.log ('counters', counters) // type of signals 


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
      }
    ];
    setData(dat)
    // if (log)
    //   console.log ('candleStick data', dat)

  }

  return (
    <div style = {{ border: '2px solid green'}}>
        <h6 style={{color: 'blue'}}>candleStick  &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Under development (Experimental) &nbsp; </h6>
        <div  style={{color: 'magenta' }}>  {props.symbol} </div> 
        {err && <div style={{color:'red'}}>{err}</div>}

        <div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <GetInt init={histLength} callBack={setHistLength} title='historySize' type='Number' pattern="[0-9]+" width = '25%'/>
            {props.eliHome && <div><input type="checkbox" checked={log}  onChange={()=> setLog( ! log)}  />  &nbsp;Log &nbsp; &nbsp; </div>}
            <input  type="checkbox" checked={static_}  onChange={() => setStatic (! static_)} />static &nbsp;&nbsp;
          </div>
          <div>&nbsp;</div>
          <button  style={{background: 'aqua'}} onClick={() => calc()}> CandleStick calc</button>&nbsp;

          </div>          
          {data && <Plot  data={data} layout={{ width: 650, height: 400, title:  'Candlestick Chart ' + props.symbol,
                   xaxis:{title: 'Date'}, yaxis: {title: 'Price'}}} config={{staticPlot: static_, 'modeBarButtonsToRemove': []}}  />}
                   {/* xaxis-rangeslider-visible=false */}
                   {/* {isMobile && <div>mobile</div>} */}
    </div>
  );
};

  
  const CandlestickChart_1 = () => {
    const data = [
      {
        x: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04'],
        close: [120, 130, 125, 140],
        decreasing: { line: { color: 'red' } },
        high: [125, 135, 130, 145],
        increasing: { line: { color: 'green' } },
        low: [115, 125, 120, 135],
        open: [118, 128, 123, 138],
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
      },
      // Buy markers
      {
        x: ['2023-01-02'],
        y: [130],
        mode: 'markers',
        marker: {
          color: 'green',
          size: 10,
          symbol: 'triangle-up'
        },
        name: 'Buy'
      },
      // Sell markers
      {
        x: ['2023-01-04'],
        y: [140],
        mode: 'markers',
        marker: {
          color: 'red',
          size: 10,
          symbol: 'triangle-down'
        },
        name: 'Sell'
      }
    ];
  
    return (
      <Plot
        data={data}
        layout={{
          title: 'Candlestick Chart with Buy/Sell Markers',
          xaxis: { title: 'Date' },
          yaxis: { title: 'Price' }
        }}
      />
    );
  };
  
  


 
export { CandlestickChart, CandlestickChart_1}