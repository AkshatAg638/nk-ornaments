"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  AnkletWithImages,
  Category,
  AuthSession,
  formatINR,
  isLowStock,
  isOutOfStock,
} from "@/lib/types";
import AnkletModal from "@/components/public/AnkletModal";

interface VarietiesClientProps {
  categories: Category[];
  anklets: AnkletWithImages[];
  session: AuthSession;
  settings: Record<string, string>;
}

export default function VarietiesClient({
  categories,
  anklets,
  session,
  settings,
}: VarietiesClientProps) {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlAnkletId = searchParams.get("anklet");

  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || "all");
  const [search, setSearch] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high" | "weight">("newest");
  const [selectedAnklet, setSelectedAnklet] = useState<AnkletWithImages | null>(null);

  // Check URL query param ?anklet=ID on load or change
  useEffect(() => {
    if (urlAnkletId) {
      const match = anklets.find((a) => a.id === urlAnkletId);
      if (match) setSelectedAnklet(match);
    }
  }, [urlAnkletId, anklets]);

  // Sync category param if URL changes
  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  const priceVisibility = settings.price_visibility || "customers_only";
  const canViewPrice =
    priceVisibility === "everyone" ||
    session.role === "customer" ||
    session.role === "admin";

  // Filter & Sort
  const filtered = anklets
    .filter((a) => {
      // Active check
      if (!a.is_active) return false;

      // Category check
      if (activeCategory !== "all") {
        if (a.category?.slug !== activeCategory) return false;
      }

      // Search check
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          a.name.toLowerCase().includes(q) ||
          a.sku.toLowerCase().includes(q) ||
          (a.material && a.material.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // In-stock only
      if (stockOnly && isOutOfStock(a)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.wholesale_price - b.wholesale_price;
      if (sortBy === "price_high") return b.wholesale_price - a.wholesale_price;
      if (sortBy === "weight") {
        const wA = parseFloat(a.weight || "0") || 0;
        const wB = parseFloat(b.weight || "0") || 0;
        return wB - wA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="space-y-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-semibold tracking-widest text-amber-400 uppercase">
          Wholesale Silver Anklet Collection
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Our Payal Varieties
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          From heavy bridal filigree payal to daily-wear lightweight sterling chains, browse directly from Agra's master manufacturers.
        </p>
      </div>

      {/* Category Tabs (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeCategory === "all"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
              : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
          }`}
        >
          All Varieties ({anklets.filter((a) => a.is_active).length})
        </button>

        {categories.map((c) => {
          const count = anklets.filter(
            (a) => a.category_id === c.id && a.is_active
          ).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === c.slug
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                  : "text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        {/* Search */}
        <div className="w-full sm:max-w-xs relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search designs or SKU..."
            className="w-full px-3.5 py-2 pl-9 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <svg
            className="w-4 h-4 text-slate-500 absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        {/* Options */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4 bg-slate-950 border-slate-700"
            />
            <span>In-Stock Only</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="weight">Weight: Heaviest First</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-white">No Anklets Found</h2>
          <p className="text-xs text-slate-400">
            Our collection is being updated. Please adjust your search or check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => {
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

                    {/* Weight tag */}
                    {item.weight && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950/90 text-emerald-300 font-mono text-[11px] font-semibold backdrop-blur-sm border border-emerald-500/30 shadow">
                          ⚖️ {item.weight}
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

                    <h2 className="text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-1">
                      {item.name}
                    </h2>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description || "Premium German Silver wholesale payal with authentic Agra craftsmanship."}
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
                      <span className="text-xs font-semibold text-amber-400/90 flex items-center gap-1">
                        <span>🔒 Login to View</span>
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition flex items-center gap-1">
                    <span>Details</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Anklet Pop-up Card (Modal) */}
      <AnkletModal
        anklet={selectedAnklet}
        onClose={() => setSelectedAnklet(null)}
        session={session}
        priceVisibility={priceVisibility}
      />
    </div>
  );
}
