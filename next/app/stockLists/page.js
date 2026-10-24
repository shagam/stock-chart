import Client from "./client";   // adjust path if needed

// stockList
export const metadata = {
  title: "Stock List Directory | Stock Analytics Platform",
  description: "Bundle stocks ib ETF into lists, to be shared between users, through backendServer",
  keywords: ["stock list", "stock directory", "ETFs", "market sectors", "investments"],
    url: "https://shareCompare.org/stockLists",
};


export default function StockListsPage() {

  return (
    <Client/>
  )
}
