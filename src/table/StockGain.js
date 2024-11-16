import React, {useState} from 'react'

const StockInfo = (props) => {

  //** replace dash by underscore so date in header doex not split in 2 lines */
  function dateReplaceDash (date) {
    return date.replace(/[-]/g,'_')
  }

  //** clear dividand if zero, so non zero stick out */
  function isZero (s) {
    if (Number(s) === 0)
      return '';
    else return s
  }

  const VOLUME = '6. volume'
  const SPLIT_COEFFICIENT = '8. split coefficient'
  const keys = Object.keys(props.chartData)
  for (let i = 0; i < keys.length; i++) {
    delete props.chartData[keys[i]][VOLUME]
    delete props.chartData[keys[i]][SPLIT_COEFFICIENT]
  }

  return (
    <div style={{border:'2px solid blue'}}>
      <div> 
       
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}> GainRaw </h6>  &nbsp; &nbsp;
          <div>{props.daily? '(daily)' : '(weekly)'}</div>
        </div>
        
        <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Raw gain history as recieved from AlphaVantage </h6>

      </div>
      
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

export default StockInfo