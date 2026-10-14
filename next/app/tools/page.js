"use client";

import Tools from "../../table/Tools";   // adjust path if needed

export default function ToolsPage(props) {
  const {
    chartSymbol,
    rows,
    logFlags,
    errorAdd,
    gainMap,
    stockChartXValues,
    stockChartYValues,
    refreshByToggleColumns,
    servSelect,
    ssl,
    PORT,
    daily
  } = props;

  return (
    <Tools
      symbol={chartSymbol}
      rows={rows}
      logFlags={logFlags}
      errorAdd={errorAdd}
      gainMap={gainMap}
      stockChartXValues={stockChartXValues}
      stockChartYValues={stockChartYValues}
      refreshByToggleColumns={refreshByToggleColumns}
      servSelect={servSelect}
      ssl={ssl}
      PORT={PORT}
      daily={daily}
    />
  );
}
