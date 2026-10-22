import Client from "./client";   // adjust path if needed



// options
export const metadata = {
  title: "Options Trading Analytics | Stock Analytics Platform",
  description: "Analyze options contracts, implied volatility, Greeks, strike prices, and expiration opportunities.",
  keywords: ["options trading", "stock options", "implied volatility", "options analytics", "Greeks"],
  url: "https://sharecompare.org/options",
  siteName: "ShareCompare",
  type: "website"
};

export default function OptionsPage(props) {
  return (
    <Client/>
  );
}

     