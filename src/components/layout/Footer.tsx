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
    </footer>
  );
}
