import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import {beep2} from '../utils/ErrorList'
import {yearsDifference} from '../utils/Date'
import DatePicker, {moment} from 'react-datepicker';
import { searchDateInArray} from '../utils/Date'

function LeverageETF (props) {
    const [gainCalc, setGainCalc] = useState ({})
    const [yearlyGainCalc, setYearlyGainCalc] = useState ({})
    const [symArray, setSymArray] = useState ([])
    const [dateArray, setDateArray] = useState([])
    const [valArrLen, setValArrLen] = useState ()
    const [pivotSym, setPivotSym] = useState ()
    const [pivotSymIndex, setPivotSymIndex] = useState ()
    const [yearlGainCalc, strYearlyGainCalc]  = useState ({})
    const [err, setErr] = useState ()
    const [highLowText, setHighLowText] = useState ('')
    const [highLowIndex, setHighLowIndex] = useState ({})
    const [dateAfterDrop, setDateAfterDrop] = useState (new Date(2023, 8, 1 )) // sep
    const [steps, setSteps] = useState([]);

    const [stepsArr, setStepsArr] = useState({});
    const [valueTblShow, setValueTblShow] = useState ()
    const [listShow, setListShow] = useState ()

    //** git index of heigest value */
    function getHighestValue (yArray, startIndex) {
        var highest = 0; // oldest 
        var highIndex = 0;
        for (let i = startIndex; i < yArray.length; i++) {
            if (highest < yArray[i]) {
                highest = yArray[i];
                highIndex = i;
            }
        }
        return highIndex;
    }

   //** git index of lowest after high */
   function getLowestAfterHigh (yArray, firstIndex) {
        var lowest = yArray[0];
        var lowestIndex = 0;
        for (let i = 0; i < firstIndex; i++) {
            if (lowest > yArray[i]) {
                lowest = yArray[i];
                lowestIndex = i;
            }
        }
        return lowestIndex;
    }


    function gainClose(i) {
        // if (dateArray.length === 0)
        //     return -1 // not ready yet
        // if (i < 0)
        //     return -1
        const close = Number(props.gainObj[dateArray[i]]['5. adjusted close']) 
        return close.toFixed(2)
    }




    //** lavarage calc entry */
    function leverage() {

        setErr()
        console.log ('lavarage=', props.gainMap)
        var symArray_ = Object.keys(props.gainMap)
        // if (symArray_ === ['QQQ','TQQQ']) {
        //     symArray_ =  ['TQQQ','QQQ']
        // }
        setSymArray (symArray_)
        if (symArray_.length !== 2) {
            setErr('Err need 2 stocks, press GAIN for another symbol' )
            beep2()
            return;
        }

        //** compare only last array section  */
        var lengthMin;
        var yArray = props.gainMap[symArray_[0]].y

        //** Find pivot sym, min history length  */
        lengthMin = yArray.length
        var indexOfPivotSym = 0;
        for (let i = 0; i < symArray_.length; i++) {
            yArray = props.gainMap[symArray_[i]].y
            if (yArray.length <= lengthMin) {
                lengthMin = yArray.length
                setPivotSymIndex (i)
                setPivotSym(symArray_[i]);
                indexOfPivotSym = i;
            }
        }



        //** calc ratio between QQQ  TQQQ*/
        for (let s = 0; s < symArray_.length; s++) {
            var gainArr = []
            var yearlyGainArr = []
            for (let i = 0; i < lengthMin; i++) {
                //**  gain between i date to oldest date */
                gainArr[i] = props.gainMap[symArray_[s]].y[i] / props.gainMap[symArray_[s]].y[lengthMin - 1]
                const yearsDiff = yearsDifference(props.gainMap[symArray_[s]].x[lengthMin - 1], props.gainMap[symArray_[s]].x[i])
                yearlyGainArr[i] = Math.pow (gainArr[i], 1 / yearsDiff)
                const a = 2 // just for debug breakpoint
            }
            gainCalc[symArray_[s]] = gainArr;
            yearlGainCalc[symArray_[s]] = yearlyGainArr;
        }

        setValArrLen (lengthMin)
        setDateArray(props.gainMap[symArray_[indexOfPivotSym]].x)


        /** calc drop from high, and add to gainMap */

        var highLowText_ = 'High/low indexes '
        for (let s = 0; s < symArray_.length; s++) {
            const x = props.gainMap[symArray_[s]].x;
            const y = props.gainMap[symArray_[s]].y;

            const startYear = dateAfterDrop.getFullYear();
            const startMon = dateAfterDrop.getMonth() + 1;
            const startDay = dateAfterDrop.getDate();    
            const startDateArray = [startYear, startMon, startDay]

            var startAfterDropIndex = searchDateInArray (x, startDateArray, symArray_[s], props.logFlags)
            if (startAfterDropIndex === -1) {
                setErr(symArray_[s], 'fail to find start date, after drop')
                return;
            }

            const historyArrLength = y.length
            const highest_index = getHighestValue (y, startAfterDropIndex);
            const lowest_index =  getLowestAfterHigh (y, highest_index)
            console.log (symArray_[s], 'high ind=', highest_index, props.gainMap[symArray_[s]].x[highest_index], props.gainMap[symArray_[s]].y[highest_index].toFixed(2))
            // props.gainMap[symArray_[s]].drop = []
            var dropFromHigh  = []
            for (let i = 0; i < historyArrLength; i++) {
                dropFromHigh[i] = (y[i] / y[highest_index]).toFixed(3)
                // if (dropFromHigh[i] > 1)
                //     dropFromHigh[i] = '-'
            }
            props.gainMap[symArray_[s]].dropFromHigh = dropFromHigh

            const indexes = {}
            indexes.highestIndex =  highest_index
            indexes.highestDate = x[highest_index]
            indexes.lowestIndex =  lowest_index
            indexes.lowestDate = x[lowest_index]
            highLowIndex[symArray_[s]] = indexes

            const STEP = 0.05;
            var stepCount = 1;

            // calc steps 
            var stepsArr_ = [];
            if (symArray_[s] === 'QQQ') {
                for (let i = highest_index; i >= lowest_index; i--) {
                    if (dropFromHigh[i] < (1 - stepCount * STEP)) {
                        console.log (symArray_[s], dropFromHigh[i], stepCount, 1 - stepCount * STEP)
                        steps[i] = symArray_[s] + '_' + dropFromHigh[i];
                        stepsArr_.push ({index: i, date: x[i], step: (1 - stepCount * STEP).toFixed(2), drop: dropFromHigh[i]})
                        stepCount ++;
                    }
                }
                stepsArr[symArray_[s]] = stepsArr_
            }
        }
    }

    function colorStep (index) {
        const len = stepsArr['QQQ'].length
        for (let i = 0; i < len; i++) {
            if (stepsArr['QQQ'][i].index === index) {
                return 'lightgreen';
            }
        }
        return 'black'
    }

    // color high / low lines
    function colorIndex (index) {
        if (highLowIndex[symArray[0]].highestIndex === index)
            return '#feb236'
        if (highLowIndex[symArray[0]].lowestIndex === index)
            return 'red'
        
        if (highLowIndex[symArray[1]].highestIndex === index)
            return '#ff7b25'
        if (highLowIndex[symArray[1]].lowestIndex === index)
            return 'magenta'
            
        return colorStep (index) 
        // return 'black'
    }

    const ROW_SPACING = {padding: "0px 5px 0px 5px", margin: '0px'}
    //** top, right, bottom, left*/

    return (
        <div style = {{ border: '2px solid blue'}}>
            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
                <h6  style={{color: 'blue' }}> Lavarage ETF </h6> &nbsp; &nbsp;
                <div>{props.daily? '(daily)' : '(weekly)'}</div>
            </div>

            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Support strategy for trading leverage ETF (like TQQQ)  using QQQ </h6>

            <div style={{color: 'red'}}> {err} </div>


            {symArray.length > 0 && <div>  symArray= {JSON.stringify(symArray)} </div>}

            <div style={{display: 'flex'}}>
                <div>Date after drop</div>
                &nbsp; <DatePicker style={{ margin: '0px'}} dateFormat="yyyy-LLL-dd" selected={dateAfterDrop} onChange={(date) => setDateAfterDrop(date)} />  &nbsp; &nbsp;
                <button  style={{background: 'aqua'}}  onClick={leverage} > Lavarage calc</button> &nbsp; &nbsp;
            </div>

            <input  type="checkbox" checked={listShow}   onChange={()=> setListShow(! listShow)} /> stepListShow   &nbsp;  &nbsp;
            {listShow && <div>
            highLow info {highLowIndex !== '{}' && <pre>{JSON.stringify(highLowIndex, null, 2)}</pre>}

            stepsArray {Object.keys(stepsArr).map((sym,symi)=>{
                return (
                    <div> {sym}  &nbsp; &nbsp; {JSON.stringify(stepsArr[sym])}</div>
                )
            } )}

            </div>}
            {/* Yearly gain TABLE */}
            <input  type="checkbox" checked={valueTblShow}   onChange={()=> setValueTblShow(! valueTblShow)} /> historical-value-table

            <div>&nbsp;</div>

            {pivotSym && symArray.length > 1 && <div> lineCount={valArrLen} &nbsp;&nbsp; oldestDate={props.gainMap[pivotSym].x[valArrLen - 1]} </div>}
            {valueTblShow && pivotSym && symArray.length > 1 && <div style={{height:'450px', width: '550px', overflow:'auto'}}>
                <table>
                    <thead>
                        <tr>
                            <th>N</th>
                            <th style={{width: '60px'}}>date</th> 
                            <th style={ROW_SPACING}> {symArray[0] + ' $'}</th>
                            <th style={ROW_SPACING}>{symArray[0]} drop</th>

                            <th style={ROW_SPACING}>{symArray[1] + ' $'}</th>
                            <th style={ROW_SPACING}>{symArray[1]} drop</th>
                            <th> QQQ-drop ** 3</th>
                            {/* <th style={ROW_SPACING}> steps</th> */}
                            {/* <th>nextOpen</th> */}

                        </tr>
                    </thead>
                    <tbody>
                        {props.gainMap[pivotSym].y.map((date, index) =>{
                            return (
                            <tr key={index}>
                                <td style={{padding: '1px', margin: '0px'}}>{index}</td>
                                <td style={{padding: "0px 5px 0px 5px", margin: '0px', width:'100px', color: colorIndex(index)}} >{props.gainMap[pivotSym].x[index]}  </td>

                                <td style={ROW_SPACING}> {props.gainMap[symArray[0]].y[index].toFixed(2)}</td>
                                <td style={ROW_SPACING}> {props.gainMap[symArray[0]].dropFromHigh[index]}</td>
                              
                                <td style={ROW_SPACING}> {props.gainMap[symArray[1]].y[index].toFixed(2)}</td>
                                <td style={ROW_SPACING}> {props.gainMap[symArray[1]].dropFromHigh[index]}</td>

                                <td style={ROW_SPACING}> {(props.gainMap['QQQ'].dropFromHigh[index] ** 3).toFixed(3)}</td>

                                {/* {<td style={ROW_SPACING}> {steps[index]}</td>} */}
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>}  




        </div>
    )


}


export {LeverageETF}