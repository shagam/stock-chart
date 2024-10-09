import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'



function LeverageETF (props) {
    const [gainCalc, setGainCalc] = useState ({})
    const [yearlyGainCalc, setYearlyGainCalc] = useState ({})
    const [symArray, setSymArray] = useState ([])
    const [dateArray, setDateArray] = useState([])
    const [valArrLen, setValArrLen] = useState ()
    const [pivotSym, setPivotSym] = useState ()
    const [pivotSymIndex, setPivotSymIndex] = useState ()
    const [yearlGainCalc, strYearlyGainCalc]  = useState ({})
    
    function gainClose(i) {
        // if (dateArray.length === 0)
        //     return -1 // not ready yet
        // if (i < 0)
        //     return -1
        const close = Number(props.gainObj[dateArray[i]]['5. adjusted close']) 
        return close.toFixed(2)
    }

    function leverage() {

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

        for (let s = 0; s < symArray_.length; s++) {
            var gainArr = []
            var yearlyGainArr = []
            for (let i = 0; i < lengthMin; i++) {
                gainArr[i] = props.gainMap[symArray_[s]].y[i] / props.gainMap[symArray_[s]].y[lengthMin - 1]
                yearlyGainArr[i] = Math.pow (gainArr[i], 1 / ((lengthMin - 1) / 52))
            }
            gainCalc[symArray_[s]] = gainArr;
            yearlGainCalc[symArray_[s]] = yearlyGainArr;
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

            <button  style={{background: 'aqua'}}  onClick={leverage} > Lavarage calc</button>
            <h6>Compare leverage ETF (like TQQQ)  with base ETF (QQQ) </h6>
            {pivotSym && symArray.length > 1 && <div> length={valArrLen} &nbsp;&nbsp; oldestDate={props.gainMap[pivotSym].x[valArrLen - 1]} </div>}
            {pivotSym && symArray.length > 1 && <div style={{height:'450px', width: '650px', overflow:'auto'}}>
                <table>
                    <thead>
                        <tr>
                        <th style={{monWidth: '300px'}}>date</th>
                        <th>{symArray[0] + ' $'}</th>
                        <th>{symArray[0]} gain</th>
                        <th>{symArray[0]} yearly gain</th>

                        <th>{symArray[1] + ' $'}</th>
                        <th>{symArray[1]} gain</th>
                        <th>{symArray[1]} yearly gain</th>
                        {/* <th>nextOpen</th> */}

                        </tr>
                    </thead>
                    <tbody>
                        {props.gainMap[pivotSym].y.map((date, index) =>{
                            return (
                            <tr key={index}>
                                <td style={{width: '110px'}}>{props.gainMap[pivotSym].x[index]}  </td>

                                <td>{props.gainMap[symArray[0]].y[index].toFixed(2)}</td>
                                <td>{gainCalc[symArray[0]][index].toFixed(2)}</td>                                
                                <td>{yearlGainCalc[symArray[0]][index].toFixed(2)}</td>

                                <td>{props.gainMap[symArray[1]].y[index].toFixed(2)}</td>
                                <td>{gainCalc[symArray[1]][index].toFixed(2)}</td>  
                                <td>{yearlGainCalc[symArray[1]][index].toFixed(2)}</td>
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