import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-aurora-ivory">
      {/* Minimal header for auth pages */}
      <header className="bg-aurora-midnight text-aurora-ivory py-4 px-4 sm:px-6">
        <div className="max-w-content mx-auto">
          <Link href="/" className="font-display text-xl tracking-wider min-h-[44px] inline-flex items-center">
            AURORA HOTEL
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl font-semibold text-aurora-midnight">
            Đăng nhập
          </h1>
          <p className="mt-2 text-sm text-aurora-forest">
            Tài khoản seed: <code className="text-xs bg-aurora-mist/30 px-1 py-0.5 rounded">admin@example.com / admin123</code> hoặc{" "}
            <code className="text-xs bg-aurora-mist/30 px-1 py-0.5 rounded">customer@example.com / customer123</code>
          </p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
