"use client";

import {MarketOpenPrice} from "../../table/MarketOpenPrice";   // adjust path if needed

import memoryStore from "../../components/MemoryStore"; // adjust path if needed

export default function Client() {

  return (
    <MarketOpenPrice
      symbol={memoryStore.get('chartSymbol')}
      API_KEY={memoryStore.get('API_KEY')}
      setDropStartDate={memoryStore.get('setDropStartDate')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      errorAdd={memoryStore.get('errorAdd')}
      logFlags={memoryStore.get('logFlags')}
      chartData={memoryStore.get('chartData')}
      daily={memoryStore.get('daily')}
    />
  );
}
