import React, {useState, useMemo, useEffect} from 'react'
import {db} from './firebase-config'
import {collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where, orderByChild, firestore} from "firebase/firestore";
import {nanoid} from 'nanoid';

import Ip from './Ip'
import "./FirebaseManage.css"

const FirebaseManage = (props) => {
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

  function addSym (sym) {
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
    
    props.rows.push (newStock);
    //firebaseGetAndFill();      
    //saveTable();
    //props.callBack(-1);
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
          addSym (symbol);
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
        // var newStock = JSON.parse ('{"id":"0","original":{"symbol":""},"index":0,"values":{"symbol":""}}');
    
        // newStock.id = nanoid();
        // newStock.values.symbol = symbol;
        // newStock.original.symbol = symbol;
        // newStock.cells = null;
        // newStock.allCells = [];
        // newStock.values.updateDate = gain.docs[i].data()._updateDate;
        // newStock.values.updateMili = gain.docs[i].data()._updateMili;

        // newStock.values.wk = gain.docs[i].data().wk;
        // newStock.values.wk2 = gain.docs[i].data().wk2;
        // newStock.values.mon = gain.docs[i].data().mon;
        // newStock.values.mon3 = gain.docs[i].data().mon3;
        // newStock.values.mon6 = gain.docs[i].data().mon6;
        // newStock.values.year = gain.docs[i].data().year;
        // newStock.values.year2 = gain.docs[i].data().year2;
        // newStock.values.year5 = gain.docs[i].data().year5;
        // newStock.values.year10 = gain.docs[i].data().year10;
        // newStock.values.year20 = gain.docs[i].data().year20;
        // newStock.values.splits = gain.docs[i].data().splits;

        // try {
        // props.prepareRow(newStock);
        // props.rows.push (newStock);
        // } catch (e) {
        //   console.log (e)
        //   alert ('adding best stocks' + e);
        // }
        // window.location.reload();
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

  return (
    <>
      <div id="firebase_id"> 
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

export default FirebaseManage