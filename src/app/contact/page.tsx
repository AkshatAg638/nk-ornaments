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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header settings={settings} session={session} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-semibold tracking-widest text-amber-400 uppercase">
            Factory Trade Desk &bull; Mathura
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Connect With Our Manufacturing Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Direct communication for retail jewellers, bullion dealers, and regional distributors across India.
          </p>
        </div>

        {/* 2-Column: Details on left, Form on right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Action Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Instant Trade Connect
              </h2>

              {cleanWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    "Hello Sachin ji (N.K. Ornaments), I am inquiring about wholesale German Silver payal catalogues."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
                >
                  <span>💬 Chat on WhatsApp Direct</span>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
                >
                  <span>📞 Call: {phone}</span>
                </a>
              )}
            </div>

            {/* Address & Operational Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Workshop &amp; Showroom
              </h2>

              <div className="space-y-3 text-slate-400">
                <p className="flex items-start gap-3">
                  <span className="text-amber-400 text-base shrink-0">👤</span>
                  <span className="leading-relaxed">
                    <strong className="text-white block font-medium">Proprietor:</strong>
                    <span className="text-amber-300 font-semibold text-sm">Sachin Chaudhary</span>
                  </span>
                </p>

                <p className="flex items-start gap-3">
                  <span className="text-amber-400 text-base shrink-0">📍</span>
                  <span className="leading-relaxed">
                    <strong className="text-white block font-medium">Factory / Showroom Address:</strong>
                    {address}
                  </span>
                </p>

                <p className="flex items-start gap-3">
                  <span className="text-amber-400 text-base shrink-0">⏰</span>
                  <span className="leading-relaxed">
                    <strong className="text-white block font-medium">Business Hours:</strong>
                    Monday – Saturday: 10:00 AM – 8:30 PM IST<br />
                    (Chowk Bazar, Mathura)
                  </span>
                </p>

                <p className="flex items-start gap-3">
                  <span className="text-amber-400 text-base shrink-0">✉️</span>
                  <span className="leading-relaxed">
                    <strong className="text-white block font-medium">Trade Inquiries:</strong>
                    {email}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Form (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-1">
              Send Wholesale Inquiry
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Fill in your requirement below. We reply with sample photos, weight breakdowns, and commercial terms.
            </p>
            <ContactForm />
          </div>
        </div>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
