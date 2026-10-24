"use client";

import {PriceAlert} from "../../table/PriceAlert";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";


export default function Client() {


  return (
    <PriceAlert
      symbol={memoryStore.get('chartSymbol')}
      daily={memoryStore.get('daily')}
      priceAlertTable={memoryStore.get('priceAlertTable')}
      setPriceAlertTable={memoryStore.get('setPriceAlertTable')}
      gainMap={memoryStore.get('gainMap')}
      errorAdd={memoryStore.get('errorAdd')}
      servSelect={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      rows={memoryStore.get('rows')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
    />
  );
}
