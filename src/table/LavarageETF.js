import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'



function LavarageETF (props) {
    const [ratioArr, setRatioArr] = useState ([])
    const [symArray, setSymArray] = useState ([])
    const [dateArray, setDateArray] = useState([])
    const [valArrLen, setValArrLen] = useState ()
    const [pivotSym, setPivotSym] = useState ()
    const [pivotSymIndex, setPivotSymIndex] = useState ()

    const symArray_ = [] // temp collection
    
    function gainClose(i) {
        // if (dateArray.length === 0)
        //     return -1 // not ready yet
        // if (i < 0)
        //     return -1
        const close = Number(props.gainObj[dateArray[i]]['5. adjusted close']) 
        return close.toFixed(2)
    }

    function lavarage() {

        console.log ('lavarage')
        console.log (props.gainMap)
        
        const symArray_ = Object.keys(props.gainMap)
        setSymArray (symArray_)
        if (symArray_.length < 2)
            return;

        //** compare only last array section  */
        var lengthMin;
        var yArray = props.gainMap[symArray_[0]].y
        // setPivotSymIndex (0)
        // setPivotSym(symArray_[0]);
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

        //** calc ratio */

        for (let i = 0; i < lengthMin; i++) {
            ratioArr[i] = props.gainMap[symArray_[0]].y[i] / props.gainMap[symArray_[1]].y[i]
        }


        setValArrLen (lengthMin)
        setDateArray(props.gainMap[symArray_[indexOfPivotSym]].x)

    }

    return (
        <div>
            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
                <h6  style={{color: 'blue' }}> Lavarage ETF </h6>
            </div>

            <button onClick={lavarage} > Lavarage calc</button>
            {pivotSym && symArray.length > 1 && <div> length={valArrLen} oldestDate={props.gainMap[pivotSym].x[valArrLen - 1]} </div>}
            {pivotSym && symArray.length > 1 && ratioArr.length > 1 && <div style={{height:'450px', width: '630px', overflow:'auto'}}>
                <table>
                    <thead>
                        <tr>
                        <th style={{monWidth: '300px'}}>date</th>
                        <th>{symArray[0]}</th>
                        <th>{symArray[0]} gain</th>

                        <th>{symArray[1]}</th>
                        <th>{symArray[1]} gain</th>

                        {/* <th>nextOpen</th> */}

                        </tr>
                    </thead>
                    <tbody>
                        {props.gainMap[pivotSym].y.map((date, index) =>{
                            return (
                            <tr key={index}>
                                <td style={{width: '100px'}}>{props.gainMap[pivotSym].x[index]}  </td> 
                                <td>{props.gainMap[symArray[0]].y[index].toFixed(2)}</td>
                                <td>{(props.gainMap[symArray[0]].y[index] / props.gainMap[symArray[0]].y[valArrLen - 1]).toFixed(3)}</td>
                                <td>{props.gainMap[symArray[1]].y[index].toFixed(2)}</td>
                                <td>{(props.gainMap[symArray[1]].y[index] / props.gainMap[symArray[1]].y[valArrLen - 1]).toFixed(3)}</td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>}  




        </div>
    )


}


export {LavarageETF}