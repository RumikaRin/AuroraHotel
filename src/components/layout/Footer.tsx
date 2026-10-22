"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="sanctuary-footer" role="contentinfo">
      {/* ─── RESORT MASTHEAD & DISPATCH ─── */}
      <div className="wrap footer-masthead">
        <div className="footer-identity">
          <span className="footer-eyebrow">SANCTUARY & COASTAL RETREAT</span>
          <h2 className="footer-brand-title">AURORA HOTEL</h2>
          <p className="footer-coordinates">
            16°06&apos;32&quot;N · 108°18&apos;44&quot;E — Bán Đảo Sơn Trà, Đà Nẵng, Việt Nam
          </p>
          <p className="footer-narrative">
            {t("footer.description")}
          </p>
        </div>

        <div className="footer-dispatch-card">
          <span className="dispatch-badge">CONCIERGE &amp; RESERVATIONS</span>
          <div className="dispatch-contacts">
            <a href="tel:+842363999999" className="dispatch-link">
              <span className="dispatch-label">Hotline:</span>
              <strong className="dispatch-val">+84 236 399 9999</strong>
            </a>
            <a href="mailto:reservations@aurorahotel.com" className="dispatch-link">
              <span className="dispatch-label">Email:</span>
              <span className="dispatch-val">reservations@aurorahotel.com</span>
            </a>
            <div className="dispatch-address">
              <span className="dispatch-label">Địa chỉ:</span>
              <span className="dispatch-val">{t("footer.address")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── EDITORIAL NAVIGATION COLOPHON ─── */}
      <div className="wrap footer-nav-colophon">
        <div className="colophon-block">
          <h3 className="colophon-title">{t("footer.explore")}</h3>
          <ul className="colophon-list">
            <li><Link href="/rooms">{t("footer.rooms")}</Link></li>
            <li><Link href="/experiences">{t("footer.experiences")}</Link></li>
            <li><Link href="/offers">{t("footer.offers")}</Link></li>
          </ul>
        </div>

        <div className="colophon-block">
          <h3 className="colophon-title">{t("footer.support")}</h3>
          <ul className="colophon-list">
            <li><Link href="/my-bookings">{t("footer.manageBooking")}</Link></li>
            <li><Link href="/login">{t("footer.login")}</Link></li>
          </ul>
        </div>

        <div className="colophon-block">
          <h3 className="colophon-title">{t("footer.contact")}</h3>
          <ul className="colophon-list">
            <li><a href="tel:+842363999999">+84 236 399 9999</a></li>
            <li><a href="mailto:reservations@aurorahotel.com">reservations@aurorahotel.com</a></li>
          </ul>
        </div>
      </div>

      {/* ─── BOTTOM LEGAL & TIME ─── */}
      <div className="wrap footer-bottom">
        <span className="footer-copyright">
          © {new Date().getFullYear()} Aurora Hotel &amp; Resort Sanctuary. All rights reserved.
        </span>
        <div className="footer-legal-links">
          <Link href="/privacy" className="footer-legal-item">{t("footer.privacy")}</Link>
          <span className="footer-sep">·</span>
          <Link href="/terms" className="footer-legal-item">{t("footer.terms")}</Link>
        </div>
      </div>

      <style>{`
        .sanctuary-footer {
          background: var(--espresso);
          color: white;
          padding: 84px 0 36px;
          border-top: 1px solid rgba(181, 154, 107, 0.25);
          font-family: var(--font-interface);
        }
        .footer-masthead {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 64px;
          padding-bottom: 56px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .footer-identity {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-eyebrow {
          color: var(--antique-brass);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .footer-brand-title {
          font-family: var(--font-display);
          font-size: 34px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: white;
          margin: 0;
          line-height: 1;
        }
        .footer-coordinates {
          color: var(--antique-brass);
          font-size: 11px;
          font-family: var(--font-interface);
          letter-spacing: 0.06em;
          margin: 0;
          opacity: 0.9;
        }
        .footer-narrative {
          color: rgba(243, 238, 231, 0.72);
          font-size: 12px;
          line-height: 1.8;
          max-width: 460px;
          margin: 4px 0 0;
        }

        .footer-dispatch-card {
          background: rgba(25, 21, 18, 0.5);
          border: 1px solid rgba(181, 154, 107, 0.22);
          border-radius: var(--radius-surface, 16px);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dispatch-badge {
          color: var(--antique-brass);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .dispatch-contacts {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .dispatch-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-size: 12px;
          min-height: 32px;
          transition: color 0.2s ease;
        }
        .dispatch-link:hover {
          color: var(--antique-brass);
        }
        .dispatch-label {
          color: rgba(243, 238, 231, 0.6);
          font-size: 11px;
        }
        .dispatch-val {
          font-family: var(--font-interface);
          font-size: 12px;
        }
        .dispatch-address {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 11px;
          color: rgba(243, 238, 231, 0.68);
          line-height: 1.6;
        }

        .footer-nav-colophon {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
          padding: 44px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .colophon-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--antique-brass);
          margin-bottom: 16px;
        }
        .colophon-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .colophon-list a {
          color: rgba(243, 238, 231, 0.72);
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          transition: color 0.2s ease;
        }
        .colophon-list a:hover {
          color: white;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding-top: 32px;
          font-size: 11px;
          color: rgba(243, 238, 231, 0.55);
        }
        .footer-legal-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .footer-legal-item {
          color: rgba(243, 238, 231, 0.65);
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          transition: color 0.2s ease;
        }
        .footer-legal-item:hover {
          color: var(--antique-brass);
        }
        .footer-sep {
          opacity: 0.4;
        }

        @media (max-width: 960px) {
          .footer-masthead {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .footer-nav-colophon {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
          }
        }
        @media (max-width: 640px) {
          .footer-nav-colophon {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
      `}</style>
    </footer>
  );
}
