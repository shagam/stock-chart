"use client";

import {MonthGain} from "../../table/MonthGain";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";

export default function Client() {

  return (
    <MonthGain
      symbol={memoryStore.get('chartSymbol')}
      gainMap={memoryStore.get('gainMap')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      logFlags={memoryStore.get('logFlags')}
      errorAdd={memoryStore.get('errorAdd')}
      setMonthGainData={memoryStore.get('setMonthGainData')}
      daily={memoryStore.get('daily')}
    />
  );
}
