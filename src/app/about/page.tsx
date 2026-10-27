import { getSiteSettings, getCurrentAuthUser } from "@/lib/data";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | Master German Silver Payal Manufacturers Mathura | N.K. Ornaments",
  description:
    "Learn about our 30-year German Silver jewelry manufacturing heritage in Chowk Bazar, Mathura, exact weight calibration, and wholesale supply commitments.",
};

export default async function AboutPage() {
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getCurrentAuthUser(),
  ]);

  const businessName = settings.business_name || "N.K. Ornaments";
  const aboutText =
    settings.about_text ||
    "Established in 1995 at Chowk Bazar, Mathura, N.K. Ornaments (Proprietor: Sachin Chaudhary) is a premier manufacturer and trade supplier of German Silver payal (anklets) catering exclusively to retail jewelers and regional distributors across the country.";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header settings={settings} session={session} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[11px] font-semibold tracking-widest text-amber-400 uppercase">
            Manufacturing Legacy &bull; Mathura, India
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Three Decades of Melodic German Silver Craftsmanship
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            From generational filigree carving to precision automated chain assembly, we engineer German Silver anklets that delight retailers and wearers alike.
          </p>
        </div>

        {/* Story Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Our Journey &amp; Factory Heritage
          </h2>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
            <p>{aboutText}</p>
            <p>
              Agra has stood as the historic epicenter of Indian payal craftsmanship for generations. At {businessName}, we specialize in premium German Silver alloys, combining intricate filigree hand-carving with high-tensile casting, ultrasonic finishing, and durable antique oxidised plating.
            </p>
          </div>
        </section>

        {/* Pillars / Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-base">
              ⚖️
            </span>
            <h3 className="text-base font-bold text-white">Calibrated Weight Precision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every anklet pair is calibrated for exact gram weight specifications, ensuring consistency across repeat wholesale orders and predictable retail margins.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-base">
              🔔
            </span>
            <h3 className="text-base font-bold text-white">Acoustic Chime Precision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our traditional ghungroo bells are hollow-punched with internal shot to generate a crisp, resonant melodic chime cherished in Indian celebrations.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-base">
              🤝
            </span>
            <h3 className="text-base font-bold text-white">Direct Trade Ethics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No middleman markups. Buy directly from the Agra manufacturer with clear per-pair weight pricing and transparent factory trade rates.
            </p>
          </div>
        </section>

        {/* Factory Capacity & Logistics */}
        <section className="bg-gradient-to-r from-slate-900 to-amber-950/20 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-[10px] font-semibold tracking-widest text-amber-400 uppercase">
              Production Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Scale Your Retail Inventory With Confidence
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              With a monthly output capacity exceeding 20,000 pairs across 200+ distinct master moulds, we fulfill seasonal wedding rush orders without delivery delays.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/varieties"
              className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 transition"
            >
              Explore Wholesale Catalog
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-2xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
            >
              Contact Our Factory
            </Link>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
