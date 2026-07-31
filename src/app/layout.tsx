import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aurora Hotel — Where Every Stay Becomes a Memory",
    template: "%s | Aurora Hotel",
  },
  description:
    "Contemporary luxury oceanfront hotel in Da Nang, Vietnam. Book directly for the best rates on premium rooms, suites, dining, and spa experiences.",
  openGraph: {
    siteName: "Aurora Hotel",
    type: "website",
    title: "Aurora Hotel — Where Every Stay Becomes a Memory",
    description:
      "Contemporary luxury oceanfront hotel in Da Nang, Vietnam. Book directly for the best rates.",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className="min-h-screen bg-aurora-ivory text-aurora-midnight antialiased font-interface"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
