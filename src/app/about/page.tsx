import { getSiteSettings, getCurrentAuthUser } from "@/lib/data";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Our Factory & Craftsmanship | N.K. Ornaments Mathura",
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
    "Established in 1995 at Chowk Bazar, Mathura, N.K. Ornaments (Proprietor: Sachin Chaudhary) is a premier manufacturer and trade supplier of German Silver payal (anklets) catering exclusively to retail jewelers and regional distributors across India.";

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Header settings={settings} session={session} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="badge badge-category">
            Manufacturing Heritage • Mathura, India
          </span>
          <h1
            className="text-4xl sm:text-6xl font-normal text-text-primary tracking-tight leading-[1.12]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Three Decades of Melodic German Silver Craftsmanship
          </h1>
          <p className="text-base text-text-secondary leading-relaxed prose-body mx-auto">
            From generational filigree carving to precision automated chain assembly, we engineer German Silver anklets that delight retailers and wearers alike.
          </p>
        </div>

        {/* Story Section */}
        <section className="card-pearl bg-bg-alt p-8 sm:p-14 space-y-6">
          <h2
            className="text-2xl sm:text-4xl font-normal text-text-primary tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Our Journey &amp; Factory Heritage
          </h2>
          <div className="text-sm sm:text-base text-text-secondary leading-relaxed space-y-4 prose-body">
            <p>{aboutText}</p>
            <p>
              Mathura has long stood as a celebrated epicenter of north Indian bridal and traditional payal craftsmanship. At {businessName}, we specialize exclusively in premium German Silver alloys, combining intricate filigree hand-carving with high-tensile casting, ultrasonic finishing, and durable antique oxidised and high-polish silver-tone plating.
            </p>
            <p>
              Under proprietor Sachin Chaudhary, our workshop operates on the foundational principles of honest alloy disclosures, strict gram-weight precision, and direct factory wholesale pricing for retail trade partners.
            </p>
          </div>
        </section>

        {/* Pillars / Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-pearl bg-bg-primary p-7 space-y-3">
            <span className="w-10 h-10 rounded-xl bg-accent text-bg-primary flex items-center justify-center font-bold text-base">
              ⚖️
            </span>
            <h3
              className="text-xl font-medium text-text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Calibrated Weight Precision
            </h3>
            <p className="text-caption text-text-secondary leading-relaxed">
              Every anklet pair is calibrated for exact gram weight specifications, ensuring consistency across repeat wholesale orders and predictable retail margins.
            </p>
          </div>

          <div className="card-pearl bg-bg-primary p-7 space-y-3">
            <span className="w-10 h-10 rounded-xl bg-accent text-bg-primary flex items-center justify-center font-bold text-base">
              🔔
            </span>
            <h3
              className="text-xl font-medium text-text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Acoustic Chime Precision
            </h3>
            <p className="text-caption text-text-secondary leading-relaxed">
              Our traditional ghungroo bells are hollow-punched with internal shot to generate a crisp, resonant melodic chime cherished in Indian celebrations.
            </p>
          </div>

          <div className="card-pearl bg-bg-primary p-7 space-y-3">
            <span className="w-10 h-10 rounded-xl bg-accent text-bg-primary flex items-center justify-center font-bold text-base">
              🤝
            </span>
            <h3
              className="text-xl font-medium text-text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Direct Trade Ethics
            </h3>
            <p className="text-caption text-text-secondary leading-relaxed">
              No middleman markups. Buy directly from the Mathura workshop with clear per-pair weight pricing and transparent factory trade rates.
            </p>
          </div>
        </section>

        {/* Factory Capacity & Logistics */}
        <section className="card-pearl bg-bg-alt p-8 sm:p-14 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="badge badge-category">
              Production Capabilities
            </span>
            <h2
              className="text-2xl sm:text-4xl font-normal text-text-primary tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Scale Your Retail Inventory With Confidence
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed prose-body">
              With scalable casting operations across 200+ distinct master moulds, our Mathura workshop fulfills wedding season rush orders and repeat showroom batches without dispatch delays.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/varieties"
              className="btn btn-primary"
            >
              Browse Complete Catalog
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline"
            >
              Contact Factory Desk
            </Link>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}
