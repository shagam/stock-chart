import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from './Date'
// import {addSymOne}  from './Firebase';
import {ErrorList, beep, beep2} from './ErrorList'
import {nanoid} from 'nanoid';
import GetInt from '../utils/GetInt'



function GainWrite (sym, rows, setError, corsServer, PORT, ssl, logFlags) {

    const LOG = logFlags.includes('gain'); 
    if (LOG)
    console.log (sym, getDate(), 'gainWrite, req params ', rows.length)

    const row_index = rows.findIndex((row)=> row.values.symbol === sym);
    if (row_index === -1) {
        alert ('stock missing: ' + sym)
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

    corsUrl += corsServer+ ":" + PORT + "/gain?cmd=w&stock=" + sym + '&dat=' + JSON.stringify(dat);
    

    if (LOG)
    console.log (sym, 'gainWrite', corsUrl)


    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
    if (result.status !== 200)
        return;
        if (LOG)
            console.log (sym, result.data)
    })
    .catch ((err) => {
    setError([sym, 'gainWrite', err.message, corsUrl])
    console.log(getDate(), 'gainWrite', err, corsUrl)
    })     
}


function CommonDatabase (props) {
    const [symOnly, setSymOnly] = useState(false);
    const [results, setResults] = useState()
    const [factor, setFactor] = useState(1.25);
    const [period, setPeriod] = useState(1)
    const [displayFlag, setDisplayFlag] = useState(false);
    const [next, setNext] = useState()

    const onOptionChange = e => {
        const t = e.target.value;
        setPeriod(Number(t))
        // console.log(tool)
    }
    

   
    function filterForInsert () {

        const LOG = props.logFlags.includes('gain'); 
        if (LOG)
        console.log (getDate(), ' backEndGetBest req params ', props.rows.length)

        const row_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ');
        if (row_index === -1) {
            alert ('stock missing: QQQ')
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
                props.errorAdd(['gainFilter ', 'invalidPeriod'])
                console.log(getDate(), 'gainFilter ', 'invalidPeriod')       
            }                      
        }         


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
                props.errorAdd([dat])
                setResults([])
                return;
            }
            const symbols = Object.keys(result.data)
            // if (LOG)
            console.log (symbols)
            setResults(symbols)
            setNext('insert')
            beep2();
        }).catch ((err) => {
            props.errorAdd(['gainFilter ', err.message, corsUrl])
            console.log(getDate(), err, corsUrl)
        })
    }    


    // fetch all filter on front end
    function filterForInsertFrontEnd () {
        const LOG = props.logFlags.includes('gain'); 
        const row_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ');
    
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
                props.errorAdd(['missing QQQ'])
                return;          
            }
            const res = {};
            var ratio;
            const resArray = [];
            const keys = Object.keys(dat);
            if (symOnly) {
                console.log (keys)
                setResults(keys)
                beep2();
                return;
            }
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
                        props.errorAdd(['gainFilter ', 'invalidPeriod'])
                        console.log(getDate(), 'gainFilter ', 'invalidPeriod')       
                    }
                }
                if (symVal > qqqValFactor) {
                    ratio = (symVal / qqqVal).toFixed(2)
                    resArray.push(sym + ': ' + ratio + ', ')               
                }
            })
                
            const symbols = Object.keys(result.data)
            // if (LOG)
            console.log (Object.keys(res).length, res)
            console.log (resArray)
            setResults(resArray)
            setNext('insert')
            beep2();
    
        }).catch ((err) => {
            props.errorAdd(['gainFilterLocal ', err.message, corsUrl])
            console.log(getDate(), err, corsUrl)
        })   
    }



    // filter on backend best for year or 2 years or 5 years or 10 years
    function filterForInsert_1_2_5_10 () {

        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=b' + '&factor=' + factor 
        setResults(['Request sent'])
        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;
            const dat = result.data
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd([dat])
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
            beep2();
    
        }).catch ((err) => {
            props.errorAdd(['gainFilterLocal ', err.message, corsUrl])
            console.log(getDate(), err, corsUrl)
        })   
    }



    function FilterForRemove () {
    
        var corsUrl;
        if (props.ssl)
        corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.corsServer+ ":" + props.PORT + '/gain?cmd=d' + '&factor=' + factor 
        setResults(['Request sent'])
        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;
            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd([dat])
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
            console.log (resArray)
            setResults(resArray)
            setNext('del')
            beep2();
    
        }).catch ((err) => {
            props.errorAdd(['gainFilterLocal ', err.message, corsUrl])
            console.log(getDate(), err, corsUrl)
        })   
    }

     
    function addSymOne (sym) {
        const sym_index = props.rows.findIndex((row)=> row.values.symbol === sym); 
        if (sym_index !== -1) 
          return; // skip if already in table
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
 
    function insertInTable () {
        if (next !== 'insert') {
            props.errorAdd(['insert requires - insert state'])
            return;
        }
        for (let i = 0; i <results.length; i++) {
            const newStock = addSymOne (results[i])
            props.rows.push (newStock);
            // console.log(results[i])
        }
        props.saveTable('any');  
        window.location.reload();
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
      <div> &nbsp; 
  

        {/* <hr/> */}
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
          <input type="checkbox" checked={symOnly}   onChange={()=>setSymOnly(!symOnly)} style={{marginTop:'3px',paddingTop:'3px' }} />
            <div style={{paddingTop:'6px' }}> symOnly </div>  
        </div>
        
   
        <div>
          {/* <hr/> */}
          {/* <div> &nbsp; </div>  */}
               
        </div>

        <div> &nbsp; </div> 
        <div>
          <div>Get stocks gain heigher than QQQ (Self backEnd)</div>
          <button type="button" onClick={()=>filterForInsert()}>FilterForInsert</button> &nbsp;
          <button type="button" onClick={()=>filterForInsertFrontEnd()}>FilterForInsert-frontEnd </button> &nbsp;
        </div>

        <div>    
          <button type="button" onClick={()=>filterForInsert_1_2_5_10()}>filterForInsert 1_2_5_10 </button>  &nbsp;
          <button type="button" onClick={()=>insertInTable()}>insert </button>
        </div>

        <div>  
            <button type="button" onClick={()=>FilterForRemove()}>FilterForRemove </button>

        </div>

        {/* <button type="button" onClick={()=>magnificent7()}>Add Magnificent_7</button> */}
        <div>
        <div style-={{display:'flex'}}> &nbsp;</div>
            <hr/>
            <div style={{color:'red'}}>{next}  </div>
            {results && <div> filteredSymbols ({results.length}): {JSON.stringify(results)} <hr/> </div>}
        </div>
      </div>
    }
    </div>
  )

}

export  {CommonDatabase, GainWrite}
