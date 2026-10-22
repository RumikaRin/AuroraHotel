import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocalizedText } from "@/components/i18n/LocalizedText";

export const metadata = { title: "Tài khoản khách | Aurora Hotel & Resort" };

export default function AccountPage() {
  return (
    <div className="account-page">
      <a className="skip-link" href="#main-content"><LocalizedText id="accessibility.skipToContent" /></a>
      <Header />
      <main id="main-content" className="wrap account-main">
        <div className="account-intro">
          <p className="account-eyebrow"><LocalizedText id="account.eyebrow" /></p>
          <h1><LocalizedText id="account.titleOne" /><br /><em><LocalizedText id="account.titleTwo" /></em></h1>
          <p><LocalizedText id="account.description" /></p>
        </div>
        <section className="account-actions">
          <article>
            <p className="account-eyebrow"><LocalizedText id="account.signedInEyebrow" /></p>
            <h2><LocalizedText id="account.signedInTitle" /></h2>
            <p><LocalizedText id="account.signedInDescription" /></p>
            <Link href="/profile"><LocalizedText id="account.openAccount" /> <span aria-hidden="true">→</span></Link>
          </article>
          <article>
            <p className="account-eyebrow"><LocalizedText id="account.lookupEyebrow" /></p>
            <h2><LocalizedText id="account.lookupTitle" /></h2>
            <p><LocalizedText id="account.lookupDescription" /></p>
            <Link href="/my-bookings"><LocalizedText id="account.openLookup" /> <span aria-hidden="true">→</span></Link>
          </article>
          <article>
            <p className="account-eyebrow"><LocalizedText id="account.findEyebrow" /></p>
            <h2><LocalizedText id="account.findTitle" /></h2>
            <p><LocalizedText id="account.findDescription" /></p>
            <Link href="/rooms"><LocalizedText id="account.viewRooms" /> <span aria-hidden="true">→</span></Link>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
