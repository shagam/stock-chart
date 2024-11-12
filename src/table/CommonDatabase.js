import React, {useState, useEffect} from 'react'
import axios from 'axios'
import cors from 'cors'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

import {ErrorList, beep, beep2} from '../utils/ErrorList'
import {nanoid} from 'nanoid';
import GetInt from '../utils/GetInt'
import {Vix} from '../utils/Vix'
import { capitalize } from '@material-ui/core'
import {IpContext} from '../contexts/IpContext';
import { useAuth } from '../contexts/AuthContext';
import MobileContext from '../contexts/MobileContext'
import GlobalFilter from '../utils/GlobalFilter'
import {addStock} from './AddStock'

import {Users}  from './Users'

function GainWrite (sym, rows, setError, corsServer, PORT, ssl, logFlags, os, ip, city, countryName, countryCode, regionName) {

    const LOG = logFlags.includes('gain'); 
    if (LOG)
    console.log (sym, getDate(), 'gainWrite, req params ', rows.length)

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    if (row_index === -1) {
        setError ('stock missing: ' + sym)
        return;
    }
    const dat = rows[row_index].values;
    if ( dat.Industry)
        dat.Industry = dat.Industry.replace(/&/g, '-') // & cause problem for write at corsServer
    var corsUrl;
    // if (corsServer === 'serv.dinagold.org')
    if (ssl)
    corsUrl = "https://";
    else 
        corsUrl = "http://"

    // clear uneeded fields to reduce storage

    const dat1 = {
        symbol: dat.symbol,
        mon3: dat.mon3,
        mon6: dat.mon6,
        year: dat.year,
        year2 : dat.year2, 
        year5 : dat.year5,
        year10: dat.year10,
        year20: dat.year20,
        short: dat.short,
        long: dat.peak2Peak,
        exchange: dat.Exchange,
        // sym: dat.sym
    }

    // delete dat.BETA
    // delete dat.Cap
    // delete dat.Div
    // delete dat.EVToEBITDA
    // delete dat.EVToRevenue
    // delete dat.Exchange
    // delete dat.ForwPE
    // delete dat.Industry
    // delete dat.PE
    // delete dat.PEG
    // delete dat.PriceToBookRatio
    // delete dat.TrailPE
    // delete dat.alphaDate
    // delete dat.alphaPrice
    // delete dat.deep
    // delete dat.deepDate
    // delete dat.deepUpdateMili
    // delete dat.gain_date
    // delete dat.gain_mili
    // delete dat.gap
    // delete dat.info_date
    // delete dat.info_mili
    // delete dat.peak2Peak
    // delete dat.percent
    // delete dat.price
    // delete dat.priceDivHigh
    // delete dat.recoverWeek
    // delete dat.splits
    // delete dat.splits_list
    // // delete dat.sym
    // delete dat.target
    // delete dat.target_raw
    // delete dat.varifyDate
    // delete dat.verify_1
    // delete dat.verifyDate
    // delete dat.verifyPrice

    if (LOG)
    console.log ('CommonDatabase gainWrite', dat1)

    corsUrl += corsServer+ ":" + PORT + "/gain?cmd=writeOneSym&stock=" + sym + '&factor=1.1' + '&dat=' + JSON.stringify(dat1); 
    corsUrl += '&ip=' + ip;
    if (city)
        corsUrl += '&city=' + city;
    if (regionName)
        corsUrl += '&region=' + regionName
    if (countryName)
        corsUrl += '&country=' + countryName;
    // if (countryCode)
    //     corsUrl += '&countryCode=' + countryCode;
    corsUrl += '&os=' + os

    if (LOG)
        console.log (sym, 'gainWrite', corsUrl)


    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
    if (result.status !== 200)
        return;
        if (LOG)
            console.log (sym, 'gainWrite', result.data)
        const dat = result.data;
        if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
            // setError([dat])
            console.log (sym, result.data)
            return;
        }

    })
    .catch ((err) => {
    setError([sym, 'gainWrite', err.message])
    console.log(getDate(), 'gainWrite', err.message)
    })     
}


function CommonDatabase (props) {
    const [results, setResults] = useState()
    const [infoJson, setInfoJson] = useState()
    const [factor, setFactor] = useState(1.25);

    const [displayFlag, setDisplayFlag] = useState(false);
    const [next, setNext] = useState()
    const [err,setErr] = useState()
    const [info, setInfo] = useState()
    const {localIp, localIpv4, eliHome} = IpContext();
    const { currentUser, admin, logout } = useAuth();
    const [logBackEnd, setLogBackEnd] = useState ();


    
    
    const [period, setPeriod] = useState(1)

    const [nameFilter, setNameFilter] = useState ();
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();


    // const [userInfo, setUserInfp] = useState ();

    useEffect (() => { 
        setInfo()
        setInfoJson()
    }, [props.symbol]) 

    const onOptionChange = e => {
        const t = e.target.value;
        setPeriod(Number(t))
        // console.log(tool)
    }
    
    function setLog () {
        setLogBackEnd (! logBackEnd)
    }
    // function toggleLogExtra () {
    //     setLogExtra (! logExtra)
    // }

    function error(arr) {
        clear()
        setErr (JSON.stringify(arr))
        props.errorAdd(arr)

    }
   
    function filterForInsert () {
        clear();
        const LOG = props.logFlags.includes('gain'); 
        if (LOG)
        console.log (getDate(), ' backEndGetBest req params ', props.rows.length)

        const row_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ');
        if (row_index === -1) {
            setErr ('stock missing: QQQ')
            beep2()
            return;
        }
        if (props.rows[row_index].values.year === undefined) {
            setErr ('Need to click <gain> on QQQ')
            beep2()
            return;
        }

        var qqqValue;
        switch (period){
            case 1:
                qqqValue = props.rows[row_index].values.year;
                break;
            case 2:
                qqqValue = props.rows[row_index].values.year2;
                break;
            case 5:
                qqqValue = props.rows[row_index].values.year5;
                break;
            case 10:
                qqqValue = props.rows[row_index].values.year10;
                break;
            default: {
                error(['gainFilter ', 'invalidPeriod'])
                console.log(getDate(), 'gainFilter ', 'invalidPeriod')       
            }                      
        }         

        const mili = Date.now()
        var corsUrl;
        // if (corsServer === 'serv.dinagold.org')
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=filterBetterThanQQQ&period=' + period + '&factor=' + factor + '&qqqValue=' + qqqValue; 
        if (logBackEnd)
            corsUrl += '&LOG=1'

        if (LOG)
        console.log (getDate(), 'gainFilter', corsUrl)

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;
            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                setResults([])
                return;
            }
            const symbols = Object.keys(result.data)
            // if (LOG)
            console.log (symbols)
            setResults(symbols)

            setNext('insert')
            const latency = Date.now() - mili
            setErr('filtered list done, latency(msec)=' + latency)
            // beep2();
        }).catch ((err) => {
            clear()
            error(['gainFilter ', err.message])
            console.log(getDate(), err.message)
        })
    }    


    // fetch all filter on front end
    function filterForInsertFrontEnd (filter) {
        clear();
        const LOG = props.logFlags.includes('gain'); 
        // const row_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ');
    
        const mili = Date.now()

        var corsUrl;
        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=getAll'
        if (logBackEnd)
            corsUrl += '&LOG=1'
        setResults(['Request sent'])
        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            if (! dat['QQQ']) {
                error(['missing QQQ'])
                return;          
            }
            const res = {};
            var ratio;
            const resArray = [];
            const keys = Object.keys(dat);
 
            //** if get all */
            if (! filter) {
                setResults(keys)
                setNext('insert')
                return;
            }
            for (let i = 0; i < keys.length; i++) {
                const sym = keys[i];
                if (! dat[sym]) {
                    console.log ('invalid key', sym)
                    continue;
                }
                var symVal
                var qqqVal 
                var qqqValFactor 
                switch (period){
                    case 1: 
                        if (! sym || ! dat[sym].year) {
                            console.log ('missing year attrib', sym)
                        }                
                        symVal = Number(dat[sym].year);
                        qqqVal = Number(dat['QQQ'].year);
                        qqqValFactor = Number(dat['QQQ'].year * factor);
                        break;
                    case 2:
                        symVal = Number(dat[sym].year2);
                        qqqVal = Number(dat['QQQ'].year2);
                        qqqValFactor = Number(dat['QQQ'].year2 * factor);
                        break;
                    case 5:
                        symVal = Number(dat[sym].year5);
                        qqqVal = Number(dat['QQQ'].year5);
                        qqqValFactor = Number(dat['QQQ'].year5 * factor);
                        break;
                    case 10:
                        symVal = Number(dat[sym].year10);
                        qqqVal = Number(dat['QQQ'].year10);
                        qqqValFactor = Number(dat['QQQ'].year10 * factor);
                        break;
                    default: {
                        error(['gainFilter ', 'invalidPeriod'])
                        console.log(getDate(), 'gainFilter ', 'invalidPeriod')       
                    }
                }
                if (!filter || symVal > qqqValFactor) {
                    if (symVal !== -1)
                        ratio = (symVal / qqqVal).toFixed(2)
                    else 
                        ratio = -1  // missing
                    // if (ratio < 0) {
                    //     console.log(sym, ratio)
                    // }
                    resArray.push(sym + ': ' + ratio + ', ')               
                }
            }
                
            // if (LOG)
            console.log (Object.keys(res).length, res)
            console.log (resArray)
            setResults(resArray)
            if (filter)
                setNext('insert')
            else
                setNext('')

            const latency = Date.now() - mili
            setErr('filtered list done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            clear()
            error(['gainFilterLocal ', err.message])
            console.log(getDate(), err.message)
        })   
    }



    // filter on backend best for year or 2 years or 5 years or 10 years
    function filterForInsert_1_2_5_10 () {
        clear();
        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=betterThanQQQ_1_2_5_10' + '&factor=' + factor 
        if (logBackEnd)
            corsUrl += '&LOG=1'
        setResults(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                setResults([])
                return;
            }

            var ratio;
            const resArray = [];
            const keys = Object.keys(dat);
            keys.forEach((sym) => {
                resArray.push (sym)
            })
                
            const symbols = Object.keys(result.data)
            // if (LOG)
            console.log (resArray.length, resArray)
            setResults(resArray)
            setNext('insert')
            const latency = Date.now() - mili
            setErr('filtered list done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            clear()
            error(['gainFilterLocal ', err.message])
            console.log(getDate(), err.message)
        })   
    }


    //** get etf with no exchange */
    function etfList () {
        clear();
        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=etf'
        if (logBackEnd)
            corsUrl += '&LOG=1'
        setResults(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                setResults([])
                return;
            }
                
            // if (LOG)
            console.log (dat.length, dat)
            setResults(dat)
            setNext('insert')
            const latency = Date.now() - mili
            setErr('etf list done, latency(msec)=' + latency)
            // beep2();

        }).catch ((err) => {
            clear()
            error(['etf ', err.message])
            console.log(getDate(), err.message)
        })   
    }


    //** get one symbol  */
    function readOneGain () {
        clear();
        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=readOne' + '&stock=' + props.symbol
        if (logBackEnd)
            corsUrl += '&LOG=1'
        setResults(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                setResults([])
                return;
            }
                
            // if (LOG)
            console.log (dat)
            setInfoJson(dat)

            const latency = Date.now() - mili
            setErr('readone done, latency(msec)=' + latency)
            // beep2();

        }).catch ((err) => {
            clear()
            error(['etf ', err.message])
            console.log(getDate(), err.message)
        })   
    }


    // get a list of symbols with low gain
    function FilterForRemove () {
        clear();
        var corsUrl;

        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=listForDelete'
         + '&factor=' + factor 
        if (logBackEnd)
            corsUrl += '&LOG=1'

        setResults(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                setResults([])
                return;
            }

            const resArray = [];
            const keys = Object.keys(dat);
            keys.forEach((sym) => {
                resArray.push(sym + ', ')               
            })
                
            const symbols = Object.keys(result.data)
            // if (LOG)
            console.log (keys)
            setResults(keys)
            setNext('del')

            const latency = Date.now() - mili
            setErr('Filtered list done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            clear()
            error(['gainFilterForRemove ', err.message])
            // setErr('gainFilterForRemove ' + err.message)
            console.log(getDate(), err.message)
        })   
    }

     
    function addSymOne (sym) {
        clear();
        const sym_index = props.rows.findIndex((row)=> row.values.symbol === sym); 
        if (sym_index !== -1) 
          return null; // skip if already in table

        addStock (props.rows, sym, false)
        props.prepareRow(props.rows[props.rows.length - 1]);
        // newStock.values.gain_date = fireGain._updateDate;
        // newStock.values.gain_mili = fireGain._updateMili;
    } 
 
    // Insert in table list of symbols 
    function insertInTable () {
        clear();
        if (next !== 'insert') {
            if (! eliHome) {// only admin allowed to insert from del list to allow del from common database
                error(['insert requires - insert state'])
                return;
            }
        }
        for (let i = 0; i <results.length; i++) {
            var sym = results[i].replace(/[0-9\\.,: ]/g,'')
            addSymOne (sym)
        }
        setNext()
        props.saveTable('any');  
        window.location.reload();
    }

    function searchName(nameFilter) {
        if (! nameFilter) {
            setErr('missing search text')
            return
        }

        nameFilter = nameFilter.toUpperCase()
        console.log('nameSearch', nameFilter)
        clear();
        var corsUrl;

        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=searchName' + '&stock=' + nameFilter
        if (logBackEnd)
            corsUrl += '&LOG=1'

        setResults(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                setResults([])
                return;
            }

            const resArray = [];
            const keys = Object.keys(dat);
            keys.forEach((sym) => {
                resArray.push(sym + ', ')               
            })
                
            // const symbols = Object.keys(result.data)
            // if (LOG)
            // console.log (keys)
            setResults(result.data)
            setNext()

            const latency = Date.now() - mili
            setErr('Filtered list done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            clear()
            error(['gainFilterForRemove ', err.message])
            // setErr('gainFilterForRemove ' + err.message)
            console.log(getDate(), err.message)
        })   

    }

    // delete symbols gain from prepared list of low gain
    function del () {
        clear();
        const LOG = props.logFlags.includes('gain'); 
        if (next !== 'del') {
            error(['del requires - del state'])
            return;
        }
        if (results.length > 5) {
            error(['cannot delete more than 5, at once'])
            return;
        }
        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=p&dat=' + JSON.stringify(results)     
        if (logBackEnd)
            corsUrl += '&LOG=1'

        if (LOG)
            console.log (getDate(), 'gainFilter', corsUrl)

        axios.get (corsUrl)
        .then ((result) => {
            if (result.status !== 200)
                return;
            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                error([dat])
                clear()
                return;
            }
            clear()
            setErr('BackEnd del bad done')

        }).catch ((err) => {
            clear()
            error(['BackEnd del bad', err.message])
            console.log(getDate(), err.message)
        })

        setNext()
    }


    // write to disk all undestaged data
    async function backendFlush () {
        clear();
        const LOG = props.logFlags.includes('gain'); 
        var corsUrl = ''
        if (props.ssl)
            corsUrl = 'https://'
        else
            corsUrl = 'http://'
        corsUrl += props.corsServer + ":" + props.PORT + "/flushAll"
        if (logBackEnd)
            corsUrl += '&LOG=1'

        setErr('BackEnd Flush request')  
        if (LOG)
        console.log (corsUrl)
        const mili = Date.now()

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
                props.errorAdd([getDate(), 'BackEnd Flush',result.data])
                setErr(result.data)
                return;
            }
            const latency = Date.now() - mili
            console.log(getDate(), 'BackEnd Flush', result.data, 'responseTime(msec)=', latency) 
            setErr('BackEnd Flush done,  Latency(msec)=' + latency)         
        } )
        .catch ((err) => {
            clear()
            error([getDate(), 'target', err.message])
            console.log(getDate(), 'targetPrice', err.message)
        })  
      }
  
    //** verify and del records missing year, year2 */
  async function verifyAll () {
    clear();
    const LOG = props.logFlags.includes('gain'); 
    var corsUrl = ''
    if (props.ssl)
        corsUrl = 'https://'
    else
        corsUrl = 'http://'
    corsUrl += props.corsServer + ":" + props.PORT + "/gain?cmd=verifyAll"
    if (logBackEnd)
        corsUrl += '&LOG=1'

    if (LOG)
    console.log (corsUrl)
    const mili = Date.now()

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
            props.errorAdd([getDate(), 'verify',result.data])
            setErr(result.data)
            return;
        }
        const latency = Date.now() - mili
        console.log(getDate(), 'verify', result.data, 'responseTime(msec)=', latency) 
        setErr('verify done,  Latency(msec)=' + latency)         
    } )
    .catch ((err) => {
        clear()
        error([getDate(), 'target', err.message])
        console.log(getDate(), 'targetPrice', err.message)
    })  
  }

      // delete symbol from all backend collections
    async function delOneSym () {
        clear();
        const LOG = props.logFlags.includes('gain'); 
        const delCommands = ["gain", "price", "priceNasdaq", "splits", "holdings", "holdingsSch","target"]
        
        const mili = Date.now()
        for (let i = 0; i < delCommands.length; i++) {
          var corsUrl = ''
          if (props.ssl)
              corsUrl = 'https://'
          else
              corsUrl = 'http://'
          corsUrl += props.corsServer + ":" + props.PORT + '/' + delCommands[i] + '?cmd=delOneSym' + '&stock=' + props.symbol
          if (logBackEnd)
            corsUrl += '&LOG=1'

          setErr(delCommands[i] + ' delRequest request sent')  
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
                  props.errorAdd([getDate(), delCommands[i] + ' Delete symbol', result.data])
              }
              console.log(getDate(), delCommands[i]+ ' arrived', result.data)        
          } )
          .catch ((err) => {
            clear()
            error([getDate(), 'backEnd sym del', err.message])
            console.log(getDate(), 'targetPrice', err.message)
          }) 
        }
        const latency = Date.now() - mili
        // error([getDate(), 'del sym', 'response(msec)=', latency])
        setErr('backEnd del sym done,  Latency(msec)=' + latency)    
      }
  

    function clear () {
        setNext()
        setResults()
        setErr()
        setInfoJson()
    }

    // test speed
    async function ping () {
        const LOG = props.logFlags.includes('gain'); 
        clear();
          var corsUrl = ''

          corsUrl = 'https://'
          corsUrl += props.corsServer + ':' + 5000 + '/ping'
        //   corsUrl += 'localhost:' + 5001 + '/ping'
          
          setErr(' ping request sent')  
          // if (LOG)
          console.log (corsUrl)
          const mili = Date.now()

          axios.get (corsUrl)
          // getDate()
          .then ((result) => {
      
              if (result.status !== 200) {
                  console.log (getDate(), 'status=', result)
                  return;
              }
              if (LOG)
                  console.log (JSON.stringify(result.data))
              const latency = Date.now() - mili
              console.log(getDate(), ' arrived', result.data, latency) 
              setErr('Ping  done, latency(msec)=' + latency) 
              beep(10,300,50)        // (vol, freq, duration)
          } )
          .catch ((err) => {
            clear()
            const latency = Date.now() - mili
            error([getDate(), 'ping', err.message, 'latency(msec)=', latency])
            console.log(getDate(), 'ping', err.message, 'latency(msec)=' + latency)
          }) 
      }

   
  return (
    <div style = {{ border: '2px solid green'}}>
      <div>
        <input
          type="checkbox" checked={displayFlag}
          onChange={() => {setDisplayFlag (! displayFlag)}}
        /> Common-Database
      </div>

      {displayFlag && <div>
        
        <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Get info from common backEnd &nbsp; </h6>

        <div  style={{color: 'magenta' }}>  {props.symbol} </div>  &nbsp;  &nbsp; 
        {err && <div style={{color:'red'}}>{err}</div>}
        {/* <hr/> */}

        {/* ====== Filters list */} 
        <div style={{display:'flex'}}>
          Period: &nbsp;&nbsp;
          <input style={{marginLeft: '0px'}}  type="radio" name="years" value='1' id='1' checked={period===1} onChange={onOptionChange}/> 1_year
          <input style={{marginLeft: '5px'}}  type="radio" name="years" value='2' id='2' checked={period===2} onChange={onOptionChange}/> 2_years
          <input style={{marginLeft: '5px'}}  type="radio" name="years" value='5' id='5' checked={period===5} onChange={onOptionChange}/> 5_years
          <input style={{marginLeft: '5px'}}  type="radio" name="years" value='10' id='10' checked={period===10} onChange={onOptionChange}/> 10_years
        </div>

        <div style={{display:'flex'}}>
          <GetInt title='Gain_above_QQQ' placeHolder={factor} init={factor} value={factor} pattern={undefined}
           type='Real' callBack={setFactor} width = '15%'/> &nbsp;&nbsp;
        </div>

        {/* ====== Buttons */} 
        <div> &nbsp; </div> 
        <div>
          <div>Get stocks gain heigher than QQQ </div>
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsert()}>FilterForInsert</button>&nbsp;
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsertFrontEnd(true)}>FilterForInsert-frontEnd </button>&nbsp;
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsertFrontEnd(false)}>listAll </button>&nbsp;
          {eliHome && <button style={{background: 'aqua'}} type="button" onClick={()=>verifyAll()}>verifyAll </button>}&nbsp;
          {eliHome && <button style={{background: 'aqua'}} type="button" onClick={()=>etfList()}>etf-list </button>}
          {/* missingYearRemove */}
        </div>

        <div> 
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsert_1_2_5_10()}>filterForInsert 1_2_5_10 </button>&nbsp;
          {next === 'insert' && <button style={{background: 'Chartreuse'}} type="button" onClick={()=>insertInTable()}>insert </button>}&nbsp;
          {(next === 'insert' || next === 'del') && <button type="button" onClick={()=>{clear()}}>Clear</button>} &nbsp;
            <div  style={{display:'flex'}}>
                {eliHome && <button type="button" onClick={()=>backendFlush()}>Backend flush</button>} &nbsp;&nbsp;
                <button style={{background: 'aqua'}} type="button" onClick={()=>searchName(nameFilter)}>search Stock </button>&nbsp;&nbsp;
                <GlobalFilter className="stock_button_class_" filter={nameFilter} setFilter={setNameFilter} name='searchSym' isMobile={isMobile}/>
            </div>
        </div>
 
        <div> &nbsp; </div> 
        {/* <hr/> */}

        {props.eliHome && <div> 
            <button style={{background: 'aqua'}} type="button" onClick={()=>FilterForRemove()}>FilterForDeleteBad </button>&nbsp;
            {next === 'del' &&  <button style={{background: 'Chartreuse'}} type="button" onClick={()=>{del()}}>Delete </button>} &nbsp;
            <div> &nbsp; </div> 
        </div>}

        {/* Active id sym gain selected */}
        <div style={{display: 'flex'}}>
            {props.symbol && eliHome && <button type="button" onClick={()=>readOneGain()}>readOneGain ({props.symbol}) </button>}&nbsp;
            {eliHome && props.symbol && <button type="button" onClick={()=> delOneSym ()}>backend-delete-One{props.symbol} </button>}&nbsp;
            {/* {eliHome && <button type="button" onClick={()=> ping ()}>ping  </button>} &nbsp;&nbsp; */}
        </div>

        {/* <hr/>          */}

        {/* <div> &nbsp;</div> */}

        {/* Display filtered symbols info  */}
        {results && <div style={{display:'flex'}}>
            <div> filteredSymbols ({results.length})</div>
            {next && results.length > 0 && <div> &nbsp; Prepared for: </div>}
            <div style={{color:'red'}}>&nbsp;&nbsp;{next} &nbsp; </div>
        </div>} 

        {/* Display filtered symbols */}
        {results &&  <div  style={{width: '250px', height: '35vh', 'overflowY': 'scroll'}}>
            {results.map((r,k)=>{
                return <div key={k}>&nbsp; {k}  &nbsp;  &nbsp;  {r}&nbsp;&nbsp;</div>
            })}
        </div>}
        <hr/>     
        {/* readOneSym info admin only */}
        <pre>{JSON.stringify(infoJson, null, 2)}</pre>

        {admin && <Users  logFlags = {props.logFlags} ssl={props.ssl} PORT={props.PORT} errorAdd={props.errorAdd} corsServer={props.corsServer}/>}

      </div>
    }
    </div>
  )

}

export  {CommonDatabase, GainWrite}
