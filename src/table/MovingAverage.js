import React, {useState, useEffect} from 'react'
import Plot from 'react-plotly.js';
import GetInt from '../utils/GetInt'
import DatePicker, {moment} from 'react-datepicker';
import {searchDateInArray} from '../utils/Date'
import MobileContext from '../contexts/MobileContext'

function MovingAverage (props) {
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
    
    const [average_long_length, setAverage_long_length] = useState(26)
    const [average_short_length, setAverage_short_length] = useState(12)

    const [average_long_Y, setAverage_long_Y] = useState([])
    const [average_short_Y, setAverage_short_Y] = useState([])
    const [startDate, setStartDate] = useState(new Date(2021, 8, 1 )); 
    const [err, setErr] = useState();

    const [chartData, setChartData] = useState()


    const startYear = startDate.getFullYear();
    const startMon = startDate.getMonth();
    const startDay = startDate.getDate();
    


    useEffect (() => { 
        setChartData()
        // setAveragePointsY([])
        // setAveragePointsX([])
    }, [props.symbol, average_long_length, average_short_length, props.daily]) 
  

    function calc_one_average(len, average_Y, startDateIndex) {
        var sum = 0;
        for (let j = 0; j < len; j++) {
            sum += props.stockChartYValues[startDateIndex - 1 - j]  // start from oldest
        }

        for (let i = 0; i < startDateIndex - len; i++, i < startDateIndex) {
            const index = startDateIndex - 1 - i - len;
            average_Y[index] = sum / len
            sum -= props.stockChartYValues[index + len]
            sum += props.stockChartYValues[index]
        }
    }
    
    
    
    
    function calc () {


        var startDateIndex = searchDateInArray (props.stockChartXValues, [startYear, startMon, startDay], props.symbol, props.logFlags, setErr)  
        if (startDateIndex < 0) {
            setErr('invalid startDate')
            return;
        }
        var dateArray_x = [];
        var priceArray_y = []
        for  (let i = 0; i < startDateIndex; i++) {
            dateArray_x[i] = props.stockChartXValues[i] // copy x_array (dates)
            priceArray_y[i] = props.stockChartYValues[i] 
        }


        //** calc averages (long, short)  */
        setAverage_long_Y([])
        calc_one_average(average_long_length, average_long_Y, startDateIndex) 
        setAverage_short_Y([])
        calc_one_average(average_short_length, average_short_Y, startDateIndex) 



        const dat =
          [
            {
                name: props.symbol,
                x: dateArray_x,
                y: priceArray_y,
                type: 'scatter',
                mode: 'lines', 
                line: {color: 'green', width: 1 }           
            },
            {
                name: 'average_' + average_long_length,
                x: dateArray_x,
                y: average_long_Y,
                type: 'scatter',
                mode: 'lines',
                line: { color: 'red', width: 1 },       
            },
            {
                name: 'average_' + average_short_length,
                x: props.stockChartXValues,
                y: average_short_Y,
                type: 'scatter',
                mode: 'lines',
                line: { color: 'blue', width: 1 },       
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
            <div style={{color: 'red'}}>{err}</div>

            <GetInt init={average_long_length} callBack={setAverage_long_length} title='average-long-length' type='Number' pattern="[0-9]+" width = '15%'/>   
            <GetInt init={average_short_length} callBack={setAverage_short_length} title='average-short-length' type='Number' pattern="[0-9]+" width = '15%'/> 
            <div> &nbsp;</div>
            &nbsp;Start-date <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> 
            <div> &nbsp;</div>
            <div><button style={{background: 'aqua'}} type="button" onClick={()=>calc()}>  calc-chart   </button> </div>

            {chartData && <Plot  data={chartData} layout={{ width: 550, height: 400, title: 'moving-average',
                xaxis: {title: {text: 'date'}}, yaxis: {title: {text: 'price'}}}} config={{staticPlot: isMobile, 'modeBarButtonsToRemove': []}}  />}
        </div>
    )
}

export { MovingAverage}