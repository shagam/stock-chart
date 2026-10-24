"use client";

import {Polymarket} from "../../table/Polymarket";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";

// polyMarket


export default function Client () {

  return (
    <Polymarket
      symbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      allColumns={memoryStore.get('allColumns')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
      logFlags={memoryStore.get('logFlags')}
      eliHome={memoryStore.get('eliHome')}
      servSelect={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      errorAdd={memoryStore.get('errorAdd')}
    />
  );
}
