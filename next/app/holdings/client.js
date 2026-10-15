"use client";

import {Holdings} from "../../table/Holdings";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";


export default function Client(props) {

  return (
    <Holdings
      chartSymbol={memoryStore.get('chartSymbol')}
      rows={memoryStore.get('rows')}
      errorAdd={memoryStore.get('errorAdd')}
      logFlags={memoryStore.get('logFlags')}
      corsServer={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      prepareRow={memoryStore.get('prepareRow')}
      saveTable={memoryStore.get('saveTable')}
      eliHome={memoryStore.get('eliHome')}
      allColumns={memoryStore.get('allColumns') }
    />
  );
}
