"use client";
import { setYear } from 'date-fns';
import React, {useState, useEffect} from 'react'
import {IpContext} from '../contexts/IpContext';
import {getDate, } from '../utils/Date'
import {pageHeader } from './StockInfo'
import { useShared } from '../contexts/SharedContext';

  function dividendCalc (symbol, setYearly_div_ratio, log, chartData, rows, refreshByToggleColumns ) {

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
          console.log (symbol, 'i=', i, 'div_ratio=', div_ratio.toFixed(4), 'div=', div, 'closePrice=', closePrice)
        }
      }
      chartData[keys[i]]['1. open'] = Number(chartData[keys[i]]['1. open']).toFixed(3)
      chartData[keys[i]]['2. high'] = Number(chartData[keys[i]]['2. high']).toFixed(3)
      chartData[keys[i]]['3. low'] = Number(chartData[keys[i]]['3. low']).toFixed(3)
    }

     //** calculate average dividend */
    const year_old = keys[keys.length - 1].split('-')[0]
    const year_new = keys[0].split('-')[0]
    const year_diff = year_new - year_old
  
    var yearly_div_ratio_ = div_ratio_sum / year_diff
    if (setYearly_div_ratio)
      setYearly_div_ratio(yearly_div_ratio_)
    
    if (log)
      console.log (symbol, getDate(), 'yearly dividend/price average=', yearly_div_ratio_.toFixed(4), 'div_count=', div_count, 'year_diff=', year_diff);

    const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
    if (row_index !== -1) {
      // if (props.rows[row_index].values.symbol === symbol) 
      rows[row_index].values.Div = (yearly_div_ratio_ * 100).toFixed(3);
      refreshByToggleColumns('Div');
    }

  }


const StockGain = (props) => {
  const {chartSymbol, setChartSymbol,
    symbol,
      // infoSymbol, setInfoSymbol,
      // gainMap, setGainMap,
      chartData, setChartData,
      gainData, setGainData,
      daily, setDaily
    } = useShared();

  const [yearly_div_ratio, setYearly_div_ratio] = useState(0) 
  const [log, setLog] = useState (false); // default to true if eliHome is true
  const [divRowsOnly, setDivRowsOnly] = useState (false); // default to true if eliHome is true
  const {eliHome} = IpContext();

  if (! chartData) {
    console.log ('StockGain: chartData undefined')
    return 
  }

  //** replace dash by underscore so date in header doex not split in 2 lines */
  function dateReplaceDash (date) {
    return date.replace(/[-]/g,'_')
  }

  useEffect (() => { 
    setYearly_div_ratio(0)
  }, [chartSymbol, chartData]) 


  function rowWithDiv (date) {
    if (chartData[date]['7. dividend amount'] !== '0.0000') {
      return true;
    }
    else return false;
  }
  //** clear dividand if zero, so non zero stick out */
  function isZero (value, date, attrib) {
    // if (divRowsOnly && chartData[date]['7. dividend amount'] === '0.0000') {
    //   return ''; // skip zero rows with no div
    // }
    if (Number(value) === 0)
      return '';
    if (attrib === '5. adjusted close') {
      return Number(value).toFixed(3);
    }
    else return value
  }

/**
 * calculate average dividend
 */
    const ROW_SPACING = {padding: "0px 5px 0px 8px", margin: '0px'}
  //  top, right, bottom, left 

  return (
    <div style={{border:'2px solid blue', background: '#f0f0e0', padding: '5px', margin: '5px'}} id='deepRecovery_id' >
      <div> 
        {pageHeader (symbol, 'gainRaw', 'Raw price history' )}
          
        <div style={{color:'green'}}>dividend/price average={yearly_div_ratio.toFixed(5)}   &nbsp; &nbsp;  {(yearly_div_ratio *100).toFixed(3)}%</div>
      </div>
      <button style={{background: 'aqua'}} type="button" onClick={()=>
        dividendCalc(chartSymbol, setYearly_div_ratio, log, chartData, props.rows, props.refreshByToggleColumns)}> dividend-calc </button> &nbsp; &nbsp; 
      <div style={{display: 'flex', flexDirection: 'row', marginTop: '5px', marginBottom: '5px'}}>
        {eliHome && <div style = {{display: 'flex'}}> <input type="checkbox" checked={log}  onChange={()=>setLog (! log)}  />&nbsp;log &nbsp; &nbsp; </div>}
        {<div style = {{display: 'flex'}}> <input type="checkbox" checked={divRowsOnly}  onChange={()=>setDivRowsOnly (! divRowsOnly)}  />&nbsp;divRowsOnly &nbsp; &nbsp; </div>}
      </div>
      {/* Stock gain list */}


      {Object.keys(chartData).length > 0 && <div  style={{height:'400px', overflow:'auto', width:'700px', border: '1px solid blue', background: '#f0f0e0', padding: '5px', margin: '5px'}}> 
          <table>
              <thead>
                  <tr>
                  <th style={{...ROW_SPACING, width: '60px'}}>date</th>
                  <th style={{...ROW_SPACING, width: '30px'}}>n</th>
                      {Object.keys(chartData[Object.keys(chartData)[0]]).map((h,h1) => {
                          return (
                            <th style={{...ROW_SPACING, width: '80px'}} key={h1}>{h}</th>
                          )
                      })}
                  </tr>
              </thead>
              <tbody>
                  {Object.keys(chartData).map((date, s1) =>{
                      if (divRowsOnly && ! rowWithDiv (date))
                        return null
                       return (
                       <tr key={s1}>
                        <td style={{...ROW_SPACING,  width: '110px'}} >{dateReplaceDash(date)}</td>
                        <td style={{...ROW_SPACING, width: '55px'}}>{s1}</td>
                          {Object.keys(chartData[date]).map((attrib,a1) => {
                              return (
                                <td key={a1} style={{...ROW_SPACING}} >{isZero(chartData[date][attrib], date, attrib)}</td>
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