import React, {useState, useEffect} from 'react'
import axios from 'axios'

import {ErrorList, beep, beep2} from '../utils/ErrorList'

import {IpContext} from '../contexts/IpContext';
import { useAuth } from '../contexts/AuthContext';
import MobileContext from '../contexts/MobileContext'

import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import GlobalFilter from '../utils/GlobalFilter'  

function Users (props) {
    const [logBackEnd, setLogBackEnd] = useState ();
    const {localIp, localIpv4, eliHome} = IpContext();
    const { currentUser, admin, logout } = useAuth();
    const [err, setErr] = useState()
    const [userFilter, setUserFilter] = useState ();

    const [getAll, setGetAll] = useState (true);
    const [extra, setExtra] = useState ();
    const [tbl, setTbl] = useState ({});
    const [logExtra, setLogExtra] = useState ();
    const [results, setResults] = useState()
    const [infoJson, setInfoJson] = useState({})

    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();

    function clear () {
        setResults()
        setErr()
        setInfoJson({})
        setTbl({})
    }

    function error(arr) {
        clear()
        setErr (JSON.stringify(arr))
        props.errorAdd(arr)

    }

    async function users () {
        clear();
        const LOG = props.logFlags.includes('gain');  
        const mili = Date.now()

        var corsUrl = ''
        if (props.ssl)
            corsUrl = 'https://'
        else
            corsUrl = 'http://'
        corsUrl += props.corsServer + ":" + props.PORT + '/users?param=1'
        if (logBackEnd)
            corsUrl += '&LOG=1'
        if (logExtra)
            corsUrl += '&LOG_EXTRA=1'
        if (userFilter)
            corsUrl += '&filter=' + userFilter;
        if (getAll)
            corsUrl += '&getAll=true';
        
        setErr('users Request request sent')  
        // if (LOG)
        console.log (corsUrl)

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
    
            if (result.status !== 200) {
                console.log (getDate(), 'status=', result)
                return;
            }
            if (LOG)
                console.log (JSON.stringify(result.data))
    
            if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
                props.errorAdd([getDate(),  ' users', result.data])
            }
            if (LOG || logBackEnd)
            console.log(getDate(),  'users arrived', result.data) 
            setErr('backEnd users,  Latency(msec)=' + latency ) 

            if (getAll) {
                var tbl1 = {}
                const inf = result.data
                const ipList = Object.keys (result.data);
                for (let i = ipList.length - 1; i >= 0; i--) {
                    tbl1[ipList[i]] = {
                        date: inf[ipList[i]].date,
                        ip:   inf[ipList[i]].ip,
                        city: inf[ipList[i]].city,
                        country: inf[ipList[i]].country,
                        count: inf[ipList[i]].count,
                    }
                    if (extra) {
                        tbl1[ipList[i]].region = inf[ipList[i]].region
                        tbl1[ipList[i]].os = inf[ipList[i]].os
                        tbl1[ipList[i]].sym = inf[ipList[i]].sym
                    }
                }
                setTbl (tbl1) // show in obj format
                return;
            }

            setInfoJson (result.data)
        } )
        .catch ((err) => {
        clear()
        error([getDate(), 'backEnd users', err.message])
        console.log(getDate(), 'backEnd users', err.message)
    }) 

    const latency = Date.now() - mili
    setErr('usrs list done, latency(msec)=' + latency)

  
    }

    const ROW_SPACING = {padding: '2px', margin: '2px'}

    return (
        <div>
            <h6 style={{color: 'blue'}}> Users &nbsp;  </h6>
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Count number of users  &nbsp; </h6>
            {err && <div style={{color:'red'}}>{err}</div>}

            <div style={{display: 'flex'}}>
                &nbsp;<div> <input type="checkbox" checked={getAll}  onChange={()=> setGetAll(! getAll)}  /> &nbsp;getAll </div> &nbsp;&nbsp;
                <div> <input type="checkbox" checked={logBackEnd}  onChange={() => setLogBackEnd(! logBackEnd)}  /> &nbsp;LogBackend &nbsp; &nbsp;</div>
                <div> <input type="checkbox" checked={logExtra}  onChange={()=> setLogExtra(!logExtra)}  /> &nbsp;LogExtra &nbsp; &nbsp;</div>            
                <div> <input type="checkbox" checked={extra}  onChange={()=> setExtra(! extra)}  /> &nbsp;region,os</div>
            </div>


            <div style={{display: 'flex'}}>
                <button style={{background: 'aqua', height: '27px', marginTop: '16px'}} type="button" onClick={()=> users ()}>userInfo  </button> &nbsp;&nbsp;
                <GlobalFilter className="stock_button_class_" filter={userFilter} setFilter={setUserFilter} name='userFilter' isMobile={isMobile}/>&nbsp; &nbsp;
            <div> &nbsp; </div> 
            </div>
            {/* <hr/>      */}

            {/* <div>&nbsp;</div> */}
            {infoJson && Object.keys(infoJson).length > 0 && <pre>{JSON.stringify(infoJson, null, 2)}</pre>}

            <div>count={Object.keys(tbl).length} </div>
            {tbl && Object.keys(tbl).length > 0 && <div style={{ maxHeight: '45vh', 'overflowY': 'scroll'}}> 
                <table>
                    <thead>
                    <tr>
                        <th>N</th>
                        {Object.keys(tbl[Object.keys(tbl)[0]]).map ((h, h1) => {
                            return (<th key={h1}>{h}</th>)
                        }) }
                    </tr>
                    </thead>
                    <tbody>
                        {Object.keys(tbl).sort((a, b) => b.date > a.date).map((s, s1) =>{
                            return (
                            <tr key={s1}>
                                <td style={ROW_SPACING}>{s1}</td>
                                {Object.keys(tbl[s]).map((t, t1) => {
                                    return (<td style={ROW_SPACING} key={t1}>{tbl[s][t]}</td>)
                                })}
                            </tr>
                        )
                        })}
                    </tbody>
                </table>        
            </div>}
        </div>
    )
    
}


export {Users}