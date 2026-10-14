
"use client";

import {DropRecoveryButtons} from "../../table/DropRecovery";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";
export default function DropRecoveryPage(props) {


  return (
    <DropRecoveryButtons
      StockSymbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      errorAdd={memoryStore.get('errorAdd')}
      logFlags={memoryStore.get('logFlags')}
      corsServer={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      prepareRow={memoryStore.get('prepareRow')}
      saveTable={memoryStore.get('saveTable')}
      eliHome={memoryStore.get('eliHome')}
      allColumns={memoryStore.get('allColumns')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      daily={memoryStore.get('daily')}
      chartData={memoryStore.get('chartData')}
    />
  );
}
