"use client";

import UrlGetParse from "../../table/UrlGetParse";   // adjust path if needed

export default function UrlGetParsePage(props) {
  const {
    chartSymbol,
    servSelect,
    ssl,
    PORT
  } = props;

  return (
    <UrlGetParse
      symbol={chartSymbol}
      corsServer={servSelect}
      ssl={ssl}
      PORT={PORT}
    />
  );
}
