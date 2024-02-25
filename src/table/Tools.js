import React, {useState, useEffect} from 'react'

import {getTargetPriceArray, targetHistAll, targetGet, targetHistoryAll, targetHistBigDiff, targetHistBest} from './TargetPrice'

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'

import logFlags from '../LogFlags'
import {monthGain} from './MonthGain'

function Tools (props) {
    const [displayFlag, setDisplayFlag] = useState (false); 

    const [mGainObj, setMgainObj] = useState ({});
    const [targetInfo, setTargetInfo] = useState ();
    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();

    const [yearGain, setYearGain] = useState ();
    const [monthNames, setMonthNames] = useState(['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])

    // const [logFlags, setLogFlags] = useState([]);
    
    var totalGain;
    
  const LOG = props.logFlags.includes('month')

  // clear vars when symbol change
    useEffect(() => {
        setTargetInfo()
        setPrice()
        setMgainObj({})
        // setTargetPriceHist()
      },[props.symbol]) 
  
  
  
    function targetGetOne (symbol) {
      const tar = getTargetPriceArray (props.symbol, setTargetInfo)
  
      const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
      if (row_index  === -1)
        return;
      setPrice (props.rows[row_index].values.price) // for display
      setTarget (props.rows[row_index].values.target) // for display
    }
  
    // show as vertical list of array items
    function renderList(array) {
      if (array.length < 1)
        return;
      if (array[0].date)
        return array.map((item) => <li key={item.date}>{JSON.stringify(item)}</li>);
      else
        return array.map((item) => <li>{JSON.stringify(item)}</li>);  
    }
     

    const style = {
        // background: 'blue',
        // color: 'red',
        // fontSize: 200,
        border: '2px solid blue'
      };
    

    return (
        <div style = {style} >
            <div>  &nbsp; &nbsp;  &nbsp;
                <input  type="checkbox" checked={displayFlag} onChange={() => {setDisplayFlag ( !displayFlag)}}/> Tools
            </div>

            {displayFlag && <div>
                <div  style={{color: 'magenta' }}> {props.symbol}</div>  

          
                {/* &nbsp; &nbsp; */}
                {props.symbol && <button type="button" onClick={()=>monthGain(props.gainMap, mGainObj, setMgainObj, setYearGain, props.logFlags)}>monthGain</button>}

                { Object.keys(mGainObj).map((oneKey,i)=>{
                  return (
                      <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {monthNames[i]}:  </div> &nbsp; &nbsp; {mGainObj[oneKey]}</div>
                    )
                })}

                {Object.keys(mGainObj).length > 0 && <div>stockCount={Object.keys(props.gainMap).length} yearlyGain={yearGain.toFixed(3)} </div>}
                <br></br>           

                {props.symbol && <button type="button" onClick={()=>targetGetOne ()}>targetHistoryOne </button> }
                {target && price && <div>price: {price} &nbsp; &nbsp; target: {target}  &nbsp; &nbsp; (target above 1 - means growth) </div> }
                {price && targetInfo && renderList(targetInfo)}
            
                <br></br>           
    
                      <br></br>         
            </div>}
        </div>
    )

}

export default Tools
