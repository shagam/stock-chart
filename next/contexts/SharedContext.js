'use client';

import { createContext, useContext, useState } from 'react';

const SharedContext = createContext(null);

export function SharedProvider({ children }) {
  const [symbol, setSymbol] = useState('');


   const value = {
    symbol, setSymbol,
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
