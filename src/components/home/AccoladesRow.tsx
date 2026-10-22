export function AccoladesRow() {
  const AWARDS = [
    { seal: "★", title: "Condé Nast Traveler", sub: "Đề cử Khu nghỉ dưỡng biển cảnh quan hàng đầu Châu Á" },
    { seal: "✦", title: "Design Heritage", sub: "Giải thưởng Kiến trúc Sa thạch & Cảnh quan Tự nhiên" },
    { seal: "5★", title: "Hospitality Excellence", sub: "Chuẩn mực dịch vụ quản gia & Trải nghiệm cá nhân hóa" },
    { seal: "ECO", title: "EarthCheck Certified", sub: "Cam kết bảo tồn thiên nhiên & năng lượng sinh thái bền vững" },
  ];

  return (
    <section className="py-20 px-6 sm:px-12 md:px-16 bg-[var(--bg-canvas)] border-y border-[var(--brass-hairline)] transition-colors duration-500">
      <div className="max-w-[1380px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {AWARDS.map((award, idx) => (
          <div key={idx} className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-full border border-[var(--brass-hairline)] flex items-center justify-center text-[var(--accent-brass)] text-lg mb-4">
              {award.seal}
            </div>
            <div className="font-serif-luxury text-xl text-[var(--text-primary)] mb-2">{award.title}</div>
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[240px]">{award.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
