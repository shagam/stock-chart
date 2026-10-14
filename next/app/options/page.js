"use client";

// export const metadata = {
//   title: "Options | ShareCompare",
//   description: "Analyze options chains, Greeks, volatility, and pricing models with ShareCompare’s advanced tools.",
//   keywords: ["options", "greeks", "volatility", "options trading", "sharecompare"],
//   openGraph: {
//     title: "Options | ShareCompare",
//     description: "Advanced options analytics including Greeks, IV, and pricing models.",
//     url: "https://sharecompare.org/options",
//     siteName: "ShareCompare",
//     type: "website"
//   }
// };

import {StockOptions} from "../../table/StockOptions";
import memoryStore from "../../components/MemoryStore";
export default function OptionsPage(props) {


  return (
    <StockOptions
      symbol={memoryStore.get('chartSymbol')}
      price={memoryStore.get('price')}
      priceDivHigh={memoryStore.get('priceDivHigh')}
      errorAdd={memoryStore.get('errorAdd')}
      daily={memoryStore.get('daily')}
      eliHome={memoryStore.get('eliHome')}
      corsServer={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
      rows={memoryStore.get('rows')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      logFlags={memoryStore.get('logFlags')}
      PageForAi={memoryStore.get('pageForAi')}
      setPageForAi={memoryStore.get('setPageForAi')}
      setPageForAiText={memoryStore.get('setPageForAiText')}
    />
  );
}
