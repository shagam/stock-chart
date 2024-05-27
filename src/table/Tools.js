import React, {useState, useEffect} from 'react'

import {getTargetPriceArray, targetHistAll, targetHistoryAll, moveFromFirebase} from './TargetPrice'

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

import {format} from "date-fns"
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
    
import logFlags from '../LogFlags'
import {monthGain} from './MonthGain'
import IpContext from '../contexts/IpContext';

function Tools (props) {
    const [displayFlag, setDisplayFlag] = useState (false); 

    const {localIp, localIpv4, eliHome} = IpContext();
    const [mGainObj, setMgainObj] = useState ({});
    
    const [targetInfo, setTargetInfo] = useState ();
    const [targetPriceHist, setTargetPriceHist] = useState ({});

    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();

    const [yearGain, setYearGain] = useState ();
    const [monthNames, setMonthNames] = useState(['Jan','Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])

    
    const [startDate, setStartDate] = useState (new Date(2002, 9, 15));
 
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
      const tar = getTargetPriceArray (props.symbol, setTargetInfo, props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect)
  
      const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
      if (row_index  === -1)
        return;
      setPrice (props.rows[row_index].values.price) // for display
      setTarget (props.rows[row_index].values.target) // for display
    }

    function targetGetAll () {
      const tar = targetHistAll (setTargetPriceHist, props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect)
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
    
    return (
        <div style = {{border: '2px solid blue'}} >
       
              <div>
                <div style = {{display: 'flex'}}>
                  <div  style={{color: 'magenta' }}>  {props.symbol} </div>  &nbsp;  &nbsp; 
                  <h6 style={{color: 'blue'}}> Tools </h6>
                </div>
          
                {/* &nbsp; &nbsp; */}
                <div style={{display:'flex'}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"md"}} 
                  dateFormat="yyyy-LLL-dd" selected={startDate} onChange={(date) => setStartDate(date)} /> &nbsp; &nbsp; 
                 {props.symbol && <button type="button" onClick={()=>monthGain(props.gainMap, mGainObj, setMgainObj, setYearGain, props.logFlags, startDate)}>monthGain</button>}
                </div>

                { Object.keys(mGainObj).map((oneKey,i)=>{
                  return (
                      <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {monthNames[i]}:  </div> &nbsp; &nbsp; {mGainObj[oneKey]}</div>
                    )
                })}

                {Object.keys(mGainObj).length > 0 && <div>stockCount={Object.keys(props.gainMap).length} yearlyGain={yearGain.toFixed(3)} </div>}
                <br></br>           
                
                 <h3>Target price history</h3>

                {false && eliHome && <button type="button" onClick={()=>moveFromFirebase (props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect)}>moveFromFirebase</button>}  &nbsp; &nbsp;

                <button type="button" onClick={()=>targetGetAll ()}>targetHistoryAll</button>  &nbsp; &nbsp;
                
                {props.symbol && <button type="button" onClick={()=>targetGetOne ()}>targetHistoryOne </button> }
                {target && price && <div>price: {price} &nbsp; &nbsp; target: {target}  &nbsp; &nbsp; (target above 1 - means growth) </div> }
                {price && targetInfo && renderList(targetInfo)}
            
                <br></br>           
        
                {targetPriceHist && Object.keys(targetPriceHist).length > 0 &&
                 <div  style={{display: 'flex'}}>count={Object.keys(targetPriceHist).length} &nbsp; &nbsp; &nbsp; <div style={{color: 'lightGreen'}}>(targetNew &nbsp;/ targetOld)</div> </div>}

                <div  style={{ maxHeight: '65vh', 'overflowY': 'scroll'}}  > 
                {targetPriceHist && Object.keys(targetPriceHist).length > 0 && Object.keys(targetPriceHist).sort().map((sym,i)=>{
                  return (
                      <div style={{width: '90vw'}} key={i}>
                        <div  style={{display: 'flex'}} >
                          <div style={{color: 'red', width: '50px'}} > {sym}   </div>   ({targetPriceHist[sym].length}) &nbsp; &nbsp;
                          <div style={{color: 'lightGreen'}} > {(targetPriceHist[sym][targetPriceHist[sym].length - 1].target /  targetPriceHist[sym][0].target).toFixed(3)} </div>
                        </div> 
                        {targetPriceHist[sym].map((targetItem) => <li key={targetItem.date}>{JSON.stringify(targetItem)} </li>)} 
                      </div>
                    )
                })}
                </div>

              <br></br>         
            </div>
        </div>
    )

}

export default Tools
