"use client";

import {CandlestickChart} from "../../table/CandleStick";   // adjust path if needed
import memoryStore from "../../components/MemoryStore"; // adjust path if needed


export default function CandlestickPage(props) {

  return (
    <CandlestickChart
      symbol={memoryStore.get('chartSymbol')}
      chartData={memoryStore.get('chartData')}
      eliHome={memoryStore.get('eliHome')}
      daily={memoryStore.get('daily')}
      errorAdd={memoryStore.get('errorAdd')}
      API_KEY={memoryStore.get('API_KEY')}
      refreshByToggleColumns={memoryStore.get('refreshByToggleColumns')}
      PageForAi={memoryStore.get('pageForAi')}
      setPageForAi={memoryStore.get('setPageForAi')}
      setPageForAiText={memoryStore.get('setPageForAiText')}
    />
  );
}
