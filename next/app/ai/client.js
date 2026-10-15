"use client";


import {Ai} from "../../table/Ai";   // adjust path if needed
import memoryStore from "../../components/MemoryStore"; // adjust path if needed


export default function Client(props) {

  return (
    <Ai
      chartSymbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      errorAdd={memoryStore.get('errorAdd')}
      gainMap={memoryStore.get('gainMap')}
      pageForAi={memoryStore.get('pageForAi')}
      pageForAiText={memoryStore.get('pageForAiText')}
      city={memoryStore.get('city')}
      countryName={memoryStore.get('countryName')}
      countryCode={memoryStore.get('countryCode')}
      regionName={memoryStore.get('regionName')}
      ip={memoryStore.get('ip')}
      os={memoryStore.get('os')}
      logFlags={memoryStore.get('logFlags')}
      corsServer={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      prepareRow={memoryStore.get('prepareRow')}
      saveTable={memoryStore.get('saveTable')}
      eliHome={memoryStore.get('eliHome')}
      allColumns={memoryStore.get('allColumns')}
    />
  );
}
