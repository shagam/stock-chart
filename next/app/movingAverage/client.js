"use client";

import {MovingAverage} from "../../table/MovingAverage";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";


export default function Client(props) {


  return (
    <MovingAverage
      symbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('mrows')}
      allColumns={memoryStore.get('allColumns')}
      deepStartDate={memoryStore.get('deepStartDate')}
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
