import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import {beep2} from '../utils/ErrorList'
import {yearsDifference} from '../utils/Date'


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

    //** git index of heigest value */
    function getHighestValue ( yArray) {
        var highest = yArray[0];
        var highIndex = 0;
        for (let i = 0; i < yArray.length; i++) {
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

    function leverage() {

        setErr()
        console.log ('lavarage')
        console.log (props.gainMap)
        
        const symArray_ = Object.keys(props.gainMap)
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
            const historyArrLength = y.length
            const highest_index = getHighestValue (y);
            const lowest_index =  getLowestAfterHigh (y, highest_index)
            console.log (symArray_[s], 'high ind=', highest_index, props.gainMap[symArray_[s]].x[highest_index], props.gainMap[symArray_[s]].y[highest_index])
            // props.gainMap[symArray_[s]].drop = []
            var dropFromHigh  = []
            for (let i = 0; i < historyArrLength; i++) {
                dropFromHigh[i] = (y[i] / y[highest_index]).toFixed(3)
            }
            props.gainMap[symArray_[s]].dropFromHigh = dropFromHigh
            props.gainMap[symArray_[s]].highest_ndex = highest_index;
            props.gainMap[symArray_[s]].lowest_ndex = lowest_index;
            // highLowText_ += highLowText + ' sym=' + symArray_[s] + "  highest=" + highest_index + '  lowest=' + lowest_index;
            const indexes = {}
            indexes.highestIndex =  highest_index
            indexes.lowestIndex =  lowest_index
            highLowIndex[symArray_[s]] = indexes
        }
        // setHighLowIndex(indexes)
    }

    const ROW_SPACING = {padding: '2px', margin: '2px'}

    return (
        <div style = {{ border: '2px solid blue'}}>
            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
                <h6  style={{color: 'blue' }}> Lavarage ETF </h6> &nbsp; &nbsp;
                <div>{props.daily? '(daily)' : '(weekly)'}</div>
            </div>

            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Compare leverage ETF (like TQQQ)  with base ETF (QQQ) </h6>
            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> gain === price / oldest price</h6>

            <div style={{color: 'red'}}> {err} </div>
            
            <button  style={{background: 'aqua'}}  onClick={leverage} > Lavarage calc</button>

            {highLowIndex !== '{}' && <pre>{JSON.stringify(highLowIndex, null, 2)}</pre>}
            
            {/* Yearly gain TABLE */}
            
            {pivotSym && symArray.length > 1 && <div> weekCount={valArrLen} &nbsp;&nbsp; oldestDate={props.gainMap[pivotSym].x[valArrLen - 1]} </div>}
            {pivotSym && symArray.length > 1 && <div style={{height:'450px', width: '650px', overflow:'auto'}}>
                <table>
                    <thead>
                        <tr>
                            <th>N</th>
                            <th style={{monWidth: '300px'}}>date</th>
                            <th style={ROW_SPACING}> {symArray[0] + ' $'}</th>
                            {/* <th>{symArray[0]} gain</th> */}
                            <th style={ROW_SPACING}>{symArray[0]} drop</th>

                            <th style={ROW_SPACING}>{symArray[1] + ' $'}</th>
                            {/* <th>{symArray[1]} gain</th> */}
                            <th style={ROW_SPACING}>{symArray[1]} drop</th>
                            {/* <th>nextOpen</th> */}

                        </tr>
                    </thead>
                    <tbody>
                        {props.gainMap[pivotSym].y.map((date, index) =>{
                            return (
                            <tr key={index}>
                                <td style={{padding: '2px', margin: '2px'}}>{index}</td>
                                <td style={{padding: '2px', margin: '2px', width:'120px'}} >{props.gainMap[pivotSym].x[index]}  </td>

                                <td style={ROW_SPACING}> {props.gainMap[symArray[0]].y[index].toFixed(2)}</td>
                                {/* <td style={ROW_SPACING}> {gainCalc[symArray[0]][index].toFixed(2)}</td>                                 */}
                                {/* <td style={ROW_SPACING}> {yearlGainCalc[symArray[0]][index].toFixed(2)}</td> */}
                                <td style={ROW_SPACING}> {props.gainMap[symArray[0]].dropFromHigh[index]}</td>

                               
                                <td style={ROW_SPACING}> {props.gainMap[symArray[1]].y[index].toFixed(2)}</td>
                                {/* <td style={ROW_SPACING}> {gainCalc[symArray[1]][index].toFixed(2)}</td>   */}
                                {/* <td style={ROW_SPACING}> {yearlGainCalc[symArray[1]][index].toFixed(2)}</td> */}
                                <td style={ROW_SPACING}> {props.gainMap[symArray[1]].dropFromHigh[index]}</td>
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