
import Client from "./client";   // adjust path if needed

// tutorials
export const metadata = {
  title: "Stock Trading Tutorials & Guides | Stock Analytics Platform",
  description:
    "Learn stock investing, technical analysis, trading strategies, portfolio management, and platform features with step-by-step tutorials.",
  keywords: [
    "stock tutorials",
    "trading guides",
    "technical analysis tutorial",
    "investing education",
    "stock market learning"
  ],

  alternates: {
    canonical: "https://shareCompare.org/tutorials",
  },

  openGraph: {
    title: "Stock Trading Tutorials & Guides | Stock Analytics Platform",
    description: "Learn stock investing, trading strategies, portfolio management, and platform features.",
    url: "https://shareCompare.org/tutorials",
    siteName: "Stock Analytics Platform",
    type: "article",
  },

  category: "Education",
};


export default function TutorialsPage() {
  return <Client />;
}
