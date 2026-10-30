"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { AuthSession } from "@/lib/types";

interface CartDrawerProps {
  session: AuthSession;
  whatsappNumber?: string;
}

export default function CartDrawer({
  session,
  whatsappNumber = "+919837755055",
}: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalAmount,
    isOpen,
    setIsOpen,
  } = useCart();

  const [note, setNote] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCity, setGuestCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderNumber: string;
    whatsappUrl: string;
    rawText: string;
    totalPairs: number;
    totalAmount: number;
    totalGrams: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");

  function parseWeightGrams(weightStr?: string | null): number {
    if (!weightStr) return 0;
    const match = weightStr.match(/(\d+(?:\.\d+)?)\s*g/i);
    return match ? parseFloat(match[1]) : 0;
  }

  async function handleCheckout() {
    setError(null);
    if (items.length === 0) return;

    if (session.role === "visitor" && (!guestName || !guestPhone)) {
      setError("Please provide your Business/Contact Name and Phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const orderItems = items.map((i) => ({
        anklet_id: i.anklet_id,
        quantity: i.quantity,
      }));

      const payload = {
        items: orderItems,
        note:
          session.role === "visitor"
            ? `Guest Lead: ${guestName} (${guestPhone}, ${guestCity || "N/A"})\n${note}`
            : note,
        customerId:
          session.role === "customer" && session.user ? session.user.id : undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit order");

      // Calculate total batch weight
      let totalGrams = 0;
      items.forEach((item) => {
        const itemGram = parseWeightGrams(item.weight);
        totalGrams += itemGram * item.quantity;
      });

      // Build structured WhatsApp message for instant supplier ping
      const orderNum = data.order_number || `ORD-${Date.now().toString().slice(-4)}`;
      let waText = `*N.K. ORNAMENTS (MATHURA) — WHOLESALE ORDER ESTIMATE*\n`;
      waText += `*Order Ref:* #${orderNum}\n`;
      waText += `*Buyer / Firm:* ${
        session.customerProfile?.business_name || guestName || "Wholesale Buyer"
      }\n`;
      if (session.customerProfile?.city || guestCity) {
        waText += `*City:* ${session.customerProfile?.city || guestCity}\n`;
      }
      waText += `*Contact:* ${
        session.customerProfile?.phone || guestPhone || "N/A"
      }\n`;
      waText += `--------------------------------\n`;
      waText += `*Order Breakdown:*\n`;

      items.forEach((item, idx) => {
        const weightTag = item.weight ? ` [${item.weight}]` : "";
        waText += `${idx + 1}. *${item.name}* (${item.sku})${weightTag}\n`;
        waText += `   ${item.quantity} pairs @ ₹${item.wholesale_price.toLocaleString(
          "en-IN"
        )} = ₹${(item.quantity * item.wholesale_price).toLocaleString("en-IN")}\n`;
      });

      waText += `--------------------------------\n`;
      waText += `*Total Quantity:* ${totalItems} pairs\n`;
      if (totalGrams > 0) {
        waText += `*Total Estimated Weight:* ~${totalGrams.toLocaleString("en-IN")}g (${(
          totalGrams / 1000
        ).toFixed(2)} kg)\n`;
      }
      waText += `*Total Estimated Value:* ₹${totalAmount.toLocaleString("en-IN")}\n`;
      if (note) waText += `*Buyer Note:* ${note}\n`;
      waText += `\n_Please confirm stock availability and dispatch schedule from Mathura workshop._`;

      const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
        waText
      )}`;

      setSubmittedOrder({
        orderNumber: orderNum,
        whatsappUrl,
        rawText: waText,
        totalPairs: totalItems,
        totalAmount,
        totalGrams,
      });
      clearCart();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopySummary() {
    if (!submittedOrder) return;
    navigator.clipboard.writeText(submittedOrder.rawText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-[#16181B]/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-elevated border-l border-divider shadow-2xl flex flex-col text-text-primary">
          {/* Header */}
          <div className="p-5 border-b border-divider flex items-center justify-between bg-bg-alt/60">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🛍️</span>
              <h2
                className="font-semibold text-text-primary text-base"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Wholesale Order Draft
              </h2>
              <span className="badge badge-category">
                {totalItems} pairs
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setSubmittedOrder(null);
              }}
              className="w-8 h-8 rounded-full bg-bg-primary border border-divider hover:border-accent text-text-secondary hover:text-text-primary flex items-center justify-center transition"
              aria-label="Close cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {submittedOrder ? (
              <div className="py-6 space-y-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#128C7E] text-2xl font-bold">
                  ✓
                </div>
                <div>
                  <h3
                    className="text-xl font-semibold text-text-primary"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Order Placed Successfully!
                  </h3>
                  <p className="text-xs text-accent font-mono mt-1 font-semibold">
                    Order Ref: #{submittedOrder.orderNumber}
                  </p>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Your order draft has been logged in our workshop system. Send the details directly to Sachin Chaudhary on WhatsApp to confirm immediate batch dispatch.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-bg-alt rounded-xl p-3.5 border border-divider text-left text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-text-secondary">
                    <span>Total Pairs:</span>
                    <span className="text-text-primary font-semibold font-sans">{submittedOrder.totalPairs} pairs</span>
                  </div>
                  {submittedOrder.totalGrams > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Est. Batch Weight:</span>
                      <span className="text-accent font-semibold font-sans">
                        ~{submittedOrder.totalGrams}g ({(submittedOrder.totalGrams / 1000).toFixed(2)} kg)
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary border-t border-divider pt-1.5">
                    <span>Estimated Amount:</span>
                    <span className="text-text-primary font-bold font-sans">₹{submittedOrder.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="pt-2 space-y-2.5">
                  <a
                    href={submittedOrder.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md transition-all duration-200"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                    </svg>
                    <span>Send Order to Sachin Chaudhary on WhatsApp</span>
                  </a>

                  <button
                    onClick={handleCopySummary}
                    className="w-full py-2.5 px-4 rounded-full text-xs font-medium border border-divider hover:border-accent text-text-secondary hover:text-text-primary bg-bg-primary transition flex items-center justify-center gap-1.5"
                  >
                    {copied ? (
                      <span className="text-[#128C7E] font-semibold">✓ Order Summary Copied!</span>
                    ) : (
                      <span>📋 Copy Order Summary</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSubmittedOrder(null);
                      setIsOpen(false);
                    }}
                    className="btn btn-outline w-full py-2.5 text-xs"
                  >
                    Back to Catalog
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-bg-alt flex items-center justify-center text-text-secondary text-xl">
                  🛒
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Your order draft is empty
                </h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                  Browse our wholesale collection and add anklets with your desired quantity to generate an order invoice.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn btn-outline text-xs"
                  >
                    Browse Varieties
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div
                      key={item.anklet_id}
                      className="p-3 bg-bg-primary border border-divider rounded-xl flex gap-3 items-center hover:border-accent/40 transition"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-bg-alt border border-divider flex-shrink-0">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">
                            ✨
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-text-primary truncate">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.anklet_id)}
                            className="text-text-secondary hover:text-status-out-of-stock text-xs ml-2 p-1"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                          SKU: {item.sku} {item.weight ? `• ${item.weight}` : ""}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-text-primary">
                            ₹{(item.wholesale_price * item.quantity).toLocaleString("en-IN")}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-bg-alt border border-divider rounded-lg px-2 py-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.anklet_id, item.quantity - 1)
                              }
                              className="text-text-secondary hover:text-text-primary text-xs px-1"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="text-xs font-semibold text-text-primary min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.anklet_id, item.quantity + 1)
                              }
                              className="text-text-secondary hover:text-text-primary text-xs px-1"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visitor Guest Details if not logged in */}
                {session.role === "visitor" && (
                  <div className="p-4 rounded-xl bg-bg-alt border border-divider space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-primary">
                        Wholesale Buyer Details
                      </span>
                      <Link
                        href="/login?redirect=/varieties"
                        className="text-[11px] text-accent hover:underline font-medium"
                      >
                        Already registered? Login
                      </Link>
                    </div>
                    <input
                      type="text"
                      placeholder="Jewelry Shop / Business Name *"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="input-pearl text-xs"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        placeholder="WhatsApp / Phone *"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="input-pearl text-xs"
                      />
                      <input
                        type="text"
                        placeholder="City / Market"
                        value={guestCity}
                        onChange={(e) => setGuestCity(e.target.value)}
                        className="input-pearl text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Order Special Notes */}
                <div>
                  <label className="block text-[11px] text-text-secondary font-medium mb-1">
                    Special Instructions / Packing Note
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Any special finish/weight preferences, dispatch via transport..."
                    className="input-pearl text-xs resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-status-out-of-stock-text bg-status-out-of-stock-bg p-2.5 rounded-lg border border-status-out-of-stock/25">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {!submittedOrder && items.length > 0 && (
            <div className="p-5 border-t border-divider bg-bg-alt/70 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Total Pairs:</span>
                  <span className="font-semibold text-text-primary">{totalItems} pairs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-text-secondary">
                    Estimated Wholesale Value:
                  </span>
                  <span className="font-bold text-text-primary">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-text-secondary">
                  * Final bill includes GST (3%) and standard dispatch freight from Chowk Bazar, Mathura.
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="btn btn-primary w-full py-3.5 text-xs font-semibold tracking-wide disabled:opacity-50"
              >
                {submitting ? "Placing Wholesale Order..." : "Confirm & Send Wholesale Order"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
