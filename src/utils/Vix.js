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
    const [url, setUrl] = useState()

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
        setUrl('https://www.google.com/search?q=vix')
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
        <div style={{display: 'flex'}}>
            <h5>Volatility index </h5> &nbsp;&nbsp;
            <a href="https://www.google.com/search?q=vix">VIX (Google)</a> &nbsp;&nbsp;&nbsp;
            <a href="https://finance.yahoo.com/quote/%5EVIX/">VIX (Yahoo/finance)</a> &nbsp;&nbsp;&nbsp;

            {/* <div>  <button onClick={()=> window.open('https://www.google.com/search?q=vix', '_blank')} >VIX Google tab</button> &nbsp; </div>  */}
            {/* <div>  <button onClick={()=> window.open('https://finance.yahoo.com/quote/%5EVIX/', '_blank')} >VIX Yahoo tab</button> &nbsp; </div>  */}

            {/* <a href='https://www.marketwatch.com/investing/index/vix'>VIX (CBOA)</a> */}
            {/* window.open(URL, '_blank'); */}
        </div>
    )

}

export {Vix}