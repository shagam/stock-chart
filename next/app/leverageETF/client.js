"use client";

import {LeverageETF} from "../../table/LeverageETF";   // adjust path if needed
import memoryStore from "../../components/MemoryStore"; // adjust path if needed


export default function Client() {

  return (
    <LeverageETF
      symbol={memoryStore.get('chartSymbol')}
      gainMap={memoryStore.get('gainMap')}
      logFlags={memoryStore.get('logFlags')}
      errorAdd={memoryStore.get('errorAdd')}
      daily={memoryStore.get('daily')}
    />
  );
}
