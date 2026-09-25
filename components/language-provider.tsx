"use client";

import * as React from "react";
import {
  translations,
  type Language,
  type TranslationKey,
} from "@/lib/i18n";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = React.createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => undefined,
  t: (key) => translations.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>("en");

  React.useEffect(() => {
    const saved = window.localStorage.getItem("haki-lang");
    if (saved === "sw" || saved === "en") setLangState(saved);
  }, []);

  const setLang = React.useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem("haki-lang", next);
    document.documentElement.lang = next;
  }, []);

  const t = React.useCallback(
    (key: TranslationKey) => translations[lang][key] ?? translations.en[key],
    [lang]
  );

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}
