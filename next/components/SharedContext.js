"use client";

import { createContext, useContext } from "react";

export const SharedContext = createContext(null);

export function useSharedContext() {
const context = useContext(SharedContext);

if (!context) {
throw new Error("SharedContext provider is missing");
}

return context;
}
