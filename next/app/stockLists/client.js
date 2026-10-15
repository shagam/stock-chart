"use client";

import StockLists from "../../table/StockLists";   // adjust path if needed
import memoryStore from "../../components/MemoryStore"; // adjust path if needed



export default function Client (props) {

  return (
    <StockLists
      ip={memoryStore.get('localIp')}
      rows={memoryStore.get('rows')}
      logFlags={memoryStore.get('logFlags')}
      saveTable={memoryStore.get('saveTable')}
      errorAdd={memoryStore.get('errorAdd')}
      servSelect={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
    />
  );
}
