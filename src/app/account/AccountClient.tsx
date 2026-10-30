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
        return "bg-status-low-stock-bg text-status-low-stock-text border-status-low-stock/30";
      case "confirmed":
        return "bg-accent/10 text-accent border-accent/25";
      case "dispatched":
        return "bg-accent/15 text-text-primary border-accent/30";
      case "completed":
        return "bg-status-in-stock-bg text-status-in-stock-text border-status-in-stock/30";
      case "cancelled":
        return "bg-status-out-of-stock-bg text-status-out-of-stock-text border-status-out-of-stock/30";
      default:
        return "bg-bg-alt text-text-secondary border-divider";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="card-pearl bg-surface-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-divider">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-bg-alt border border-divider flex items-center justify-center text-2xl text-accent">
            🏬
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight">
              {customer?.business_name || "Wholesale Partner"}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Contact: {customer?.contact_person || session.user?.email} &bull;{" "}
              {customer?.city || "Mathura / Agra Trade Region"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/varieties"
            className="btn btn-primary text-xs py-2 px-4"
          >
            Explore Catalog
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-outline text-xs py-2 px-4"
          >
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Grid: Profile Details + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business Details */}
        <div className="space-y-6">
          <div className="card-pearl bg-surface-card p-6 border border-divider space-y-4">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2 font-mono">
              <span>📋</span> Trade Account Profile
            </h2>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-text-secondary block">Firm / Showroom Name</span>
                <span className="font-medium text-text-primary text-sm">
                  {customer?.business_name || "—"}
                </span>
              </div>

              <div>
                <span className="text-text-secondary block">GSTIN</span>
                <span className="font-mono font-medium text-accent">
                  {customer?.gst_number || "Unregistered / Composition"}
                </span>
              </div>

              <div>
                <span className="text-text-secondary block">Contact Phone / WhatsApp</span>
                <span className="font-medium text-text-primary">
                  {customer?.phone || "—"}
                </span>
              </div>

              <div>
                <span className="text-text-secondary block">Email Address</span>
                <span className="text-text-primary">
                  {customer?.email || session.user?.email || "—"}
                </span>
              </div>

              <div>
                <span className="text-text-secondary block">Dispatch / Billing Address</span>
                <span className="text-text-primary leading-relaxed block mt-0.5">
                  {customer?.address_line}
                  <br />
                  {customer?.city}, {customer?.state} - {customer?.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Support Card */}
          <div className="card-pearl bg-bg-alt p-6 border border-divider space-y-3">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-widest flex items-center gap-1.5">
              <span>💬</span> Factory Order Desk
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Need custom weight sorting, wholesale German silver rate booking, or express transport delivery?
            </p>
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                `Hello N.K. Ornaments, I am ${customer?.business_name || "a wholesale buyer"} requesting order assistance.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              Direct WhatsApp Desk
            </a>
          </div>
        </div>

        {/* Right Column: Wholesale Orders History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif text-text-primary flex items-center gap-2">
              <span>📦</span> Wholesale Order History
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-bg-alt text-text-secondary border border-divider">
                {orders.length}
              </span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="card-pearl bg-surface-card p-12 text-center border border-divider space-y-3">
              <div className="text-3xl text-accent">✦</div>
              <h3 className="text-base font-serif text-text-primary">No trade orders yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Explore our catalog to view wholesale German silver payal rates and place your first stock order.
              </p>
              <div className="pt-2">
                <Link
                  href="/varieties"
                  className="btn btn-primary text-xs py-2 px-5 inline-flex"
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
                    className="card-pearl bg-surface-card p-5 sm:p-6 border border-divider space-y-4 hover:border-accent/40 transition-colors duration-200"
                  >
                    {/* Order Head */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider pb-3">
                      <div>
                        <span className="font-mono text-sm font-semibold text-text-primary">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-text-secondary ml-2 font-mono">
                          {orderDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border uppercase tracking-wider ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <a
                          href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                            `Hello Sachin ji, tracking update requested for wholesale Order #${order.order_number} (${totalPairs} pairs). Please share the current dispatch or transport consignment details.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] border border-[#25D366]/30 flex items-center gap-1 transition-all duration-200"
                          title="Track on WhatsApp"
                        >
                          <span>💬 Track</span>
                        </a>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-divider/40 last:border-b-0 text-text-secondary"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-accent">
                              {item.quantity}x
                            </span>
                            <span className="font-medium text-text-primary">
                              {item.anklet_name_snapshot}
                            </span>
                          </div>
                          <span className="font-mono font-medium text-text-primary">
                            {formatINR(item.price_snapshot * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-divider text-xs">
                      <span className="text-text-secondary">
                        Total Quantity: <strong className="text-text-primary font-medium">{totalPairs} pairs</strong>
                      </span>
                      <div>
                        <span className="text-text-secondary mr-2">Estimated Value:</span>
                        <span className="text-sm font-serif font-semibold text-text-primary">
                          {formatINR(orderTotal)}
                        </span>
                      </div>
                    </div>

                    {order.note && (
                      <p className="text-xs text-text-secondary italic bg-bg-alt p-3 rounded-xl border border-divider">
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
