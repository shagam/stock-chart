import React, {useState} from 'react';
import axios from 'axios'

function Vix (props) {

    const LOG = true;


    const [vix, setVix] = useState()
    const [dat, setDat] = useState()
    const [err, setErr] = useState()

    function vixGet () {
        setErr ()
        setDat()

        var corsUrl = ''
        if (props.ssl)
            corsUrl = 'https://'
        else
            corsUrl = 'http://'
        corsUrl += props.corsServer + ":" + props.PORT + "/vix"

        setErr('request sent to server')
        if (LOG)
            console.log (corsUrl)

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
        setErr()
        if (result.status !== 200) {
            console.log (props.chartSymbol, 'status=', result)
            return;
        }
        if (LOG)
            console.log (JSON.stringify(result.data))

        if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
            setErr(result.data)
            return;
        }

        setDat(result.data)
            
        } )
        .catch ((err) => {
        setErr(err.message)
        // console.log(err.message)
        })
    }

    return (
        <div>
            <div style={{display: 'flex'}}>
                <div>  <button onClick={vixGet} > vix </button> &nbsp; </div> 
                {dat && <div> {dat} </div>}
                {err && <div> {err} </div>}
            </div>
        </div>
    )

}

export {Vix}