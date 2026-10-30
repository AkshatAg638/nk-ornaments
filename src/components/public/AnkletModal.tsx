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
  }, [anklet, searchParams]);

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
    }, 450);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-anklet-title"
      onClick={handleDismiss}
      className="fixed inset-0 z-50 bg-[#16181B]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
    >
      {/* Modal Container (click inside does not close) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-elevated border border-divider rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-xl relative my-auto max-h-[92vh] overflow-y-auto text-text-primary transition-all duration-300"
      >
        {/* Close Button (X) */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-bg-primary hover:bg-bg-alt text-text-secondary hover:text-text-primary flex items-center justify-center transition border border-divider hover:border-accent"
          aria-label="Close dialog"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Primary Display */}
            <div className="relative rounded-xl overflow-hidden border border-divider bg-bg-alt aspect-square flex items-center justify-center group">
              <img
                src={activeImage.public_url}
                alt={anklet.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />

              {/* Status Badge */}
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
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border shrink-0 transition ${
                      selectedImageIndex === idx
                        ? "border-accent ring-1 ring-accent"
                        : "border-divider opacity-70 hover:opacity-100"
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
                  <span className="badge badge-category">
                    {anklet.category.name}
                  </span>
                )}
                <span className="text-caption font-mono text-text-secondary">
                  SKU: {anklet.sku}
                </span>
              </div>

              {/* Title */}
              <h1
                id="modal-anklet-title"
                className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight leading-snug"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {anklet.name}
              </h1>

              {/* Description */}
              {anklet.description && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {anklet.description}
                </p>
              )}

              {/* Specifications Table */}
              <div className="bg-bg-alt/70 rounded-xl p-4 border border-divider space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-divider pb-2">
                  <span className="text-text-secondary">Material:</span>
                  <span className="font-medium text-text-primary">{anklet.material || "German Silver"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-divider pb-2">
                  <span className="text-text-secondary">Weight (per pair):</span>
                  <span className="font-semibold text-accent">
                    {anklet.weight || "Standard Weight"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-divider pb-2">
                  <span className="text-text-secondary">Standard Length:</span>
                  <span className="font-medium text-text-primary">{anklet.length || "26 cm"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Finish / Polish:</span>
                  <span className="font-medium text-text-primary">{anklet.colour || "German Silver Polish"}</span>
                </div>
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-xl bg-bg-alt border border-divider">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-caption text-text-secondary uppercase tracking-widest block font-medium">
                      Direct Wholesale Rate
                    </span>
                    {canViewPrice ? (
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold text-text-primary">
                          {formatINR(anklet.wholesale_price)}
                        </span>
                        <span className="text-xs text-text-secondary">/ pair</span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-1.5 text-accent font-medium text-sm">
                        <span>🔒 Wholesale Price Locked</span>
                      </div>
                    )}
                  </div>

                  {!canViewPrice && (
                    <span className="text-[11px] text-text-secondary">
                      Registered trade buyers only
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions based on user authentication */}
            <div className="pt-4 border-t border-divider">
              {orderSuccess && (
                <div className="mb-3 p-3 bg-status-in-stock-bg border border-status-in-stock/25 rounded-xl text-xs text-status-in-stock-text text-center font-medium">
                  ✓ Added {orderQuantity} pairs of {anklet.name} to order list!
                </div>
              )}

              {isOut ? (
                <div className="text-center py-2.5 text-xs font-medium text-status-out-of-stock-text bg-status-out-of-stock-bg border border-status-out-of-stock/25 rounded-xl">
                  Currently Out of Stock &bull; Inquire with factory for next casting batch
                </div>
              ) : session.role === "customer" || session.role === "admin" ? (
                /* Customer / Admin Order Controls */
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-text-secondary font-medium">Quantity (Pairs):</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOrderQuantity((q) =>
                            Math.max(1, q - 1)
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-bg-primary hover:bg-bg-alt text-text-primary font-bold text-sm flex items-center justify-center transition border border-divider"
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
                        className="w-16 px-2 py-1.5 text-center font-semibold text-text-primary bg-bg-primary border border-divider rounded-lg text-xs focus:border-accent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOrderQuantity((q) =>
                            Math.min(anklet.stock_quantity, q + 1)
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-bg-primary hover:bg-bg-alt text-text-primary font-bold text-sm flex items-center justify-center transition border border-divider"
                      >
                        +
                      </button>
                      <span className="text-xs text-text-secondary">pairs</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToOrder}
                    className="btn btn-primary w-full py-3.5 text-xs tracking-wide"
                  >
                    Add {orderQuantity} Pairs to Wholesale Order &bull; {formatINR(anklet.wholesale_price * orderQuantity)}
                  </button>

                  <a
                    href={`https://wa.me/919837755055?text=${encodeURIComponent(
                      `Hello Sachin ji, I am inquiring about *${anklet.name}* (SKU: ${anklet.sku}${
                        anklet.weight ? `, Weight: ${anklet.weight}` : ""
                      }) on N.K. Ornaments. Could you please share the current wholesale rate and dispatch availability?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-medium bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/30 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                    </svg>
                    <span>Inquire on WhatsApp</span>
                  </a>
                </div>
              ) : (
                /* Visitor: Can add to order draft or register */
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleAddToOrder}
                    className="btn btn-primary w-full py-3.5 text-xs tracking-wide"
                  >
                    Add {orderQuantity} Pairs to Wholesale Order Draft
                  </button>

                  <a
                    href={`https://wa.me/919837755055?text=${encodeURIComponent(
                      `Hello Sachin ji, I am inquiring about *${anklet.name}* (SKU: ${anklet.sku}${
                        anklet.weight ? `, Weight: ${anklet.weight}` : ""
                      }) on N.K. Ornaments. Could you please share the current wholesale rate and dispatch availability?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-medium bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/30 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                    </svg>
                    <span>Inquire on WhatsApp</span>
                  </a>

                  <div className="flex items-center justify-between text-[11px] text-text-secondary px-1 pt-1">
                    <span>New trade jeweler?</span>
                    <Link
                      href="/register"
                      className="text-accent hover:underline font-semibold"
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
