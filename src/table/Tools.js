import React, {useState, useEffect} from 'react'

import {getTargetPriceArray, targetHistAll, targetGet, targetHistoryAll, targetHistBigDiff, targetHistBest} from './TargetPrice'

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'

import LogFlags from '../LogFlags'


function Tools (props) {
    const [displayFlag, setDisplayFlag] = useState (false); 

    const [mGainObj, setMgainObj] = useState ({});
    const [stockCount, setStockCount] = useState ();
    const [targetInfo, setTargetInfo] = useState ();
    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();
    const [targetPriceHist, setTargetPriceHist] = useState ({});
    const [yearGain, setYearGain] = useState ();

    const [logFlags, setLogFlags] = useState([]);
    
    var totalGain;
    
  const LOG = props.logFlags.includes('month')

  var stockCount_ = -1

    useEffect(() => {
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
      stockCount_ = stocks.length;

      for (var symm in props.gainMap) {
        const gainMapSym = props.gainMap[symm];
        const mGainForSymm = [1,1,1,1,1,1, 1,1,1,1,1,1] ;  // monthGainfor one stock
        const mCountForSymm = [0,0,0,0,0,0, 0,0,0,0,0,0] ; // how many gains per each month
        const xArray = gainMapSym.x;
        const yArray = gainMapSym.y;
        var i = 0; // Jan
        
        for (; i < yArray.length; ) { // index into weekly x (date) y (price) arrays 
          var weekOfNextMonth = nextMonthWeek(i, xArray); // 0..11
          if (weekOfNextMonth >= 0) { // if not end of array

            const date = xArray[i];
            const dateSplit_ = dateSplit (date); // [year,mon,day]
            const mon = (Number(dateSplit_[1]) - 1 + 12) % 12; // month  0..11
      
      
            if (weekOfNextMonth - i >= 3) {
              const p = yArray[i] / yArray[weekOfNextMonth]
              if (yArray[weekOfNextMonth] === 0)
                console.log (symm, weekOfNextMonth, yArray[weekOfNextMonth])
              mGainForSymm[mon] *= Number(p)
              if (isNaN(mGainForSymm[mon])) {
                console.log (symm, NaN, yArray[weekOfNextMonth])
                const a = -1;
              }
              mCountForSymm[mon] ++;
              // mGainForSymm[mon] = mGainForSymm[mon].toFixed(2)
              // mGain[mon] = mGainForSymm[mon];
              if (LOG)
                console.log (xArray[weekOfNextMonth], ' ', xArray[i],  '  month:', mon, 'gain:', p.toFixed(2))
            }
            else
              console.log (symm, 'weekOfNextMonth=', weekOfNextMonth, 'i=', i)
            i = weekOfNextMonth;
          }
          else {
            var OneStockYearGain = 1;

            // no,alize values average
            for (let i = 0; i < 12; i++) {
              if (mCountForSymm[i] === 0) {
                console.log (symm + ' devide by zero ' + ' month=' + i)
              }
              else
                OneStockYearGain *= Math.pow(mGainForSymm[i], 1 / mCountForSymm[i]);
              mGainForSymm[i] = Math.pow (mGainForSymm[i], 1 / mCountForSymm[i]).toFixed(3)
            }
            // if (LOG)
            console.log (symm, 'yearlyGain: ', OneStockYearGain.toFixed(2), mGainForSymm)
            break // end of one stock
          }
        }
        for (let j = 0; j < 12; j++) {
          mGain[j] *= mGainForSymm[j]
        }
    } 
    
    // prepare for print results calc average stocks gain for 
    var yearlyGain = 1;
    mGainObj.Jan = Number(Math.pow(Number(mGain[0]), 1 / stockCount_)).toFixed(3);
    if (isNaN(mGainObj.Jan)) // debug error
      console.log (symm, NaN)
    else
      yearlyGain *= mGainObj.Jan;
    mGainObj.Feb = Number(Math.pow(Number(mGain[1]), 1 / stockCount_)).toFixed(3);
    if (isNaN(mGainObj.Jan)) // debug error
      console.log (symm, NaN)
    else
      yearlyGain *= mGainObj.Feb;
    mGainObj.Mar = Number(Math.pow(Number(mGain[2]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Mar;
    mGainObj.Apr = Number(Math.pow(Number(mGain[3]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Apr;
    mGainObj.May = Number(Math.pow(Number(mGain[4]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.May;
    mGainObj.Jun = Number(Math.pow(Number(mGain[5]), 1 / stockCount_)).toFixed(3);       
    yearlyGain*= mGainObj.Jun;
    mGainObj.Jul = Number(Math.pow(Number(mGain[6]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Jul;
    mGainObj.Aug = Number(Math.pow(Number(mGain[7]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Aug;
    mGainObj.Sep = Number(Math.pow(Number(mGain[8]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Sep;
    mGainObj.Oct = Number(Math.pow(Number(mGain[9]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Oct;
    mGainObj.Nov = Number(Math.pow(Number(mGain[10]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Nov;
    mGainObj.Dec = Number(Math.pow(Number(mGain[11]), 1 / stockCount_)).toFixed(3);
    yearlyGain *= mGainObj.Dec;

    setYearGain (yearlyGain)
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
                {<button type="button" onClick={()=>monthGain(props.gainMap)}>monthGain</button>}

                { Object.keys(mGainObj).map((oneKey,i)=>{
                  return (
                      <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {oneKey}:  </div> &nbsp; &nbsp; {mGainObj[oneKey]}</div>
                    )
                })}

                {stockCount && <div>stockCount={stockCount} yearlyGain={yearGain.toFixed(3)} </div>}
                <br></br>           

                {props.symbol && <button type="button" onClick={()=>targetGet ()}>targetHistoryOne </button> }
                {target && price && <div>price: {price} &nbsp; &nbsp; target: {target}  &nbsp; &nbsp; (target above 1 - means growth) </div> }
                {price && targetInfo && renderList(targetInfo)}
            
                <br></br>           
    
                <div>
                  <button type="button" onClick={()=>targetHistAll (setTargetPriceHist, logFlags)}>targetHistoryAll</button>  &nbsp; &nbsp;
                  {/* <button type="button" onClick={()=>targetHistBigDiff (setTargetPriceArray, logFlags)}>targetHistBigDiff</button>  &nbsp; &nbsp; */}
                  <button type="button" onClick={()=>targetHistBest (setTargetPriceHist, logFlags)}>targetHistBest</button>         

                  {targetPriceHist && Object.keys(targetPriceHist).length > 0 && <div>count={Object.keys(targetPriceHist).length} </div>}

                  <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}  > 
   
                    {targetPriceHist && Object.keys(targetPriceHist).sort().map((oneKey,i)=>{
                      return (
                          <div  style={{maxHeight: '80px', marginTop: '5px'}} key={i}>  <div style={{'color': 'red', width: '40px'}} >
                            {oneKey}:  </div>  {targetPriceHist[oneKey].map((item) => <li>{JSON.stringify(item)}</li>)} 
                          </div>
                        )
                    })}
                  </div>
      
                </div>
                {/* <br></br>          */}
            </div>}
        </div>
    )

}

export {Tools}