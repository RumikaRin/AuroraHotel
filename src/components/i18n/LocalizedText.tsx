"use client";

import { useLanguage } from "./LanguageProvider";

interface LocalizedTextProps {
  id: string;
  values?: Record<string, string | number>;
}

export function LocalizedText({ id, values }: LocalizedTextProps) {
  const { t } = useLanguage();
  return <>{t(id, values)}</>;
}
