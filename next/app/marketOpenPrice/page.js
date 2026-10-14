"use client";

import MarketOpenPrice from "../../table/MarketOpenPrice";   // adjust path if needed

export default function MarketOpenPricePage(props) {
  const {
    chartSymbol,
    API_KEY,
    setDropStartDate,
    stockChartXValues,
    stockChartYValues,
    errorAdd,
    logFlags,
    chartData,
    daily
  } = props;

  return (
    <MarketOpenPrice
      symbol={chartSymbol}
      API_KEY={API_KEY}
      setDropStartDate={setDropStartDate}
      stockChartXValues={stockChartXValues}
      stockChartYValues={stockChartYValues}
      errorAdd={errorAdd}
      logFlags={logFlags}
      chartData={chartData}
      daily={daily}
    />
  );
}
