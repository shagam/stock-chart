import React, {useState, useEffect} from 'react'
import {targetHistoryOne, targetHistAll, targetHistoryAll} from './TargetPrice'
import IpContext from '../contexts/IpContext';
import GetInt from '../utils/GetInt'

function TargetPriceGui (props) {
    const [targetInfoOne, setTargetInfoOne] = useState ();
    const [targetPriceHist, setTargetHistAll] = useState ({});

    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();
    const {localIp, localIpv4, eliHome} = IpContext();
    const [targetBase, setTargetBase] = useState (0);
    const [predict, setPredict] = useState ();
    const [status, setStatus] = useState ();
    const [logBackEnd, setLogBackEnd] = useState ();

    const LOG = props.logFlags.includes('month')

    // clear vars when symbol change
    useEffect(() => {
        setTargetInfoOne()
        setPrice()
        setPredict()
        setTarget()

        // setTargetPriceHist()
    },[props.symbol]) 

    function setLog () {
        setLogBackEnd (! logBackEnd)
    }

    function targetGetOne () {
        const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
        if (row_index  === -1)
            return;
        if (props.rows[row_index].values.PE === -2) {
            props.errorAdd([props.symbol, 'no target price for ETF'])
            setStatus('no target price for ETF')
            return;
        }
        const tar = targetHistoryOne (props.symbol, setTargetInfoOne, setTargetHistAll,  props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect, setStatus, logBackEnd)
        setTargetInfoOne()
        setPrice()
        setPredict()
        setPrice (props.rows[row_index].values.price) // for display
        setTarget (props.rows[row_index].values.target) // for display
    }
    
    function targetGetAll () {
        setTargetInfoOne()
        setPrice()
        setPredict()
        const tar = targetHistAll (setTargetHistAll, setTargetInfoOne, props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect, setStatus, logBackEnd)
    }
    
    function checkPrediction () {
        const LOG = props.logFlags.includes('target')
        const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
        if (row_index  === -1)
            return;
        const price = props.rows[row_index].values.price // for display
        if (LOG)
            console.log ('predicted:', targetInfoOne[targetBase].date, targetInfoOne[targetBase].target, 
            'actual:', targetInfoOne[targetInfoOne.length - 1].date, targetInfoOne[targetInfoOne.length - 1].price)

        const days =  (targetInfoOne[targetInfoOne.length - 1].dateMili -  targetInfoOne[targetBase].dateMili) / 1000 / 3600 / 24

        const predictionObj = {
            predictionDate:  targetInfoOne[targetBase].date,
            predictionPrice: targetInfoOne[targetBase].target,
            actualDate:  targetInfoOne[targetInfoOne.length - 1].date,
            actualPrice: price,
            days: days.toFixed(0),
            ratio: (targetInfoOne[targetInfoOne.length - 1].price / targetInfoOne[targetBase].target).toFixed(2)
        }

        setPredict(predictionObj);
    }


    // show as vertical list of array items
    function renderList(array) {
        if (array.length < 1)
            return;
        return array.map((item, k) => <li key={k}>{JSON.stringify(item)}</li>);
    }
  

    return (

        <div>

            <h5>Target price history</h5>

            {props.symbol && <button style={{background: 'aqua'}} type="button" onClick={()=>targetGetOne ()}>targetHistoryOne </button> } &nbsp;

            <button style={{background: 'aqua'}} type="button" onClick={()=>targetGetAll ()}>targetHistoryAll</button>  &nbsp;
            {eliHome &&  <input type="checkbox" checked={logBackEnd}  onChange={setLog}  />  } &nbsp;LogBackend &nbsp;

            <div style={{color: 'red'}}> {status} </div>
            <div style = {{display: 'flex'}}>
                {targetInfoOne && <GetInt init={targetBase} callBack={setTargetBase} title='targetBase' type='Number' pattern="[0-9]+"/>} &nbsp; &nbsp;
                {targetInfoOne && props.symbol && <button style={{height: '35px', marginTop: '7px'}} type="button" onClick={()=>checkPrediction ()}>checkPrediction </button> }
            </div>

            {target && price && <div>price: {price} &nbsp; &nbsp; target: {target}  &nbsp; &nbsp; (target above 1 - means growth) </div> }
            
            {price && targetInfoOne && renderList(targetInfoOne)}

            {/* <br></br>            */}

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
                    {targetPriceHist[sym].map((targetItem, k) => <li key={k}>{JSON.stringify(targetItem)} </li>)} 
                </div>
                )
            })}
            </div>
            <pre>{JSON.stringify(predict, null, 2)}</pre>
        </div>
    )
}

export {TargetPriceGui}