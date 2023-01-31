import React, {useState} from 'react'
import {db} from '../firebaseConfig'
import { getDocs, doc, deleteDoc, query, where} from "firebase/firestore";
import {nanoid} from 'nanoid';
import {dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, getDate} from './Date'

import Ip from './Ip'
// import "./Firebase.css"

const Firebase = (props) => {
  const [stocksGain, setStocksGain] = useState([]);
  const [stocksInfo, setStocksInfo] = useState([]);
  const [stocksGainAll, setStocksGainAll] = useState([]);
  const [stocksInfoAll, setStocksInfoAll] = useState([]); 

  const LOG_FLAG = false;


  //read from firebase gain
  const firebaseGainGetAll = async () => {
    const gain = await getDocs(props.gainRef);
    setStocksGainAll (gain);
    setStocksGain(gain.docs.map((doc) =>({...doc.data(), id: doc.id})))
    console.log ('firebase read gain: ', gain.docs.length, stocksGain.length);
  }

  //read from firebase info
  const firebaseInfoGetAll = async () => {
    const info = await getDocs(props.infoRef)
    setStocksInfoAll (info);
    setStocksInfo(info.docs.map((doc) =>({...doc.data(), id: doc.id})))
    if (LOG_FLAG)
    console.log ('firebase read info: ', info.docs.length, stocksInfo.length);
  }

 
  // main entry
  const count_gain_info = () => {
    firebaseGainGetAll();
    firebaseInfoGetAll();

    if (LOG_FLAG)
    console.log ('stocksGain (count): ', stocksGain.length, 'stocksInfo (count): ', stocksInfo.length);
   // console.log ("ipList: ", ipList.length);
  }

  function addSym (sym, fireGain) {
    const sym_index = props.rows.findIndex((row)=> row.values.symbol === 'QQQ'); 
    if (sym_index === -1) 
      return;
    var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    props.prepareRow(newStock);

    newStock.id = nanoid();
    newStock.values.symbol = sym;
    newStock.original.symbol = sym;
    newStock.cells = null;
    newStock.allCells = [];
    
    newStock.values.gain_date = fireGain._updateDate;
    newStock.values.gain_mili = fireGain._updateMili;

    newStock.values.wk = fireGain.wk;
    newStock.values.wk2 = fireGain.wk2;
    newStock.values.mon = fireGain.mon;
    newStock.values.mon3 = fireGain.mon3;
    newStock.values.mon6 = fireGain.mon6;
    newStock.values.year = fireGain.year;
    newStock.values.year2 = fireGain.year2;
    newStock.values.year5 = fireGain.year5;
    newStock.values.year10 = fireGain.year10;
    newStock.values.year20 = fireGain.year20;
    newStock.values.splits = fireGain.splits;
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
      
      var userQuery = query (props.gainRef, where(
       'year', '>', (props.rows[QQQ_index].values.year * 0.92) ));


      if (periodYears === 2)
        userQuery = query (props.gainRef, where(
        'year2', '>', (props.rows[QQQ_index].values.year2 * 0.92) ));

        if (periodYears === 5)
        userQuery = query (props.gainRef, where(
        'year5', '>', (props.rows[QQQ_index].values.year5 * 0.92) ));

        if (periodYears === 10)
        userQuery = query (props.gainRef, where(
        'year10', '>', (props.rows[QQQ_index].values.year10 * 0.92) ));        

        // || 'mon6', '>', props.rows[QQQ_index].values.mon6 
        // || 'year2', '>', 10//props.rows[QQQ_index].values.year2
        // || 'year5', '>', 10000//props.rows[QQQ_index].values.year5
        // || 'year10', '>', 10000// props.rows[QQQ_index].values.year10

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
          ratio = Number(ratio.toFixed(2))
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
            const textForAlert = `symbols in firebase compared with QQQ (${len} symbols, yearPeriod: ${periodYears}): \n `
            console.log (textForAlert + Object.keys(found_stocks_array))
            alert (`${textForAlert} with gain compared to qqq\n ${str} `)
          }
      }
      else {
        props.saveTable('all');
        window.location.reload();
      }
      // const ind = props.allColumns.findIndex((column)=> column.Header === 'gain_date');
      // if (add_flag)
      //   props.allColumns[ind].toggleHidden();
        
    } catch(e) { console.log (e); alert (e)}
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
   const firebaseGainGetOne = async (symbol, saveTable) => {
    try {
      // get one symbol gain from firebase
      var userQuery = query (props.gainRef, where('__symbol', '==', symbol));
      const gain = await getDocs(userQuery);

      const row_index = props.rows.findIndex((row)=> row.values.symbol === symbol);            
      if (row_index !== -1 && gain !== undefined && gain.docs.length > 0) {
        const gain_ = gain.docs[0].data()

        props.rows[row_index].values.sym = symbol; // added field
        props.rows[row_index].values.splits_list = gain_.splits;
        if (gain_.splits)
          props.rows[row_index].values.splitsCount = JSON.parse(gain_.splits).length;
        props.rows[row_index].values.gain_mili = gain_._updateMili;
        props.rows[row_index].values.gain_date = gain_._updateDate;
    
        props.rows[row_index].values.wk = gain_.wk; 
        props.rows[row_index].values.wk2 = gain_.wk2; 
        props.rows[row_index].values.mon = gain_.mon; 
        props.rows[row_index].values.mon3 = gain_.mon3;
        props.rows[row_index].values.mon6 = gain_.mon6; 
        props.rows[row_index].values.year = gain_.year; 
        props.rows[row_index].values.year2 = gain_.year2; 
        props.rows[row_index].values.year5 = gain_.year5; 
        props.rows[row_index].values.year10 = gain_.year10;
        props.rows[row_index].values.year20 = gain_.year20;
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
      if (saveTable) // save table and refresh only on last one
        props.saveTable('all');
    } catch(e) {console.log (e)}
  }

  // get one symbol INFO from firebase  and clean duplicates
  const firebaseInfoGetOne = async (symbol) => {
    try {
      var userQuery = query (props.infoRef, where('__symbol', '==', symbol));
      const info = await getDocs(userQuery);
      if (info.docs.length > 0) {
        const rowIndex = props.rows.findIndex((row)=> row.values.symbol === symbol);            
        if (rowIndex !== -1 && info !== undefined) {
          const info_ = info.docs[0].data();
          props.updateTableInfo (info_.data, info_._updateDate, info_._updateMili)
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
    } catch(e) {console.log (e); alert (e)}
  }



  const firebaseGetAndFill = () => {
    // allow reads once a minute

    // if (Date.now() - firebaseFillMili < 1000*60)
    //   return;
    // setFirebaseFillMili(Date.now());

    // turn on columns so used can decide if up to date
    try {
    // var ind = props.allColumns.findIndex((column)=> column.Header === 'info_date');
    // props.allColumns[ind].toggleHidden();
    var ind = props.allColumns.findIndex((column)=> column.Header === 'gain_date');
    // props.allColumns[ind].toggleHidden();

    // fill missing data get from firebase 
    for (let i = 0; i < props.rows.length; i++) {
      const saveTableFlag = i === props.rows.length - 1; // save table and refresh only on last one
      if (props.rows[i].values.info_date === undefined)  // only getif empty
        firebaseInfoGetOne((props.rows[i].values.symbol));
      if (props.rows[i].values.gain_date === undefined) // only getif empty
        firebaseGainGetOne((props.rows[i].values.symbol), saveTableFlag);
    }
    props.refreshCallBack()
    console.log ('gain, info inserted in table')
    // setTimeout(function() {
    //   props.saveTable('any');    
    // }, 500);
    } catch (e) { console.log (e)}
    // setTimeout(() => props.saveTable('all'), 700);
    // props.saveTable('all');
  }

  const showAll  = async () => {
    //db.collection("cities").get().then((querySnapshot) => { querySnapshot.forEach((doc) => { db.collection("stock-gain_").doc(doc.id). update ({your data}) }); });
    const all = [];  
    const gain = await getDocs(props.gainRef);
    for (let i = 0; i < gain.docs.length; i++) {
      const sym = gain.docs[i].data().__symbol;
      all.push (sym);
    }
      // all.push (gain.docs[i].data().__symbol);

    const info = await getDocs(props.infoRef);
    for (let i = 0; i < info.docs.length; i++) {
      const sym = info.docs[i].data().__symbol;
      if (all.indexOf(sym) === -1)
        all.push (sym);
      // if (! all.find (sym))
        // all.push (sym);
    }

    var list = "";
    var alertList = "";
    for (let i = 0; i < all.length; i++) {
      alertList +=  all[i] + "   ";
      list += all[i] + "\n";
    }
    // alert (all.toString() + "  (" + all.length + ")"); 
    alert ("(" + all.length + ")\n" + alertList); 
    console.log ("(" + all.length + ")\n" + list); 
    //gain.docs.map(doc) =>  
    //alert (gain.docs.map((doc) =>({...doc.data().__symbol})))
    //console.log ('firebase read gain: ', gain.docs.length, stocksGain.length);

  }

  // const style = {
  //   //background: 'blue',
  //   // color: 'red',
  //   // fontSize: 200,
  //   border: '2px solid green'
  // };
  return (
    <>
      <div style = {{ border: '2px solid green'}}> 
        <button type="button" onClick={()=>firebaseGetAndFill()} >Fill_gain_info </button>
        <button type="button" onClick={()=>firebaseGainGetBest(false, 1)}>stocks-compared-to-QQQ-1y </button>
        {/* <div style={{padding: '1px'}} ></div> */}
        <button type="button" onClick={()=>firebaseGainGetBest(false, 2)}>stocks-compared-to-QQQ-2y </button>
        <button type="button" onClick={()=>firebaseGainGetBest(false, 5)}>stocks-compared-to-QQQ-5y </button>
        <button type="button" onClick={()=>firebaseGainGetBest(false, 10)}>stocks-compared-to-QQQ-10y </button>        
        <div>
        <button type="button" onClick={()=>firebaseGainGetBest(true, 1)}>Fill-stocks-compared-to-QQQ-1y </button>
        <button type="button" onClick={()=>firebaseGainGetBest(true, 2)}>Fill-stocks-compared-to-QQQ-2y </button>
        <button type="button" onClick={()=>firebaseGainGetBest(true, 5)}>Fill-stocks-compared-to-QQQ-5y </button>
        <button type="button" onClick={()=>firebaseGainGetBest(true, 10)}>Fill-stocks-compared-to-QQQ-10y </button>

        {/* {stockListStr !== '' &&
          <textarea rows={3} cols={80} value={stockListStr} />   
        } */}

        </div>
        {props.admin &&
          <div>
            <div> Firebase   gain: {stocksGain.length}, info: {stocksInfo.length} &bpsp; </div>
            <button type="button" onClick={()=>count_gain_info()}>count_gain_info </button>  
            <button type="button" onClick={()=>ip_symbol_statistics()}>Stock_popularity</button>
            <button type="button" onClick={()=>showAll ()}>showAll</button>
          </div>
        }
      </div>
      <div  style =  {{ border: '2px solid green', display:'flex'}} > 
        {props.admin && <Ip db = {props.db} stocksGainAll = {stocksGainAll} stocksInfoAll = {stocksInfoAll} localIp = {props.localIp} admin = {props.admin} />}
      </div>
    </>
  )
}

export default Firebase