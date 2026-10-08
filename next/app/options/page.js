"use client";

import StockOptions from "../../table/StockOptions";   // adjust path if needed

export default function OptionsPage(props) {
  const {
    chartSymbol,
    price,
    priceDivHigh,
    errorAdd,
    daily,
    eliHome,
    servSelect,
    ssl,
    PORT,
    rows,
    stockChartXValues,
    stockChartYValues,
    logFlags,
    pageForAi,
    setPageForAi,
    setPageForAiText
  } = props;

  return (
    <StockOptions
      symbol={chartSymbol}
      stockPrice={price}
      priceDivHigh={priceDivHigh}
      errorAdd={errorAdd}
      daily={daily}
      eliHome={eliHome}
      corsServer={servSelect}
      ssl={ssl}
      PORT={PORT}
      rows={rows}
      stockChartXValues={stockChartXValues}
      stockChartYValues={stockChartYValues}
      logFlags={logFlags}
      PageForAi={pageForAi}
      setPageForAi={setPageForAi}
      setPageForAiText={setPageForAiText}
    />
  );
}
