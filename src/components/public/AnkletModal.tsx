"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  AnkletWithImages,
  AuthSession,
  formatINR,
  isLowStock,
  isOutOfStock,
} from "@/lib/types";

interface AnkletModalProps {
  anklet: AnkletWithImages | null;
  onClose: () => void;
  session: AuthSession;
  priceVisibility: string;
}

export default function AnkletModal({
  anklet,
  onClose,
  session,
  priceVisibility,
}: AnkletModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  // Active image index
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (anklet) {
      setSelectedImageIndex(0);
      setOrderQuantity(1);
      setOrderSuccess(false);

      // Deep linking: update URL without full page reload
      const currentParam = searchParams.get("anklet");
      if (currentParam !== anklet.id) {
        const url = new URL(window.location.href);
        url.searchParams.set("anklet", anklet.id);
        window.history.pushState({}, "", url.toString());
      }
    }
  }, [anklet]);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleDismiss();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleDismiss() {
    // Remove query param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("anklet");
    window.history.pushState({}, "", url.toString());
    onClose();
  }

  if (!anklet) return null;

  const isOut = isOutOfStock(anklet);
  const isLow = isLowStock(anklet);

  // Price visibility: show price if priceVisibility is "everyone" OR user is logged in as "customer" or "admin"
  const canViewPrice =
    priceVisibility === "everyone" ||
    session.role === "customer" ||
    session.role === "admin";

  const images =
    anklet.images && anklet.images.length > 0
      ? anklet.images
      : [
          {
            id: "fallback",
            anklet_id: anklet.id,
            storage_path: "",
            public_url:
              "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80",
            size_bytes: 140000,
            is_primary: true,
            sort_order: 0,
          },
        ];

  const activeImage = images[selectedImageIndex] || images[0];

  function handleAddToOrder() {
    if (!anklet) return;
    if (orderQuantity < 1) {
      alert("Please select at least 1 pair.");
      return;
    }
    if (anklet.stock_quantity && orderQuantity > anklet.stock_quantity) {
      alert(`Requested quantity exceeds available stock (${anklet.stock_quantity} pairs).`);
      return;
    }
    addItem(anklet, orderQuantity);
    setOrderSuccess(true);
    setTimeout(() => {
      onClose();
    }, 350);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-anklet-title"
      onClick={handleDismiss}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Modal Container (click inside does not close) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Primary Display */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square flex items-center justify-center group shadow-xl">
              <img
                src={activeImage.public_url}
                alt={anklet.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    isOut
                      ? "bg-rose-500 text-white"
                      : isLow
                      ? "bg-amber-500 text-slate-950"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {isOut
                    ? "Out of Stock"
                    : isLow
                    ? `Low Stock (${anklet.stock_quantity} pairs)`
                    : "In Stock"}
                </span>
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border shrink-0 transition ${
                      selectedImageIndex === idx
                        ? "border-amber-400 ring-2 ring-amber-400/30 scale-105"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.public_url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specs & Ordering */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & SKU */}
              <div className="flex items-center gap-2">
                {anklet.category && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {anklet.category.name}
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">
                  SKU: {anklet.sku}
                </span>
              </div>

              {/* Title */}
              <h1
                id="modal-anklet-title"
                className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug"
              >
                {anklet.name}
              </h1>

              {/* Description */}
              {anklet.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {anklet.description}
                </p>
              )}

              {/* Specifications Table */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400">Material:</span>
                  <span className="font-semibold text-amber-300">{anklet.material || "German Silver"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400">Weight (per pair):</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {anklet.weight || "Standard Weight"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400">Standard Length:</span>
                  <span className="font-medium text-white">{anklet.length || "26 cm"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Finish / Polish:</span>
                  <span className="font-medium text-white">{anklet.colour || "German Silver Polish"}</span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-slate-900 border border-amber-500/20">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                      Direct Wholesale Rate
                    </span>
                    {canViewPrice ? (
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold text-amber-400">
                          {formatINR(anklet.wholesale_price)}
                        </span>
                        <span className="text-xs text-slate-400">/ pair</span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-amber-400 font-medium text-sm">
                        <span>🔒 Wholesale Price Locked</span>
                      </div>
                    )}
                  </div>

                  {!canViewPrice && (
                    <span className="text-[10px] text-slate-400">
                      Registered trade buyers only
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions based on user authentication */}
            <div className="pt-4 border-t border-slate-800">
              {orderSuccess && (
                <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 text-center">
                  ✓ Added {orderQuantity} pairs of {anklet.name} to order list!
                </div>
              )}

              {isOut ? (
                <div className="text-center py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  Currently Out of Stock &bull; Inquire with factory for next casting batch
                </div>
              ) : session.role === "customer" || session.role === "admin" ? (
                /* Customer / Admin Order Controls */
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-300 font-medium">Quantity (Pairs):</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOrderQuantity((q) =>
                            Math.max(1, q - 1)
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={anklet.stock_quantity || 9999}
                        value={orderQuantity}
                        onChange={(e) =>
                          setOrderQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 px-2 py-1.5 text-center font-bold text-white bg-slate-950 border border-slate-700 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOrderQuantity((q) =>
                            Math.min(anklet.stock_quantity, q + 1)
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition"
                      >
                        +
                      </button>
                      <span className="text-xs text-slate-400">pairs</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToOrder}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-98"
                  >
                    Add {orderQuantity} Pairs to Wholesale Order &bull; {formatINR(anklet.wholesale_price * orderQuantity)}
                  </button>
                </div>
              ) : (
                /* Visitor: Can add to order draft or register */
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleAddToOrder}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-98"
                  >
                    Add {orderQuantity} Pairs to Wholesale Order Draft
                  </button>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                    <span>New trade jeweler?</span>
                    <Link
                      href="/register"
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Register for Wholesale &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
