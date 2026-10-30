import { getSiteSettings, getCurrentAuthUser } from "@/lib/data";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us & Factory Inquiries | N.K. Ornaments Mathura",
  description:
    "Direct contact with our Mathura German Silver payal manufacturing facility. Inquire with proprietor Sachin Chaudhary about wholesale rates, custom designs, and catalogues.",
};

export default async function ContactPage() {
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getCurrentAuthUser(),
  ]);

  const phone = settings.contact_phone || "+91 98377 55055";
  const email = settings.contact_email || "sachin@nkornaments.com";
  const address = settings.contact_address || "Near Hathras Kachodi Wala, Chowk Bazar, Mathura - 281001, Uttar Pradesh";
  const whatsapp = settings.contact_whatsapp || "+919837755055";
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, "");
  const cleanPhone = phone.replace(/[^0-9+]/g, "");

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header settings={settings} session={session} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 sm:space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="badge badge-category">
            Factory Trade Desk • Mathura
          </span>
          <h1
            className="text-3xl sm:text-5xl font-normal text-text-primary tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Connect With Our Manufacturing Hub
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed prose-body mx-auto">
            Direct communication for retail jewellers, bullion traders, and regional distributors across India seeking wholesale German Silver payal.
          </p>
        </div>

        {/* 2-Column: Details on left, Form on right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Action Buttons */}
            <div className="card-pearl bg-bg-alt p-6 space-y-4">
              <h2
                className="text-lg font-medium text-text-primary uppercase tracking-wider text-xs"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Instant Trade Connect
              </h2>

              {cleanWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    "Hello Sachin ji (N.K. Ornaments), I am inquiring about wholesale German Silver payal catalogues."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full py-3 text-xs"
                >
                  <span>💬 Chat on WhatsApp Direct</span>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="btn btn-outline w-full py-3 text-xs"
                >
                  <span>📞 Call: {phone}</span>
                </a>
              )}
            </div>

            {/* Address & Operational Info */}
            <div className="card-pearl bg-bg-primary p-6 space-y-4 text-xs">
              <h2
                className="text-sm font-semibold text-text-primary uppercase tracking-wider text-[11px]"
              >
                Workshop &amp; Showroom
              </h2>

              <div className="space-y-3 text-text-secondary">
                <div className="flex items-start gap-3">
                  <span className="text-accent text-base shrink-0">👤</span>
                  <div className="leading-relaxed">
                    <strong className="text-text-primary block font-medium">Proprietor:</strong>
                    <span className="text-accent font-semibold text-sm">Sachin Chaudhary</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-accent text-base shrink-0">📍</span>
                  <div className="leading-relaxed">
                    <strong className="text-text-primary block font-medium">Factory / Showroom Address:</strong>
                    <span>{address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-accent text-base shrink-0">🕒</span>
                  <div className="leading-relaxed">
                    <strong className="text-text-primary block font-medium">Working Hours:</strong>
                    <span>Monday &ndash; Saturday: 10:00 AM &ndash; 8:00 PM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-accent text-base shrink-0">✉️</span>
                  <div className="leading-relaxed">
                    <strong className="text-text-primary block font-medium">Trade Desk Email:</strong>
                    <a href={`mailto:${email}`} className="text-accent hover:underline">
                      {email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Wholesale Policy Notice */}
            <div className="p-4 rounded-xl bg-bg-alt border border-divider text-xs space-y-1.5 text-text-secondary">
              <span className="font-semibold text-text-primary block">
                Wholesale Trade Supply Policy:
              </span>
              <p className="leading-relaxed">
                We supply exclusively to registered retail jewelers and trade buyers. We do not retail individual single pieces to end consumers.
              </p>
            </div>
          </div>

          {/* Right Form (3 cols) */}
          <div className="lg:col-span-3 card-pearl bg-surface-card p-6 sm:p-10 space-y-6">
            <div className="space-y-1.5 border-b border-divider pb-4">
              <h2
                className="text-2xl font-normal text-text-primary"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Send a Trade Inquiry
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Fill in your jewelry business details below. Our factory dispatch desk in Mathura will respond promptly with current wholesale rates and sample terms.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
