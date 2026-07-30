import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

// Default metadata for every route. Pages only set their own `title`
// (plain string, no suffix): the template below appends "| Starter".
// The OG image is intentionally not set here; add `openGraph.images`
// together with `metadataBase` once the project has a real image
// (see the OG section in README.md).
export const metadata: Metadata = {
  title: {
    default: "Starter",
    template: "%s | Starter",
  },
  description: "Hardened Next.js starter (auth, rate limit, atomic checkout)",
  openGraph: {
    siteName: "Starter",
    type: "website",
    title: "Starter",
    description: "Hardened Next.js starter (auth, rate limit, atomic checkout)",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <header className="border-b border-neutral-200 bg-white">
          {/* min-h-11 (44px) on every link keeps tap targets at or above the
              44x44px floor enforced by e2e/layout-safety.spec.ts */}
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-1">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-semibold"
            >
              Starter
            </Link>
            <div className="flex flex-wrap text-sm">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center px-2 hover:underline"
              >
                Trang chủ
              </Link>
              <Link
                href="/profile"
                className="inline-flex min-h-11 items-center px-2 hover:underline"
              >
                Tài khoản
              </Link>
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center px-2 hover:underline"
              >
                Quản trị
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center px-2 hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
