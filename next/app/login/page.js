import Client from "./client";   // adjust path if needed

// login
export const metadata = {
  title: "Login | Stock Analytics Platform",
  description:
    "Sign in to access stock analysis tools, trading features, saved watchlists, and personalized insights.",
  keywords: [
    "login",
    "sign in",
    "stock platform login",
    "trading account",
    "member access"
  ],

  alternates: {
    canonical: "https://yourdomain.com/login",
  },

  openGraph: {
    title: "Login | Stock Analytics Platform",
    description: "Sign in to access stock analysis tools and personalized insights.",
    url: "https://yourdomain.com/login",
    siteName: "Stock Analytics Platform",
    type: "website",
  },

  robots: {
    index: false,
    follow: true,
  },

  category: "Finance",
};


export default function LoginPage() {
  return <Client />;
}
