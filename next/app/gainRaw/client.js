"use client";

import {StockGain} from "../../table/StockGain";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";



export default function Client(props) {
  console.log('chartData:', memoryStore.get('chartData'));
  console.log('gainData:', memoryStore.get('gainData'));
  return (
    <StockGain
      stockGain={memoryStore.get('gainData')}
      symbol={memoryStore.get('chartSymbol')}
      setGainRawDividand={memoryStore.get('setGainRawDividand')}
      daily={memoryStore.get('daily')}
      chartData={memoryStore.get('chartData')}
      rows={memoryStore.get('rows')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
    />
  );
}
