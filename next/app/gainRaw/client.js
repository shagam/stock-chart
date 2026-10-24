"use client";

import {StockGain} from "../../table/StockGain";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";



export default function Client() {
  console.log(memoryStore.get('chartData'))
  return (
    <StockGain
      // stockGain={memoryStore.get('gainData')}
      // symbol={memoryStore.get('chartSymbol')}
      // setGainRawDividand={memoryStore.get('setGainRawDividand')}
      daily={memoryStore.get('daily')}
      // chartData={memoryStore.get('chartData')}
      rows={memoryStore.get('rows')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
    />
  );
}
