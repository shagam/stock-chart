import { setYear } from 'date-fns';
import React, {useState, useEffect} from 'react'
import {IpContext} from '../contexts/IpContext';


  function dividendCalc (symbol, setYearly_div_ratio, setLog, log, chartData, rows, refreshByToggleColumns ) {

    var div_count = 0;
    var div_ratio_sum = 0;
    const VOLUME = '6. volume'
    const SPLIT_COEFFICIENT = '8. split coefficient'
    const keys = Object.keys(chartData)
    for (let i = 0; i < keys.length; i++) {
      delete chartData[keys[i]][VOLUME]
      delete chartData[keys[i]][SPLIT_COEFFICIENT]

      //** calculate dividend ratio */
      const div = chartData[keys[i]]['7. dividend amount']
      const closePrice = chartData[keys[i]]['4. close']

      if (div !== undefined && div !== '0.0000') {
        const div_ratio = Number(div) / Number(closePrice);
        div_ratio_sum += div_ratio
        div_count += 1
        if (div_ratio > 0.01 && log){
          console.log ('i=', i, 'div_ratio=', div_ratio.toFixed(4), 'div=', div, 'closePrice=', closePrice)
        }
      }
    }
     //** calculate average dividend */
    const year_old = keys[keys.length - 1].split('-')[0]
    const year_new = keys[0].split('-')[0]
    const year_diff = year_new - year_old
  
    var yearly_div_ratio_ = div_ratio_sum / year_diff
    setYearly_div_ratio(yearly_div_ratio_)
    console.log ('yearly dividend/price average=', yearly_div_ratio_.toFixed(4))

    const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
    if (row_index !== -1) {
      // if (props.rows[row_index].values.symbol === props.symbol) 
      rows[row_index].values.Div = yearly_div_ratio_.toFixed(4);
      refreshByToggleColumns('Div');
    }

  }


const StockGain = (props) => {
  const [yearly_div_ratio, setYearly_div_ratio] = useState(0) 
  const [log, setLog] = useState (false); // default to true if eliHome is true
  const {eliHome} = IpContext();

  //** replace dash by underscore so date in header doex not split in 2 lines */
  function dateReplaceDash (date) {
    return date.replace(/[-]/g,'_')
  }

  useEffect (() => { 
    setYearly_div_ratio(0)
  }, [props.symbol, props.chartData]) 

  //** clear dividand if zero, so non zero stick out */
  function isZero (s) {
    if (Number(s) === 0)
      return '';
    else return s
  }

/**
 * calculate average dividend
 */


  return (
    <div style={{border:'2px solid blue'}}>
      <div> 
       
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}> GainRaw </h6>  &nbsp; &nbsp;
        </div>
        
        <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Raw gain history as recieved from AlphaVantage </h6>
        <div style={{color:'green'}}>dividend/price average={yearly_div_ratio.toFixed(5)}   &nbsp; &nbsp;  {(yearly_div_ratio *100).toFixed(3)}%</div>
      </div>
      <button style={{background: 'aqua'}} type="button" onClick={()=>
        dividendCalc(props.symbol, setYearly_div_ratio, setLog, log, props.chartData, props.rows, props.refreshByToggleColumns)}> dividend-calc </button> &nbsp; &nbsp; 
      {eliHome && <div style = {{display: 'flex'}}> <input type="checkbox" checked={log}  onChange={()=>setLog (! log)}  />&nbsp;log &nbsp; &nbsp; </div>}
      {/* Stock gain list */}

      {Object.keys(props.chartData).length > 0 && <div  style={{height:'400px', overflow:'auto'}}> 
          <table>
              <thead>
                  <tr>
                  <th style={{width: '110px'}}>date</th>
                  <th>n</th>
                      {Object.keys(props.chartData[Object.keys(props.chartData)[0]]).map((h,h1) => {
                          return (
                            <th style={{width: '80px'}} key={h1}>{h}</th>
                          )
                      })}
                  </tr>
              </thead>
              <tbody>
                  {Object.keys(props.chartData).map((s, s1) =>{
                      return (
                      <tr key={s1}>
                        <td  style={{padding: '2px', margin: '2px', width: '110px'}} >{dateReplaceDash(s)}</td>
                        <td style={{padding: '2px', margin: '2px'}}>{s1}</td>
                          {Object.keys(props.chartData[s]).map((a,a1) => {
                              return (
                                <td key={a1} style={{padding: '2px', margin: '2px'}} >{isZero(props.chartData[s][a])}</td>
                              )
                          })}
                      </tr>
                      )
                  })}
              </tbody>

          </table>
      </div> }



    </div>
  )
}

export { StockGain, dividendCalc}