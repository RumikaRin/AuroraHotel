export function DirectBookingBenefits() {
  const benefits = [
    { symbol: "✦", label: "Cam kết giá tốt nhất" },
    { symbol: "✦", label: "Miễn phí bữa sáng" },
    { symbol: "✦", label: "Hủy phòng linh hoạt" },
    { symbol: "✦", label: "Ưu tiên nhận phòng sớm" },
  ];

  return (
    <section aria-label="Quyền lợi đặt phòng trực tiếp">
      <div className="benefits-strip">
        <div className="benefits-inner wrap">
          {benefits.map((b, i) => (
            <span key={i} className="benefit-item">
              <span className="benefit-symbol">{b.symbol}</span>
              <span className="benefit-label">{b.label}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .benefits-strip {
          background: var(--paper);
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding-block: 20px;
        }
        .benefits-inner {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
          flex-wrap: wrap;
        }
        .benefit-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding-inline: 28px;
          border-right: 1px solid var(--line);
        }
        .benefit-item:last-child {
          border-right: none;
        }
        .benefit-symbol {
          color: var(--gold);
          font-size: 10px;
        }
        .benefit-label {
          font-family: var(--font-interface);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
        }
        @media (max-width: 768px) {
          .benefits-inner {
            flex-direction: column;
            gap: 12px;
          }
          .benefit-item {
            border-right: none;
            padding-inline: 0;
          }
        }
      `}</style>
    </section>
  );
}
