"use client";

import {StockInfo} from "../../table/StockInfo";   // adjust path if needed


// infoRaw


export default function Client() {

  return (
    <StockInfo
      // stockInfo={memoryStore.get('stockInfo')}
      // chartSymbol={memoryStore.get('chartSymbol')}
      // infoSymbol={memoryStore.get('infoSymbol')}
    />
  );
}
