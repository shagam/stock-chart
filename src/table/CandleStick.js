import React from 'react';

import Plot from 'react-plotly.js';

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
  console.log (props.chartData)

  var data;
  function calc () {
    const x = Object.keys (props.chartData)
    console.log('calc')
    var high = [], low = [], open = [], close = [];
    for (var i = 0; i < x.length; i++) {
      high.push(props.chartData[x[i]].high)
      low.push(props.chartData[x[i]].low)
      open.push(props.chartData[x[i]].open)
      close.push(props.chartData[x[i]].close)
    }
    

    data = [
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
      }
    ];

  }


  return (
    <div style = {{ border: '2px solid green'}}>
        <h6 style={{color: 'blue'}}>candelStick  &nbsp;  </h6>
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Under development &nbsp; </h6>

        <div  style={{color: 'magenta' }}>  {props.symbol} </div>  &nbsp;  &nbsp; 

        {props.eliHome && <div>
          <button onClick={() => calc()}> CandelStick calc</button>&nbsp;

          {data && <Plot data={data}
            layout={{ title: 'Candlestick Chart', xaxis: { title: 'Date' }, yaxis: { title: 'Price' } }}
          />}
        </div>}
    </div>
  );
};

export { CandlestickChart, CandleStick}