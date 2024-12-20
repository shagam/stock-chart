
import React, {useState, useEffect} from 'react'
import axios from 'axios'
import cors from 'cors'
import {formatDate} from '../utils/Date';
import {getDate} from '../utils/Date'
import {IpContext} from '../contexts/IpContext';
import {useAuth} from '../contexts/AuthContext';


// https://62.0.92.49:5000/splits?stock=MSFT
// https://dinagold.org:5000/splits?stock=MSFT
// https://www.stocksplithistory.com/?symbol=MSFT

function Splits (props) {
  const { eliHome} = IpContext();
  const { currentUser, admin, logout } = useAuth();
  const [ignoreSaved, setIgnoreSaved] = useState ();
  const [logBackEnd, setLogBackEnd] = useState ();
  const [splitInfo, setSplitInfo] = useState ([]);
  const [url, setUrl] = useState ();
  const [err, setErr] = useState ();
  const [corsUrl, setCorsUrl] = useState ();
  const [updateDate, setUpdateDate] = useState ();

  const LOG_FLAG = props.logFlags && props.logFlags.includes('splits');

  useEffect(() => {
    setSplitInfo()
    setUrl()
    setCorsUrl()
    setErr()
    setUpdateDate()
    setUpdateDate()
    setLogBackEnd()
    setIgnoreSaved()
  },[props.symbol]) 



  function renderList(array) {
    if (array.length === 0)
      return <div>[]</div>
    if (array[0].date)
      return array.map((item) => <li key={item.date}>{JSON.stringify(item)}</li>);
    else
      return array.map((item) => <li>{JSON.stringify(item)}</li>);
  }

 function setIgnore () {
    setIgnoreSaved (!ignoreSaved)
  }

  function setLog () {
    setLogBackEnd (! logBackEnd)
  }


  function splitsGet () {
    if (! props.symbol) {
      alert ("Missing symbol, press gain for a symbol")
      return;
    }
    setErr('Request sent to server')
    setSplitInfo()
    setUpdateDate()
    setCorsUrl ("https://" + props.servSelect + ":" + props.PORT + "/splits?stock=" + props.symbol)
    setUrl ("https://www.stocksplithistory.com/?symbol=" + props.symbol)

    StockSplitsGet(props.symbol, props.rows, props.errorAdd, props.servSelect,
       props.PORT, props.ssl, props.logFlags, setSplitInfo, setErr, ignoreSaved)
       if (LOG_FLAG)
        console.log (splitInfo)
  }



 

  const StockSplitsGet = (sym, rows, setError, corsServer, PORT, ssl, logFlags, setSplitInfo, setErr, ignoreSaved) => {

      // const [splits, setSplits] = useState([])
      const LOG = logFlags && logFlags.includes('splits'); 
      if (LOG)
        console.log (sym, getDate(), 'req params ', rows.length)

      var corsUrl;
      // if (corsServer === 'serv.dinagold.org')
      if (ssl) {
        corsUrl = "https://";
        corsUrl += corsServer+ ":" + PORT + "/splits?stock=" + sym;
      }
      else {
        corsUrl = "http://"
        corsUrl += corsServer+ ":" + PORT + "/splits?stock=" + sym;
      }
      if (ignoreSaved)
        corsUrl += '&ignoreSaved=true';

      if (logBackEnd)
        corsUrl += '&LOG=true';

      if (LOG)
        console.log (sym, corsUrl)
      // corsUrl = "http://192.168.1.4:5000/splits?stock=" + sym;
      // corsUrl = "http://localhost:5000/splits?stock=" + sym;
      // corsUrl = "https://www.stocksplithistory.com/?symbol=" + sym;

      axios.get (corsUrl)
      // getDate()
      .then ((result) => {
        setErr() // clear message 'request sent'
        if (result.status !== 200)
          return;
        // setError('');
        const splits = result.data;
        if (splits.length > 0)
          setUpdateDate(formatDate (new Date(splits[0].updateMili)))
        if (splits.length > 0 && LOG) {
          // console.log('\x1B[31mhello\x1B[34m world');
          console.log (sym, getDate(), result.data, result.status)
        }
        console.log (sym, "splits from server", splits)
          // console.log ('last web split: ', splits[splits.length - 1]);

        if (splits === '') { // no splits
          setSplitInfo([])
          return;
        }

        const row_index = rows.findIndex((row)=> row.values.symbol === sym);
        if (row_index === -1) {
          alert ('stock missing (splits): ' + sym)
          return;
        }

        if (rows[row_index].values.splits_list !== undefined) {
          // console.log ('old split: ', rows[row_index].values.splits)
          if (LOG && rows[row_index].values.splits_list)
          console.dir (rows[row_index].values.splits_list);
        }

        var splitArray = [];
        for (let i = 0; i < splits.length; i++) {
          if (splits[i].jump === undefined) //skip first entry whish contains update mili only.
            continue;
          // if (splits[i].year < 2000)
          //   continue;
          const date = splits[i].year + '-' + splits[i].month + '-' + splits[i].day;
          const split = {date: date, ratio: Number (splits[i].jump)};
          // splitArray = [...splitArray, split]
          splitArray.push (split);
        }

        if (splitArray.length > 0) {
          // console.dir (splitArray);
          const stringify = JSON.stringify(splitArray)
          if (LOG && rows[row_index].values.splits_list !== stringify) {
          console.log ("old splits", rows[row_index].values.splits_list)
          }
          rows[row_index].values.splits_list = stringify;
          rows[row_index].values.splits = splitArray.length;
          rows[row_index].values.splitsUpdateMili = Date.now();
          if (setSplitInfo)
            setSplitInfo(splitArray)
        }
        else {
          // setSplitInfo([])
          if (LOG)
          console.log (sym, "delete obsolete splits")
          rows[row_index].values.splits_list = '';
          rows[row_index].values.splits = '';
          rows[row_index].values.splitsUpdateMili = Date.now();
        }

      })
      .catch ((err) => {
        setError([sym, err.message, corsUrl])
        console.log(err, corsUrl)
      })     
  }


return (
  <div>
    <h5>Stock splits</h5>
    <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>  &nbsp; {props.symbol}:  &nbsp; Stock split history  &nbsp; </h6>
    {err && <div style={{color: 'red'}}> {err} </div>}
    {LOG_FLAG && <div>{corsUrl}</div>}
    {LOG_FLAG && <div>{url}</div>}
    <div style={{display: 'flex'}}>
      {eliHome &&  <div> <input type="checkbox" checked={ignoreSaved}  onChange={setIgnore}  />   &nbsp;IgnoreSaved &nbsp; &nbsp; </div>}
      {eliHome &&  <div> <input type="checkbox" checked={logBackEnd}  onChange={setLog}  />  &nbsp;LogBackend &nbsp; &nbsp; </div>}
      <button style={{background: 'aqua'}} type="button" onClick={()=>splitsGet ()}>Splits  </button>  
    </div>

    {updateDate && <div>Update:&nbsp;&nbsp; {updateDate}</div>}
    {splitInfo && renderList(splitInfo)}
  </div>
)

}



export {Splits}

