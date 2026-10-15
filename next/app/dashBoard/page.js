import Client from "./client";   // adjust path if needed


// loginDashboard
export const metadata = {
  title: "Dashboard Login | Stock Analytics Platform",
  description:
    "Securely access your personalized stock analytics dashboard, portfolio tracking tools, and market insights.",
  keywords: [
    "dashboard login",
    "stock dashboard",
    "portfolio dashboard",
    "user account",
    "member login"
  ],

  alternates: {
    canonical: "https://yourdomain.com/dashboard",
  },

  openGraph: {
    title: "Dashboard Login | Stock Analytics Platform",
    description: "Securely access your personalized stock analytics dashboard.",
    url: "https://yourdomain.com/dashboard",
    siteName: "Stock Analytics Platform",
    type: "website",
  },

  robots: {
    index: false,
    follow: true,
  },

  category: "Finance",
};


export default function DashboardPage() {
  return <Client />;
}
