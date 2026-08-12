"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTranslation, Language } from "@/domain/i18n";

const LANGUAGE_STORAGE_KEY = "aurora-public-language";

interface LanguageContextValue {
  lang: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("vi");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === "vi" || savedLanguage === "en") setLang(savedLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.locale = lang;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

  const setLanguage = useCallback((language: Language) => setLang(language), []);
  const toggleLanguage = useCallback(() => setLang((current) => current === "vi" ? "en" : "vi"), []);
  const t = useCallback((key: string, values?: Record<string, string | number>) => getTranslation(lang, key, values), [lang]);
  const value = useMemo(() => ({ lang, setLanguage, toggleLanguage, t }), [lang, setLanguage, toggleLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
