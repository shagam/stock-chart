import React, {useState, useEffect} from 'react'
import Plot from 'react-plotly.js';
import GetInt from '../utils/GetInt'
import MobileContext from '../contexts/MobileContext'

function MovingAverage (props) {
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
    
    const [average_long_length, setAverage_long_length] = useState(26)
    const [average_short_length, setAverage_short_length] = useState(12)

    const [average_long_Y, setAverage_long_Y] = useState([])
    const [average_short_Y, setAverage_short_Y] = useState([])

    const [chartData, setChartData] = useState()


    useEffect (() => { 
        setChartData()
        // setAveragePointsY([])
        // setAveragePointsX([])
    }, [props.symbol, average_long_length, average_short_length, props.daily]) 
  

    function calc_one_average(len, average_Y) {
        var sum = 0;
        for (let j = 0; j < len; j++) {
            sum += props.stockChartYValues[props.stockChartYValues.length - 1 - j]  // start from oldest
        }

        for (let i = 0; i < props.stockChartXValues.length - len; i++) {
            const index = props.stockChartXValues.length - 1 - i - len;
            average_Y[index] = sum / len
            sum -= props.stockChartYValues[index + len]
            sum += props.stockChartYValues[index]
        }
    }
    
    
    
    
    function calc () {
        //** calc first average  */

        // setAverage_long_Y([])

        // var sumForAverageLong = 0;
        // const average_long_length_ = Number(len)
        // for (let j = 0; j < average_long_length_; j++) {
        //     sumForAverageLong += props.stockChartYValues[props.stockChartYValues.length - 1 - j]  // start from oldest
        // }

        // for (let i = 0; i < props.stockChartXValues.length - average_long_length_; i++) {
        //     const index = props.stockChartXValues.length - 1 - i - average_long_length_;
        //     average_long_Y[index] = sumForAverageLong / average_long_length_
        //     sumForAverageLong -= props.stockChartYValues[index + average_long_length_]
        //     sumForAverageLong += props.stockChartYValues[index]
        // }
        setAverage_long_Y([])
        calc_one_average(average_long_length, average_long_Y) 
        setAverage_short_Y([])
        calc_one_average(average_short_length, average_short_Y) 

        
        const dat =
          [
            {
                name: props.symbol,
                x: props.stockChartXValues,
                y: props.stockChartYValues,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'green' },           
            },
            {
                name: 'average_' + average_long_length,
                x: props.stockChartXValues,
                y: average_long_Y,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'red' },       
            },
            {
                name: 'average_' + average_short_length,
                x: props.stockChartXValues,
                y: average_short_Y,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'blue' },       
            },
        
        ]
          setChartData(dat)
    } 


    return (
        <div style={{border:'2px solid blue'}}>

            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h6 style={{color: 'blue'}}> Noving average &nbsp;  </h6> &nbsp; &nbsp;
              <div>{ props.daily? '(daily)' : '(weekly)'}</div>
            </div>
            <div> &nbsp;</div>

            <GetInt init={average_long_length} callBack={setAverage_long_length} title='average-long-length' type='Number' pattern="[0-9]+" width = '15%'/>   
            <GetInt init={average_short_length} callBack={setAverage_short_length} title='average-short-length' type='Number' pattern="[0-9]+" width = '15%'/>   
            
            <div><button style={{background: 'aqua'}} type="button" onClick={()=>calc()}>  calc-chart   </button> </div>

            {chartData && <Plot  data={chartData} layout={{ width: 550, height: 400, title: 'moving-average',
                xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'price'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}
        </div>
    )
}

export { MovingAverage}