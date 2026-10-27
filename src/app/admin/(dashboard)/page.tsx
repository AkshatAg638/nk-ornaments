import Link from "next/link";
import {
  getAnklets,
  getCategories,
  getCustomers,
  getOrders,
  getEnquiries,
  getStorageUsage,
  getCurrentAuthUser,
} from "@/lib/data";
import { formatINR, isLowStock, isOutOfStock } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    anklets,
    categories,
    customers,
    orders,
    enquiries,
    storage,
    session,
  ] = await Promise.all([
    getAnklets(),
    getCategories(),
    getCustomers(),
    getOrders(),
    getEnquiries(),
    getStorageUsage(),
    getCurrentAuthUser(),
  ]);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const lowStockItems = anklets.filter((a) => isLowStock(a));
  const outOfStockItems = anklets.filter((a) => isOutOfStock(a));
  const unreadEnquiries = enquiries.filter((e) => !e.is_read);

  const usedMB = (storage.usedBytes / (1024 * 1024)).toFixed(2);
  const totalMB = (storage.totalBytes / (1024 * 1024)).toFixed(0);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Admin Dashboard • {session.user?.email || "Master Admin"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Wholesale Manufacturing Overview
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Monitor production stock, fulfill wholesale orders, manage categories, and keep track of free-tier storage limits.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/anklets/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add New Anklet</span>
            </Link>

            <Link
              href="/admin/stock"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 transition border border-slate-700 active:scale-95"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5" />
              </svg>
              <span>Quick Stock Table</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Link
          href="/admin/anklets"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition group"
        >
          <span className="text-[11px] font-medium text-slate-400">Total Anklets</span>
          <div className="text-2xl font-bold text-white mt-1 group-hover:text-amber-400 transition">
            {anklets.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Active designs</span>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition group"
        >
          <span className="text-[11px] font-medium text-slate-400">Categories</span>
          <div className="text-2xl font-bold text-white mt-1 group-hover:text-amber-400 transition">
            {categories.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Catalog lines</span>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition group"
        >
          <span className="text-[11px] font-medium text-slate-400">Pending Orders</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {pendingOrders.length}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Needs confirmation</span>
        </Link>

        <Link
          href="/admin/customers"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition group"
        >
          <span className="text-[11px] font-medium text-slate-400">Wholesalers</span>
          <div className="text-2xl font-bold text-white mt-1 group-hover:text-amber-400 transition">
            {customers.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Registered B2B</span>
        </Link>

        <Link
          href="/admin/stock?status=low_stock"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition group"
        >
          <span className="text-[11px] font-medium text-amber-300">Low Stock</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {lowStockItems.length}
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">&le; Threshold limit</span>
        </Link>

        <Link
          href="/admin/stock?status=out_of_stock"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition group"
        >
          <span className="text-[11px] font-medium text-rose-300">Out of Stock</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {outOfStockItems.length}
          </div>
          <span className="text-[10px] text-rose-400/80 mt-1 block">Unavailable</span>
        </Link>
      </div>

      {/* Storage Meter & Quick Health (Requirement: Free-tier 1 GB limit warning at 80%) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            <h2 className="text-sm font-semibold text-white">
              Supabase Free Tier Image Storage Meter
            </h2>
          </div>
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-white">{usedMB} MB</span> used of{" "}
            <span className="text-slate-300">{totalMB} MB (1 GB Limit)</span> &bull;{" "}
            <span className="text-amber-400">{storage.imageCount} photos stored</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              storage.isWarning
                ? "bg-rose-500 shadow-lg shadow-rose-500/50"
                : storage.percentage > 50
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.max(2, storage.percentage)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>Usage: {storage.percentage}%</span>
          {storage.isWarning ? (
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              ⚠️ Warning: Approaching 80% storage threshold. Delete unused images or resize.
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">
              ✓ Optimal: Client-side WebP compression ensures 1 GB holds ~6,000 anklet photos.
            </span>
          )}
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                Recent Wholesale Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                View all ({orders.length}) &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-800">
              {orders.slice(0, 4).map((ord) => {
                const totalAmount = ord.items.reduce(
                  (sum, it) => sum + it.price_snapshot * it.quantity,
                  0
                );
                return (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-white">
                          {ord.order_number}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
                            ord.status === "pending"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : ord.status === "confirmed"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : ord.status === "dispatched"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : ord.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {ord.customer?.business_name || "Wholesale Buyer"} &bull;{" "}
                        {ord.items.length} designs
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-amber-400 block">
                        {formatINR(totalAmount)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 text-center">
            <Link
              href="/admin/orders"
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1"
            >
              Manage dispatch &amp; print wholesale packing sheets &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Trade Enquiries &amp; Quotations
                {unreadEnquiries.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                    {unreadEnquiries.length} New
                  </span>
                )}
              </h2>
              <Link
                href="/admin/enquiries"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                View all ({enquiries.length}) &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-800">
              {enquiries.slice(0, 3).map((enq) => (
                <div key={enq.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{enq.name}</span>
                      {!enq.is_read && (
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {enq.message}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                    {enq.phone && <span>📞 {enq.phone}</span>}
                    {enq.email && <span>✉️ {enq.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 text-center">
            <Link
              href="/admin/enquiries"
              className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1"
            >
              Open inquiries dashboard &amp; reply on WhatsApp &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
