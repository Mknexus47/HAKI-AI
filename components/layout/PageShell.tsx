"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Languages, ShieldAlert } from "lucide-react";
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
          className="border-b border-amber-200/70 bg-gradient-to-b from-amber-50 to-[#fdf6e7]"
        >
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/25">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-[200px] flex-1">
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  Important Notice{" "}
                  <span className="font-medium text-slate-400">·</span>{" "}
                  <span className="font-semibold text-slate-600">Muhimu</span>
                </h2>
                <p className="mt-0.5 text-[13px] text-slate-500">
                  General legal information only — not legal advice.
                </p>
              </div>
              <Link
                href="/legal-aid"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
                {t("legalAid.getHelp")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="flex gap-3 rounded-xl border border-amber-200/60 bg-white/80 p-4 shadow-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-[11px] font-bold text-amber-700">
                  EN
                </span>
                {/* Safety requirement: disclaimer always visible in BOTH languages */}
                <p className="text-[13px] leading-relaxed text-slate-600">
                  {t("disclaimer").replace(/^⚠️\s*/, "")}
                </p>
              </div>
              <div className="flex gap-3 rounded-xl border border-amber-200/60 bg-white/80 p-4 shadow-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-[11px] font-bold text-amber-700">
                  <Languages className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-[13px] leading-relaxed text-slate-600">
                  {t("disclaimer.sw").replace(/^⚠️\s*/, "")}
                </p>
              </div>
            </div>
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
