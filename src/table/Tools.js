import React, {useState, useEffect} from 'react'

import {getTargetPriceArray, targetHistAll, targetGet, targetHistoryAll, targetHistBigDiff} from './TargetPrice'

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'



function Tools (props) {
    const [displayFlag, setDisplayFlag] = useState (false); 

    const [monGainTxt, setMonGainText] = useState ();
    const [totalMonGain, setTotalMonGain] = useState ();
    const [targetInfo, setTargetInfo] = useState ();
    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();

    var totalGain;
    
    useEffect(() => {
        setMonGainText()
        setTotalMonGain()
        setTargetInfo()
        setPrice()
      },[props.symbol]) 
  
  

      function nextMonthIndex (i, month) {
        const date = props.stockChartXValues[i];
        if(date === undefined) {
          var b = 1
        }
        const dateSplit_ = dateSplit (date);
        var monthNum = dateSplit_[1];
  
        for (let j = i; j < props.stockChartXValues.length; j++) {
          const nextDate = props.stockChartXValues[j];
          const nextDateSplit = dateSplit (nextDate);
          const nextMonth = nextDateSplit[1];
          if (nextMonth !== monthNum)
            return j;
        }
        return -1; // error
      }
  
  
      function monthGain () {    

        const mGain = [1,1,1,1,1,1, 1,1,1,1,1,1] // init value for gains
        var i = 0;
        for (; i < props.stockChartYValues.length; ) {
          var nextIndex = nextMonthIndex(i);
          if (nextIndex < 0) {
            break;
          }
          const date = props.stockChartXValues[i];
          const dateSplit_ = dateSplit (date);
          const mon = (Number(dateSplit_[1]) - 1 + 12) % 12; 
    
    
          if (nextIndex - i >= 3) {
            const p = (props.stockChartYValues[i] / props.stockChartYValues[nextIndex])
            mGain[mon] *= Number(p);
            mGain[mon]= (Number(mGain[mon]))
            const a = 1;
            if (props.logFlags.includes('month')) {
              console.log (props.stockChartXValues[nextIndex], ' ', props.stockChartXValues[i],  '  month:', mon, 'gain:', p.toFixed(2))
            }
          }
          i = nextIndex; 
        }
        const mGainObj = {}
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
        const totalGain = mGain[0] * mGain[1] * mGain[2] * mGain[3] * mGain[4] * mGain[5]
                        * mGain[6] * mGain[7] * mGain[8] * mGain[9] * mGain[10] * mGain[11];
        setTotalMonGain (totalGain.toFixed(3))

        var mGainTxt = JSON.stringify (mGainObj)

        mGainTxt = mGainTxt.replace (/,/g, '  ')
        mGainTxt = mGainTxt.replace (/"/g, '')
        // mGainTxt = mGainTxt.replace(/Jul/, '  Jul')
        setMonGainText(mGainTxt)
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
          return true;
        }
        var arrWithTarget = []
        for (let i = 0; i < arr.length; i++) {
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

                {props.symbol && <button type="button" onClick={()=>targetGet ()}>targetHistoryOne </button> }
                {target && price && <div>price: {price} &nbsp; &nbsp; target: {target}  &nbsp; &nbsp; (target above 1 - means growth) </div> }
                {price && targetInfo && renderList(addRatio(targetInfo, price))}

                
                {/* &nbsp; &nbsp; */}

                <br></br>   <br></br>  
                <div>
                  <button type="button" onClick={()=>targetHistAll ()}>targetHistoryAll</button>  &nbsp; &nbsp;
                  <button type="button" onClick={()=>targetHistBigDiff ()}>targetHistBigDiff</button>
                </div>
                <br></br>           <br></br>

                {props.symbol &&  <button type="button" onClick={()=>monthGain()}>monthGainCompare</button>}
                <div>{monGainTxt} </div>
                {totalMonGain && <div>totalGain: &nbsp;&nbsp; {totalMonGain} </div>}
                <br></br>            

            </div>}
        </div>
    )

}

export {Tools}