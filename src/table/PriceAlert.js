import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'

import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';

function priceAlertCheck (symbol, priceAlertTable, priceDivHigh, errorAdd) {
    for (let i = 0; i < priceAlertTable.length; i++) {
        if (priceAlertTable[i].sym !== symbol)
            continue;
        if (priceAlertTable[i].drop === 'true') {
            const threshold = (1 - priceAlertTable[i].percent/100)
            if (priceDivHigh < threshold ){
                errorAdd ([symbol, 'drop_priceAlert threshold=' + threshold, ' > price/High=' +  priceDivHigh])
            }
        }
        else {
            const threshold = (1 + priceAlertTable[i].percent/100)
            if (priceDivHigh > threshold )
                errorAdd ([symbol, ', rise_priceAlert threshold=' + threshold, ' price/High=' +  priceDivHigh])
        }
    }
}


function PriceAlert (props) {

    const [percent, setPercent] = useState(8)
    const [drop, setDrop]  = useState(true)
    const [log, setLog] = useState(false)
    const {eliHome} = IpContext();


    function add () {
        if (! percent) {
            props.setErr ('error, need to enter ')
            return;
        }

        props.priceAlectTable.push ({sym: props.symbol, drop: drop? 'true': 'false', percent: percent})
        localStorage.setItem('priceAlert', JSON.stringify(props.priceAlectTable))
        if (log)
            console.log (props.symbol, props.priceAlectTable)
        window.location.reload();
    }
    
    
    function del () {
        for (let i = props.priceAlectTable.length - 1; i >= 0; i--) {  // search from end of table
            if (props.priceAlectTable[i].sym === props.symbol) {
                props.priceAlectTable.splice(i, 1);
                localStorage.setItem('priceAlert', JSON.stringify(props.priceAlectTable))
                if (log)
                    console.log (props.symbol, props.priceAlectTable)
                window.location.reload();
                return
            }
        }

    }


    return (
        <div style={{ border: '2px solid blue'}}>

            {/* ====== Header titles */} 
            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
                <h6 style={{color: 'blue'}}> Price Alert &nbsp;  </h6>
            </div>
            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Price alert setting </h6>

            {/* {eliHome && <input style={{marginTop: '15px'}} type="checkbox" checked={log}  onChange={setLog(! log)} />} &nbsp; */}
            <GetInt init={percent} callBack={setPercent} title='drop %' type='text' pattern="[0-9\.]+" width = '15%'/> &nbsp;
            
            <div style={{display:'flex'}}>
                <button  style={{background: 'aqua'}} type="button" onClick={()=>add()}>add {props.symbol} </button> &nbsp;  &nbsp;
                {/* drop=<Toggle names={['false', 'true',]} colors={['gray','red']} state={drop} setState={setDrop} title='drop vs rise'/> &nbsp; */}
             </div>
             
             <div>&nbsp;</div>
             <button  style={{background: 'aqua'}} type="button" onClick={()=>del()}> delete {props.symbol} </button>
       

            <div>&nbsp;</div>
            {/* {<pre>{JSON.stringify(props.priceAlectTable, null, 2)}</pre>} */}
            <div>count={props.priceAlectTable.length}</div>
            {props.priceAlectTable.length > 0 &&  <div  style={{width: '300px', height: '25vh', 'overflowY': 'scroll'}}>
                <table>
                    <thead>
                    <tr>
                        <th>N</th>
                        {Object.keys(props.priceAlectTable[0]).map((p, index) => {
                            return (
                                <th key={index} scope="col">
                                    {p} 
                                </th>      
                            )
                        })}         
                    </tr>   
                    </thead>

                    <tbody>             
                        {props.priceAlectTable.map((s, s1) =>{
                            return (
                            <tr key={s1}>
                                <td style={{padding: '2px', margin: '1px', width: '12px'}}>{s1}</td>
                                {Object.keys(props.priceAlectTable[s1]).map((k,n)=>{
                                return (
                                    <td key={n} style={{padding: '2px', margin: '1px'}}>
                                        {props.priceAlectTable[s1][k]}
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