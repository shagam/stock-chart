import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import axios from 'axios'
import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import {todaySplit, todayDate, dateSplit,} from '../utils/Date'



function priceAlertCheck (symbol, priceAlertTable, price, errorAdd, stockChartXValues, stockChartYValues) {
    for (let i = 0; i < priceAlertTable.length; i++) {
        if (priceAlertTable[i].sym !== symbol)
            continue;
        const threshold = priceAlertTable[i].thresholdPrice
        if (priceAlertTable[i].above === 'true') {
            if (price > threshold){
                errorAdd ([symbol, ', price_alert, threshold=' + threshold, ' < price=' + price, 'above=' + priceAlertTable[i].above])
            }
        }
        else {
            if (price < threshold) {
                errorAdd ([symbol, ', price_alert, threshold=' + threshold, ' > price=' + price, 'above=' + priceAlertTable[i].above])
            }
        }
    }
}


function PriceAlert (props) {

    const [percent, setPercent] = useState(8)
    const [thresholdPrice, setThesholdPrice] = useState(props.stockChartYValues[0])
    const [drop, setDrop]  = useState(true)  // above
    const [LOG, setLOG] = useState(false)
    const {eliHome} = IpContext();
    const {isMobile} = MobileContext();
    const [risePeriod, setRisePeriod] = useState(10)


    // function latestPrice__() {
    //     latestPrice (props.symbol, props.servSelect, props.PORT, props.ssl, props.rows, props.refreshByToggleColumns, props.errorAdd, props.stockChartXValues, props.stockChartYValues, LOG)
    // }


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
        // remove prev alert on same sym
        for (let i = props.priceAlertTable.length - 1; i >= 0; i--) {
            if (props.priceAlertTable[i].sym === props.symbol) {
                props.priceAlertTable.splice(i, 1);
            }
        }

        props.priceAlertTable.push ({sym: props.symbol, above: drop? 'true': 'false' , thresholdPrice: thresholdPrice})
        localStorage.setItem('priceAlert', JSON.stringify(props.priceAlertTable))
        if (LOG)
            console.log (props.symbol, props.priceAlertTable)
        // window.location.reload();
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


    const drop_or_rise = drop ? 'Threshold-price-below': 'Threshold-price-above'

    return (
        <div style={{ border: '2px solid blue'}}>

            {/* ====== Header titles */} 
            <div style = {{display: 'flex'}}>
                <div  style={{color: 'magenta' }}>  {props.symbol} </div> &nbsp; &nbsp;
                <h6 style={{color: 'blue'}}> Price Alert &nbsp;  </h6>
            </div>
            <h6 style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>Price alert setting </h6>

            <div>&nbsp;</div>
            <div style={{display:'flex'}}>
                {eliHome && !isMobile && <div>&nbsp;<input  type="checkbox" checked={LOG}  onChange={()=> setLOG(! LOG)} /> LOG&nbsp;</div>}
                <button  style={{background: 'aqua'}} type="button" onClick={()=>checkDropAll()}> check-drop-all  &nbsp; &nbsp; </button> &nbsp;  &nbsp;
                {/* &nbsp;<button  style={{background: 'aqua'}} type="button" onClick={()=>latestPrice__()}>latest-price {props.symbol} </button> */}
                <GetInt init={percent} callBack={setPercent} title={'percent-drop'} type='text' pattern="[0-9\.\-]+" width = '15%'/> &nbsp;
            </div>

            <hr/> 


            <GetInt init={thresholdPrice} callBack={setThesholdPrice} title={drop_or_rise} type='text' pattern="[0-9\.\-]+" width = '15%'/> &nbsp;
            {/* {!drop && <GetInt init={risePeriod} callBack={setRisePeriod} title=' rise-period (weeks)' type='Number' pattern="[0-9]+" width = '15%'/>}          */}

            <div style={{color: 'magenta'}}>Reload page to see changes</div>
            <div style={{display:'flex'}}>
                &nbsp;<button  style={{background: 'aqua'}} type="button" onClick={()=>add()}>add {props.symbol} </button> &nbsp;  &nbsp;
                above=<Toggle names={['false', 'true',]} colors={['gray','red']} state={drop} setState={setDrop} title='above vs below'/> &nbsp;

             </div>
             
             <div>&nbsp;</div> &nbsp;
             {<button  style={{background: 'aqua'}} type="button" onClick={()=>del()}> delete {props.symbol} </button>}
       

            <div>&nbsp;</div>
            {/* {<pre>{JSON.stringify(props.priceAlertTable, null, 2)}</pre>} */}
            <div>count={props.priceAlertTable.length}</div>
            {props.priceAlertTable.length > 0 &&  <div  style={{width: '350px', maxHeight: '35vh', 'overflowY': 'scroll'}}>
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