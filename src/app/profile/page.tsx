import Link from "next/link";
import { auth } from "@/auth";
import { requireUser } from "@/server/auth/guards";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Tài khoản | Aurora Hotel & Resort" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser(await auth());

  return (
    <div className="profile-page">
      <a className="skip-link" href="#main-content">Đi đến nội dung chính</a>
      <Header />
      <main id="main-content" className="wrap profile-main">
        <div className="profile-intro"><p className="profile-eyebrow">Aurora · signed-in guest</p><h1>Chào mừng<br /><em>trở lại.</em></h1><p>Thông tin dưới đây được đọc từ phiên đăng nhập hiện tại.</p></div>
        <section className="profile-card" aria-labelledby="profile-title"><div className="profile-card-heading"><div><p className="profile-eyebrow">Guest profile</p><h2 id="profile-title">Thông tin tài khoản</h2></div><span className="profile-role">{user.role}</span></div><dl><div><dt>Email</dt><dd>{user.email ?? "(không có)"}</dd></div><div><dt>Tên</dt><dd>{user.name ?? "(không có)"}</dd></div><div><dt>Vai trò</dt><dd>{user.role}</dd></div></dl><div className="profile-links"><Link href="/rooms">Đặt một kỳ nghỉ ↗</Link><Link href="/my-bookings">Tra cứu booking ↗</Link></div></section>
      </main>
      <Footer />
      <style>{`
        .profile-page { min-height: 100vh; background: var(--linen); color: var(--espresso); }
        .profile-main { padding-block: calc(var(--header-height) + 56px) 120px; }
        .profile-intro { display: grid; grid-template-columns: 1fr .62fr; gap: 45px; align-items: end; padding-bottom: 52px; }
        .profile-eyebrow { margin: 0 0 14px; color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; }
        .profile-intro h1 { margin: 0; font: 500 clamp(58px, 8vw, 112px)/.82 var(--font-display); letter-spacing: -.055em; }
        .profile-intro h1 em { color: var(--muted-terracotta); font-style: italic; font-weight: 400; }
        .profile-intro > p:last-child { max-width: 360px; margin: 0 0 4px; color: var(--taupe); font-size: 13px; line-height: 1.8; }
        .profile-card { max-width: 860px; padding: 34px; border: 1px solid rgba(181,154,107,.38); background: var(--warm-ivory); }
        .profile-card-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; padding-bottom: 20px; border-bottom: 1px solid var(--line); }
        .profile-card-heading .profile-eyebrow { margin-bottom: 8px; }
        .profile-card h2 { margin: 0; font: 500 44px/.9 var(--font-display); }
        .profile-role { color: var(--muted-terracotta); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .profile-card dl { display: grid; gap: 0; margin: 0; }
        .profile-card dl div { display: flex; justify-content: space-between; gap: 20px; padding-block: 18px; border-bottom: 1px solid var(--line); font-size: 12px; }
        .profile-card dt { color: var(--taupe); }
        .profile-card dd { margin: 0; font-weight: 600; }
        .profile-links { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 26px; }
        .profile-links a { min-height: 44px; display: inline-flex; align-items: center; padding: 0 14px; border-radius: 5px; background: var(--espresso); color: var(--warm-ivory); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
        .profile-links a:hover { background: var(--walnut); }
        @media (max-width: 800px) { .profile-intro { grid-template-columns: 1fr; gap: 18px; } }
        @media (max-width: 560px) { .profile-main { padding-block: calc(var(--header-height) + 30px) 80px; } .profile-intro h1 { font-size: 70px; } .profile-card { padding: 22px 18px; } .profile-card-heading { align-items: start; flex-direction: column; } .profile-card h2 { font-size: 40px; } .profile-card dl div { align-items: start; flex-direction: column; gap: 5px; } .profile-links a { width: 100%; justify-content: center; } }
      `}</style>
    </div>
  );
}
