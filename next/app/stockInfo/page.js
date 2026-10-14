"use client";

import StockInfo from "../../table/StockInfo";   // adjust path if needed

export default function InfoRawPage(props) {
  const {
    stockInfo,
    chartSymbol,
    infoSymbol
  } = props;

  return (
    <StockInfo
      stockInfo={stockInfo}
      chartSymbol={chartSymbol}
      infoSymbol={infoSymbol}
    />
  );
}
