import React, {useState} from 'react'
import {db} from './firebase-config'
import { getDocs, doc, deleteDoc, query, where} from "firebase/firestore";
import {nanoid} from 'nanoid';

import Ip from './Ip'
import "./Firebase.css"

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
    props.prepareRow(newStock);

    props.rows.push (newStock);
  }

  // get all stocks better than QQQ
  const firebaseGainGetBest = async (add_flag) => {

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
       // 'mon6', '>', props.rows[QQQ_index].values.mon6 
       'year', '>', (props.rows[QQQ_index].values.year * 0.92)
        // || 'year2', '>', 10//props.rows[QQQ_index].values.year2
        // || 'year5', '>', 10000//props.rows[QQQ_index].values.year5
        // || 'year10', '>', 10000// props.rows[QQQ_index].values.year10
        ));
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
          addSym (symbol, gain.docs[i].data());
          props.saveTable();
          props.refreshCallBack();
        }

        if (LOG_FLAG)
        console.log ('stock equ QQQ added ', i, symbol);
        if (found_stocks_array[symbol] === undefined)
          found_stocks_array[symbol] = true;
        else {
          if (LOG_FLAG)
          console.log ('dup')
        }
      }

      if (! add_flag) {
        const len = Object.keys (found_stocks_array).length;
        alert (`symbols (missing) compared with QQQ (year gain) (${len} symbols):  ${JSON.stringify(Object.keys(found_stocks_array))}`)
      }
      else
        window.location.reload();    
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
        collect[sym] ++;
    }
    console.log (collect);
    alert (JSON.stringify (collect))
  }

   // get one symbol GAIN from firebase  and clean duplicates
   const firebaseGainGetOne = async (symbol) => {
    try {
      // get one symbol gain from firebase
      var userQuery = query (props.gainRef, where('__symbol', '==', symbol));
      const gain = await getDocs(userQuery);

      const rowIndex = props.rows.findIndex((row)=> row.values.symbol === symbol);            
      if (rowIndex !== -1 && gain !== undefined) {
        const gain_ = gain.docs[0].data()
        props.updateTableGain (gain_.__symbol, gain_.splits, gain_._updateDate, gain_._updateMili, gain_.wk, gain_.wk2, gain_.mon, gain_.mon3, gain_.mon6, gain_.year, gain_.year2, gain_.year5, gain_.year10, gain_.year20, gain_.price);
      }
 
      if (gain.docs.length > 0) {
        var latestIndex = 0;
        
        if (gain.docs.length > 1) {
          console.log ('duplicates ', gain.docs.length, gain.docs[0].data()); 
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
            var gainDoc = doc(db, "stock-gain", gain.docs[i].id);
            await deleteDoc (gainDoc);    
          }               
        }
      }
    } catch(e) { console.log (e); alert (e)}
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

    // console.log (stocksInfoOne);
    // console.log (stocksGainOne);     
    // fill in table missing values
    
    // turn on columns so used can decide if up to date
    // var ind = allColumns.findIndex((column)=> column.Header === 'info_date');
    // allColumns[ind].toggleHidden();
    // ind = allColumns.findIndex((column)=> column.Header === 'gain_date');
    // allColumns[ind].toggleHidden();

    // fill missing data
    for (let i = 0; i < props.rows.length; i++) {
      // get from firebase 
      if (props.rows[i].values.info_date === undefined) {
        firebaseInfoGetOne((props.rows[i].values.symbol));
      }
      if (props.rows[i].values.gain_date === undefined) {
        firebaseGainGetOne((props.rows[i].values.symbol));
      }
    }
    props.saveTable();
    props.refreshCallBack(-1);
  }



  return (
    <>
      <div id="firebase_id"> 
        <button type="button" onClick={()=>firebaseGetAndFill()}>Fill_gain_info </button>
        <button type="button" onClick={()=>firebaseGainGetBest(false)}>Show-stocks-compared-to-QQQ </button>
        <button type="button" onClick={()=>firebaseGainGetBest(true)}>Fill-stocks-compared-to-QQQ </button>
        {props.admin &&
          <div>
            <div> Firebase   gain: {stocksGain.length}, info: {stocksInfo.length} </div>
            <button type="button" onClick={()=>count_gain_info()}>count_gain_info </button>  
            <button type="button" onClick={()=>ip_symbol_statistics()}>Stock_popularity</button>
          </div>
        }
      </div>
      <div id="ip_id"> 
        <Ip db = {props.db} stocksGainAll = {stocksGainAll} stocksInfoAll = {stocksInfoAll} localIp = {props.localIp} admin = {props.admin} />
      </div>
    </>
  )
}

export default Firebase