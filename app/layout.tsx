import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { OfflineSupport } from "@/components/offline-support";
import SplashScreen from "@/components/layout/SplashScreen";
import { SITE_URL } from "@/lib/site";
import { websiteJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HAKI AI | Legal Information and Document Assistance Platform",
    template: "%s | HAKI AI",
  },
  description:
    "Cloud-hosted, AI-powered legal information and document generation platform for Kenya. Not a substitute for a licensed advocate.",
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "303kwchFMijcbwNcRYamdbAFCwaBjO09_gHZTi96PPA",
  },
  openGraph: {
    title: "HAKI AI | Legal Information and Document Assistance Platform",
    description:
      "Cloud-hosted, AI-powered legal information and document generation platform for Kenya. Not a substitute for a licensed advocate.",
    url: SITE_URL,
    siteName: "HAKI AI",
    type: "website",
    images: [{ url: "/logo-icon.jpg", width: 512, height: 512, alt: "HAKI AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HAKI AI | Legal Information and Document Assistance Platform",
    description:
      "Cloud-hosted, AI-powered legal information and document generation platform for Kenya. Not a substitute for a licensed advocate.",
    images: ["/logo-icon.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <SplashScreen />
            {children}
            <OfflineSupport />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
