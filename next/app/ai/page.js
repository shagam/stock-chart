"use client";

import Ai from "../../table/Ai";   // adjust path if needed

export default function AiPage(props) {
  const {
    chartSymbol,
    rows,
    errorAdd,
    gainMap,
    pageForAi,
    pageForAiText,
    city,
    countryName,
    countryCode,
    regionName,
    ip,
    os,
    logFlags,
    servSelect,
    ssl,
    PORT,
    prepareRow,
    saveTable,
    eliHome,
    allColumns
  } = props;

  return (
    <Ai
      chartSymbol={chartSymbol}
      rows={rows}
      errorAdd={errorAdd}
      gainMap={gainMap}
      pageForAi={pageForAi}
      pageForAiText={pageForAiText}
      city={city}
      countryName={countryName}
      countryCode={countryCode}
      regionName={regionName}
      ip={ip}
      os={os}
      logFlags={logFlags}
      corsServer={servSelect}
      ssl={ssl}
      PORT={PORT}
      prepareRow={prepareRow}
      saveTable={saveTable}
      eliHome={eliHome}
      allColumns={allColumns}
    />
  );
}
