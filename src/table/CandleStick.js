import React, {useState} from 'react';

import Plot from 'react-plotly.js';
import GetInt from '../utils/GetInt'
import {beep2} from '../utils/ErrorList'

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
  const [err,setErr] = useState()


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
    for (var i = 0; i < histLength; i++) {
      xClipped.push(x[i])
      high.push(props.chartData[x[i]]['2. high'])
      low.push(props.chartData[x[i]]['3. low'])
      open.push(props.chartData[x[i]]['1. open'])
      close.push(props.chartData[x[i]]['4. close'])
    }


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
    if (log)
      console.log ('candleStick data', dat)

  }


  return (
    <div style = {{ border: '2px solid green'}}>
        <h6 style={{color: 'blue'}}>candleStick  &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Under development &nbsp; </h6>
        <div  style={{color: 'magenta' }}>  {props.symbol} </div> 
        {err && <div style={{color:'red'}}>{err}</div>}

        <div>
          <GetInt init={histLength} callBack={setHistLength} title='historySize' type='Number' pattern="[0-9]+" width = '15%'/>
          {props.eliHome && <div><input type="checkbox" checked={log}  onChange={()=> setLog( !log)}  />  &nbsp;Log &nbsp; &nbsp; </div>}
          <div>&nbsp;</div>
          <button  style={{background: 'aqua'}} onClick={() => calc()}> CandleStick calc</button>&nbsp;

          {data && <Plot data={data}
            layout={{ title: 'Candlestick Chart ' + props.symbol, xaxis: { title: 'Date' }, yaxis: { title: 'Price' } }}
          />}
        </div>
    </div>
  );
};

export { CandlestickChart, CandleStick}