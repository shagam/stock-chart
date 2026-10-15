"use client";

import {Futures} from "../../table/Futures";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";



export default function Client(props) {

  return (
    <Futures
      symbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      allColumns={memoryStore.get('allColumns')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
      logFlags={memoryStore.get('logFlags')}
      servSelect={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      errorAdd={memoryStore.get('errorAdd')}
    />
  );
}
