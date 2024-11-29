import React, {useState, useEffect} from 'react'
import Plot from 'react-plotly.js';
import GetInt from '../utils/GetInt'
import MobileContext from '../contexts/MobileContext'

function MovingAverage (props) {
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
    
    const [average_long_length, setAverage_long_length] = useState(26)
    const [average_short_length, setAverage_short_length] = useState(12)

    const [average_Y, setAverage_Y] = useState([])
    const [average_short_Y, setAverage_short_Y] = useState([])

    const [chartData, setChartData] = useState()
    const title = 'moving-average'

    useEffect (() => { 
        setChartData()
        // setAveragePointsY([])
        // setAveragePointsX([])
    }, [props.symbol, average_long_length, average_short_length]) 
  


    function calc () {
        //** calc first average  */

        setAverage_Y([])

        var sumForAverage = 0;
        const averageLength_ = Number(average_long_length)
        for (let j = 0; j < averageLength_; j++) {
            sumForAverage += props.stockChartYValues[props.stockChartYValues.length - 1 - j]  // start from oldest
        }

        for (let i = 0; i < props.stockChartXValues.length - averageLength_; i++) {
            const index = props.stockChartXValues.length - 1 - i - averageLength_;
            average_Y[index] = sumForAverage / averageLength_

            // const i_rem = index + averageLength;
            // const i_add = index;

            sumForAverage -= props.stockChartYValues[index + averageLength_]
            sumForAverage += props.stockChartYValues[index]
        }

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
                y: average_Y,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'red' },       
          }]
          setChartData(dat)
    } 


    return (
        <div style={{border:'2px solid blue'}}>

            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h6 style={{color: 'blue'}}> Noving average &nbsp;  </h6> &nbsp; &nbsp;
              <div>{ ! props.weekly? '(daily)' : '(weekly)'}</div>
            </div>
            <div> &nbsp;</div>

            <GetInt init={average_long_length} callBack={setAverage_long_length} title='average-long-length' type='Number' pattern="[0-9]+" width = '15%'/>   
            <GetInt init={average_short_length} callBack={setAverage_short_length} title='average-short-length' type='Number' pattern="[0-9]+" width = '15%'/>   
            
            <div><button style={{background: 'aqua'}} type="button" onClick={()=>calc()}>  calc-chart   </button> </div>

            {chartData && <Plot  data={chartData} layout={{ width: 550, height: 400, title: title,
                xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'price'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}
        </div>
    )
}

export { MovingAverage}