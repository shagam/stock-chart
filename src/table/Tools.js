import React, {useState, useEffect} from 'react'

import {getTargetPriceArray, targetHistAll, targetGet, targetHistoryAll, targetHistBigDiff, targetHistBest} from './TargetPrice'

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'

import LogFlags from '../LogFlags'


function Tools (props) {
    const [displayFlag, setDisplayFlag] = useState (false); 

    const [monGainTxt, setMonGainText] = useState ();
    const [mGainObj, setMgainObj] = useState ({});
    const [totalMonGain, setTotalMonGain] = useState ();
    const [targetInfo, setTargetInfo] = useState ();
    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();
    const [targetPriceArray, setTargetPriceArray] = useState ();

    const [logFlags, setLogFlags] = useState([]);
    
    var totalGain;
    
    useEffect(() => {
        setMonGainText()
        setTotalMonGain()
        setTargetInfo()
        setPrice()
        setMgainObj({})
      },[props.symbol]) 
  
  
      // loop through months
      function nextMonthIndex (i, xArray) {
        const date = xArray[i];
        if(date === undefined) {
          var b = 1
        }
        const dateSplit_ = dateSplit (date);
        var monthNum = dateSplit_[1];
  
        for (let j = i; j < xArray.length; j++) {
          const nextDate = xArray[j];
          const nextDateSplit = dateSplit (nextDate);
          const nextMonth = nextDateSplit[1];
          if (nextMonth !== monthNum)
            return j;
        }
        return -1; // error
      }
  
      // compare month gain over the history
      function monthGain (xArray, yArray) {    

        const mGain = [1,1,1,1,1,1, 1,1,1,1,1,1] // init value for gains
        var i = 0; // Jan
        for (; i < yArray.length; ) { 
          var nextIndex = nextMonthIndex(i, xArray);
          if (nextIndex < 0) { // error
            break;
          }
          const date = xArray[i];
          const dateSplit_ = dateSplit (date);
          const mon = (Number(dateSplit_[1]) - 1 + 12) % 12; 
    
    
          if (nextIndex - i >= 3) {
            const p = yArray[i] / yArray[nextIndex]
            mGain[mon] *= Number(p);
            mGain[mon]= (Number(mGain[mon]))
            const a = 1;
            if (props.logFlags.includes('month')) {
              console.log (xArray[nextIndex], ' ', xArray[i],  '  month:', mon, 'gain:', p.toFixed(2))
            }
          }
          i = nextIndex; 
        }

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

        // var mGainTxt = '';
        // const keys = Object.keys(mGainObj)
        // keys.forEach (key => mGainTxt += '  ' + key + ': ' + mGainObj[key] + '     ')
        // setMonGainText(mGainTxt)

        const totalGain = mGain[0] * mGain[1] * mGain[2] * mGain[3] * mGain[4] * mGain[5]
                        * mGain[6] * mGain[7] * mGain[8] * mGain[9] * mGain[10] * mGain[11];
        setTotalMonGain (totalGain.toFixed(3))
      }
    


      function monthGainMany(gainMap) {
        setMgainObj ({})
        // mGainObj.jan = 1;
        // mGainObj.Feb = 2
        // mGainObj.Mar = 3
        // mGainObj.Apr = 4
        // mGainObj.May = 5
        // mGainObj.Jun = 6

        // mGainObj.Jul = 7
        // mGainObj.Aug = 8
        // mGainObj.Sep = 9
        // mGainObj.Oct = 10
        // mGainObj.Nov = 11
        // mGainObj.Dec = 12

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

                {props.symbol &&  <button type="button" onClick={()=>monthGain(props.stockChartXValues, props.stockChartYValues)}>monthGainCompare</button>} 

                {/* {props.gainMap &&  <button type="button" onClick={()=>monthGainMany(props.gainMap)}>monthGainMany</button>} */}
                {/* <pre>
                  {JSON.stringify(mGainObj, null, 2)}
                </pre> */}

                {Object.keys(mGainObj).map((oneKey,i)=>{
                  return (
                      <div style={{display:'flex'}} key={i}> &nbsp; &nbsp;  <div style={{'color': 'red', width: '30px'}} > {oneKey}:  </div> &nbsp; &nbsp; {mGainObj[oneKey]}</div>
                    )
                })}

                {totalMonGain && <div>totalGain: &nbsp;&nbsp; {totalMonGain} </div>}
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