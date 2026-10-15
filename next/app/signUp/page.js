

import Client from "./client";   // adjust path if needed

// signUp
export const metadata = {
  title: "Create Account | Stock Analytics Platform",
  description:
    "Create a free account to access stock analysis tools, watchlists, alerts, trading insights, and portfolio tracking.",
  keywords: [
    "sign up",
    "create account",
    "stock analytics account",
    "register",
    "trading platform"
  ],

  alternates: {
    canonical: "https://yourdomain.com/signUp",
  },

  openGraph: {
    title: "Create Account | Stock Analytics Platform",
    description: "Create an account and start tracking markets and investments.",
    url: "https://yourdomain.com/signUp",
    siteName: "Stock Analytics Platform",
    type: "website",
  },

  category: "Finance",
};


export default function SignupPage() {
  return <Client />;
}
