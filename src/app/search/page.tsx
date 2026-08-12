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
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--night)",
        color: "white",
        fontFamily: "var(--font-interface)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ font: '500 24px "Cormorant Garamond", serif', color: "var(--gold)" }}>
          {t("search.loadingAvailability")}
        </p>
        <small style={{ color: "#a0aaa3", fontSize: 11 }}>Aurora Hotel Da Nang</small>
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
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--night)",
        color: "white",
      }}
    >
      {t("search.loading")}
    </div>
  );
}
