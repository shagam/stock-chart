import React, {useState} from 'react'
import {db} from '../firebaseConfig'
import { getDocs, doc, deleteDoc, query, where} from "firebase/firestore";
import {nanoid} from 'nanoid';
import {dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, getDate} from './Date'
import GetInt from '../utils/GetInt'
import {GainFilter} from './Gain'

// import Ip from './Ip'
// import "./Firebase.css"

const Firebase = (props) => {
  const [stocksGain, setStocksGain] = useState([]);
  const [stocksInfo, setStocksInfo]  = useState([]);
  const [stocksGainAll, setStocksGainAll] = useState([]);
  const [stocksInfoAll, setStocksInfoAll] = useState([]); 
  const [displayFlag, setDisplayFlag] = useState(false);
  const [results, setResults] = useState()
  const [factor, setFactor] = useState(1.25);
  const [period, setPeriod] = useState(1)
  const onOptionChange = e => {
    const t = e.target.value;
    setPeriod(Number(t))
    // console.log(tool)
  }


  const LOG_FLAG = props.logFlags.includes('backEnd');

  function magnificent7 () {
    const list = ['MSFT','AAPL','AMZN','NVDA','AVGO','META','GOOG','TSLA']
    for (const sym of list) {
      const newStock = addSymOne (sym)
      props.rows.push (newStock);
    }
    props.saveTable('any');  
    window.location.reload();
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

  function addSym (sym, fireGain) {

    const sym_index = props.rows.findIndex((row)=> row.values.symbol === sym); 
    if (sym_index !== -1) 
      return; // skip if already in table
    const newStock = addSymOne (sym)
    
    newStock.values.gain_date = fireGain._updateDate;
    newStock.values.gain_mili = fireGain._updateMili;

    newStock.values.mon3 = fireGain.mon3;
    newStock.values.mon6 = fireGain.mon6;
    newStock.values.year = fireGain.year;
    newStock.values.year2 = fireGain.year2;
    newStock.values.year5 = fireGain.year5;
    newStock.values.year10 = fireGain.year10;
    newStock.values.year20 = fireGain.year20;
    if (fireGain.peak2Peak)
      newStock.values.peak2Peak = fireGain.peak2Peak;
    else
      newStock.values.peak2Peak = -1;
    if (newStock.values.year === '-1.00')
      newStock.values.year = -1
    if (newStock.values.year2 === '-1.00')
      newStock.values.year2 = -1
    if (newStock.values.year5 === '-1.00')
      newStock.values.year5 = -1
    if (newStock.values.year10 === '-1.00')
      newStock.values.year10 = -1
    if (newStock.values.year20 === '-1.00')
      newStock.values.year20 = -1
    if (fireGain.splits)
    newStock.values.splits = JSON.parse (fireGain.splits).length;
    newStock.values.price = fireGain.price;
    newStock.values.splits_list = fireGain.splits;

    newStock.values.verify_1 = Number(fireGain.verify_1);

    // deepRecover info
    newStock.values.deep = fireGain.deep;
    newStock.values.recoverWeek = fireGain.recoverWeek;
    newStock.values.deepDate = fireGain.deepDate; 
    // if (gain_.priceDivHigh !== undefined)
    newStock.values.priceDivHigh = fireGain.priceDivHigh;
    props.prepareRow(newStock);

    props.rows.push (newStock);
    // props.saveTable('any');  
  }

  async function peak2PeakBest (fill) {
    const QQQ_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ'); 
    if (QQQ_index === -1) {
      alert ('QQQ missing in table');
      return; // cannot compare with QQQ
    }
    if (props.rows[QQQ_index].values.peak2Peak === undefined) {
      alert ('need to get QQQ gain by pressing <gain> ');
      return; // cannot compare with QQQ
    }
    const stockGain = props.rows[QQQ_index].values.peak2Peak * factor;
    var userQuery = query (props.gainRef, where(
      'peak2Peak', '>', '' + stockGain ));

      const gain = await getDocs(userQuery);
      if (LOG_FLAG)
      console.log (gain.docs.length);
      var found_stocks_array = {};
      for (let i = 0; i < gain.docs.length; i++) {
  
        const symbol = gain.docs[i].data().__symbol;
        
        const symIndex = props.rows.findIndex((row)=> row.values.symbol === symbol); 
        if (symIndex !== -1) {
          if (LOG_FLAG)
          console.log ('stock alreay in table ', i, symbol);
          continue; // already in table
        }

        const dat = gain.docs[i].data();
        addSym (symbol, dat);


        if (LOG_FLAG)
        console.log ('stock equ QQQ added ', i, symbol);
        if (found_stocks_array[symbol] === undefined) {
          // found_stocks_array[symbol] = ratio;
        }
        else {
          if (LOG_FLAG)
          console.log ('dup')
        }
      }

      props.saveTable('all');
      window.location.reload();
  }

  function backEndGetBest (insert) {

    const filteredGain = GainFilter (props.rows, props.errorAdd, props.corsServer, props.PORT, props.ssl,
      props.logFlags, period, factor, setResults, insert)

  }





  // get all stocks better than QQQ
  const firebaseGainGetBest = async (add_flag, periodYears) => {

    try {
      // get one symbol gain from firebase
      const QQQ_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ'); 
      if (QQQ_index === -1) {
        alert ('QQQ missing in table');
        return; // cannot compare with QQQ
      }
      if (props.rows[QQQ_index].values.year === undefined) {
        alert ('need to get QQQ gain by pressing <gain> ');
        return; // cannot compare with QQQ
      }

      
      if (LOG_FLAG)
      console.log (props.rows[QQQ_index].values.mon6) 
      
      const fasctor = 1.3;
      var userQuery;
      
        if (periodYears === 1) {
          const gain = props.rows[QQQ_index].values.year * factor;
          userQuery = query (props.gainRef, where('year', '>', ''+ gain));
        }

        if (periodYears === 2) {
          const gain = props.rows[QQQ_index].values.year2 * factor
          userQuery = query (props.gainRef, where('year2', '>', ''+ gain));
        }

        if (periodYears === 5) {
          const gain = props.rows[QQQ_index].values.year5 * factor
          userQuery = query (props.gainRef, where('year5', '>', ''+ gain));
        }

        if (periodYears === 10) {
          const gain = props.rows[QQQ_index].values.year10 * factor
          userQuery = query (props.gainRef, where('year10', '>', ''+ gain));        
        }
        // || 'mon6', '>', props.rows[QQQ_index].values.mon6 
        // || 'year2', '>', 10//props.rows[QQQ_index].values.year2
        // || 'year5', '>', 10000//props.rows[QQQ_index].values.year5
        // || 'year10', '>', 10000// props.rows[QQQ_index].values.year10

      const gain = await getDocs(userQuery);
      if (LOG_FLAG)
      console.log (gain.docs.length);
      var found_stocks_array = {};
      for (let i = 0; i < gain.docs.length; i++) {

        const dat = gain.docs[i].data();
        const symbol = dat.__symbol;
        
        const symIndex = props.rows.findIndex((row)=> row.values.symbol === symbol); 
        if (symIndex !== -1) {
          if (LOG_FLAG)
          console.log ('stock alreay in table ', i, symbol);
          continue; // already in table
        }

        if (add_flag) {
          // if need to add
          addSym (symbol, gain.docs[i].data());
          // props.saveTable(symbol);
        }
        else {
          const dat = gain.docs[i].data();
          var ratio = -1;
          switch (periodYears) {
            case 1:
              ratio = dat.year / props.rows[QQQ_index].values.year;
              break;
            case 2:
              ratio = dat.year2 / props.rows[QQQ_index].values.year2;
              break;            
            case 5:
              ratio = dat.year5 / props.rows[QQQ_index].values.year5;
              break;
            case 10:
              ratio = dat.year10 / props.rows[QQQ_index].values.year10;
              break;              
            default:
              ratio = -1;
          }
          ratio = (ratio.toFixed(2))
          // console.log (ratio);
        }

        if (LOG_FLAG)
        console.log ('stock equ QQQ added ', i, symbol);
        if (found_stocks_array[symbol] === undefined)
          found_stocks_array[symbol] = ratio;
        else {
          if (LOG_FLAG)
          console.log ('dup')
        }
      }

      // disply list
      if (! add_flag) {
          const len = Object.keys (found_stocks_array).length;
          if (len === 0)
            alert (`no symbols found in firebase that compare with QQQ , except symbols in table`)
          else {
            //*  build string list for display
            var str = "";
            var i = 0;
            Object.keys(found_stocks_array).forEach(function (key) {
              if (i % 5 === 0)
                str += "\n"
              str += key + ': ';
              str += found_stocks_array[key] + "    ";
              i++;

            })

            // display alert and list on console.
            const textForAlert = `${len} symbols in commonDatabase with gain ${fasctor} times QQQ, during ${periodYears} years: \n `
            console.log (textForAlert + Object.keys(found_stocks_array))
            alert (`${textForAlert} \n ${str} `)
          }
      }
      else {
        props.saveTable('all');
        window.location.reload();
      }
      // const ind = props.allColumns.findIndex((column)=> column.Header === 'gain_date');
      // if (add_flag)
      //   props.allColumns[ind].toggleHidden();
        
    } catch(e) { console.log (e)}
  }

  // collect statistics per stock symbol
  const ip_symbol_statistics = async () => {
    var collect = {};
    const ipStock = await getDocs(props.ipStockRef)
    for (let i = 0; i < ipStock.docs.length; i++) {
      var sym = ipStock.docs[i].data().stockSymbol;
      if (collect[sym] === undefined)
        collect[sym] = 1;
      else
        collect[sym] ++; //skip stock already in table
    }
    console.log (collect);
    alert (JSON.stringify (collect))
  }

   // get one symbol GAIN from firebase  and clean duplicates
   const firebaseGainAll = async () => {
    for (let row_index = 0; row_index < props.rows.length; row_index++) {
      try {
      const symbol = props.rows[row_index].values.symbol;
      // get one symbol gain from firebase
      var userQuery = query (props.gainRef, where('__symbol', '==', symbol));
      const gain = await getDocs(userQuery);
           
      if (row_index !== -1 && gain !== undefined && gain.docs.length > 0) {
        const gain_ = gain.docs[0].data()

        props.rows[row_index].values.sym = symbol; // added field
        props.rows[row_index].values.splits_list = gain_.splits;
        if (gain_.splits)
          props.rows[row_index].values.splits = JSON.parse(gain_.splits).length;
        props.rows[row_index].values.gain_mili = gain_._updateMili;
        props.rows[row_index].values.gain_date = gain_._updateDate;
    
        props.rows[row_index].values.mon3 = gain_.mon3;
        props.rows[row_index].values.mon6 = gain_.mon6; 
        props.rows[row_index].values.year = gain_.year; 
        props.rows[row_index].values.year2 = gain_.year2; 
        props.rows[row_index].values.year5 = gain_.year5; 
        props.rows[row_index].values.year10 = gain_.year10;
        props.rows[row_index].values.year20 = gain_.year20;
        props.rows[row_index].values.peak2Peak = gain_.peak2Peak;
        props.rows[row_index].values.price = gain_.price;

        // props.updateTableGain (gain_.__symbol, gain_.splits, gain_._updateDate, gain_._updateMili, gain_.wk, gain_.wk2, gain_.mon, gain_.mon3, gain_.mon6, gain_.year, gain_.year2, gain_.year5, gain_.year10, gain_.year20, gain_.price);

        props.rows[row_index].values.verify_1 = Number(gain_.verify_1);

        // deepRecover info
        props.rows[row_index].values.deep = gain_.deep;
        props.rows[row_index].values.recoverWeek = gain_.recoverWeek;
        props.rows[row_index].values.deepDate = gain_.deepDate; 
        // if (gain_.priceDivHigh !== undefined)
        props.rows[row_index].values.priceDivHigh = gain_.priceDivHigh;
        if (props.rows[row_index].values.target_raw !== undefined && props.rows[row_index].values.price !== undefined)
          props.rows[row_index].values.target = Number((props.rows[row_index].values.target_raw/props.rows[row_index].values.price).toFixed(2))
        // if (row_index === props.rows.length - 1) // if last one call save refresh
        //   props.saveTable('any');  
      }
 
      // delete duplicates except last one
      if (gain.docs.length > 0) {
        var latestIndex = 0;
        if (gain.docs.length > 1) {
          //console.log ('duplicates ', gain.docs.length, gain.docs[0].data()); 
          var updateMili = 0;
          // search for latest
          for (let i = 0; i < gain.docs.length; i++) {
            if (gain.docs[i].data()._updateMili > updateMili) {
              updateMili = gain.docs[i].data()._updateMili;
              latestIndex = i;
            }
          }
          // delete all dups except latest
          for (let i = 0; i < gain.docs.length; i++) {
            if (i === latestIndex)
              continue;
            //const id = gain.docs[i].id;
            var gainDoc = doc(db, "stock-gain_", gain.docs[i].id);
            await deleteDoc (gainDoc);    
          }               
        }
      }
    }catch (e) {console.log (e)}
    } 
  
    props.saveTable('all');
    window.location.reload();
  }

  // get one symbol INFO from firebase  and clean duplicates
  const firebaseInfoAll = async () => {
    for (let row_index = 0; row_index < props.rows.length; row_index++) {
      const symbol = props.rows[row_index].values.symbol;
      var userQuery = query (props.infoRef, where('__symbol', '==', symbol));
      const info = await getDocs(userQuery);
      if (info.docs.length > 0) {
        const rowIndex = props.rows.findIndex((row)=> row.values.symbol === symbol);            
        if (rowIndex !== -1 && info !== undefined) {
          const info_ = info.docs[0].data();
          props.updateTableInfo (symbol, info_.data, info_._updateDate, info_._updateMili)
        }

        var latestIndex = 0;
        if (info.docs.length > 1) {
          console.log ('duplicates', info.docs.length, info.docs[0].data());
          var updateMili = 0;
          // search for latest
          for (let i = 0; i < info.docs.length; i++) {
            if (info.docs[i].data()._updateMili > updateMili) {
              updateMili = info.docs[i].data()._updateMili;
              latestIndex = i;
            }
          }
          // delete all dups except latest
          for (let i = 0; i < info.docs.length; i++) {
            if (i === latestIndex)
              continue;
            //const id = info.docs[i].id;
            var infoDoc = doc(db, "stock-info", info.docs[i].id);
            await deleteDoc (infoDoc);    
          }
        }
       }
    } 
    props.saveTable('all');
  }

  const firebaseStatistics  = async () => {
    //db.collection("cities").get().then((querySnapshot) => { querySnapshot.forEach((doc) => { db.collection("stock-gain_").doc(doc.id). update ({your data}) }); });
    const allGain = [];
    const gain = await getDocs(props.gainRef);
    // gainLength = gain.docs.length;
    for (let i = 0; i < gain.docs.length; i++) {
      const sym = gain.docs[i].data().__symbol;
      allGain.push (sym);
    }
    allGain.sort();

    // all.push (gain.docs[i].data().__symbol);
    const allInfo = [];
    const info = await getDocs(props.infoRef);
    // infoLength = info.docs.length;
    for (let i = 0; i < info.docs.length; i++) {
      const sym = info.docs[i].data().__symbol;
      if (allInfo.indexOf(sym) === -1)
        allInfo.push (sym);
      // if (! all.find (sym))
        // all.push (sym);
    }
    allInfo.sort();
    var list = "";
    var alertList = "";
    for (let i = 0; i < allGain.length; i++) {
      alertList +=  allGain[i] + "   ";
      list += allGain[i] + "\n";
    }
    // alert (all.toString() + "  (" + all.length + ")"); 
    console.log ('firesbase gain list (', allGain.length, ")\n" + allGain);
    console.log ('\nfirebase info list (', allInfo.length, ")\n" + allInfo);

    alert ('firesbase gain list (' + allGain.length + ') ' + allGain + '\n\nfirebase info list (' + allInfo.length + ")" + allInfo + ")\n"); 
    //gain.docs.map(doc) =>  
    //alert (gain.docs.map((doc) =>({...doc.data().__symbol})))
    //console.log ('firebase read gain: ', gain.docs.length, stocksGain.length);

  }

  // Remove firebase entries wors than QQQ
  const worst  = async (del) => {
    const QQQ_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ'); 
    if (QQQ_index === -1) {
      alert ('QQQ missing in table');
      return; // cannot compare with QQQ
    }
    const ratio = 0.95;
    const allGain = [];
    const gain = await getDocs(props.gainRef);
    // gainLength = gain.docs.length;
    const info = await getDocs(props.infoRef);

    for (let i = 0; i < gain.docs.length; i++) {
      const symDat = gain.docs[i].data();
      const gainId = gain.docs[i].id;
      const QQQDat = props.rows[QQQ_index].values;
      const sym = symDat.__symbol;
      // if (sym === 'QQQX') {
      //   const a = 10;
      // }
      // if (QQQDat.mon6 * ratio <= symDat.mon6)
      //   continue;
      if (! QQQDat.year || QQQDat.year * ratio <= symDat.year)
        continue;
      if (! QQQDat.year2 || QQQDat.year2  * ratio <= symDat.year2)
        continue;
      if (! QQQDat.year5 || QQQDat.year5  * ratio <= symDat.year5)
        continue;
      if (symDat.year10 === undefined) {
        continue;
      }
      if (! QQQDat.year10 || QQQDat.year10  * ratio <= symDat.year10)
        continue;
      if (symDat.year20 === undefined) {
        continue;
      }
      if (! QQQDat.year20 || QQQDat.year20  * ratio <= symDat.year20)
        continue;
      
      allGain.push (sym);
      if (del) {
        // del gain
        var gainDoc = doc(db, "stock-gain_", gain.docs[i].id);
        await deleteDoc (gainDoc);
        console.log (sym, 'del firebase gain')
      }
    }
    allGain.sort();
    if (allGain.length === 0) {
      console.log ('No sym found worse than QQQ')
      return;
    }

    if (! del)
      alert ('Symbols worse than QQQ ratio: ' + ratio + '  List (' + allGain.length + ') ' + JSON.stringify(allGain))

    // delete info of sym
    if (del) {
      for (let i = 0; i < info.docs.length; i++) {
        const sym = info.docs[i].data().__symbol;
        if (allGain.includes (sym)) {
          var infoDoc = doc(db, "stock-info", info.docs[i].id);
          await deleteDoc (infoDoc);
          console.log (sym, 'del firebase info')
        }  
      }
    }
  }

  // const style = {
  //   //background: 'blue',
  //   // color: 'red',
  //   // fontSize: 200,
  //   border: '2px solid green'
  // };
  return (
    <div style = {{ border: '2px solid green'}}>
      <div>
        <input
          type="checkbox" checked={displayFlag}
          onChange={() => {setDisplayFlag (! displayFlag)}}
        /> Common-database
      </div>

      {displayFlag && 
      <div> &nbsp; 
        <button type="button" onClick={()=>firebaseGainAll()} >Fill_gain </button> &nbsp;
        <button type="button" onClick={()=>firebaseInfoAll()} >Fill_info </button> &nbsp;
        <button type="button" onClick={()=>firebaseStatistics (true)}>BackEnd-lists</button>

    
        <button type="button" onClick={()=>peak2PeakBest ()}>Fill-stocks-p2p-compare-to-QQQ </button> &nbsp;
 
        <div> &nbsp; </div> 
        {/* <hr/> */}
        <div style={{display:'flex'}}>
          Period: &nbsp;&nbsp;
          <input style={{marginLeft: '0px'}}  type="radio" name="years" value='1' id='1' checked={period===1} onChange={onOptionChange}/> 1_year
          <input style={{marginLeft: '5px'}}  type="radio" name="years" value='2' id='2' checked={period===2} onChange={onOptionChange}/> 2_years
          <input style={{marginLeft: '5px'}}  type="radio" name="years" value='5' id='5' checked={period===5} onChange={onOptionChange}/> 5_years
          <input style={{marginLeft: '5px'}}  type="radio" name="years" value='10' id='2' checked={period===10} onChange={onOptionChange}/> 10_years
        </div>
        <GetInt title='factor' placeHolder={factor} init={factor} value={factor} pattern={undefined} type='Real' callBack={setFactor}/>
 
        <div>&nbsp;
          <button type="button" onClick={()=>firebaseGainGetBest(false, period)}>show-stocks-compared-to-QQQ firebase </button> &nbsp;
          <button type="button" onClick={()=>firebaseGainGetBest(true, period)}>Fill-stocks-compared-to-QQQ  </button> &nbsp;
          
        </div>
          <button type="button" onClick={()=>backEndGetBest(false)}>Show-stocks-compared-to-QQQ </button> &nbsp;
          <button type="button" onClick={()=>backEndGetBest(true)}>Insert-stocks-compared-to-QQQ </button> &nbsp;
        <div>

        {/* // show/remove from FireBase all stocks worse than QQQ */}
        {/* <hr/> */}
        <div> &nbsp; </div> 
        <div>&nbsp;
          <button type="button" onClick={()=>magnificent7()}>Add Magnificent_7</button>
          <button type="button" onClick={()=>worst(false)}>Show worse than QQQ</button>
          &nbsp;
          {props.eliHome && <button type="button" onClick={()=>worst(true)}>remove worse than QQQ</button>}
        </div>

        </div>
        {props.admin &&
          <div>
            <button type="button" onClick={()=>ip_symbol_statistics()}>Stock_popularity</button>
          </div>
        }
        {results && <div> <hr/>filteredSymbols: {JSON.stringify(results)} <hr/> </div>}
      </div>
    }
      {/* <div  style =  {{ border: '2px solid green', display:'flex'}} > 
        {props.admin && <Ip db = {props.db} stocksGainAll = {stocksGainAll} stocksInfoAll = {stocksInfoAll} localIp = {props.localIp} admin = {props.admin} />}
      </div> */}
    </div>
  )
}

export default Firebase