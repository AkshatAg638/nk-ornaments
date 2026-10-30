"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AnkletWithImages,
  Category,
  AuthSession,
  formatINR,
  isLowStock,
  isOutOfStock,
} from "@/lib/types";
import AnkletModal from "@/components/public/AnkletModal";

interface HomeClientProps {
  categories: Category[];
  anklets: AnkletWithImages[];
  settings: Record<string, string>;
  session: AuthSession;
}

export default function HomeClient({
  categories,
  anklets,
  settings,
  session,
}: HomeClientProps) {
  const [selectedAnklet, setSelectedAnklet] = useState<AnkletWithImages | null>(null);

  const tagline = settings.tagline || "Master German Silver Payal Manufacturers Since 1995";
  const priceVisibility = settings.price_visibility || "customers_only";
  const canViewPrice =
    priceVisibility === "everyone" ||
    session.role === "customer" ||
    session.role === "admin";

  const activeAnklets = anklets.filter((a) => a.is_active);
  const featuredAnklets = activeAnklets.slice(0, 8);

  // Settings-driven trust row: only show if configured in site settings
  const rawTrustItems =
    settings.trust_items ||
    [
      settings.trust_item_1,
      settings.trust_item_2,
      settings.trust_item_3,
      settings.trust_item_4,
    ]
      .filter(Boolean)
      .join("|");

  const trustItems = rawTrustItems
    ? rawTrustItems
        .split(/[|,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Settings-driven stats row: ONLY show if admin has explicitly filled these values
  const statsList = [
    { value: settings.stat_1_value || settings.stat_years, label: settings.stat_1_label || "Years Heritage" },
    { value: settings.stat_2_value || settings.stat_designs, label: settings.stat_2_label || "Active Moulds" },
    { value: settings.stat_3_value || settings.stat_capacity, label: settings.stat_3_label || "Monthly Pairs" },
    { value: settings.stat_4_value || settings.stat_accuracy, label: settings.stat_4_label || "Weight Accuracy" },
  ].filter((s) => Boolean(s.value));

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────
          1. HERO SECTION (Pearl Background)
          ───────────────────────────────────────────── */}
      <section className="bg-bg-primary border-b border-divider pt-20 sm:pt-28 lg:pt-36 pb-16 sm:pb-24 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Headline */}
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-text-primary leading-[1.08]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Handcrafted German Silver Payal{" "}
              <span className="text-accent italic">
                For India&apos;s Finest Jewelers.
              </span>
            </h1>

            {/* Subhead / Prose */}
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed prose-body">
              {tagline}. Precision casting, melodic chime ghungroos, antique oxidised and high-polish silver-tone finishes. Supplying retailers across India with direct manufacturer pricing and transparent weight breakdowns.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/varieties"
                className="btn btn-primary btn-lg inline-flex items-center gap-2 shadow-xs"
              >
                <span>Browse Wholesale Catalog</span>
                <span>&rarr;</span>
              </Link>

              <Link
                href="/contact"
                className="btn btn-outline btn-lg"
              >
                Request Trade Quotation
              </Link>
            </div>

            {/* Settings-driven Stats: Only rendered if configured in settings */}
            {statsList.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-divider">
                {statsList.map((st, idx) => (
                  <div key={idx}>
                    <span
                      className="text-2xl sm:text-3xl font-semibold text-text-primary block"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {st.value}
                    </span>
                    <span className="text-caption text-text-secondary block mt-0.5">
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          TRUST ROW (Settings-driven, hidden when empty)
          ───────────────────────────────────────────── */}
      {trustItems.length > 0 && (
        <section className="bg-bg-alt border-b border-divider py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 text-xs font-medium text-text-secondary">
              {trustItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────
          2. WHOLESALE BENEFITS (Alternate Background)
          ───────────────────────────────────────────── */}
      <section className="bg-bg-alt border-b border-divider py-14 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge badge-category">
              Why Retailers Partner With Us
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Direct Trade Advantages
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏭",
                title: "Direct Factory Pricing",
                desc: "Zero distributor commissions. Buy directly from Mathura's core German Silver workshop at trade rates.",
              },
              {
                icon: "⚖️",
                title: "Guaranteed Weight Accuracy",
                desc: "Every pair is calibrated to exact gram specifications for reliable retail margins and billing.",
              },
              {
                icon: "📦",
                title: "Flexible Order Quantities",
                desc: "No rigid minimum order quantity requirements. Order what you need to stock fast-moving collections.",
              },
              {
                icon: "🚚",
                title: "Insured Pan-India Logistics",
                desc: "Secure door-to-door transit via verified courier & transport with insured dispatch across India.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="card-pearl bg-bg-primary p-6 space-y-2.5"
              >
                <span className="text-2xl block">{benefit.icon}</span>
                <h3 className="text-sm font-semibold text-text-primary">
                  {benefit.title}
                </h3>
                <p className="text-caption text-text-secondary leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          3. CATEGORIES SHOWCASE (Pearl Background)
          ───────────────────────────────────────────── */}
      <section className="bg-bg-primary border-b border-divider py-14 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="badge badge-category">
                Curated Collections
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Anklet Varieties
              </h2>
            </div>
            <Link
              href="/varieties"
              className="btn btn-outline btn-sm self-start sm:self-auto"
            >
              View all collections ({categories.length}) &rarr;
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="card-pearl bg-bg-alt p-10 text-center text-text-secondary text-xs">
              Our collection is being updated. Please check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const count = activeAnklets.filter((a) => a.category_id === cat.id).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/varieties?category=${cat.slug}`}
                    className="card-pearl bg-surface-card p-6 flex flex-col justify-between group no-underline"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="w-9 h-9 rounded-xl bg-accent text-bg-primary flex items-center justify-center font-bold text-xs">
                          NK
                        </span>
                        <span className="badge badge-category">
                          {count} designs
                        </span>
                      </div>

                      <h3
                        className="text-xl font-medium text-text-primary group-hover:text-accent transition"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {cat.name}
                      </h3>

                      <p className="text-caption text-text-secondary line-clamp-2 leading-relaxed">
                        {cat.description || "Fine German silver wholesale payal with authentic craftsmanship."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-divider mt-6 flex items-center justify-between text-xs font-medium text-accent">
                      <span>Explore Collection</span>
                      <span className="group-hover:translate-x-1 transition">&rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          4. LATEST WHOLESALE ARRIVALS (Alternate Background)
          ───────────────────────────────────────────── */}
      <section className="bg-bg-alt border-b border-divider py-14 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="badge badge-category">
                Fresh Castings
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Latest Wholesale Arrivals
              </h2>
            </div>
            <Link
              href="/varieties"
              className="btn btn-outline btn-sm self-start sm:self-auto"
            >
              Explore Complete Catalog &rarr;
            </Link>
          </div>

          {featuredAnklets.length === 0 ? (
            <div className="card-pearl bg-bg-primary p-10 text-center text-text-secondary text-xs">
              Our collection is being updated. Please check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAnklets.map((item) => {
                const primaryImg =
                  item.images.find((img) => img.is_primary)?.public_url ||
                  item.images[0]?.public_url ||
                  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80";

                const isOut = isOutOfStock(item);
                const isLow = isLowStock(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAnklet(item)}
                    className="card-pearl bg-bg-primary flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Photo Container */}
                      <div className="relative aspect-square overflow-hidden bg-bg-alt border-b border-divider">
                        <img
                          src={primaryImg}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />

                        {/* Stock Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`badge ${
                              isOut
                                ? "badge-out-of-stock"
                                : isLow
                                ? "badge-low-stock"
                                : "badge-in-stock"
                            }`}
                          >
                            {isOut
                              ? "Out of Stock"
                              : isLow
                              ? "Low Stock"
                              : "In Stock"}
                          </span>
                        </div>

                        {item.weight && (
                          <div className="absolute bottom-3 right-3">
                            <span className="px-2 py-0.5 rounded-full bg-bg-primary/90 text-text-primary font-mono text-[11px] font-medium border border-divider shadow-xs backdrop-blur-xs">
                              {item.weight}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-text-secondary font-mono">
                          <span>{item.category?.name}</span>
                          <span className="text-accent">{item.sku}</span>
                        </div>

                        <h3
                          className="text-lg font-medium text-text-primary group-hover:text-accent transition line-clamp-1"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {item.name}
                        </h3>

                        <p className="text-caption text-text-secondary line-clamp-2 leading-relaxed">
                          {item.description || "Premium German Silver wholesale payal with authentic Mathura craftsmanship."}
                        </p>
                      </div>
                    </div>

                    {/* Footer Strip */}
                    <div className="p-5 pt-0 border-t border-divider mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-text-secondary uppercase tracking-wider block">
                          Wholesale Rate
                        </span>
                        {canViewPrice ? (
                          <span className="text-sm font-semibold text-text-primary">
                            {formatINR(item.wholesale_price)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-accent">
                            🔒 Login to View
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-medium text-accent group-hover:translate-x-1 transition">
                        Quick View &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          5. DIRECT WHOLESALE CTA (Pearl Background)
          ───────────────────────────────────────────── */}
      <section className="bg-bg-primary py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-pearl bg-bg-alt p-8 sm:p-14 text-center space-y-4">
            <span className="badge badge-category">
              Become a Trade Partner • Mathura
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-normal text-text-primary tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ready to Stock Premium German Silver Payal in Your Showroom?
            </h2>
            <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed prose-body">
              Contact proprietor Sachin Chaudhary or register with your business details to unlock wholesale trade lists, access seasonal catalogues, and place bulk production orders.
            </p>

            <div className="pt-3 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="btn btn-primary"
              >
                Send Trade Inquiry
              </Link>
              <Link
                href="/varieties"
                className="btn btn-outline"
              >
                Explore All Varieties
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Anklet Pop-up Modal */}
      <AnkletModal
        anklet={selectedAnklet}
        onClose={() => setSelectedAnklet(null)}
        session={session}
        priceVisibility={priceVisibility}
      />
    </div>
  );
}
