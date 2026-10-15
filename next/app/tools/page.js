import Client from "./client";   // adjust path if needed


// tools
export const metadata = {
  title: "Trading Tools & Market Utilities | Stock Analytics Platform",
  description:
    "Access stock market tools, trading utilities, screeners, calculators, and analytics designed to support smarter investment decisions.",
  keywords: [
    "stock tools",
    "trading tools",
    "market utilities",
    "investment tools",
    "financial analytics"
  ],

  alternates: {
    canonical: "https://yourdomain.com/tools",
  },

  openGraph: {
    title: "Trading Tools & Market Utilities | Stock Analytics Platform",
    description: "Access stock market tools, trading utilities, screeners, calculators, and analytics.",
    url: "https://yourdomain.com/tools",
    siteName: "Stock Analytics Platform",
    type: "website",
  },

  category: "Finance",
};


export default function ToolsPage(props) {


  return (
    <Client/>
  )
}
