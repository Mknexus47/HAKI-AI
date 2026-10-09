import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { OfflineSupport } from "@/components/offline-support";
import SplashScreen from "@/components/layout/SplashScreen";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://haki-ai-virid.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HAKI AI | Legal Information and Document Assistance Platform",
  description:
    "Cloud-hosted, AI-powered legal information and document generation platform for Kenya. Not a substitute for a licensed advocate.",
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  openGraph: {
    title: "HAKI AI | Legal Information and Document Assistance Platform",
    description:
      "Cloud-hosted, AI-powered legal information and document generation platform for Kenya. Not a substitute for a licensed advocate.",
    url: SITE_URL,
    siteName: "HAKI AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HAKI AI | Legal Information and Document Assistance Platform",
    description:
      "Cloud-hosted, AI-powered legal information and document generation platform for Kenya. Not a substitute for a licensed advocate.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
