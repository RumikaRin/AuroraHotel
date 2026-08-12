import Link from "next/link";
import { LoginForm } from "./login-form";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export const metadata = { title: "Đăng nhập | Aurora Hotel & Resort" };

export default function LoginPage() {
  return (
    <div className="login-page">
      <header className="login-header"><Link href="/" aria-label="Aurora Hotel">AURORA HOTEL</Link><div className="login-header-actions"><span><LocalizedText id="login.guestAccess" /></span><LanguageToggle className="login-language-toggle" /></div></header>
      <main className="login-main"><div className="login-panel"><p className="login-eyebrow"><LocalizedText id="login.eyebrow" /></p><h1><LocalizedText id="login.titleOne" /><br /><em><LocalizedText id="login.titleTwo" /></em></h1><p className="login-lede"><LocalizedText id="login.description" /></p><LoginForm /><Link href="/my-bookings" className="login-lookup-link"><LocalizedText id="login.lookup" /></Link></div></main>
      <style>{`
        .login-page { min-height: 100vh; background: var(--linen); color: var(--espresso); }
        .login-header { height: var(--header-height); display: flex; align-items: center; justify-content: space-between; padding-inline: max(24px, calc((100vw - var(--container)) / 2)); background: var(--espresso); color: var(--warm-ivory); }
        .login-header a { display: inline-flex; min-height: 44px; align-items: center; font: 600 24px/1 var(--font-display); letter-spacing: .1em; }
        .login-header-actions { display: flex; align-items: center; gap: 12px; }
        .login-header-actions > span { color: var(--antique-brass); font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
        .login-language-toggle { min-width: 44px; min-height: 44px; border: 1px solid rgba(243,238,231,.42); border-radius: var(--radius-control); background: transparent; color: var(--warm-ivory); font-size: 9px; font-weight: 700; }
        .login-main { display: grid; place-items: center; min-height: calc(100vh - var(--header-height)); padding: 60px 20px; }
        .login-panel { width: min(520px, 100%); padding: clamp(28px, 6vw, 56px); border: 1px solid rgba(181,154,107,.38); background: var(--warm-ivory); }
        .login-eyebrow { margin: 0 0 14px; color: var(--walnut); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .login-panel h1 { margin: 0; font: 500 clamp(54px, 8vw, 86px)/.82 var(--font-display); letter-spacing: -.055em; }
        .login-panel h1 em { color: var(--muted-terracotta); font-style: italic; font-weight: 400; }
        .login-lede { margin: 24px 0 0; color: var(--walnut); font-size: 13px; line-height: 1.8; }
        .login-form { display: grid; gap: 15px; margin-top: 28px; }
        .login-form label { display: grid; gap: 8px; color: var(--walnut); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .login-form input { min-height: 48px; border: 1px solid #d9cfc3; border-radius: 5px; background: var(--linen); color: var(--espresso); padding: 0 12px; font-size: 12px; outline: none; }
        .login-form input:focus { border-color: var(--antique-brass); box-shadow: 0 0 0 3px rgba(181,154,107,.15); }
        .login-form button { min-height: 48px; border: 0; border-radius: 5px; background: var(--espresso); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .login-form button:hover:not(:disabled) { background: var(--walnut); }
        .login-form button:disabled { opacity: .5; }
        .login-form p { margin: 0; padding: 12px; border: 1px solid #c98270; background: rgba(167,109,85,.1); color: #8e4c3a; font-size: 11px; line-height: 1.5; }
        .login-lookup-link { display: inline-flex; min-height: 44px; align-items: center; margin-top: 18px; border-bottom: 1px solid var(--taupe); color: var(--walnut); font-size: 9px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
