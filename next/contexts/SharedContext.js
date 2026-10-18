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
  const [eliHome, setEliHome] = useState(false);
  const [logFlags, setLogFlags] = useState([]);

  const [price, setPrice] = useState();
  const [priceDivHigh, setPriceDivHigh] = useState();

  const [stockChartXValues, setStockChartXValues] = useState ([]);
  const [stockChartYValues, setStockChartYValues] = useState ([]);

  const servList = [process.env.NEXT_PUBLIC_AWS_IP, process.env.NEXT_PUBLIC_LOCAL_SERV_IP]
  const servNameList = ['production', 'test']; //,'local_win']//, 'production_'];
  const [ssl, setSsl] = useState(true)
  const [servSelect, setServSelect] = useState(servList[0]);  // default test server
  const [PORT, setPORT] = useState(5000);
  const HIGH_LIMIT_KEY = process.env.NEXT_PUBLIC_ALPHAVANTAGE_KEY
    // ,'C542IZRPH683PFNZ','BC9UV9YUBWM3KQGF','QMV6KTIDIPRAQ9R0','Q6A0J5VH5720QBGR'

   const value = {
      chartSymbol, setChartSymbol,
      infoSymbol, setInfoSymbol,
      gainMap, setGainMap,
      chartData, setChartData,
      stockInfo, setStockInfo,
      gainRawDividand, setGainRawDividand,
      gainData, setGainData,
      
      daily, setDaily,
      eliHome, setEliHome,
      logFlags, setLogFlags,

      price, setPrice,
      priceDivHigh, setPriceDivHigh,

      stockChartXValues, setStockChartXValues,
      stockChartYValues, setStockChartYValues,

      servList,
      servNameList, 
      servSelect, setServSelect,
      ssl, setSsl,
      PORT, setPORT,

      HIGH_LIMIT_KEY
   };


  return (
    <SharedContext.Provider value={value} >
      {children}
    </SharedContext.Provider>
  );
}

function useShared() {
  return useContext(SharedContext);
}

export {useShared, SharedContext}
