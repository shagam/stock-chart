import React, {useState} from 'react';
import axios from 'axios'
// https://go.cboe.com/l/77532/2021-10-13/bwkqfd
// https://finance.yahoo.com/quote/%5EVIX/history   one year backwards

// volatility index historical 

function Vix (props) {

    const LOG = true;


    const [vix, setVix] = useState()
    const [dat, setDat] = useState()
    const [err, setErr] = useState()

    function vixGet () {
        setErr()
        setDat()

        var corsUrl = ''
        if (props.ssl)
            corsUrl = 'https://'
        else
            corsUrl = 'http://'
        corsUrl += props.corsServer + ":" + props.PORT + "/vix"
        if (false)
        corsUrl += '?txt=txt'
        setErr()
        setDat('request sent to server')
        if (LOG)
            console.log (corsUrl)

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {

        if (result.status !== 200) {
            console.log (props.chartSymbol, 'status=', result)
            return;
        }
        if (LOG)
            console.log (JSON.stringify(result.data))

        if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
            setDat()
            setErr(result.data)
            return;
        }

        const vix = JSON.stringify(result.data,null,2)
        setErr()
        setDat(result.data.val + '      diff=' + result.data.diff + '  ' + result.data.perc)
        // setDat(vix)
            
         } )
        .catch ((err) => {
            setDat()
            setErr(err.message)
        // console.log(err.message)
        })
    }

    return (
        <div>
            <div style={{display: 'flex'}}>
                <div>  <button onClick={vixGet} >volatility index (vix)</button> &nbsp; </div> 
                {dat && <div> {dat} </div>}
                {err && <div> {err} </div>}
            </div>
        </div>
    )

}

export {Vix}