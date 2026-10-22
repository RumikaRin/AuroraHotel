"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function EditorialHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<"dusk" | "dawn">("dusk");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Check document or local storage for initial theme
    const savedTheme = (localStorage.getItem("aurora-theme") as "dusk" | "dawn") || "dusk";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSetTheme = (newTheme: "dusk" | "dawn") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("aurora-theme", newTheme);
  };

  return (
    <header className={`site-nav ${isScrolled ? "scrolled" : ""}`} id="main-nav">
      <Link href="/" className="brand-mark">
        <span className="brand-title">A U R O R A</span>
        <span className="brand-caption">Đà Nẵng · Resort & Reserve</span>
      </Link>

      <nav aria-label="Điều hướng chính" className="hidden lg:block">
        <ul className="nav-links">
          <li>
            <a href="#manifesto">
              <span className="nav-index">01</span>
              <span className="nav-label">Triết lý</span>
            </a>
          </li>
          <li>
            <a href="#masterplan">
              <span className="nav-index">02</span>
              <span className="nav-label">Phân khu</span>
            </a>
          </li>
          <li>
            <a href="#suites">
              <span className="nav-index">03</span>
              <span className="nav-label">Suites & Villas</span>
            </a>
          </li>
          <li>
            <a href="#gastronomy">
              <span className="nav-index">04</span>
              <span className="nav-label">Ẩm thực</span>
            </a>
          </li>
          <li>
            <a href="#wellness">
              <span className="nav-index">05</span>
              <span className="nav-label">Trị liệu</span>
            </a>
          </li>
          <li>
            <a href="#packages">
              <span className="nav-index">06</span>
              <span className="nav-label">Đặc quyền</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="nav-actions">
        <div className="theme-switch-segmented" role="group" aria-label="Chuyển chế độ giao diện">
          <button
            type="button"
            className={`theme-switch-btn ${theme === "dusk" ? "active" : ""}`}
            onClick={() => handleSetTheme("dusk")}
            title="Chế độ Tối (Dạ khúc)"
            aria-pressed={theme === "dusk"}
          >
            <span className="theme-icon" aria-hidden="true">☾</span>
            <span>Tối</span>
          </button>
          <button
            type="button"
            className={`theme-switch-btn ${theme === "dawn" ? "active" : ""}`}
            onClick={() => handleSetTheme("dawn")}
            title="Chế độ Sáng (Bình minh)"
            aria-pressed={theme === "dawn"}
          >
            <span className="theme-icon" aria-hidden="true">☼</span>
            <span>Sáng</span>
          </button>
        </div>

        <a href="#suites" className="btn-reserve-nav">
          Đặt kỳ nghỉ
        </a>
      </div>
    </header>
  );
}
