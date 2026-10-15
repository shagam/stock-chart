"use client";


import {CommonDatabase} from "../../table/CommonDatabase";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";
  

export default function Client(props) {


  return (
    <CommonDatabase
      localIp={memoryStore.get('localIp')}
      rows={memoryStore.get('rows')}
      prepareRow={memoryStore.get('prepareRow')}
      symbol={memoryStore.get('chartSymbol')}
      admin={memoryStore.get('admin')}
      eliHome={memoryStore.get('eliHome')}
      saveTable={memoryStore.get('saveTable')}
      refreshCallBack={memoryStore.get('refreshByToggleColumns')}
      allColumns={memoryStore.get('allColumns')}
      logFlags={memoryStore.get('logFlags')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      errorAdd={memoryStore.get('errorAdd')}
      corsServer={memoryStore.get('servSelect')}
      yearlyPercent={memoryStore.get('yearlyPercent')}
      QQQ_gain={memoryStore.get('QQQ_gain')}
    />
  );
}
