import Image from "next/image";
import Link from "next/link";

interface ExperienceItem {
  id: string;
  tagline: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

const EXPERIENCES: ExperienceItem[] = [
  {
    id: "culinary",
    tagline: "Fine Dining & Seafood",
    title: "Ẩm Thực Thượng Hạng",
    description:
      "Hải sản tươi ngon kết hợp nghệ thuật ẩm thực đương đại do các đầu bếp ngôi sao chế biến.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Bàn tiệc ẩm thực cao cấp bên bờ biển",
  },
  {
    id: "wellness",
    tagline: "Holistic Wellness & Spa",
    title: "Tái Tạo Năng Lượng",
    description:
      "Liệu trình trị liệu độc quyền kết hợp thảo dược thiên nhiên Việt Nam và kỹ thuật bấm huyệt chuyên sâu.",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Không gian spa thư giãn với đá nóng thảo dược",
  },
  {
    id: "private-beach",
    tagline: "Private Oceanfront Oasis",
    title: "Bãi Biển & Bể Bơi Vô Cực",
    description:
      "Thả mình trong làn nước trong xanh riêng biệt, tận hưởng ly cocktail nhiệt đới và không gian yên bình.",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Bể bơi vô cực hướng biển với bầu trời hoàng hôn",
  },
  {
    id: "butler-service",
    tagline: "Tailored Butler Care",
    title: "Quản Gia Cá Nhân 24/7",
    description:
      "Đội ngũ quản gia chuyên nghiệp tận tâm phục vụ mọi nhu cầu cá nhân từ soạn hành lý đến bữa ăn riêng.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Quản gia phục vụ tại phòng suite sang trọng",
  },
];

export function SanctuaryExperiences() {
  return (
    <section aria-label="Trải nghiệm nghỉ dưỡng">
      <div className="sanctuary-section">
        <div className="wrap">
          <div className="sanctuary-header">
            <span className="sanctuary-eyebrow">Trải Nghiệm Nghỉ Dưỡng</span>
            <h2 className="sanctuary-title">
              Hệ Sinh Thái Dịch Vụ<br />
              <em>Đẳng Cấp.</em>
            </h2>
            <p className="sanctuary-subtitle">
              Mỗi khoảnh khắc tại Aurora Hotel đều được thiết kế mang lại sự
              thư thái tuyệt đối và giá trị cảm xúc riêng biệt.
            </p>
          </div>

          <div className="sanctuary-grid">
            {EXPERIENCES.map((item) => (
              <div key={item.id} className="sanctuary-card">
                <div className="sanctuary-card-image">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading="lazy"
                  />
                </div>
                <div className="sanctuary-card-body">
                  <span className="sanctuary-card-tagline">{item.tagline}</span>
                  <h3 className="sanctuary-card-title">{item.title}</h3>
                  <p className="sanctuary-card-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="sanctuary-cta">
            <Link href="/experiences" className="text-link" style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}>
              Khám phá tất cả trải nghiệm <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .sanctuary-section {
          background: var(--night-soft);
          padding-block: 120px;
          border-top: 1px solid rgba(197,164,109,0.15);
          border-bottom: 1px solid rgba(197,164,109,0.15);
        }
        .sanctuary-header {
          text-align: center;
          margin-bottom: 72px;
        }
        .sanctuary-eyebrow {
          display: block;
          color: var(--gold);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .sanctuary-title {
          font: 500 clamp(40px, 5vw, 72px)/0.9 "Cormorant Garamond", serif;
          color: white;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }
        .sanctuary-title em {
          font-style: italic;
          font-weight: 400;
          color: var(--gold);
        }
        .sanctuary-subtitle {
          max-width: 520px;
          margin: 0 auto;
          color: #a6b2ab;
          font-size: 13px;
          line-height: 1.8;
        }
        .sanctuary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .sanctuary-card {
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid rgba(197,164,109,0.15);
          background: var(--ink);
        }
        .sanctuary-card-image {
          position: relative;
          height: 320px;
          overflow: hidden;
        }
        .sanctuary-card-image img {
          transition: transform 0.6s cubic-bezier(.16,1,.3,1);
        }
        .sanctuary-card:hover .sanctuary-card-image img {
          transform: scale(1.03);
        }
        .sanctuary-card-body {
          padding: 28px 32px 32px;
        }
        .sanctuary-card-tagline {
          display: block;
          color: var(--gold);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .sanctuary-card-title {
          font: 500 26px/1.1 "Cormorant Garamond", serif;
          color: white;
          margin-bottom: 10px;
        }
        .sanctuary-card-desc {
          color: #a6b2ab;
          font-size: 12px;
          line-height: 1.75;
          margin: 0;
        }
        .sanctuary-cta {
          text-align: center;
          margin-top: 56px;
        }
        .sanctuary-cta .text-link:hover {
          color: var(--gold) !important;
          border-color: var(--gold) !important;
        }
        @media (max-width: 768px) {
          .sanctuary-section { padding-block: 80px; }
          .sanctuary-grid { grid-template-columns: 1fr; }
          .sanctuary-card-image { height: 240px; }
        }
      `}</style>
    </section>
  );
}
