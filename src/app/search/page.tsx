"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function SearchRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    const checkIn = searchParams.get("checkIn") || new Date().toISOString().slice(0, 10);
    const checkOut =
      searchParams.get("checkOut") ||
      new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10);
    const guests = searchParams.get("guests") || "2";

    router.replace(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  }, [router, searchParams]);

  return (
    <div className="search-loading-page">
      <div className="search-loading-box">
        <p className="search-loading-title">
          {t("search.loadingAvailability")}
        </p>
        <small className="search-loading-brand">Aurora Hotel Da Nang</small>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchRedirectContent />
    </Suspense>
  );
}

function SearchLoading() {
  const { t } = useLanguage();
  return (
    <div className="search-loading-page">
      {t("search.loading")}
    </div>
  );
}
