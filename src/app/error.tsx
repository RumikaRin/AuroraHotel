"use client";

// Route-segment error boundary. Must be a client component (Next.js
// requirement) because it receives the reset() callback. It renders inside
// the root layout, so header/nav stay visible and Tailwind styles apply
// (no inline styles: production CSP forbids them, see
// src/lib/security-headers.ts).
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Local debugging aid. In production, forward this to your error
    // tracker instead (see the "Error tracking" section in README.md).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-sm py-12 text-center">
      <h1 className="text-2xl font-semibold">Đã xảy ra lỗi</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Có sự cố tạm thời khi xử lý yêu cầu. Bạn có thể thử lại; nếu lỗi lặp
        lại, vui lòng quay về trang chủ.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-neutral-500">
          Mã tra cứu lỗi: <code>{error.digest}</code>
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center rounded bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-100"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
