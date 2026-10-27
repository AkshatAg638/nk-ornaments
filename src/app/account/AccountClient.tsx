"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthSession, OrderWithDetails, formatINR } from "@/lib/types";

interface AccountClientProps {
  session: AuthSession;
  orders: OrderWithDetails[];
  whatsappNumber: string;
}

export default function AccountClient({
  session,
  orders,
  whatsappNumber,
}: AccountClientProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");
  const customer = session.customerProfile;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error("Logout error:", e);
      setLoggingOut(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "confirmed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "dispatched":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
            🏬
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {customer?.business_name || "Wholesale Partner"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Contact: {customer?.contact_person || session.user?.email} &bull;{" "}
              {customer?.city || "Agra"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/varieties"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow"
          >
            Explore Catalog
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition"
          >
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Grid: Profile Details + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Trade Account Profile
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Firm / Showroom Name</span>
                <span className="font-semibold text-slate-200">
                  {customer?.business_name || "—"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">GSTIN</span>
                <span className="font-mono font-semibold text-amber-400">
                  {customer?.gst_number || "Unregistered / Composition"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Contact Phone / WhatsApp</span>
                <span className="font-semibold text-slate-200">
                  {customer?.phone || "—"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Email Address</span>
                <span className="text-slate-300">
                  {customer?.email || session.user?.email || "—"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block">Dispatch / Billing Address</span>
                <span className="text-slate-300 leading-relaxed block mt-0.5">
                  {customer?.address_line}
                  <br />
                  {customer?.city}, {customer?.state} - {customer?.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Support Card */}
          <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>💬</span> Factory Order Desk
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Need custom weight sorting, daily silver market rate booking, or express transport delivery?
            </p>
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                `Hello N.K. Ornaments, I am ${customer?.business_name || "a wholesale buyer"} requesting order assistance.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
            >
              Direct WhatsApp Desk
            </a>
          </div>
        </div>

        {/* Right Column: Wholesale Orders History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>📦</span> Wholesale Order History
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {orders.length}
              </span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="text-3xl">🛍️</div>
              <h3 className="text-sm font-semibold text-white">No trade orders yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore our catalog to view real-time wholesale silver payal rates and place your first stock order.
              </p>
              <div className="pt-2">
                <Link
                  href="/varieties"
                  className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition"
                >
                  Browse Varieties &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const totalPairs = order.items?.reduce(
                  (sum, i) => sum + i.quantity,
                  0
                ) || 0;
                const orderTotal = order.items?.reduce(
                  (sum, i) => sum + i.price_snapshot * i.quantity,
                  0
                ) || 0;

                const orderDate = new Date(order.created_at).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" }
                );

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700/80 transition"
                  >
                    {/* Order Head */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="font-mono text-sm font-bold text-white">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          {orderDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border uppercase tracking-wide ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <a
                          href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                            `Hello N.K. Ornaments, tracking update requested for Order ${order.order_number}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                          title="Inquire status on WhatsApp"
                        >
                          💬 Track
                        </a>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 text-slate-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 font-bold">
                              {item.quantity}x
                            </span>
                            <span className="text-white font-medium">
                              {item.anklet_name_snapshot}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-200">
                            {formatINR(item.price_snapshot * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                      <span className="text-slate-400">
                        Total Quantity: <strong className="text-white">{totalPairs} pairs</strong>
                      </span>
                      <div>
                        <span className="text-slate-400 mr-2">Estimated Value:</span>
                        <span className="text-sm font-bold text-amber-400">
                          {formatINR(orderTotal)}
                        </span>
                      </div>
                    </div>

                    {order.note && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/60">
                        Note: {order.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
