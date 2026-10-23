import Link from "next/link";
import { LoginForm } from "./login-form";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export const dynamic = "force-dynamic";

export const metadata = { title: "Đăng nhập | Aurora Hotel & Resort" };

export default function LoginPage() {
  return (
    <div className="login-page">
      <a href="#login-content" className="skip-link">
        <LocalizedText id="accessibility.skipToContent" />
      </a>
      <header className="login-header">
        <Link href="/" aria-label="Aurora Hotel">AURORA HOTEL</Link>
        <div className="login-header-actions">
          <span><LocalizedText id="login.guestAccess" /></span>
          <LanguageToggle className="login-language-toggle" />
        </div>
      </header>
      <main id="login-content" className="login-main">
        <div className="login-panel">
          <p className="login-eyebrow"><LocalizedText id="login.eyebrow" /></p>
          <h1><LocalizedText id="login.titleOne" /><br /><em><LocalizedText id="login.titleTwo" /></em></h1>
          <p className="login-lede"><LocalizedText id="login.description" /></p>
          <LoginForm />
          <Link href="/my-bookings" className="login-lookup-link"><LocalizedText id="login.lookup" /></Link>
        </div>
      </main>
    </div>
  );
}
