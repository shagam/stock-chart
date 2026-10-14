"use client";

import PriceAlert from "../../table/PriceAlert";   // adjust path if needed

export default function PriceAlertPage(props) {
  const {
    chartSymbol,
    daily,
    priceAlertTable,
    setPriceAlertTable,
    gainMap,
    errorAdd,
    servSelect,
    ssl,
    PORT,
    rows,
    refreshByToggleColumns,
    stockChartXValues,
    stockChartYValues
  } = props;

  return (
    <PriceAlert
      symbol={chartSymbol}
      daily={daily}
      priceAlertTable={priceAlertTable}
      setPriceAlertTable={setPriceAlertTable}
      gainMap={gainMap}
      errorAdd={errorAdd}
      servSelect={servSelect}
      ssl={ssl}
      PORT={PORT}
      rows={rows}
      refreshByToggleColumns={refreshByToggleColumns}
      stockChartXValues={stockChartXValues}
      stockChartYValues={stockChartYValues}
    />
  );
}
