import Client from "./client";   // adjust path if needed

// export const metadata = {
//   title: "Options | ShareCompare",
//   description: "Analyze options chains, Greeks, volatility, and pricing models with ShareCompare’s advanced tools.",
//   keywords: ["options", "greeks", "volatility", "options trading", "sharecompare"],
//   openGraph: {
//     title: "Options | ShareCompare",
//     description: "Advanced options analytics including Greeks, IV, and pricing models.",
//     url: "https://sharecompare.org/options",
//     siteName: "ShareCompare",
//     type: "website"
//   }
// };



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

     