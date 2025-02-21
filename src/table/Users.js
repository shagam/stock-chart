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
    const [logBackEnd, setLogBackEnd] = useState (false);
    const {localIp, localIpv4, eliHome} = IpContext();
    const {currentUser, admin, logout } = useAuth();
    const [err, setErr] = useState()
    const [userFilter, setUserFilter] = useState ();

    const [getAll, setGetAll] = useState (true);
    const [extra, setExtra] = useState (false);
    // const [tbl, setTbl] = useState ({});
    const [userArray, setUserArray] = useState([]);
    const [logExtra, setLogExtra] = useState (false);
    const [milisec, setMilisec] = useState (false);
    const [results, setResults] = useState()
    const [infoJson, setInfoJson] = useState({})

    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();

    function clear () {
        setResults()
        setErr()
        setInfoJson({})
        setUserArray({})
    }

    function error(e) {
        clear()
        setErr (JSON.stringify(e))
        props.errorAdd([e])

    }

    async function users () {
        clear();

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
        if (logBackEnd)
        console.log (corsUrl)

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
    
            if (result.status !== 200) {
                console.log (getDate(), 'status=', result)
                return;
            }
            if (logBackEnd)
                console.log (JSON.stringify(result.data))
    
            if (typeof(result.data) === 'string' && result.data.startsWith('fail')) {
                props.errorAdd([getDate(),  ' users', result.data])
            }
            if (logBackEnd)
            console.log(getDate(),  'users arrived', result.data) 
            setErr('backEnd users,  Latency(msec)=' + latency ) 

            if (getAll) {
                var arr_unsort = []
                const inf = result.data
                const ipList = Object.keys (result.data);
                if (logBackEnd)
                    console.log (result.data)
                for (let i = ipList.length - 1; i >= 0; i--) {
                    var obj = {
                        mili: inf[ipList[i]].mili, // add mili for sort on date
                        date: inf[ipList[i]].date,
                        ip:   inf[ipList[i]].ip,
                        city: inf[ipList[i]].city,
                        region: inf[ipList[i]].region,
                        country: inf[ipList[i]].country,
                        count: inf[ipList[i]].count,

                    }
                    if (extra) {
                        obj.os = inf[ipList[i]].os
                        obj.sym = inf[ipList[i]].sym
                    }

                    arr_unsort.push (obj)
                }

                //** a.localeCompare(b) */
                const arr = arr_unsort.sort((a, b) => b.mili > a.mili ? -1 : 1)  
                if (logBackEnd)
                    console.log ('users', arr)

                //** delete mili */
                for (let i = 0; i < arr.length; i++) {
                    if (!arr[i].region)
                        if (logBackEnd)
                            console.log ('missing region', arr[i])
                    if (! milisec)
                        delete arr[i].mili
                }

                setUserArray(arr)
                return;
            }

            setInfoJson (result.data)
        } )
        // .catch ((err) => {
        //     clear()
        //     error([getDate(), 'backEnd users', err.message])
        //     console.log(getDate(), 'backEnd users', err.message)
        // }) 

    const latency = Date.now() - mili
    setErr('usrs list done, latency(msec)=' + latency)

  
    }
    //** top, right, bottom ,right*/
    const ROW_SPACING = {padding: "0px 5px 2px 8px", margin: '0px'}

    return (
        <div>
            <h6 style={{color: 'blue'}}> Users &nbsp;  </h6>
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Count number of users  &nbsp; </h6>
            {err && <div style={{color:'red'}}>{err}</div>}

            <div style={{display: 'flex'}}>
                &nbsp;<div> <input type="checkbox" checked={getAll}  onChange={()=> setGetAll(! getAll)}  /> &nbsp;getAll </div> &nbsp;&nbsp;
                <div> <input type="checkbox" checked={logBackEnd}  onChange={() => setLogBackEnd(! logBackEnd)}  /> &nbsp;LogBackend &nbsp; &nbsp;</div>
                <div> <input type="checkbox" checked={logExtra}  onChange={()=> setLogExtra(!logExtra)}  /> &nbsp;LogExtra &nbsp; &nbsp;</div>            
                <div> <input type="checkbox" checked={extra}  onChange={()=> setExtra(! extra)}  /> &nbsp;region,os &nbsp; &nbsp;</div> 
                <div> <input type="checkbox" checked={milisec}  onChange={()=> setMilisec(! milisec)}  /> &nbsp;milisec </div>
            </div>


            <div style={{display: 'flex'}}>
                <button style={{background: 'aqua', height: '27px', marginTop: '16px'}} type="button" onClick={()=> users ()}>userInfo  </button> &nbsp;&nbsp;
                <GlobalFilter className="stock_button_class_" filter={userFilter} setFilter={setUserFilter} name='userFilter' isMobile={isMobile}/>&nbsp; &nbsp;
            <div> &nbsp; </div> 
            </div>
            {/* <hr/>      */}

            {/* <div>&nbsp;</div> */}
            {infoJson && Object.keys(infoJson).length > 0 && <pre>{JSON.stringify(infoJson, null, 2)}</pre>}

            <div>count={userArray.length} </div>
            {userArray && userArray.length > 0 && <div style={{ maxHeight: '45vh', 'overflowY': 'scroll'}}> 
                <table>
                    <thead>
                    <tr>
                        <th>N</th>
                          {/* loop on attributes  */}
                        {Object.keys(userArray[0]).map ((h, h1) => {  
                            return (<th key={h1}>{h}</th>)
                        }) }
                    </tr>
                    </thead>
                    <tbody>
                        {/* loop on usrs  */}
                        {userArray.map((s, s1) =>{ 
                            return (
                            <tr key={s1}>
                                <td style={ROW_SPACING}>{s1}</td>
                                {/* loop on attributes  */}
                                {Object.keys(s).map((t, t1) => {  
                                    return (<td style={ROW_SPACING} key={t1}>{s[t]}</td>)
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