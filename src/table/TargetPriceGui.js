import React, {useState, useEffect} from 'react'
import {getTargetPriceArray, targetHistAll, targetHistoryAll, moveFromFirebase} from './TargetPrice'
import IpContext from '../contexts/IpContext';
import GetInt from '../utils/GetInt'

function TargetPriceGui (props) {
    const [targetInfo, setTargetInfo] = useState ();
    const [targetPriceHist, setTargetPriceHist] = useState ({});

    const [price, setPrice] = useState ();
    const [target, setTarget] = useState ();
    const {localIp, localIpv4, eliHome} = IpContext();
    const [targetBase, setTargetBase] = useState (0);
    const [predict, setPredict] = useState ();

    const LOG = props.logFlags.includes('month')

    // clear vars when symbol change
    useEffect(() => {
        setTargetInfo()
        setPrice()
        setPredict()

        // setTargetPriceHist()
    },[props.symbol]) 

    function targetGetOne () {
        const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
        if (row_index  === -1)
            return;
        if (props.rows[row_index].values.PE === -2) {
            props.errorAdd([props.symbol, 'no target price for ETF'])
            return;
        }
        const tar = getTargetPriceArray (props.symbol, setTargetInfo, props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect)
        setPrice (props.rows[row_index].values.price) // for display
        setTarget (props.rows[row_index].values.target) // for display
    }
    
    function targetGetAll () {
        const tar = targetHistAll (setTargetPriceHist, props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect)
    }
    
    function checkPrediction () {
        const LOG = props.logFlags.includes('target')
        const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
        if (row_index  === -1)
            return;
        const price = props.rows[row_index].values.price // for display
        if (LOG)
            console.log ('predicted:', targetInfo[targetBase].date, targetInfo[targetBase].target, 
            'actual:', targetInfo[targetInfo.length - 1].date, targetInfo[targetInfo.length - 1].price)

        const days =  (targetInfo[targetInfo.length - 1].dateMili -  targetInfo[targetBase].dateMili) / 1000 / 3600 / 24

        const predictionObj = {
            predictionDate:  targetInfo[targetBase].date,
            predictionPrice: targetInfo[targetBase].target,
            actualDate:  targetInfo[targetInfo.length - 1].date,
            actualPrice: price,
            days: days.toFixed(0),
            ratio: (targetInfo[targetInfo.length - 1].price / targetInfo[targetBase].target).toFixed(2)
        }

        setPredict(predictionObj);
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

        <div>

            <h3>Target price history</h3>

            {false && eliHome && <button type="button" onClick={()=>moveFromFirebase (props.logFlags, props.errorAdd, props.ssl, props.PORT, props.servSelect)}>moveFromFirebase</button>}  &nbsp; &nbsp;

            <button type="button" onClick={()=>targetGetAll ()}>targetHistoryAll</button>  &nbsp; &nbsp;
            
            {props.symbol && <button type="button" onClick={()=>targetGetOne ()}>targetHistoryOne </button> }

            <div style = {{display: 'flex'}}>
                {targetInfo && <GetInt init={targetBase} callBack={setTargetBase} title='targetBase' type='Number' pattern="[0-9]+"/>} &nbsp; &nbsp;
                {targetInfo && props.symbol && <button style={{height: '35px', marginTop: '7px'}} type="button" onClick={()=>checkPrediction ()}>checkPrediction </button> }
            </div>

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
            <pre>{JSON.stringify(predict, null, 2)}</pre>
        </div>
    )
}

export {TargetPriceGui}