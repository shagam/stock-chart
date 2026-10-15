"use client";

import Config from "../../table/Config";   // adjust path if needed
import memoryStore from "../../components/MemoryStore"; // adjust path if needed


export default function Client(props) {

  return (
    <Config
      alphaCallBack={memoryStore.get('alphaCallBack')}
      ip={memoryStore.get('ip')}
      rows={memoryStore.get('rows')}
      saveTable={memoryStore.get('saveTable')}
      logFlags={memoryStore.get('logFlags')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
      smoothSpikes={memoryStore.get('smoothSpikes')}
      setSmoothSpikes={memoryStore.get('setSmoothSpikes')}
      openMarketFlag={memoryStore.get('openMarketFlag')}
      setOpenMaretFlag={memoryStore.get('setOpenMaretFlag')}
      errorAdd={memoryStore.get('errorAdd')}
      servSelect={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
    />
  );
}
