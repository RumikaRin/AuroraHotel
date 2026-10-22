"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export function DirectBookingBenefits() {
  const { t } = useLanguage();
  const privileges = [
    { title: t("home.benefitBestRate"), desc: "Đảm bảo mức giá ưu đãi nhất" },
    { title: t("home.benefitBreakfast"), desc: "Điểm tâm sáng tiêu chuẩn hữu cơ" },
    { title: t("home.benefitCancellation"), desc: "Linh hoạt thay đổi lịch trình" },
    { title: t("home.benefitEarlyCheckIn"), desc: "Tùy thuộc tình trạng phòng" },
  ];

  return (
    <section aria-label={t("home.directRate")} data-header-tone="light" className="privileges-strip">
      <div className="wrap privileges-container">
        <div className="privileges-lead">
          <span className="privileges-eyebrow">ĐẶC QUYỀN TRỰC TIẾP</span>
          <span className="privileges-dot">/</span>
        </div>

        <div className="privileges-grid">
          {privileges.map((item, idx) => (
            <div key={idx} className="privilege-unit">
              <span className="privilege-title">{item.title}</span>
              <span className="privilege-sub">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .privileges-strip {
          background: var(--warm-ivory);
          border-top: 1px solid rgba(181, 154, 107, 0.2);
          border-bottom: 1px solid rgba(181, 154, 107, 0.2);
          padding-block: 22px;
        }
        .privileges-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }
        .privileges-lead {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .privileges-eyebrow {
          font-family: var(--font-interface);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--antique-brass);
        }
        .privileges-dot {
          color: rgba(181, 154, 107, 0.4);
          font-size: 13px;
        }
        .privileges-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
          flex: 1;
        }
        .privilege-unit {
          display: flex;
          flex-direction: column;
          gap: 3px;
          border-left: 1px solid rgba(181, 154, 107, 0.25);
          padding-left: 16px;
        }
        .privilege-title {
          font-family: var(--font-interface);
          font-size: 12px;
          font-weight: 600;
          color: var(--espresso);
          letter-spacing: 0.02em;
        }
        .privilege-sub {
          font-family: var(--font-interface);
          font-size: 11px;
          color: var(--taupe);
          line-height: 1.4;
        }
        @media (max-width: 1024px) {
          .privileges-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .privileges-grid {
            grid-template-columns: repeat(2, 1fr);
            width: 100%;
            gap: 16px;
          }
        }
        @media (max-width: 640px) {
          .privileges-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}
