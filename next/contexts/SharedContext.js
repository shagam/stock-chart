'use client';

import { createContext, useContext, useState } from 'react';

const SharedContext = createContext(null);

export function SharedProvider({ children }) {
  const [chartSymbol, setChartSymbol] = useState("");
  const [infoSymbol, setInfoSymbol] = useState("");
  const [gainMap, setGainMap] = useState([]);
  const [chartData, setChartData] = useState({}); 
  const [stockInfo, setStockInfo] = useState ('');
  const [gainRawDividand, setGainRawDividand] = useState (true);
  const [gainData, setGainData] = useState();
  const [daily, setDaily] = useState (true);

   const value = {
      chartSymbol, setChartSymbol,
      infoSymbol, setInfoSymbol,
      gainMap, setGainMap,
      chartData, setChartData,
      stockInfo, setStockInfo,
      gainRawDividand, setGainRawDividand,
      gainData, setGainData,
      daily, setDaily
   };


  return (
    <SharedContext.Provider value={value} >
      {children}
    </SharedContext.Provider>
  );
}

export function useShared() {
  return useContext(SharedContext);
}
