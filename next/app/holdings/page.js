import Client from "./client";   // adjust path if needed

// holdings
export const metadata = {
  title: "ETF Holdings Tracker | Stock Analytics Platform",
  description: "Monitor ETF holdings.",
  keywords: ["ETF holdings", "investment tracker", "stock portfolio", "portfolio analysis", "asset allocation"],
  url: "https://shareCompare.org/holdings"
};

export default function HoldingsPage() {

  return (
    <Client />
  );
}

    