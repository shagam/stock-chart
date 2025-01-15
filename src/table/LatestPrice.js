import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import axios from 'axios'
import GetInt from '../utils/GetInt'
import Toggle from '../utils/Toggle'
import {IpContext} from '../contexts/IpContext';
import MobileContext from '../contexts/MobileContext'
import {todaySplit, todayDate, dateSplit,} from '../utils/Date'
import {getDate,} from '../utils/Date'



function LatestPrice (props) {
    const [LOG, setLOG] = useState(false)
    const {eliHome} = IpContext();


    function latestPrice() {

        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/latestPrice?stock=' + props.symbol + '&src=' + 'goog'
        if (LOG)
            corsUrl += '&LOG=1'
        console.log (props.symbol + ' ' + corsUrl)  

        const mili = Date.now()

        axios.get (corsUrl)

        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                console.log(getDate(), dat)
                return;
            }

            console.log ('results' , dat)

            // find highest price
            var highestPrice = -1; // highest price
            for (let i = 0; i < props.stockChartYValues.length; i++) {
                const val = props.stockChartYValues[i];
                if (val > highestPrice)
                    highestPrice = val;
            }

            const row_index = props.rows.findIndex((row)=> row.values.symbol === props.symbol);
            const price = Number(dat.price)
            props.rows[row_index].values.price = price.toFixed(2);
            props.rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(3); 
            props.refreshByToggleColumns()
        }).catch ((err) => {
            console.log(getDate(), err.message)
        })   
    }

    return (
        <div>
           &nbsp;<button  style={{background: 'aqua'}} type="button" onClick={()=>latestPrice()}>latest-price {props.symbol} </button>
        </div>

    )

}

export {LatestPrice}