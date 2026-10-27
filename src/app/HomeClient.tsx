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

  const businessName = settings.business_name || "N.K. Ornaments";
  const tagline = settings.tagline || "Master Manufacturers & Wholesalers of Fine Silver Payal Since 1995";
  const priceVisibility = settings.price_visibility || "customers_only";
  const canViewPrice =
    priceVisibility === "everyone" ||
    session.role === "customer" ||
    session.role === "admin";

  const activeAnklets = anklets.filter((a) => a.is_active);
  const featuredAnklets = activeAnklets.slice(0, 8);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-slate-800 p-8 sm:p-14 lg:p-16">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Direct Mathura Manufacturer &bull; German Silver Wholesale Only
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Handcrafted German Silver Payal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              For India's Finest Jewelers.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {tagline || "Master Manufacturers & Wholesalers of Fine German Silver Payal Since 1995"}. Precision casting, melodic chime ghungroos, antique oxidised and high-polish finishes. Supplying retailers across India with direct manufacturer pricing and transparent weight breakdowns.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/varieties"
              className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-xl shadow-amber-500/20 active:scale-95 inline-flex items-center gap-2"
            >
              <span>Browse Wholesale Catalog</span>
              <span>&rarr;</span>
            </Link>

            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 transition border border-slate-700/80 active:scale-95"
            >
              Request Trade Quotation
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <span className="text-2xl font-black text-white">30+</span>
              <span className="text-[11px] text-slate-400 block">Years Heritage</span>
            </div>
            <div>
              <span className="text-2xl font-black text-amber-400">German Silver</span>
              <span className="text-[11px] text-slate-400 block">Premium Alloy</span>
            </div>
            <div>
              <span className="text-2xl font-black text-white">20K+</span>
              <span className="text-[11px] text-slate-400 block">Monthly Pairs</span>
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-400">Exact Weight</span>
              <span className="text-[11px] text-slate-400 block">Gram Accuracy</span>
            </div>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute right-0 top-0 -mt-16 -mr-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-20 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 2. Wholesale Benefits Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition"
          >
            <span className="text-2xl block mb-2">{benefit.icon}</span>
            <h2 className="text-sm font-bold text-white mb-1">{benefit.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </section>

      {/* 3. Categories Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold tracking-widest text-amber-400 uppercase">
              Curated Lines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Anklet Varieties
            </h2>
          </div>
          <Link
            href="/varieties"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            View all categories ({categories.length}) &rarr;
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
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
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition group flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-500/5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
                        NK
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                        {count} designs
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {cat.description || "Fine silver wholesale payal with authentic craftsmanship."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span>Explore Line</span>
                    <span className="group-hover:translate-x-1 transition">&rarr;</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Latest Additions / Featured Anklets Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold tracking-widest text-amber-400 uppercase">
              Fresh Castings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Latest Wholesale Arrivals
            </h2>
          </div>
          <Link
            href="/varieties"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            Explore Complete Range &rarr;
          </Link>
        </div>

        {featuredAnklets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
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
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Photo Container */}
                    <div className="relative aspect-square overflow-hidden bg-slate-950">
                      <img
                        src={primaryImg}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Stock Pill */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md shadow-md ${
                            isOut
                              ? "bg-rose-500/90 text-white"
                              : isLow
                              ? "bg-amber-500/90 text-slate-950 font-bold"
                              : "bg-emerald-600/90 text-white"
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
                          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 font-mono text-[10px] backdrop-blur-sm border border-slate-800">
                            {item.weight}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{item.category?.name}</span>
                        <span className="text-amber-400">{item.sku}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || "Authentic Agra silver payal."}
                      </p>
                    </div>
                  </div>

                  {/* Footer Strip */}
                  <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Wholesale Rate</span>
                      {canViewPrice ? (
                        <span className="text-base font-bold text-amber-400">
                          {formatINR(item.wholesale_price)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-400/90">
                          🔒 Login to View
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition">
                      Quick View &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Direct Wholesale Callout CTA */}
      <section className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block">
          Become a Trade Partner &bull; Mathura
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Ready to Stock Premium German Silver Payal in Your Showroom?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Contact proprietor Sachin Chaudhary or register with your business details to unlock wholesale trade lists, access seasonal catalogues, and place bulk production orders.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            Send Trade Inquiry
          </Link>
          <Link
            href="/varieties"
            className="px-6 py-3 rounded-2xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
          >
            Explore All Varieties
          </Link>
        </div>
      </section>

      {/* Anklet Pop-up Card Modal */}
      <AnkletModal
        anklet={selectedAnklet}
        onClose={() => setSelectedAnklet(null)}
        session={session}
        priceVisibility={priceVisibility}
      />
    </div>
  );
}
