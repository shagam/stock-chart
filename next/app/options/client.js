"use client";


import {StockOptions} from "../../table/StockOptions";
import memoryStore from "../../components/MemoryStore";


export default function Client() {


  return (
    <StockOptions
      // symbol={memoryStore.get('chartSymbol')}
      // price={memoryStore.get('price')}
      // priceDivHigh={memoryStore.get('priceDivHigh')}
      errorAdd={memoryStore.get('errorAdd')}
      // daily={memoryStore.get('daily')}
      eliHome={memoryStore.get('eliHome')}
      // corsServer={memoryStore.get('servSelect')}
      // ssl={memoryStore.get('ssl')}
      // PORT={memoryStore.get('PORT')}
      rows={memoryStore.get('rows')}
      // stockChartXValues={memoryStore.get('stockChartXValues')}
      // stockChartYValues={memoryStore.get('stockChartYValues')}
      // logFlags={memoryStore.get('logFlags')}
      PageForAi={memoryStore.get('pageForAi')}
      setPageForAi={memoryStore.get('setPageForAi')}
      setPageForAiText={memoryStore.get('setPageForAiText')}
    />
  );
}
