import Client from "./client";   // adjust path if needed

// polyMarket
export const metadata = {
  title: "Polymarket Analytics | Stock Analytics Platform",
  description: "Explore prediction market trends, probabilities, sentiment, and event-driven opportunities.",
  keywords: ["polymarket", "prediction markets", "market probabilities", "event forecasting"]
};

export default function PolymarketPage(props) {

  return (
    <Client />
  );
}

