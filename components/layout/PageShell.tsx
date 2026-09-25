"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import { useLanguage } from "@/components/language-provider";

interface PageShellProps {
  children: React.ReactNode;
  disclaimer?: boolean;
}

export default function PageShell({
  children,
  disclaimer = true,
}: PageShellProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f7f8f9]">
      <Header />

      {disclaimer && (
        <section
          aria-label="Legal disclaimer"
          className="border-b border-amber-200 bg-amber-50"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 text-center text-sm font-medium leading-relaxed text-amber-900 sm:px-6 lg:px-8">
            {/* Safety requirement: disclaimer always visible in BOTH languages */}
            <p>{t("disclaimer")}</p>
            <p className="text-amber-800/90">{t("disclaimer.sw")}</p>
            <p>
              <Link
                href="/legal-aid"
                className="font-semibold underline underline-offset-2 hover:text-amber-700"
              >
                {t("legalAid.getHelp")} →
              </Link>
            </p>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("common.backHome")}
        </Link>
        {children}
      </main>

      <Footer />
    </div>
  );
}
