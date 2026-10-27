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
  whatsappNumber = "+919837012345",
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
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderNumber: string;
    whatsappUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");

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

      // Build WhatsApp message for instant supplier ping
      const orderNum = data.order_number || `ORD-${Date.now().toString().slice(-4)}`;
      let waText = `*NEW WHOLESALE ORDER: ${orderNum}*\n`;
      waText += `*Buyer:* ${
        session.customerProfile?.business_name || guestName || "Wholesale Buyer"
      }\n`;
      if (session.customerProfile?.city || guestCity) {
        waText += `*City:* ${session.customerProfile?.city || guestCity}\n`;
      }
      waText += `*Phone:* ${
        session.customerProfile?.phone || guestPhone || "N/A"
      }\n\n`;
      waText += `*Items Ordered:*\n`;

      items.forEach((item, idx) => {
        waText += `${idx + 1}. ${item.name} (${item.sku})\n`;
        waText += `   Qty: ${item.quantity} pairs @ ₹${item.wholesale_price.toLocaleString(
          "en-IN"
        )} = ₹${(item.quantity * item.wholesale_price).toLocaleString("en-IN")}\n`;
      });

      waText += `\n*Total Pairs:* ${totalItems} pairs`;
      waText += `\n*Estimated Value:* ₹${totalAmount.toLocaleString("en-IN")}`;
      if (note) waText += `\n*Note:* ${note}`;
      waText += `\n\n_Please confirm stock availability & dispatch schedule for these German Silver payal designs._`;

      const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
        waText
      )}`;

      setSubmittedOrder({ orderNumber: orderNum, whatsappUrl });
      clearCart();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="font-bold text-white text-base">
                Wholesale Order Draft
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {totalItems} pairs
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setSubmittedOrder(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {submittedOrder ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Order Submitted Successfully!
                  </h3>
                  <p className="text-xs text-amber-400 font-mono mt-1">
                    Order Ref: {submittedOrder.orderNumber}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Our sales desk in Mathura has received your order draft. To expedite processing, send your order summary directly to our WhatsApp dispatch desk below.
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <a
                    href={submittedOrder.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
                  >
                    <span>💬 Send to WhatsApp Dispatch</span>
                  </a>
                  <button
                    onClick={() => {
                      setSubmittedOrder(null);
                      setIsOpen(false);
                    }}
                    className="w-full py-2.5 text-xs text-slate-400 hover:text-white"
                  >
                    Back to Catalog
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 text-2xl">
                  🛒
                </div>
                <h3 className="text-sm font-semibold text-slate-300">
                  Your order draft is empty
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse our wholesale collection and add anklets with your desired quantity to generate an order invoice.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition"
                  >
                    Browse Varieties
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.anklet_id}
                      className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex gap-3 items-center"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                            ✨
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeItem(item.anklet_id)}
                            className="text-slate-500 hover:text-rose-400 text-xs ml-2"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                          SKU: {item.sku} {item.weight ? `• ${item.weight}` : ""}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-emerald-400">
                            ₹{(item.wholesale_price * item.quantity).toLocaleString("en-IN")}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.anklet_id, item.quantity - 1)
                              }
                              className="text-slate-400 hover:text-white text-xs px-1"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-white min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.anklet_id, item.quantity + 1)
                              }
                              className="text-slate-400 hover:text-white text-xs px-1"
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
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-300">
                        Wholesale Buyer Details
                      </span>
                      <Link
                        href="/login?redirect=/varieties"
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Already registered? Login
                      </Link>
                    </div>
                    <input
                      type="text"
                      placeholder="Jewelry Shop / Business Name *"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        placeholder="WhatsApp / Phone *"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        placeholder="City / Market"
                        value={guestCity}
                        onChange={(e) => setGuestCity(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Order Special Notes */}
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">
                    Special Instructions / Packing Note
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Any special finish/weight preferences, dispatch via transport..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                    {error}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {!submittedOrder && items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/70 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total Pairs:</span>
                  <span className="font-semibold text-white">{totalItems} pairs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-200">
                    Estimated Wholesale Value:
                  </span>
                  <span className="font-bold text-amber-400">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  * Final bill includes GST (3%) and standard dispatch freight from Chowk Bazar, Mathura.
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
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
