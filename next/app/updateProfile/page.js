
// updateProfile
export const metadata = {
  title: "Update Profile Settings | Stock Analytics Platform",
  description:
    "Manage your account profile, preferences, watchlists, notifications, and personal settings.",
  keywords: [
    "update profile",
    "profile settings",
    "account management",
    "user preferences",
    "notification settings"
  ],

  alternates: {
    canonical: "https://yourdomain.com/updateProfile",
  },

  openGraph: {
    title: "Update Profile Settings | Stock Analytics Platform",
    description: "Manage account preferences and profile settings.",
    url: "https://yourdomain.com/updateProfile",
    siteName: "Stock Analytics Platform",
    type: "website",
  },

  robots: {
    index: false,
    follow: true,
  },

  category: "Account",
};

export default function UpdateProfilePage() {
  return <Client />;
}
