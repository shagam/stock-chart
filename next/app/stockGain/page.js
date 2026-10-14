"use client";

import StockGain from "../../table/StockGain";   // adjust path if needed

export default function GainRawPage(props) {
  const {
    gainData,
    chartSymbol,
    setGainRawDividand,
    daily,
    chartData,
    rows,
    refreshByToggleColumns
  } = props;

  return (
    <StockGain
      stockGain={gainData}
      symbol={chartSymbol}
      setGainRawDividand={setGainRawDividand}
      daily={daily}
      chartData={chartData}
      rows={rows}
      refreshByToggleColumns={refreshByToggleColumns}
    />
  );
}
