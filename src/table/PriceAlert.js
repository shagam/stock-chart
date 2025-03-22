import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import axios from 'axios'
import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import {todaySplit, todayDate, dateSplit,} from '../utils/Date'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import { setRef } from '@material-ui/core';
import { beep2 } from '../utils/ErrorList';


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
    const [above, setAbove]  = useState(true)  // above
    const [LOG, setLOG] = useState(false)
    const {eliHome} = IpContext();
    const {isMobile} = MobileContext();
    const [risePeriod, setRisePeriod] = useState(10)
    const [showDel, setShowDel] = useState(false)
    const [refresh, setRefresh] = useState(false)   


  // Initialize state with localStorage value or a default value
  const [priceAlertTable, setPriceAlertTable] = useState(() => {
    const savedState = localStorage.getItem('priceAlert');
    const parsedState = savedState ? JSON.parse(savedState) : [];
    // props.setPriceAlertTable(parsedState);
    return parsedState;
    });



    useEffect (() => {
        for (let i = priceAlertTable.length - 1; i >= 0; i--) {  // search from end of table
            if (priceAlertTable[i].sym === props.symbol) {
                setShowDel (true);
                setThesholdPrice (props.stockChartYValues[0])
                return;
            }
            setShowDel(false);
        }
    }, [props.symbol, priceAlertTable, props.stockChartYValues]) 


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

        props.priceAlertTable.push ({sym: props.symbol, above: above? 'true': 'false' , thresholdPrice: thresholdPrice})
        localStorage.setItem('priceAlert', JSON.stringify(props.priceAlertTable))
        setPriceAlertTable(priceAlertTable)
        props.setPriceAlertTable(priceAlertTable)
        setRefresh(! refresh)
        if (LOG)
            console.log (props.symbol, priceAlertTable)
        // window.location.reload();
    }
    
    
    function del () {
        for (let i = props.priceAlertTable.length - 1; i >= 0; i--) {  // search from end of table
            if (props.priceAlertTable[i].sym === props.symbol) {
                props.priceAlertTable.splice(i, 1);
                localStorage.setItem('priceAlert', JSON.stringify(props.priceAlertTable))
                setPriceAlertTable(priceAlertTable)
                props.setPriceAlertTable(priceAlertTable)
                setRefresh(! refresh)
                if (LOG)
                    console.log (props.symbol, priceAlertTable)
                // window.location.reload();
                return
            }
            beep2()
        }
    }


    const drop_or_rise = above ?  'above' : 'below'

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
                <button  style={{background: 'aqua'}} type="button" onClick={()=>checkDropAll()}> check-drop-from-high (all)  &nbsp; &nbsp; </button> &nbsp;  &nbsp;
                {/* &nbsp;<button  style={{background: 'aqua'}} type="button" onClick={()=>latestPrice__()}>latest-price {props.symbol} </button> */}
                <GetInt init={percent} callBack={setPercent} title={'percent-drop'} type='text' pattern="[0-9\.\-]+" width = '15%'/> &nbsp;
            </div>


            {/* Add remove buttons  */}

            <hr/> 
            {eliHome && !isMobile && <div style={{display:'flex'}} >&nbsp;<input  type="checkbox" checked={LOG}  onChange={()=> setLOG(! LOG)} /> &nbsp;log &nbsp;</div>} &nbsp;
            <div style={{display:'flex'}}>
                <button  style={{background: 'lightgreen'}} type="button" onClick={()=>add()}>price-alert-add  &nbsp;  &nbsp; {props.symbol} </button> &nbsp;  &nbsp;
                <ComboBoxSelect serv={above} nameList={['below','above',]} setSelect={setAbove} title='' TITLE='above vs below' options={[false,true]} defaultValue={above} /> &nbsp;
             </div>
             
             <div>&nbsp;</div>
             {showDel && <button  style={{background: '#ffccff'}} type="button" onClick={()=>del()}> price-alert-delete {props.symbol} </button>}
       
             <div style={{display:'flex'}} >
                <div style={{marginTop:'10px'}}>Threshold-price</div> &nbsp; &nbsp;  &nbsp;  &nbsp;
                <GetInt init={thresholdPrice} callBack={setThesholdPrice} title={drop_or_rise} type='text' pattern="[0-9\.\-]+" width = '25%'/> &nbsp;
            {/* {!drop && <GetInt init={risePeriod} callBack={setRisePeriod} title=' rise-period (weeks)' type='Number' pattern="[0-9]+" width = '15%'/>}          */}
            </div>

            <div>&nbsp;</div>
            {<div style={{display:'flex'}}>
                <input  type="checkbox" checked={refresh}  onChange={()=> setRefresh(! refresh)} /> refresh &nbsp;  &nbsp;
                <div style={{color: 'magenta'}}>Toggle refresh to refresh table</div>
            </div>}

            {/* price alert Table  */}

            <div>&nbsp;</div> &nbsp;         
            {/* {<pre>{JSON.stringify(props.priceAlertTable, null, 2)}</pre>} */}
            <div>count={priceAlertTable.length}</div>
            {priceAlertTable.length > 0 &&  <div  style={{width: '350px', maxHeight: '35vh', 'overflowY': 'scroll'}}>
                <table>
                    <thead>
                    <tr>
                        <th>N</th>
                        {Object.keys(priceAlertTable[0]).map((p, index) => {
                            return (
                                <th key={index} scope="col">
                                    {p} 
                                </th>      
                            )
                        })}         
                    </tr>   
                    </thead>

                    <tbody>             
                        {priceAlertTable.map((s, s1) =>{
                            return (
                            <tr key={s1}>
                                <td style={{padding: '2px', margin: '1px', width: '12px'}}>{s1}</td>
                                {Object.keys(priceAlertTable[s1]).map((k,n)=>{
                                return (
                                    <td key={n} style={{padding: '2px', margin: '1px'}}>
                                        {priceAlertTable[s1][k]}
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