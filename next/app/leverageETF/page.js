"use client";

import LeverageETF from "../../table/LeverageETF";   // adjust path if needed

export default function LeverageETFPage(props) {
  const {
    chartSymbol,
    gainMap,
    logFlags,
    errorAdd,
    daily
  } = props;

  return (
    <LeverageETF
      symbol={chartSymbol}
      gainMap={gainMap}
      logFlags={logFlags}
      errorAdd={errorAdd}
      daily={daily}
    />
  );
}
