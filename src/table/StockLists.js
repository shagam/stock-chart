import React, {useState} from 'react'
import GlobalFilter from '../utils/GlobalFilter'
import {addStock} from './AddStock'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import {IpContext, getIpInfo} from '../contexts/IpContext';

function StockLists (props) {
    const {localIp, localIpv4, eliHome} = IpContext();
    const [displayFlag, setDisplayFlag] = useState(false);
    const [version, setVersion] = useState(0)
    const [listName, setListName] = useState();
    const [newListName, setNewListName] = useState();
    const [stockLists, setStockLists] = useState({});
    const [nameArray, setNameArray] = useState([]);
    const [backendNameArray, setBackendNameArray] = useState([]);
    const [backendListName, setBackendListName] = useState();
    const [err,setErr] = useState()
    const [info, setInfo] = useState()
    const [logBackEnd, setLogBackEnd] = useState ();

    const LOG = props.logFlags && props.logFlags.includes("stockLists");

    function setLog () {
        setLogBackEnd (! logBackEnd)
    }

    //** get from localstorage on startup */
    const keys = Object.keys(stockLists);
    if (keys.length === 0) 
        get()


   function get () {
        const listsRaw = localStorage.getItem('stocksLists')
        if (! listsRaw || listsRaw === '{}')
            return;
        // const keys = Object.keys(listsRaw);

        const stockListLocal = JSON.parse(listsRaw)
        setStockLists(stockListLocal)

        const nameArrayLocal = Object.keys(stockListLocal)
        setNameArray(nameArrayLocal)
        if (nameArrayLocal && nameArrayLocal.length > 0)
            setListName(nameArrayLocal[0])
    }



    //** create list from table */
    function add() {
        setErr();
        setInfo();
        const symbols = [];
        for (let i = 0; i < props.rows.length; i++) {
            const sym = props.rows[i].values.symbol
            symbols.push (sym)
        }
       
        console.log ('addNewList', newListName, symbols)

        if (! newListName) {
            alert ('Missing list Name')
            return;
        }

        //** get old lists before add */
        const keys = Object.keys(stockLists);
        if (keys.length === 0)
            get()

        stockLists[newListName] = symbols;
        const nameArrayLocal = Object.keys(stockLists)
        setNameArray(nameArrayLocal)
        setListName(newListName)
        setStockLists(stockLists)
        localStorage.setItem('stocksLists', JSON.stringify(stockLists))
    }

 
    //** delete local list */
    function del () {
        setErr();
        setInfo();
        if (! listName) {
            alert ('Missing list Name')
            return;
        }
        console.log('del', listName)
        if (stockLists[listName]) {
            delete stockLists[listName]
            localStorage.setItem('stocksLists', JSON.stringify(stockLists))
            setStockLists(stockLists)
            const nameArrayLocal = Object.keys(stockLists)
            setNameArray(nameArrayLocal)
            setNewListName()
        }
        else
            console.log ('missing list=', listName)
    }


    //** insert list in table */
    function insert() {
        setErr();
        setInfo();
        if (! listName) {
            alert ('Missing list Name')
            return;
        }
        
        console.log('insetInTable', listName)

        const list = stockLists[listName];
        if (! list) {
            console.log ('err', listName)
            return;
        }
        for (let i = 0; i < list.length; i++)
            addStock(props.rows, list[i], false)

        props.saveTable('stockLists');  
        const nameArrayLocal = Object.keys(stockLists)
        setNameArray(nameArrayLocal)
        window.location.reload();
    }

    ////////////////////////////////////////////////////////////////

    //** share with others by sending to backend */
    function backendShare () {
        setErr();
        setInfo();
        if (! listName) {
            alert ('Missing list Name')
            return;
        }
        //servSelect={servSelect} ssl={ssl} PORT={PORT}
        var corsUrl;

        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.servSelect+ ":" + props.PORT + '/stockLists?cmd=writeOne&listName=' + listName + '&ip=' + props.ip +'&dat=' + JSON.stringify(stockLists[listName])

        if (logBackEnd)
            corsUrl += '&LOG=1'
        // if (LOG)
            console.log (corsUrl)

        setInfo(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd(['stockListsSend ', listName]) 
                return;
            }

            const resArray = [];

            const latency = Date.now() - mili
            setErr('stockListsSend done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            props.errorAdd(['stockListsSend ', listName, err.message])
            setErr(getDate() + ' ' + err.message)
            console.log(getDate(), err.message)
        })   
    }


    //** filter list names on backend */
    function backEndFilterNames () {
        // if (! newListName) {
        //     alert ('Missing list Name')
        //     return;
        // }
        //servSelect={servSelect} ssl={ssl} PORT={PORT}
        setErr();
        setInfo();
        var corsUrl;

        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.servSelect+ ":" + props.PORT + '/stockLists?cmd=filterNames'
        if (newListName)
            corsUrl += '&filterName=' + newListName;

        if (logBackEnd)
            corsUrl += '&LOG=1'
        // if (LOG)
        console.log (corsUrl)
        
        setInfo(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd(['stockListsGetOne ', listName]) 
                return;
            }
            setInfo(dat)
            setBackendNameArray(dat)
            if (dat && dat.length > 0)
                setBackendListName(dat[0])

            const latency = Date.now() - mili
            setErr('stockListsSend done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            props.errorAdd(['stockListsSend ', listName, err.message])
            setErr(getDate() + ' ' + err.message)
            console.log(getDate(), err.message)
        })   
    }


    //** get one list from backend */
    function backendGetOne() {
        setErr();
        setInfo();
        if (! backendListName) {
            alert ('Missing list Name')
            return;
        }
        var corsUrl;
        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.servSelect+ ":" + props.PORT + '/stockLists?cmd=getOne&listName=' + backendListName

        if (logBackEnd)
            corsUrl += '&LOG=1'
        // if (LOG)
        console.log (corsUrl)
        
        setInfo(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd(['stockListsSend ', listName]) 
                return;
            }
            // setInfo(dat)
            stockLists[dat.listName] = dat.list.stocks; //** insert in list */ 
            localStorage.setItem('stocksLists', JSON.stringify(stockLists))
            if (stockLists[dat.listName] && stockLists[dat.listName].length > 0)
                setBackendListName(stockLists[dat.listName])

            const latency = Date.now() - mili
            setErr('stockListsSend done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            props.errorAdd(['stockListsSend ', listName, err.message])
            setErr(getDate() + ' ' + err.message)
            console.log(getDate(), err.message)
        })   
    }


    //** delete one list on backend */
    function backendDelete () {
        setErr();
        setInfo();
        console.log (backendListName, info)
        if (! backendListName) {
            alert ('Missing list Name')
            return;
        }

        var corsUrl;

        if (props.ssl)
            corsUrl = "https://";
        else 
            corsUrl = "http://"   
        corsUrl += props.servSelect+ ":" + props.PORT + '/stockLists?cmd=delOne&listName=' + backendListName

        if (logBackEnd)
            corsUrl += '&LOG=1'
        // if (LOG)
        console.log (corsUrl)
        
        setInfo(['Request sent'])
        const mili = Date.now()

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd(['stockListsSend ', listName]) 
                return;
            }

            const latency = Date.now() - mili
            setErr('stockListsSend done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            props.errorAdd(['stockListsSend ', listName, err.message])
            setErr(getDate() + ' ' + err.message)
            console.log(getDate(), err.message)
        }) 
    }


    return (
        <div style={{border:'2px solid blue', width: '95vw'}}>

            <div>
                <input type="checkbox" checked={displayFlag} onChange={() => {setDisplayFlag (! displayFlag)}}  /> stock-lists-share
            </div>

            { displayFlag && <div>
                {err && <div style={{color:'red'}}>{err}</div>}

                <div style={{display: 'flex'}}>
                    {/* <div style={{padding: '14px'}}>List-name</div> */}
                    <GlobalFilter className="stock_button_class_" filter={newListName} setFilter={setNewListName} name='newListName' isMobile={false}/>  &nbsp; &nbsp;
                    <button style={{hight: '8px' }} onClick={add} > new-list-from-table </button>   &nbsp; &nbsp;
                    <button style={{backgroundColor: '#7FFF00'}} onClick={backEndFilterNames} > backEnd-filterNames </button> &nbsp; &nbsp; 
                    {eliHome && <div> <input type="checkbox" checked={logBackEnd}  onChange={setLog}  /> &nbsp;LogBackend &nbsp; &nbsp;</div>}
                </div>

                <div> &nbsp; </div>
                <div style={{display:'flex'}}>
                    <div style={{display:'flex'}}> <ComboBoxSelect serv={nameArray} nameList={nameArray} setSelect={setListName}
                     title='Choose-local-list' options={nameArray} defaultValue={listName}/> </div>  &nbsp; &nbsp;
                    <button onClick={del} > delete </button>  &nbsp; &nbsp;
                    <button onClick={insert} > insertInTable </button> &nbsp; &nbsp; 
                    <button style={{backgroundColor: '#7FFF00'}} onClick={backendShare} > backEnd-share </button> &nbsp; &nbsp; 
                </div>

                <div> &nbsp; </div>
                {backendNameArray.length > 0 &&  <div style={{display:'flex'}}>
                    <div style={{display:'flex'}}> <ComboBoxSelect serv={backendListName} nameList={backendNameArray} setSelect={setBackendListName}
                     title='Choose-backend-list' options={backendNameArray} defaultValue={backendListName}/> </div>
                       &nbsp; &nbsp;
                    <button style={{backgroundColor: '#7FFF00'}} onClick={backendGetOne} > backEnd-getOne </button> &nbsp; &nbsp; 
                    {eliHome && <button style={{backgroundColor: '#7FFF00'}} onClick={backendDelete} > backend-delete </button>} &nbsp; &nbsp; 
                </div>}

                {info && <pre> filtered-names {JSON.stringify(info)}</pre>}
                {/* <pre> names {JSON.stringify(nameArray, null, 2)}</pre> */}
                <div  style={{ maxHeight: '35vh', 'overflowY': 'scroll'}}>
                    { nameArray.map((m,k)=> {
                        return(<div style={{width:'600px', overflow:'auto'}} key={k}> 
                         <div style={{color: 'magenta'}}>&nbsp;{m} &nbsp;&nbsp; {stockLists[m].length}</div> {JSON.stringify(stockLists[m])}</div>)
                    })}
                </div>
                {/* <pre> stockLists {JSON.stringify(stockLists, null, 2)}</pre> */}
                
          </div>}
      </div>

    )
}

export default StockLists