import Client from "./client";   // adjust path if needed


// loginDashboard
export const metadata = {
  title: "Dashboard Login | Stock Analytics Platform",
  description:
    "Securely access your personalized stock analytics dashboard, portfolio tracking tools, and market insights.",
  keywords: [
    "login dashboard",
    "portfolio dashboard",
    "user account",
    "member login"
  ],
  url: "https://shareCompare.org/dashboard",

  alternates: {
    canonical: "https://shareCompare.org/dashboard",
  },

  openGraph: {
    title: "Dashboard Login | Stock Analytics Platform",
    description: "Securely access your personalized stock analytics dashboard.",
    url: "https://shareCompare.org/dashboard",
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
    // return <div>Dashboard</div>;
  return <Client />;
}
