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

function GainWrite (sym, rows, setError, corsServer, PORT, ssl, logFlags, ip, city, countryName, countryCode, regionName) {

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

    corsUrl += corsServer+ ":" + PORT + "/gain?cmd=w&stock=" + sym + '&factor=1.1' + '&dat=' + JSON.stringify(dat1); 
    corsUrl += '&ip=' + ip;
    if (city)
        corsUrl += '&city=' + city;
    if (countryName)
        corsUrl += '&country=' + countryName;
    // if (countryCode)
    //     corsUrl += '&countryCode=' + countryCode;
    if (regionName)
        corsUrl += '&region=' + regionName

    if (LOG)
    console.log (sym, 'gainWrite', corsUrl)


    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
    if (result.status !== 200)
        return;
        if (LOG)
            console.log (sym, result.data)
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
    const [factor, setFactor] = useState(1.25);

    const [displayFlag, setDisplayFlag] = useState(false);
    const [next, setNext] = useState()
    const [err,setErr] = useState()
    const [info, setInfo] = useState()
    const {localIp, localIpv4, eliHome} = IpContext();
    const { currentUser, admin, logout } = useAuth();
    const [logBackEnd, setLogBackEnd] = useState ();
    const [logExtra, setLogExtra] = useState ();

    const [period, setPeriod] = useState(1)

    const [nameFilter, setNameFilter] = useState ();
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();

    useEffect (() => { 
        setErr()
        setInfo()
    }, [props.symbol]) 

    const onOptionChange = e => {
        const t = e.target.value;
        setPeriod(Number(t))
        // console.log(tool)
    }
    
    function setLog () {
        setLogBackEnd (! logBackEnd)
    }
    function toggleLogExtra () {
        setLogExtra (! logExtra)
    }

    function error(arr) {
        clear()
        setErr (JSON.stringify(arr))
        props.errorAdd(arr)

    }
   
    function filterForInsert () {
        setErr()
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
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=f&period=' + period + '&factor=' + factor + '&qqqValue=' + qqqValue; 

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
        setErr()
        const LOG = props.logFlags.includes('gain'); 
        const row_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ');
    
        const mili = Date.now()

        var corsUrl;
        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=a'
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
 
            keys.forEach((sym) => {
                var symVal
                var qqqVal 
                var qqqValFactor 
                switch (period){
                    case 1:                   
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
            })
                
            const symbols = Object.keys(result.data)
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
        setErr()
        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=b' + '&factor=' + factor 
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


    // get a list of symbols with low gain
    function FilterForRemove () {
        setErr()
        var corsUrl;

        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=d' + '&factor=' + factor 
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
        setErr()
        const sym_index = props.rows.findIndex((row)=> row.values.symbol === sym); 
        if (sym_index !== -1) 
          return null; // skip if already in table
        var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
        props.prepareRow(newStock);
        newStock.id = nanoid();
        newStock.values.symbol = sym;
        newStock.original.symbol = sym;
        newStock.cells = null;
        newStock.allCells = [];
        
        // newStock.values.gain_date = fireGain._updateDate;
        // newStock.values.gain_mili = fireGain._updateMili;
        props.prepareRow(newStock);
        return (newStock)
    } 
 
    // Insert in table list of symbols 
    function insertInTable () {
        setErr()
        if (next !== 'insert') {
            if (! eliHome) {// only admin allowed to insert from del list to allow del from common database
                error(['insert requires - insert state'])
                return;
            }
        }
        for (let i = 0; i <results.length; i++) {
            var sym = results[i].replace(/[0-9\\.,: ]/g,'')
            const newStock = addSymOne (sym)
            if (newStock != null)
                props.rows.push (newStock);
            // console.log(results[i])
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
        setErr()
        var corsUrl;

        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=searchName' + '&stock=' + nameFilter
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
        setErr()
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
        const LOG = props.logFlags.includes('gain'); 
        var corsUrl = ''
        if (props.ssl)
            corsUrl = 'https://'
        else
            corsUrl = 'http://'
        corsUrl += props.corsServer + ":" + props.PORT + "/flushAll"
        
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
  

      // delete symbol from all backend collections
    async function delOneSym () {
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
    }

    // test speed
    async function ping () {
        const LOG = props.logFlags.includes('gain'); 
      
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

    async function users () {
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
            // if (LOG)
            console.log(getDate(),  'users arrived', result.data) 
            setErr('backEnd users,  Latency(msec)=' + latency + ';  ....    ' + JSON.stringify (result.data) )  
            // setInfo (JSON.stringify(result.data))
        } )
        .catch ((err) => {
        clear()
        error([getDate(), 'backEnd users', err.message])
        console.log(getDate(), 'backEnd users', err.message)
    }) 

    const latency = Date.now() - mili
    // error([getDate(), 'del sym', 'response(msec)=', latency])
  
    }
      

  return (
    <div style = {{ border: '2px solid green'}}>
      <div>
        <input
          type="checkbox" checked={displayFlag}
          onChange={() => {setDisplayFlag (! displayFlag)}}
        /> Common-Database
      </div>

      {displayFlag && 
      <div>

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
           type='Real' callBack={setFactor}/> &nbsp;&nbsp;
        </div>

        {/* ====== Buttons */} 
        <div> &nbsp; </div> 
        <div>
          <div>Get stocks gain heigher than QQQ </div>
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsert()}>FilterForInsert</button>&nbsp;
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsertFrontEnd(true)}>FilterForInsert-frontEnd </button>&nbsp;
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsertFrontEnd(false)}>listAll </button>
        </div>

        <div>    
          <button style={{background: 'aqua'}} type="button" onClick={()=>filterForInsert_1_2_5_10()}>filterForInsert 1_2_5_10 </button>&nbsp;
          {next === 'insert' && <button style={{background: 'Chartreuse'}} type="button" onClick={()=>insertInTable()}>insert </button>}&nbsp;
          {(next === 'insert' || next === 'del') && <button type="button" onClick={()=>{clear()}}>Clear</button>} &nbsp;
            <div  style={{display:'flex'}}>
                <button style={{background: 'aqua'}} type="button" onClick={()=>searchName(nameFilter)}>search Stock </button>&nbsp;
                <GlobalFilter  className="stock_button_class_" filter={nameFilter} setFilter={setNameFilter} name='name' isMobile={isMobile}/>
            </div>
        </div>
 
        <div> &nbsp; </div> 
        {/* <hr/> */}

        {props.eliHome && <div> 
            <button style={{background: 'aqua'}} type="button" onClick={()=>FilterForRemove()}>FilterForDeleteBad </button>&nbsp;
            {next === 'del' &&  <button style={{background: 'Chartreuse'}} type="button" onClick={()=>{del()}}>Delete </button>} &nbsp;
            <div> &nbsp; </div> 
        </div>}

        {/* <br></br>  */}
        <div style={{display: 'flex'}}>
            {eliHome && <button type="button" onClick={()=>backendFlush()}>Backend flush</button>} &nbsp;&nbsp;
            {eliHome && props.symbol && <button type="button" onClick={()=> delOneSym ()}>backend delete {props.symbol} </button>}&nbsp;
            {/* {eliHome && <button type="button" onClick={()=> ping ()}>ping  </button>} &nbsp;&nbsp; */}
            {eliHome && <button type="button" onClick={()=> users ()}>users  </button>} &nbsp;&nbsp;
            {eliHome && <div> <input type="checkbox" checked={logBackEnd}  onChange={setLog}  /> &nbsp;LogBackend &nbsp; &nbsp;</div>}
            {eliHome && <div> <input type="checkbox" checked={logExtra}  onChange={toggleLogExtra}  /> &nbsp;LogExtra &nbsp; &nbsp;</div>}
        </div>
        
        <div>

            {/* ========= Display filtered list */} 
            <div> &nbsp;</div>
            {results && <div style={{display:'flex'}}>
                <div> filteredSymbols ({results.length})</div>
                {next && results.length > 0 && <div> &nbsp; Prepared for: </div>}
                <div style={{color:'red'}}>&nbsp;&nbsp;{next} &nbsp; </div>
            </div>} 
            {results &&  <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}>
                {results.map((r,k)=>{
                    return <div key={k}>&nbsp; {r}&nbsp;&nbsp;</div>
                })}
            </div>}
            {info && <div>{info}</div>}
        </div>
      </div>
    }
    </div>
  )

}

export  {CommonDatabase, GainWrite}
