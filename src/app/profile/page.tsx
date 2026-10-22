import Link from "next/link";
import { auth } from "@/auth";
import { requireUser } from "@/server/auth/guards";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const metadata = { title: "Tài khoản | Aurora Hotel & Resort" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser(await auth());

  return (
    <div className="profile-page">
      <a className="skip-link" href="#main-content"><LocalizedText id="common.skipToContent" /></a>
      <Header />
      <main id="main-content" className="wrap profile-main">
        <div className="profile-intro"><p className="profile-eyebrow"><LocalizedText id="profile.eyebrow" /></p><h1><LocalizedText id="profile.titleOne" /><br /><em><LocalizedText id="profile.titleTwo" /></em></h1><p><LocalizedText id="profile.description" /></p></div>
        <section className="profile-card" aria-labelledby="profile-title"><div className="profile-card-heading"><div><p className="profile-eyebrow"><LocalizedText id="profile.cardEyebrow" /></p><h2 id="profile-title"><LocalizedText id="profile.cardTitle" /></h2></div><span className="profile-role">{user.role}</span></div><dl><div><dt><LocalizedText id="profile.email" /></dt><dd>{user.email ?? <LocalizedText id="profile.missing" />}</dd></div><div><dt><LocalizedText id="profile.name" /></dt><dd>{user.name ?? <LocalizedText id="profile.missing" />}</dd></div><div><dt><LocalizedText id="profile.role" /></dt><dd>{user.role}</dd></div></dl><div className="profile-links"><Link href="/rooms"><LocalizedText id="profile.book" /></Link><Link href="/my-bookings"><LocalizedText id="profile.lookup" /></Link></div></section>
      </main>
      <Footer />
    </div>
  );
}
