import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import axios from 'axios'
import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import {todaySplit, todayDate, dateSplit,} from '../utils/Date'
import {getDate,} from '../utils/Date'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'



function LatestPrice (props) {
    const [LOG, setLOG] = useState(false)
    const {eliHome} = IpContext();
    const [subPages, setSubPages] = useState(false)  
    const priceSources = ['goog','fetchPage','nasdaq','yahoo','watch']
    const [source, setSource] = useState(priceSources[0])
    

    const log = props.logFlags.includes('gain')

    function latestPrice() {

        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/latestPrice?stock=' + props.symbol
        corsUrl += '&src=' + source 
        // corsUrl += '&src=' + 'goog'     during trade hours
        // corsUrl += '&src=' + 'fetchPage'  // during trade hours
        // corsUrl += '&src=' + 'nasdaq' // fails during trade hours
        // corsUrl += '&src=' + 'yahoo'  // during trade hours
        // corsUrl += '&src=' + 'watch' // fails during trade hours

        if (LOG)
            corsUrl += '&LOG=1'
        if (subPages)
            corsUrl += '&subPages=' + true
        console.log (props.symbol + ' ' + corsUrl)  

        const mili = Date.now()

        axios.get (corsUrl)

        .then ((result) => {
            if (result.status !== 200) {
                props.setErr(props.symbol + ' ' + result.status)
                return;
            }

            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                console.log(props.symbol, getDate(), 'latestPrice', dat)
                props.setErr(props.symbol + ' ' +  getDate() + ' latestPrice ' + dat)
                return;
            }
            if (log)
                console.log (dat)
            // find highest price
            var highestPrice = -1; // highest price
            for (let i = 0; i < props.stockChartYValues.length; i++) {
                const val = props.stockChartYValues[i];
                if (val > highestPrice)
                    highestPrice = val;
            }

            const price = Number(dat.price)
            console.log ('price=' + price, ' highest=' + highestPrice.toFixed(2), ' price/Highest=' + (price / highestPrice).toFixed(3))

            const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);

            props.rows[row_index].values.price = price.toFixed(2);
            props.rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(3); 
            props.refreshByToggleColumns()
        }).catch ((err) => {
            console.log(getDate(), err.message)
            props.setErr(props.symbol + ' ' + err.message)
        })   
    }
//  'inline-block'
    return (
        <div style={{display: 'flex'}}>
            <ComboBoxSelect serv={source} nameList={priceSources} setSelect={setSource} title='' TITLE='market open price ' options={priceSources} defaultValue={false} /> &nbsp;
            <div> <input  type="checkbox" checked={subPages}  onChange={()=> setSubPages(! subPages)} />  subPages </div>
            &nbsp;<button  style={{background: 'aqua'}} type="button" title="price during market closed (not ready)" onClick={()=>latestPrice()}>marketClosed {props.symbol} </button>
        </div>

    )

}

export {LatestPrice}