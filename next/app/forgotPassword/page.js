import Client from "./client";   // adjust path if needed


// forgotPassword
export const metadata = {
  title: "Reset Password | Stock Analytics Platform",
  description:
    "Recover access to your account by securely resetting your password and restoring account access.",
  keywords: [
    "forgot password",
    "reset password",
    "account recovery",
    "password assistance"
  ],

  alternates: {
    canonical: "https://yourdomain.com/forgotPassword",
  },

  openGraph: {
    title: "Reset Password | Stock Analytics Platform",
    description: "Recover access to your account securely.",
    url: "https://yourdomain.com/forgotPassword",
    siteName: "Stock Analytics Platform",
    type: "website",
  },

  robots: {
    index: false,
    follow: false,
  },

  category: "Account",
};


export default function ForgotPasswordPage() {
  return <Client />;
}
