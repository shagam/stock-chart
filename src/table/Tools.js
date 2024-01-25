import React, {useState, useEffect} from 'react'

import {getTargetPriceArray, targetHistAll, targetGet, targetHistoryAll, targetHistBigDiff, targetHistBest} from './TargetPrice'

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'

import LogFlags from '../LogFlags'


function Tools (props) {
    const [displayFlag, setDisplayFlag] = useState (false); 

    const [monGainTxt, setMonGainText] = useState ();
    const [mGainObj, setMgainObj] = useState ({});
    const [stockCount, setStockCount] = useState ();
    const [targetInfo, setTargetInfo] = useState ();
    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();
    const [targetPriceArray, setTargetPriceArray] = useState ();

    const [logFlags, setLogFlags] = useState([]);
    
    var totalGain;
    
  const LOG = props.logFlags.includes('month')

    useEffect(() => {
        setMonGainText()
        setStockCount()
        setTargetInfo()
        setPrice()
        setMgainObj({})
      },[props.symbol]) 
  
  
      // loop through months
      function nextMonthWeek (i, xArray) {
        const date = xArray[i];
        if(date === undefined) {
          var b = 1
        }
        const dateSplit_ = dateSplit (date);
        var monthNum = dateSplit_[1];
  
        for (let j = i; j < xArray.length; j++) {  // i, j week number
          const nextDate = xArray[j];
          const nextDateSplit = dateSplit (nextDate);
          const nextMonth = nextDateSplit[1];
          if (nextMonth !== monthNum)
            return j;
        }
        // console.log (monthNum)
        return -1; // error
      }
  

    // collect month gain over the history
    function monthGain () {    
      
      const mGain = [1,1,1,1,1,1, 1,1,1,1,1,1] // init value for gains
      const stocks = Object.keys (props.gainMap);
      setStockCount (stocks.length)

      for (var symm in props.gainMap) {
        const gainMapSym = props.gainMap[symm];
        const mGainForSymm = [1,1,1,1,1,1, 1,1,1,1,1,1] ;  // monthGainfor one stock
        const xArray = gainMapSym.x;
        const yArray = gainMapSym.y;
        var i = 0; // Jan
        for (; i < yArray.length; ) { // index into weekly x (date) y (price) arrays 
          var weekOfNextMonth = nextMonthWeek(i, xArray); // 0..11
          if (weekOfNextMonth >= 0) { // success

            const date = xArray[i];
            const dateSplit_ = dateSplit (date); // [year,mon,day]
            const mon = (Number(dateSplit_[1]) - 1 + 12) % 12; // month  0..11
      
      
            if (weekOfNextMonth - i >= 3) {
              const p = yArray[i] / yArray[weekOfNextMonth]
              mGainForSymm[mon] *= Number(p)
              mGainForSymm[mon] = mGainForSymm[mon].toFixed(2)
              mGain[mon] *= Number(p);
              mGain[mon]= (Number(mGain[mon]))
              const a = 1;
              if (LOG) {
                console.log (xArray[weekOfNextMonth], ' ', xArray[i],  '  month:', mon, 'gain:', p.toFixed(2))
              }
            }
            i = weekOfNextMonth;
          }
          else {
              // if (LOG)
            console.log (symm, mGainForSymm)
            break
          } 
        }

    } 
    
    // prepare for print results
    mGainObj.Jan = Number(mGain[0] + 0.0005).toFixed(2);
    mGainObj.Feb = Number(mGain[1] + 0.0005).toFixed(2);
    mGainObj.Mar = Number(mGain[2] + 0.0005).toFixed(2);
    mGainObj.Apr = Number(mGain[3] + 0.0005).toFixed(2);
    mGainObj.May = Number(mGain[4] + 0.0005).toFixed(2);
    mGainObj.Jun = Number(mGain[5] + 0.0005).toFixed(2);       
    mGainObj.Jul = Number(mGain[6] + 0.0005).toFixed(2);
    mGainObj.Aug = Number(mGain[7] + 0.0005).toFixed(2);
    mGainObj.Sep = Number(mGain[8] + 0.0005).toFixed(2);
    mGainObj.Oct = Number(mGain[9] + 0.0005).toFixed(2);
    mGainObj.Nov = Number(mGain[10] + 0.0005).toFixed(2);
    mGainObj.Dec = Number(mGain[11] + 0.0005).toFixed(2); 
  }

  
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
     
      // calc target ratio for each
      function addRatio (arr, price) {
        if (arr === undefined) {
          return arr;
        }
        var arrWithTarget = []
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].tar)
            arrWithTarget.push (arr[i]) 
          else
            arrWithTarget.push ({date: arr[i].date, target: arr[i].target, tar: (arr[i].target / price).toFixed(2)})
          // arr[i]['tar'] = (arr[i].target / price).toFixed(2);
        }
        return arrWithTarget;
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
                {props.gainMap &&  <button type="button" onClick={()=>monthGain(props.gainMap)}>monthGain</button>}

                {mGainObj && Object.keys(mGainObj).map((oneKey,i)=>{
                  return (
                      <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {oneKey}:  </div> &nbsp; &nbsp; {mGainObj[oneKey]}</div>
                    )
                })}

                {stockCount && <div>stockCount: &nbsp;&nbsp; {stockCount} </div>}
                <br></br>                 <br></br>

                {props.symbol && <button type="button" onClick={()=>targetGet ()}>targetHistoryOne </button> }
                {target && price && <div>price: {price} &nbsp; &nbsp; target: {target}  &nbsp; &nbsp; (target above 1 - means growth) </div> }
                {price && targetInfo && renderList(addRatio(targetInfo, price))}
            
                <br></br>  <br></br>            
    
                <div>
                  <button type="button" onClick={()=>targetHistAll (setTargetPriceArray, logFlags)}>targetHistoryAll</button>  &nbsp; &nbsp;
                  <button type="button" onClick={()=>targetHistBigDiff (setTargetPriceArray, logFlags)}>targetHistBigDiff</button>  &nbsp; &nbsp;
                  <button type="button" onClick={()=>targetHistBest (setTargetPriceArray, logFlags)}>targetHistBest</button>               
                </div>
                {/* <br></br>          */}

                {targetPriceArray&& <textarea type='text' name='stockInfo' cols='75' rows='10' readOnly
                  value={targetPriceArray}  >
                </textarea>}

            </div>}
        </div>
    )

}

export {Tools}