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
    const [targetPriceHist, setTargetPriceHist] = useState ({});
    const [yearGain, setYearGain] = useState ();
    const [monthNames, setMonthNames] = useState(['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])

    // const [logFlags, setLogFlags] = useState([]);
    
    var totalGain;
    
  const LOG = props.logFlags.includes('month')

    useEffect(() => {
        setTargetInfo()
        setPrice()
        setMgainObj({})
      },[props.symbol]) 
  
  
  
    function targetGet (symbol) {
      const tar = getTargetPriceArray (props.symbol, setTargetInfo)
  
      const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
      if (row_index  === -1)
        return;
      setPrice (props.rows[row_index].values.price)
      setTarget (props.rows[row_index].values.target)
    }
  
    function renderList(array) {
      if (array.length < 1)
        return;
      if (array[0].date)
        return array.map((item) => <li key={item.date}>{JSON.stringify(item)}</li>);
      else
        return array.map((item) => <li>{JSON.stringify(item)}</li>);  
    }
     

    const displayFlagChange = () => {setDisplayFlag ( !displayFlag)}

    const style = {
        // background: 'blue',
        // color: 'red',
        // fontSize: 200,
        border: '2px solid blue'
      };
    

    return (
        <div style = {style} >
            <div>
                <input  type="checkbox" checked={displayFlag} onChange={displayFlagChange}/> Tools
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

                {props.symbol && <button type="button" onClick={()=>targetGet ()}>targetHistoryOne </button> }
                {target && price && <div>price: {price} &nbsp; &nbsp; target: {target}  &nbsp; &nbsp; (target above 1 - means growth) </div> }
                {price && targetInfo && renderList(targetInfo)}
            
                <br></br>           
    
                <div>
                  <button type="button" onClick={()=>targetHistAll (setTargetPriceHist, props.logFlags)}>targetHistoryAll</button>  &nbsp; &nbsp;
                  {/* <button type="button" onClick={()=>targetHistBigDiff (setTargetPriceArray, logFlags)}>targetHistBigDiff</button>  &nbsp; &nbsp; */}
                  <button type="button" onClick={()=>targetHistBest (setTargetPriceHist, props.logFlags)}>targetHistBest</button>         

                  {targetPriceHist && Object.keys(targetPriceHist).length > 0 && <div>count={Object.keys(targetPriceHist).length} </div>}

                  <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}  > 
   
                    {targetPriceHist && Object.keys(targetPriceHist).sort().map((sym,i)=>{
                      return (
                          <div style={{width: '90vw'}} key={i}>
                            <div style={{'color': 'red', width: '40px'}} > {sym}:  </div>
                            {targetPriceHist[sym].map((targetItem) => <li key={targetItem.date}>{JSON.stringify(targetItem)} </li>)} 
                          </div>
                        )
                    })}
                  </div>
      
                </div>
                <br></br>         
            </div>}
        </div>
    )

}

export {Tools}