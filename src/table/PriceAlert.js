import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'

import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'


function priceAlertCheck (symbol, priceAlertTable, priceDivHigh, errorAdd, stockChartXValues, stockChartYValues) {
    for (let i = 0; i < priceAlertTable.length; i++) {
        if (priceAlertTable[i].sym !== symbol)
            continue;
        if (priceAlertTable[i].drop === 'true') {
            const threshold = (1 - priceAlertTable[i].percent/100)
            if (priceDivHigh < threshold ){
                errorAdd ([symbol, ', drop_alert, threshold=' + threshold.toFixed(3), ' > price/High=' +  priceDivHigh])
            }
        }
        else {
            const threshold = (1 + priceAlertTable[i].percent/100)
            const rise = stockChartYValues[0] / stockChartYValues[priceAlertTable[i].risePeriod] ;
            if (rise > threshold )
                errorAdd ([symbol, ', rise_alert, threshold=' + threshold.toFixed(3), ' rise=' +  rise.toFixed(3), 'weeks=' + priceAlertTable[i].risePeriod])
        }
    }
}


function PriceAlert (props) {

    const [percent, setPercent] = useState(8)
    const [drop, setDrop]  = useState(true)
    const [LOG, setLOG] = useState(false)
    const {eliHome} = IpContext();
    const {isMobile} = MobileContext();
    const [risePeriod, setRisePeriod] = useState(10)


    function checkDropAll () {
        const sym_list = Object.keys(props.gainMap);
        if (LOG)
            console.log (sym_list)
        if (LOG)
            console.log (props.gainMap)

        // scan all symbols
        for (let i = 0; i < sym_list.length; i++) {
            // calc highest
            const symGainInfo = props.gainMap[sym_list[i]]
            var highest = 0;
            for (let j = 0; j < symGainInfo.y.length; j++) {
                if (highest < symGainInfo.y[j])
                    highest = symGainInfo.y[j]
            }

            // check drop
            const threshold = (1 - percent/100)
            const priceDivHigh = symGainInfo.y[0] / highest 

            if (priceDivHigh < threshold)
                props.errorAdd ([sym_list[i], ', drop_alert, threshold=' + threshold.toFixed(2), ' > price/High=' +  priceDivHigh.toFixed(2)])

        }
        // price 
    }

    function add () {
        if (! percent) {
            props.setErr ('error, need to enter ')
            return;
        }

        props.priceAlertTable.push ({sym: props.symbol, drop: drop? 'true': 'false', percent: percent, risePeriod: drop ? -1: risePeriod})
        localStorage.setItem('priceAlert', JSON.stringify(props.priceAlertTable))
        if (LOG)
            console.log (props.symbol, props.priceAlertTable)
        window.location.reload();
    }
    
    
    function del () {
        for (let i = props.priceAlertTable.length - 1; i >= 0; i--) {  // search from end of table
            if (props.priceAlertTable[i].sym === props.symbol) {
                props.priceAlertTable.splice(i, 1);
                localStorage.setItem('priceAlert', JSON.stringify(props.priceAlertTable))
                if (LOG)
                    console.log (props.symbol, props.priceAlertTable)
                window.location.reload();
                return
            }
        }

    }

    const drop_or_rise = drop ? 'drop % ': 'rise % '

    return (
        <div style={{ border: '2px solid blue'}}>

            {/* ====== Header titles */} 
            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
                <h6 style={{color: 'blue'}}> Price Alert &nbsp;  </h6>
            </div>
            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Price alert setting </h6>

            {eliHome && !isMobile && <div>&nbsp;<input  type="checkbox" checked={LOG}  onChange={()=> setLOG(! LOG)} />LOG&nbsp;</div>}
            <GetInt init={percent} callBack={setPercent} title={drop_or_rise} type='text' pattern="[0-9\.\-]+" width = '15%'/> &nbsp;
            {!drop && <GetInt init={risePeriod} callBack={setRisePeriod} title=' rise-period (weeks)' type='Number' pattern="[0-9]+" width = '15%'/>}         
            
            <div>&nbsp;</div>
            <button  style={{background: 'aqua'}} type="button" onClick={()=>checkDropAll()}> check-drop-all  &nbsp; &nbsp; {percent}% </button> &nbsp;  &nbsp;
            <div>&nbsp;</div>

            <div style={{display:'flex'}}>
                &nbsp;<button  style={{background: 'aqua'}} type="button" onClick={()=>add()}>add {props.symbol} </button> &nbsp;  &nbsp;
                drop=<Toggle names={['false', 'true',]} colors={['gray','red']} state={drop} setState={setDrop} title='drop vs rise'/> &nbsp;

             </div>
             
             <div>&nbsp;</div> &nbsp;
             <button  style={{background: 'aqua'}} type="button" onClick={()=>del()}> delete {props.symbol} </button>
       

            <div>&nbsp;</div>
            {/* {<pre>{JSON.stringify(props.priceAlertTable, null, 2)}</pre>} */}
            <div>count={props.priceAlertTable.length}</div>
            {props.priceAlertTable.length > 0 &&  <div  style={{width: '350px', height: '25vh', 'overflowY': 'scroll'}}>
                <table>
                    <thead>
                    <tr>
                        <th>N</th>
                        {Object.keys(props.priceAlertTable[0]).map((p, index) => {
                            return (
                                <th key={index} scope="col">
                                    {p} 
                                </th>      
                            )
                        })}         
                    </tr>   
                    </thead>

                    <tbody>             
                        {props.priceAlertTable.map((s, s1) =>{
                            return (
                            <tr key={s1}>
                                <td style={{padding: '2px', margin: '1px', width: '12px'}}>{s1}</td>
                                {Object.keys(props.priceAlertTable[s1]).map((k,n)=>{
                                return (
                                    <td key={n} style={{padding: '2px', margin: '1px'}}>
                                        {props.priceAlertTable[s1][k]}
                                    </td>
                                )
                                })
                            }
                            </tr>
                            )
                        })}
                    </tbody>  
                </table>
            </div>}
        </div>
    )
}

export {PriceAlert, priceAlertCheck}