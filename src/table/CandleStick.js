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

  function calc () {
    setErr()
    if (! props.daily) {
      setErr('need daily mode')
      beep2()
      return
    }
    const x = Object.keys (props.chartData)
    // console.log('calc')
    var xClipped = [], high = [], low = [], open = [], close = [];
     //x.length; 
    const candles = []
    for (var i = 0; i < histLength; i++) {
      const candle = {
        open: props.chartData[x[i]]['1. open'],
        high: props.chartData[x[i]]['2. high'],
        low: props.chartData[x[i]]['3. low'],
        close: props.chartData[x[i]]['4. close'],
        date: xClipped[i]
      }
      candles.push(candle)

      xClipped.push(x[i])
      high.push(props.chartData[x[i]]['2. high'])
      low.push(props.chartData[x[i]]['3. low'])
      open.push(props.chartData[x[i]]['1. open'])
      close.push(props.chartData[x[i]]['4. close'])
    }
    console.log ('candles', candles)
    
    // Calculate signals
    let signals = [];
    for (let j = 3; j < candles.length; j++) {
        let prev1 = candles[j - 1];
        let prev2 = candles[j - 2];
        let prev3 = candles[j - 3];
        let curr = candles[j];
        
        // Strong Bullish Signal (Multiple Bullish Candles)
        if (prev3.close > prev3.open && prev2.close > prev2.open && prev1.close > prev1.open && curr.open < curr.close) {
            signals.push({ index: j, signal: 'BUY', reason: 'Three Consecutive Bullish Candles' });
        }
        
        // Strong Bearish Signal (Multiple Bearish Candles)
        if (prev3.close < prev3.open && prev2.close < prev2.open && prev1.close < prev1.open && curr.open > curr.close) {
            signals.push({ index: j, signal: 'SELL', reason: 'Three Consecutive Bearish Candles' });
        }
    }
    console.log ('signals', signals) 

    const dat = [
      {
        x: xClipped,
        close: close,
        // decreasing: { line: { color: 'red' } },
        high: high,
        // increasing: { line: { color: 'green' } },
        low: low,
        open: open,
        type: 'candlestick',
        xaxis: 'x',
        yaxis: 'y'
      }
    ];
    setData(dat)
    if (log)
      console.log ('candleStick data', dat)

  }

  return (
    <div style = {{ border: '2px solid green'}}>
        <h6 style={{color: 'blue'}}>candleStick  &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Under development (Experimental) &nbsp; </h6>
        <div  style={{color: 'magenta' }}>  {props.symbol} </div> 
        {err && <div style={{color:'red'}}>{err}</div>}

        <div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <GetInt init={histLength} callBack={setHistLength} title='historySize' type='Number' pattern="[0-9]+" width = '15%'/>
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