import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { OfflineSupport } from "@/components/offline-support";
import SplashScreen from "@/components/layout/SplashScreen";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HAKI AI | Legal Information and Document Assistance Platform",
  description:
    "Cloud-hosted, AI-powered legal information and document generation platform for Kenya. Not a substitute for a licensed advocate.",
  manifest: "/manifest.json",
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
