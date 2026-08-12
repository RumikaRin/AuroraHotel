"use client";

import { useLanguage } from "./LanguageProvider";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, t, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      className={className}
      onClick={toggleLanguage}
      aria-label={t(lang === "vi" ? "header.switchToEnglish" : "header.switchToVietnamese")}
    >
      {lang.toUpperCase()}
    </button>
  );
}
