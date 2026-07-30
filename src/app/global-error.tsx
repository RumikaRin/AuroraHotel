"use client";

// Last-resort boundary: it replaces the root layout when the layout itself
// throws, so it must render its own <html> and <body> and import the global
// stylesheet (the root layout's import is gone at this point). Keep it
// minimal and dependency-free; anything fancy here can crash too.
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <main className="mx-auto max-w-sm px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Đã xảy ra lỗi nghiêm trọng</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-neutral-500">
              Mã tra cứu lỗi: <code>{error.digest}</code>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex min-h-11 items-center rounded bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Thử lại
          </button>
        </main>
      </body>
    </html>
  );
}
