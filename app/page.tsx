"use client";

import Link from "next/link";
import AnimatedLogo from "@/components/layout/AnimatedLogo";
import {
  Menu,
  Scale,
  TreeDeciduous,
  PanelLeft,
  SquarePen,
  MoreHorizontal,
  Search,
  ChevronRight,
  CheckCircle2,
  Share2,
  Plus,
  Copy,
  Bookmark,
  FileText,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FeaturesSection from "@/components/layout/FeaturesSection";
import TopicsSection from "@/components/layout/TopicsSection";
import DocumentPreviewSection from "@/components/layout/DocumentPreviewSection";
import WhySection from "@/components/layout/WhySection";
import Footer from "@/components/layout/Footer";
import AuthActions from "@/components/layout/AuthActions";
import { LanguageToggle } from "@/components/layout/Header";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n";

const navLinks: { href: string; key: TranslationKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/ask", key: "nav.ask" },
  { href: "/document-generator", key: "nav.documents" },
  { href: "/legal-topics", key: "nav.topics" },
  { href: "/about", key: "nav.about" },
  { href: "/blog", key: "nav.blog" },
];

const legalTopics = [
  "Tenant & landlord basics",
  "Employment rights basics",
  "Consumer rights basics",
  "Debt demand letters",
  "Small business agreements",
  "Complaint letters",
];

const modelProviders = ["OpenAI", "Google Gemini", "Groq Llama"];

function BrandLogo({ className }: { className?: string }) {
  return <AnimatedLogo className={className} />;
}

function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[980px] overflow-hidden rounded-xl border border-slate-300/40 bg-[#101114] shadow-[0_40px_80px_-30px_rgba(15,23,42,0.45)]">
      <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-white/5 bg-[#0b0c0f] p-3 sm:block">
          <div className="mb-3 flex items-center justify-between px-1 text-slate-500">
            <PanelLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <SquarePen className="h-3.5 w-3.5" aria-hidden="true" />
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5 text-[10px] text-slate-500">
            <Search className="h-3 w-3" aria-hidden="true" />
            Search messages
          </div>
          <p className="px-1 pb-2 text-[9px] font-medium uppercase tracking-wider text-slate-600">
            Legal topics
          </p>
          <ul className="space-y-1">
            {legalTopics.map((topic) => (
              <li
                key={topic}
                className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[10px] text-slate-400 hover:bg-white/5"
              >
                <span
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#c9a227]/15 text-[8px] font-semibold text-[#c9a227]"
                  aria-hidden="true"
                >
                  <Scale className="h-2.5 w-2.5" />
                </span>
                <span className="truncate">{topic}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main panel */}
        <div className="relative min-h-[380px] bg-[#101114]">
          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-10 items-center justify-between border-b border-white/5 bg-[#0e0f12] px-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <SquarePen className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="rounded bg-white/5 px-2 py-0.5">haki-assistant</span>
              <Copy className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
              <Bookmark className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
              <Plus className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
              <TreeDeciduous className="h-3.5 w-3.5 text-[#c9a227]" aria-hidden="true" />
              <span className="tracking-wide">HAKI AI</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>

          {/* Model picker dropdown */}
          <div className="absolute left-3 top-12 z-20 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#17181c] shadow-2xl shadow-black/60">
            <ul className="space-y-0.5 p-1 text-[11px] text-slate-300">
              {modelProviders.map((provider) => (
                <li
                  key={provider}
                  className="flex items-center justify-between rounded-md px-2.5 py-1.5 hover:bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="grid h-4 w-4 place-items-center rounded-full bg-white/10 text-[8px] font-semibold text-slate-300"
                      aria-hidden="true"
                    >
                      {provider.charAt(0)}
                    </span>
                    {provider}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600" aria-hidden="true" />
                </li>
              ))}
              <li className="flex items-center justify-between rounded-md bg-white/5 px-2.5 py-1.5">
                <span className="flex items-center gap-2">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-[#c9a227]/15" aria-hidden="true">
                    <TreeDeciduous className="h-3 w-3 text-[#c9a227]" />
                  </span>
                  Haki
                </span>
                <ChevronRight className="h-3 w-3 text-slate-600" aria-hidden="true" />
              </li>
            </ul>
            <div className="border-t border-white/10 p-2">
              <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5 text-[10px] text-slate-500">
                <Search className="h-3 w-3" aria-hidden="true" />
                Search AI models...
              </div>
              <div className="mt-1.5 flex items-center justify-between rounded-md border border-white/10 px-2 py-1.5 text-[10px] text-slate-300">
                <span className="flex items-center gap-2">
                  <TreeDeciduous className="h-3 w-3 text-[#c9a227]" aria-hidden="true" />
                  haki-assistant
                </span>
                <CheckCircle2 className="h-3 w-3 text-emerald-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* AI assistant conversation */}
          <div className="space-y-3 px-4 pb-10 pt-14 text-[11px] leading-relaxed text-slate-400 sm:pl-[248px] sm:pr-12">
            <div className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-white/5 px-3 py-2 text-slate-300">
              What are my rights as a tenant?
            </div>
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9a227]">
                <TreeDeciduous className="h-3 w-3" aria-hidden="true" />
                HAKI AI
              </p>
              <p>
                In Kenya, a tenant has the right to safe and habitable
                accommodation, peaceful enjoyment of the property, and
                protection from unlawful eviction. Your landlord must follow
                the tenancy agreement and due process before ending a tenancy,
                and must return your deposit less any agreed deductions.
              </p>
              <p className="text-slate-300">Next steps:</p>
              <ol className="list-decimal space-y-1 pl-5 text-slate-300">
                <li>Review your tenancy agreement.</li>
                <li>Keep records of your rent payments and any repairs.</li>
                <li>Raise any issue with your landlord in writing first.</li>
                <li>
                  If unresolved, contact a licensed advocate or the Rent
                  Restriction Tribunal.
                </li>
              </ol>
              <div className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2">
                <span className="flex items-center gap-2 text-slate-300">
                  <FileText className="h-3.5 w-3.5 text-[#c9a227]" aria-hidden="true" />
                  Suggested document: Rent acknowledgement letter
                </span>
                <span className="chip-gradient rounded-full px-2.5 py-1 text-[9px] font-semibold">
                  Generate
                </span>
              </div>
              <p className="text-[9.5px] text-slate-600">
                HAKI AI provides general legal information only and does not
                provide legal advice.
              </p>
            </div>
          </div>

          {/* Right icon rail */}
          <div className="absolute right-0 top-10 hidden h-full w-9 flex-col items-center gap-4 border-l border-white/5 bg-[#0e0f12] pt-3 text-slate-600 sm:flex">
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-[#f7f8f9]">
      {/* Navbar */}
      <header className="relative z-30">
        <div className="mx-auto flex h-[88px] max-w-[1200px] items-center justify-between px-5 sm:px-6 lg:px-8">
          <BrandLogo />

          <nav aria-label="Main navigation" className="hidden items-center md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.key}
                href={link.href}
                className="px-3 py-2 text-[15px] font-medium text-slate-700 transition-colors hover:text-[#c0221b]"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle />
            <AuthActions />
            <Button
              asChild
              className="btn-gradient-primary h-10 rounded-full px-6 text-[15px] font-semibold"
            >
              <Link href="/contact">{t("common.contact")}</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" aria-label="Mobile navigation menu">
                <SheetHeader>
                  <SheetTitle asChild>
                    <Link href="/" aria-label="HAKI AI home">
                      HAKI AI
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="mt-6 flex flex-col gap-1"
                >
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href + link.key}>
                      <Link
                        href={link.href}
                        className="rounded-md px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      >
                        {t(link.key)}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-4">
                  <LanguageToggle stacked />
                </div>
                <SheetClose asChild>
                  <div className="mt-4">
                    <AuthActions stacked />
                  </div>
                </SheetClose>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero-bg relative overflow-hidden pt-8 md:pt-14">
        {/* Background map silhouette */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 860"
          className="pointer-events-none absolute left-1/2 top-[40px] h-[760px] w-[980px] -translate-x-1/2 md:h-[860px] md:w-[1100px]"
          fill="#efe8e7"
        >
          <path d="M250,70 L640,85 L700,150 L760,180 L800,250 L880,275 L840,330 L760,345 L735,420 L745,500 L700,585 L655,670 L600,745 L530,790 L470,770 L445,700 L400,640 L360,565 L300,510 L230,470 L150,445 L70,400 L35,340 L60,285 L130,255 L205,235 Z" />
          <path d="M690,600 L720,640 L705,710 L675,745 L660,700 L668,645 Z" />
        </svg>

        <div className="relative z-10 mx-auto max-w-[1200px] px-5 text-center sm:px-6 lg:px-8">
          <h1 className="mx-auto max-w-4xl text-[42px] font-bold leading-[1.06] tracking-tight text-[#1f2a37] sm:text-[56px] lg:text-[68px]">
            {t("hero.title")}
          </h1>

          <p className="mx-auto mt-7 max-w-[740px] text-[16px] leading-relaxed text-slate-600 md:text-[18px]">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              className="btn-gradient-primary h-[56px] rounded-full px-9 text-[17px] font-semibold"
            >
              <Link href="/ask">{t("hero.ask")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-[56px] rounded-full border-slate-300 px-9 text-[17px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900"
            >
              <Link href="/document-generator">{t("hero.generate")}</Link>
            </Button>
          </div>

          <div className="mt-14 md:mt-20">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* Safety First disclaimer banner */}
      <section
        aria-label="Legal disclaimer"
        className="border-y border-amber-200 bg-amber-50"
      >
        <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 text-center text-sm font-medium leading-relaxed text-amber-900 sm:px-6 lg:px-8">
          <p>{t("disclaimer")}</p>
          <p className="text-amber-800/90">{t("disclaimer.sw")}</p>
          <p className="font-semibold text-amber-950">
            {t("scope.limitation")}
          </p>
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

      {/* Core Features / How It Works */}
      <FeaturesSection />

      {/* Legal Topics Explorer */}
      <TopicsSection />

      {/* Document Generator Preview */}
      <DocumentPreviewSection />

      {/* Why HAKI AI */}
      <WhySection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
