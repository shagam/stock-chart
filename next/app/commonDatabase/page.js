import Client from "./client";

// commonDatabase
export const metadata = {
  title: "Stock Market Database | Stock Analytics Platform",
  description: "Filter stocks with gain better than QQQ (i.e 2X fold times fold, since a year or 2 years ago), based on historical stock prices. ",
  keywords: ["stock database", "market database", "financial data", "stock information"],
  url: "https://shareCompare.org/commonDatabase",
};


export default function CommonDatabasePage() {

  return (<Client/>

  );
}
