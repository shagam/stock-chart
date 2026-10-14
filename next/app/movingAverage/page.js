"use client";

import MovingAverage from "../../table/MovingAverage";   // adjust path if needed

export default function MovingAveragePage(props) {
  const {
    chartSymbol,
    rows,
    allColumns,
    deepStartDate,
    setDropStartDate,
    stockChartXValues,
    stockChartYValues,
    errorAdd,
    logFlags,
    chartData,
    daily
  } = props;

  return (
    <MovingAverage
      symbol={chartSymbol}
      rows={rows}
      allColumns={allColumns}
      deepStartDate={deepStartDate}
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
