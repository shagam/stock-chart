"use client";

import {Peak2PeakGui} from "../../table/Peak2Peak";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";


export default function Client() {
  
  return (
    <Peak2PeakGui
      symbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      gainMap={memoryStore.get('gainMap')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      logFlags={memoryStore.get('logFlags')}
      weekly={ ! memoryStore.get('daily')}
      setBubbleLine={memoryStore.get('setBubbleLine')}
      bubbleLine={memoryStore.get('bubbleLine')}
      errorAdd={memoryStore.get('errorAdd')}
      saveTable={memoryStore.get('saveTable')}
      price={memoryStore.get('price')}
      eliHome={memoryStore.get('eliHome')}
    />
  );
}
