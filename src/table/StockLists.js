import React, {useState, useEffect} from 'react'
import GlobalFilter from '../utils/GlobalFilter'
import {addStock} from './AddStock'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
    searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import {IpContext, getIpInfo} from '../contexts/IpContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import {ErrorList, beep, beep2} from '../utils/ErrorList'

function StockLists (props) {
    const {localIp, localIpv4, eliHome} = IpContext();
    const {currentUser, admin} = useAuth();
    const [displayFlag, setDisplayFlag] = useState(false);
    const [version, setVersion] = useState(0)
    const [listName, setListName] = useState();
    const [newListName, setNewListName] = useState();
    const [stockLists, setStockLists] = useState({});
    const [nameArray, setNameArray] = useState([]);
    
    const [backEndFilter, setBackEndFilter] = useState();
    const [backendNameArray, setBackendNameArray] = useState([]);
    const [backendListName, setBackendListName] = useState();
    
    const [err,setErr] = useState()
    const [info, setInfo] = useState()
    const [latency, setLatency] = useState()
    
    const [logBackEnd, setLogBackEnd] = useState ();
    const [myIp, setMyIp] = useState (true);


    const LOG = props.logFlags && props.logFlags.includes("stockLists");

    useEffect (() => { 
        setErr()
        setInfo()
        setLatency()
        setBackendListName()
        setBackendNameArray()
        setBackEndFilter()
    }, [props.servSelect]) 


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

        setLatency ('Request sent')
        const mili = Date.now() // measure latency

        axios.get (corsUrl)

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

            if (backendNameArray && ! backendNameArray.includes(listName))
                backendNameArray.push(listName)

            const latency = Date.now() - mili
            setLatency('stockListsSend done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            setErr(getDate() + ' backendShare ' + err.message)
            beep()
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
        if (backEndFilter)
            corsUrl += '&filterName=' + backEndFilter;
        if (myIp)
            corsUrl += '&ip=' + props.ip

        if (logBackEnd)
            corsUrl += '&LOG=1'

        console.log (corsUrl)
    
        setLatency('Request sent')
        const mili = Date.now() // measure latency

        axios.get (corsUrl)

        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd(['stockListsGetOne ', listName]) 
                return;
            }
            // setInfo(dat)
            setBackendNameArray(dat)
            if (dat && dat.length > 0)
                setBackendListName(dat[0])

            const latency = Date.now() - mili
            setLatency('stockListsSend done, latency(msec)=' + latency)
            // beep2();
    
        }).catch ((err) => {
            setErr(getDate() + ' filterNames ' + err.message)
            beep()
        })   
    }


    //** get one list from backend */
    function backendGetOne() {
        setErr();
        // setInfo();
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
        
        setLatency('Request sent')
        const mili = Date.now() // measure latency

        axios.get (corsUrl)
        // getDate()
        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            if (LOG)
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                props.errorAdd(['stockListsSend ', listName]) 
                return;
            }
            // setInfo(dat)
            stockLists[dat.listName] = dat.stocks; //** insert in list */ 
            localStorage.setItem('stocksLists', JSON.stringify(stockLists))
            if (stockLists[dat.listName] && stockLists[dat.listName].length > 0)
                setBackendListName(stockLists[dat.listName])

            const latency = Date.now() - mili
            setLatency ('stockListsSend done, latency(msec)=' + latency)
            // beep2();
        }).catch ((err) => {
            setErr(getDate() + ' backendGetOne ' + err.message)
            beep()
        })   
    }


    //** delete one list on backend */
    function backendDelete () {
        setErr();
        // setInfo();
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
        corsUrl += '&ip=' + props.ip;
        if (admin)
            corsUrl += '&admin=' + true;
        if (logBackEnd)
            corsUrl += '&LOG=1'
        // if (LOG)
        console.log (corsUrl)
        
        setLatency('Request sent')
        const mili = Date.now()  // measure latency

        axios.get (corsUrl)

        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            console.log (dat)
            if (dat && typeof dat === 'string' && dat.startsWith('fail')) {
                setErr(getDate() + ' stockLists delete ' + dat)
                beep() 
                return;
            }

            const latency = Date.now() - mili
            setLatency('stockListsSend done, latency(msec)=' + latency)
            // beep2();
            // remove backendListName from list
            if (backendNameArray.length > 0) {
                var backendNameArrayTemp = []
                for (let i = 0; i < backendNameArray.length - 1; i++) {
                    if (backendNameArray[i] !== backendListName)
                        backendNameArrayTemp.push(backendNameArray[i])
                }
                setBackendNameArray(backendNameArrayTemp)
            }
        }).catch ((err) => {
            setErr(getDate() + ' backendDelete ' + err.message)
            beep()
        }) 
    }


    return (
        <div style={{border:'2px solid blue'}}>

            <div>
                <input type="checkbox" checked={displayFlag} onChange={() => {setDisplayFlag (! displayFlag)}}  /> stock-lists-share
            </div>

            { displayFlag && <div>
                {err && <div style={{color:'red'}}>{err}</div>}
                <div style={{color: 'green'}}>{latency}</div>

                {/* Local lists  */}
                <h5 style={{color: 'blue'}}> Local stock lists </h5>
                <div style={{display: 'flex'}}>
                    {/* <div style={{padding: '14px'}}>List-name</div> */}
                    &nbsp; <GlobalFilter className="stock_button_class_" filter={newListName} setFilter={setNewListName} name='newListName' isMobile={false}/>  &nbsp; &nbsp;
                    <button style={{hight: '8px' }} onClick={add} > new_list_from_table </button>   &nbsp; &nbsp;
                </div>

                <div> &nbsp; </div>
                <div style={{display:'flex'}}>
                &nbsp; <div style={{display:'flex'}}> <ComboBoxSelect serv={nameArray} nameList={nameArray} setSelect={setListName}
                        title='local-lists' options={nameArray} defaultValue={listName}/> </div>  &nbsp; &nbsp;
                    <button onClick={del} > delete </button>  &nbsp; &nbsp;
                    <button onClick={insert} > insertInTable </button> &nbsp; &nbsp; 
                    <button style={{backgroundColor: 'pink'}} onClick={backendShare} > share_to_backEnd </button> &nbsp; &nbsp; 
                </div>


                <hr/> 
                {/* shared Back-end */}
                <div  style= {{background: '#aaffdd'}}>
                    <h5 style={{color: 'green'}}> Shared backend </h5>
                    <div style={{display:'flex'}}>
                        &nbsp; <GlobalFilter className="stock_button_class_" filter={backEndFilter} setFilter={setBackEndFilter} name='filter' isMobile={false}/>  &nbsp; &nbsp;
                        <button style={{backgroundColor: '#7FFF00'}} onClick={backEndFilterNames} > filter-names </button> &nbsp; &nbsp; 
                        <div> <input style={{marginTop: '15px'}} type="checkbox" checked={myIp}  onChange={() => setMyIp(! myIp) }  /> &nbsp; onlyMy-ip &nbsp; &nbsp;</div>
                        {eliHome && <div> <input style={{marginTop: '15px'}} type="checkbox" checked={logBackEnd}  onChange={()=>setLogBackEnd (! logBackEnd)}  /> &nbsp;Log &nbsp; &nbsp;</div>}
                    </div>

                    {/* {info && <pre> filtered-names {info.length} {JSON.stringify(info)}</pre>} */}
                    {backendNameArray && <div> filtered-names({backendNameArray.length})
                            <div style={{maxWidth: '90%', 'overflowY': 'scroll'}}> {JSON.stringify(backendNameArray)}</div>
                         </div>}
                    
                    {/* <div> &nbsp; </div> */}
                    {backendNameArray && backendNameArray.length > 0 &&  <div style={{display:'flex'}}>
                        &nbsp; <div style={{display:'flex'}}> <ComboBoxSelect serv={backendListName} nameList={backendNameArray} setSelect={setBackendListName}
                        title='backend-lists' options={backendNameArray} defaultValue={backendListName}/> </div> &nbsp; &nbsp;

                        <button style={{backgroundColor: '#7FFF00'}} onClick={backendGetOne} > getOne-backend </button> &nbsp; &nbsp; 
                        <button style={{backgroundColor: '#7FFF00'}} onClick={backendDelete} > delete-backend </button> &nbsp; &nbsp; 
                    </div>}
                </div>
                {/* LOcal lists */}
                <hr/> 
                {stockLists && <h6>Local stock-lists &nbsp; ({Object.keys(stockLists).length}) </h6>}
                {/* <h6> local stock listNames: {JSON.stringify(Object.keys(stockLists))} </h6> */}
                {/* <pre> names {JSON.stringify(nameArray, null, 2)}</pre> */}
                <div  style={{ maxHeight: '35vh', 'overflowY': 'scroll'}}>
                    {Object.keys(stockLists).map((m,k)=> {
                        return(<div  key={k}> 
                         <div style={{color: 'magenta'}}>&nbsp;{m} &nbsp;&nbsp; {stockLists[m].length}</div>
                          <div style={{width:'600px', overflow:'auto'}}>{JSON.stringify(stockLists[m])}</div> &nbsp; &nbsp;</div>)
                    })}
                </div>
                {/* <pre> stockLists {JSON.stringify(stockLists, null, 2)}</pre> */}
                
          </div>}
      </div>

    )
}

export default StockLists