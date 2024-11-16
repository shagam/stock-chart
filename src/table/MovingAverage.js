import React, {useState, useEffect} from 'react'
import GetInt from '../utils/GetInt'


function MovingAverage (props) {

    const [averageLength, setAverageLength] = useState(20)

    const [averagePointsY, setAveragePointsY] = useState([])
    const [averagePointsX, setAveragePointsX] = useState([])

    function calc () {

        //** calc first average  */
        var average = 0;
        for (let j = 0; j < averageLength; j++) {
            average += props.stockChartYValues[props.stockChartYValues.length - 1 - j]  // start from oldest
        }

        for (let i = averageLength; i < props.stockChartXValues.length; i++) {
            const index = props.stockChartXValues.length - i;
            averagePointsY[index] = average / averageLength
            averagePointsX[index] = props.stockChartXValues[index]
            average -= props.stockChartYValues[props.stockChartYValues.length - 1 - index]
            average += props.stockChartYValues[props.stockChartYValues.length - 1 - averageLength - index]
        }
    } 



    return (
        <div style={{border:'2px solid blue'}}>

            <div style = {{display: 'flex'}}>
              <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
              <h6 style={{color: 'blue'}}> Noving average &nbsp;  </h6> &nbsp; &nbsp;
              <div>{ ! props.weekly? '(daily)' : '(weekly)'}</div>
            </div>


            <GetInt init={averageLength} callBack={setAverageLength} title='getCount' type='Number' pattern="[0-9]+" width = '15%'/>   

            <button type="button" onClick={()=>calc()}>  calc   </button> &nbsp;    
            
        </div>
    )
}

export { MovingAverage}