"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import AuthActions from "@/components/layout/AuthActions";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n";

const navLinks: { href: string; key: TranslationKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/legal-topics", key: "nav.topics" },
  { href: "/document-generator", key: "nav.documents" },
  { href: "/about", key: "nav.about" },
];

export function LanguageToggle({ stacked = false }: { stacked?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => setLang(lang === "en" ? "sw" : "en")}
      aria-label={t("common.langLabel")}
      title={t("common.langLabel")}
      className={
        stacked
          ? "w-full justify-center"
          : "h-9 gap-1.5 rounded-full border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-white hover:text-slate-900"
      }
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {lang === "en" ? "EN" : "SW"}
    </Button>
  );
}

export default function Header() {
  const { t } = useLanguage();

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="HAKI AI home"
            className="flex items-center gap-2"
          >
            <Image
              src="/logo-icon.jpg"
              alt="HAKI AI logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-cover shadow-sm ring-1 ring-black/5"
            />
            <span className="text-gradient-brand text-2xl font-bold tracking-tight">
              HAKI AI
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle />
            <AuthActions />
          </div>

          <div className="flex md:hidden">
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
                    <SheetClose asChild key={link.href}>
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
      <div aria-hidden="true" className="h-16" />
    </>
  );
}
