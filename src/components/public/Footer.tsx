import Link from "next/link";
import { getCategories } from "@/lib/data";

interface FooterProps {
  settings: Record<string, string>;
}

export default async function Footer({ settings }: FooterProps) {
  const categories = await getCategories();
  const businessName = settings.business_name || "N.K. Ornaments";
  const tagline = settings.tagline || "Master German Silver Payal Manufacturers Since 1995";
  const phone = settings.contact_phone || "+91 98377 55055";
  const email = settings.contact_email || "sachin@nkornaments.com";
  const address = settings.contact_address || "Near Hathras Kachodi Wala, Chowk Bazar, Mathura (281001), UP";
  const whatsapp = settings.contact_whatsapp || "+919837755055";
  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, "");

  return (
    <footer className="bg-bg-alt border-t border-divider text-text-secondary text-sm">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent text-bg-primary flex items-center justify-center font-bold text-sm">
              NK
            </div>
            <div>
              <span
                className="font-semibold text-text-primary text-base block"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {businessName}
              </span>
              <span className="text-[10px] text-accent font-medium tracking-wider uppercase block">
                Mathura • India
              </span>
            </div>
          </div>
          <p className="text-text-secondary leading-relaxed text-xs">
            {tagline}. Specializing in wholesale supply of German Silver payal and traditional ornaments for retail jewelers across India.
          </p>
          <div className="flex items-center gap-3 pt-1">
            {settings.social_instagram && (
              <a
                href={settings.social_instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-bg-primary border border-divider hover:border-accent flex items-center justify-center text-text-secondary hover:text-text-primary transition"
                aria-label="Instagram"
              >
                IG
              </a>
            )}
            {settings.social_facebook && (
              <a
                href={settings.social_facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-bg-primary border border-divider hover:border-accent flex items-center justify-center text-text-secondary hover:text-text-primary transition"
                aria-label="Facebook"
              >
                FB
              </a>
            )}
            {settings.social_youtube && (
              <a
                href={settings.social_youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-bg-primary border border-divider hover:border-accent flex items-center justify-center text-text-secondary hover:text-text-primary transition"
                aria-label="YouTube"
              >
                YT
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary uppercase text-[11px] tracking-wider">
            Wholesale Portal
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="hover:text-accent transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/varieties" className="hover:text-accent transition">
                Varieties &amp; Catalog
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent transition">
                About Our Factory &amp; Craftsmanship
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent transition">
                Contact &amp; Trade Inquiries
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-accent transition">
                Staff / Admin Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories Showcase */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary uppercase text-[11px] tracking-wider">
            Anklet Lines
          </h3>
          <ul className="space-y-2 text-xs">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/varieties?category=${c.slug}`}
                  className="hover:text-accent transition truncate block"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Manufacturing Workshop Contact */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary uppercase text-[11px] tracking-wider">
            Manufacturing Hub
          </h3>
          <div className="space-y-2 text-text-secondary leading-relaxed text-xs">
            <p className="flex items-start gap-2">
              <span className="text-accent shrink-0">📍</span>
              <span>{address}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-accent shrink-0">📞</span>
              <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-text-primary transition">
                {phone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-accent shrink-0">✉️</span>
              <a href={`mailto:${email}`} className="hover:text-text-primary transition">
                {email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-status-in-stock shrink-0">💬</span>
              <span className="text-status-in-stock font-mono">{whatsapp}</span>
            </p>
            <p className="text-[11px] text-accent font-medium pt-1 border-t border-divider">
              Proprietor: Sachin Chaudhary
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-divider py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-text-secondary text-[11px]">
          <p>
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved. German Silver Jewellery Manufacturer.
          </p>
          <p className="text-accent-light">
            Premium German Silver &bull; Exact Weight Calibration &bull; Mathura Trade Supply
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Quick Connect Button */}
      {cleanWhatsApp && (
        <a
          href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
            "Hello N.K. Ornaments, I would like to inquire about wholesale German Silver payal designs and catalogue."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-13 h-13 rounded-full bg-status-in-stock hover:bg-status-in-stock/80 text-bg-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
          aria-label="Direct WhatsApp Trade Support"
          title="Direct WhatsApp with Factory"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
          </svg>
        </a>
      )}
    </footer>
  );
}
