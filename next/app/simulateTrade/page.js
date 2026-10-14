"use client";

import Simulate from "../../table/Simulate";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";
export default function SimulateTradePage(props) {
  // const {
  //   chartSymbol,
  //   rows,
  //   stockChartXValues,
  //   gainMap,
  //   stockChartYValues,
  //   logFlags,
  //   errorAdd,
  //   saveTable,
  //   monthGainData,
  //   daily
  // } = props;

  return (
    <Simulate
      symbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      gainMap={memoryStore.get('gainMap')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      logFlags={memoryStore.get('logFlags')}
      errorAdd={memoryStore.get('errorAdd')}
      saveTable={memoryStore.get('saveTable')}
      monthGainData={memoryStore.get('monthGainData')}
      daily={memoryStore.get('daily')}
    />
  );
}
