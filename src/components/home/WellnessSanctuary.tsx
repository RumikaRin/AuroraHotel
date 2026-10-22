import Image from "next/image";

export function WellnessSanctuary() {
  const TREATMENTS = [
    {
      title: "Massage Đá Nóng & Tinh Dầu Tràm Gió",
      time: "90 Phút · Liệu trình thư giãn sâu",
      desc: "Sử dụng đá núi lửa hấp nóng kết hợp tinh dầu tràm gió Sơn Trà giúp giải tỏa căng thẳng cơ bắp và phục hồi năng lượng tinh thần.",
      img: "/images/aurora/deluxe-king.jpg",
    },
    {
      title: "Yoga Đón Bình Minh Trên Vách Đá",
      time: "06:00 Sáng · Lớp học buổi sáng",
      desc: "Thực hành hít thở pranayama và chuỗi động tác chào mặt trời giữa không gian mở lộng gió trên đỉnh vách đá hướng ra vịnh biển.",
      img: "/images/hero-hotel.png",
    },
    {
      title: "Thủy Liệu Pháp Thảo Mộc Rừng",
      time: "60 Phút · Tắm bồn gỗ tuyết tùng",
      desc: "Ngâm mình trong bồn gỗ thơm ngát lá thảo dược rừng thu hái thủ công, giúp thải độc toàn diện và lưu thông khí huyết.",
      img: "/images/epilogue-resort.png",
    },
  ];

  return (
    <section className="py-32 px-6 sm:px-12 md:px-16 bg-[var(--bg-surface)] transition-colors duration-500" id="wellness">
      <div className="max-w-[1380px] mx-auto">
        <div className="section-eyebrow">LIỆU TRÌNH PHỤC HỒI THÂN TÂM</div>
        <h2 className="section-heading-editorial font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4">
          Spa Mộc giữa Rừng Nguyên Sinh
        </h2>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-xl mb-12">
          Các gian trị liệu biệt lập được thiết kế tôn trọng địa hình tự nhiên, mang lại sự yên bình tuyệt đối cho hành trình chăm sóc sức khỏe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TREATMENTS.map((item, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-surface-card)] border border-[var(--brass-hairline)] rounded-lg overflow-hidden shadow-xl hover:border-[var(--accent-brass)] transition-colors"
            >
              <div className="relative h-56 w-full">
                <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <div className="text-[10px] tracking-wider uppercase text-[var(--accent-brass)] mb-2">{item.time}</div>
                <h3 className="font-serif-luxury text-2xl text-[var(--text-primary)] mb-3">{item.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">{item.desc}</p>
                <a
                  href="#suites"
                  className="text-xs uppercase tracking-wider text-[var(--accent-brass)] hover:underline inline-block font-medium"
                >
                  Tư vấn liệu trình ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
