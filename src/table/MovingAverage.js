import React, {useState, useEffect} from 'react'
import Plot from 'react-plotly.js';
import GetInt from '../utils/GetInt'
import MobileContext from '../contexts/MobileContext'

function MovingAverage (props) {
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
    const [averageLength, setAverageLength] = useState(30)

    const [averagePointsY, setAveragePointsY] = useState([])
    const [averagePointsX, setAveragePointsX] = useState([])
    
    const [chartData, setChartData] = useState()
    const title = 'moving-average'

    useEffect (() => { 
        setChartData()
        // setAveragePointsY([])
        // setAveragePointsX([])
    }, [props.symbol, averageLength]) 
  


    function calc () {
        //** calc first average  */

        setAveragePointsY([])
        setAveragePointsX([])

        var sumForAverage = 0;
        const averageLength_ = Number(averageLength)
        for (let j = 0; j < averageLength_; j++) {
            sumForAverage += props.stockChartYValues[props.stockChartYValues.length - 1 - j]  // start from oldest
        }

        for (let i = 0; i < props.stockChartXValues.length - averageLength_; i++) {
            const index = props.stockChartXValues.length - 1 - i - averageLength_;
            averagePointsY[index] = sumForAverage / averageLength_
            averagePointsX[index] = props.stockChartXValues[index]

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
                name: 'mov_aver',
                x: averagePointsX,
                y: averagePointsY,
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
            <button type="button" onClick={()=>calc()}>  calc-chart   </button> 

            <GetInt init={averageLength} callBack={setAverageLength} title='average-length' type='Number' pattern="[0-9]+" width = '15%'/>   
    
            {chartData && <Plot  data={chartData} layout={{ width: 550, height: 400, title: title,
                xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'price'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}
        </div>
    )
}

export { MovingAverage}