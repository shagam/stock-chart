"use client";

import Tools from "../../table/Tools";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";


// tools


export default function Client(props) {


  return (
    <Tools
      symbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      logFlags={memoryStore.get('logFlags')}
      errorAdd={memoryStore.get('errorAdd')}
      gainMap={memoryStore.get('gainMap')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
      servSelect={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      daily={memoryStore.get('daily')}
    />
  );
}
