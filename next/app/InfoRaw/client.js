"use client";

import {StockInfo} from "../../table/StockInfo";   // adjust path if needed
import memoryStore from "../../components/MemoryStore"; // adjust path if needed

// infoRaw


export default function Client(props) {

  return (
    <StockInfo
      stockInfo={memoryStore.get('stockInfo')}
      chartSymbol={memoryStore.get('chartSymbol')}
      infoSymbol={memoryStore.get('infoSymbol')}
    />
  );
}
