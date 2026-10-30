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
    <div className="space-y-10">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="badge badge-category">
          Wholesale German Silver Collection
        </span>
        <h1
          className="text-3xl sm:text-5xl font-normal text-text-primary tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Explore Our Payal Varieties
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed prose-body">
          From heavy bridal filigree payal to daily-wear lightweight German Silver chains, browse directly from Mathura&apos;s master manufacturers with factory trade rates.
        </p>
      </div>

      {/* Category Tabs (Horizontal Scrollable Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-divider">
        <button
          onClick={() => setActiveCategory("all")}
          className={`whitespace-nowrap transition ${
            activeCategory === "all"
              ? "btn btn-primary btn-sm"
              : "btn btn-outline btn-sm"
          }`}
        >
          All Collections ({anklets.filter((a) => a.is_active).length})
        </button>

        {categories.map((c) => {
          const count = anklets.filter(
            (a) => a.category_id === c.id && a.is_active
          ).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`whitespace-nowrap transition ${
                activeCategory === c.slug
                  ? "btn btn-primary btn-sm"
                  : "btn btn-outline btn-sm"
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-alt border border-divider p-3.5 rounded-2xl">
        {/* Search */}
        <div className="w-full sm:max-w-xs relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search designs or SKU..."
            className="input-pearl pl-9 text-xs py-2"
          />
          <svg
            className="w-4 h-4 text-text-secondary absolute left-3 top-2.5 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary select-none font-medium">
            <input
              type="checkbox"
              checked={stockOnly}
              onChange={(e) => setStockOnly(e.target.checked)}
              className="rounded accent-accent h-4 w-4 border-divider"
            />
            <span>In-Stock Only</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-pearl w-auto text-xs py-2 px-3 font-medium"
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
        <div className="card-pearl bg-bg-alt p-12 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-bg-primary border border-divider flex items-center justify-center text-text-secondary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-text-primary">
            No Designs Found
          </h2>
          <p className="text-xs text-text-secondary">
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

                    {/* Weight tag */}
                    {item.weight && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded-full bg-bg-primary/90 text-text-primary font-mono text-[11px] font-medium border border-divider shadow-xs backdrop-blur-xs">
                          ⚖️ {item.weight}
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

                    <h2
                      className="text-lg font-medium text-text-primary group-hover:text-accent transition line-clamp-1"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.name}
                    </h2>

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

                  <span className="text-xs font-medium text-accent group-hover:translate-x-1 transition flex items-center gap-1">
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
