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
    </section>
  );
}
