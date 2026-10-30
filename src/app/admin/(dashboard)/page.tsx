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
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-alt border border-divider text-text-secondary text-xs font-mono mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-status-in-stock"></span>
              Admin Dashboard • {session.user?.email || "Master Admin"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight">
              Wholesale Manufacturing Overview
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl">
              Monitor production stock, fulfill wholesale orders, manage categories, and keep track of free-tier storage limits.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/anklets/new"
              className="btn btn-primary text-xs py-2.5 px-4 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Add New Anklet</span>
            </Link>

            <Link
              href="/admin/stock"
              className="btn btn-outline text-xs py-2.5 px-4 inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5" />
              </svg>
              <span>Quick Stock Table</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Link
          href="/admin/anklets"
          className="card-pearl bg-surface-card border border-divider hover:border-accent/40 rounded-2xl p-4 sm:p-5 transition group"
        >
          <span className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">Total Anklets</span>
          <div className="text-2xl font-serif font-semibold text-text-primary mt-1.5 group-hover:text-accent transition">
            {anklets.length}
          </div>
          <span className="text-[11px] text-text-secondary mt-1 block">Active designs</span>
        </Link>

        <Link
          href="/admin/categories"
          className="card-pearl bg-surface-card border border-divider hover:border-accent/40 rounded-2xl p-4 sm:p-5 transition group"
        >
          <span className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">Categories</span>
          <div className="text-2xl font-serif font-semibold text-text-primary mt-1.5 group-hover:text-accent transition">
            {categories.length}
          </div>
          <span className="text-[11px] text-text-secondary mt-1 block">Catalog lines</span>
        </Link>

        <Link
          href="/admin/orders"
          className="card-pearl bg-surface-card border border-divider hover:border-accent/40 rounded-2xl p-4 sm:p-5 transition group"
        >
          <span className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">Pending Orders</span>
          <div className="text-2xl font-serif font-semibold text-text-primary mt-1.5 group-hover:text-accent transition">
            {pendingOrders.length}
          </div>
          <span className="text-[11px] text-status-low-stock-text mt-1 block">Needs confirmation</span>
        </Link>

        <Link
          href="/admin/customers"
          className="card-pearl bg-surface-card border border-divider hover:border-accent/40 rounded-2xl p-4 sm:p-5 transition group"
        >
          <span className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">Wholesalers</span>
          <div className="text-2xl font-serif font-semibold text-text-primary mt-1.5 group-hover:text-accent transition">
            {customers.length}
          </div>
          <span className="text-[11px] text-text-secondary mt-1 block">Registered Wholesalers</span>
        </Link>

        <Link
          href="/admin/stock?status=low_stock"
          className="card-pearl bg-surface-card border border-divider hover:border-accent/40 rounded-2xl p-4 sm:p-5 transition group"
        >
          <span className="text-xs font-mono font-medium text-status-low-stock-text uppercase tracking-wider">Low Stock</span>
          <div className="text-2xl font-serif font-semibold text-status-low-stock-text mt-1.5">
            {lowStockItems.length}
          </div>
          <span className="text-[11px] text-text-secondary mt-1 block">&le; Threshold limit</span>
        </Link>

        <Link
          href="/admin/stock?status=out_of_stock"
          className="card-pearl bg-surface-card border border-divider hover:border-accent/40 rounded-2xl p-4 sm:p-5 transition group"
        >
          <span className="text-xs font-mono font-medium text-status-out-of-stock-text uppercase tracking-wider">Out of Stock</span>
          <div className="text-2xl font-serif font-semibold text-status-out-of-stock-text mt-1.5">
            {outOfStockItems.length}
          </div>
          <span className="text-[11px] text-text-secondary mt-1 block">Unavailable</span>
        </Link>
      </div>

      {/* Storage Meter & Quick Health */}
      <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            <h2 className="text-sm font-serif font-semibold text-text-primary">
              Supabase Free Tier Image Storage Meter
            </h2>
          </div>
          <div className="text-xs text-text-secondary font-mono">
            <span className="font-semibold text-text-primary">{usedMB} MB</span> used of{" "}
            <span>{totalMB} MB (1 GB Limit)</span> &bull;{" "}
            <span className="text-accent">{storage.imageCount} photos stored</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-bg-alt h-3 rounded-full overflow-hidden border border-divider p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              storage.isWarning
                ? "bg-status-out-of-stock"
                : storage.percentage > 50
                ? "bg-status-low-stock"
                : "bg-accent"
            }`}
            style={{ width: `${Math.max(2, storage.percentage)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
          <span>Usage: {storage.percentage}%</span>
          {storage.isWarning ? (
            <span className="text-status-out-of-stock-text font-semibold flex items-center gap-1">
              ⚠️ Warning: Approaching 80% storage threshold. Delete unused images or resize.
            </span>
          ) : (
            <span className="text-text-secondary font-medium">
              ✓ Optimal: Client-side WebP compression ensures 1 GB holds ~6,000 anklet photos.
            </span>
          )}
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-divider">
              <h2 className="text-base font-serif font-medium text-text-primary flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                Recent Wholesale Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs text-accent hover:underline font-semibold"
              >
                View all ({orders.length}) &rarr;
              </Link>
            </div>

            <div className="divide-y divide-divider">
              {orders.slice(0, 4).map((ord) => {
                const totalAmount = ord.items.reduce(
                  (sum, it) => sum + it.price_snapshot * it.quantity,
                  0
                );
                return (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-text-primary">
                          {ord.order_number}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-mono font-medium border ${
                            ord.status === "pending"
                              ? "bg-status-low-stock-bg text-status-low-stock-text border-status-low-stock/30"
                              : ord.status === "confirmed"
                              ? "bg-accent/10 text-accent border-accent/25"
                              : ord.status === "dispatched"
                              ? "bg-accent/15 text-text-primary border-accent/30"
                              : ord.status === "completed"
                              ? "bg-status-in-stock-bg text-status-in-stock-text border-status-in-stock/30"
                              : "bg-status-out-of-stock-bg text-status-out-of-stock-text border-status-out-of-stock/30"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">
                        {ord.customer?.business_name || "Wholesale Buyer"} &bull;{" "}
                        {ord.items.length} designs
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-serif font-semibold text-text-primary block">
                        {formatINR(totalAmount)}
                      </span>
                      <span className="text-[11px] text-text-secondary font-mono">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-divider mt-4 text-center">
            <Link
              href="/admin/orders"
              className="text-xs text-text-secondary hover:text-text-primary transition inline-flex items-center gap-1"
            >
              Manage dispatch &amp; print wholesale packing sheets &rarr;
            </Link>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="card-pearl bg-surface-card border border-divider rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-divider">
              <h2 className="text-base font-serif font-medium text-text-primary flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Trade Enquiries &amp; Quotations
                {unreadEnquiries.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-accent text-bg-primary font-mono text-[10px]">
                    {unreadEnquiries.length} New
                  </span>
                )}
              </h2>
              <Link
                href="/admin/enquiries"
                className="text-xs text-accent hover:underline font-semibold"
              >
                View all ({enquiries.length}) &rarr;
              </Link>
            </div>

            <div className="divide-y divide-divider">
              {enquiries.slice(0, 3).map((enq) => (
                <div key={enq.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">{enq.name}</span>
                      {!enq.is_read && (
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-secondary font-mono">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {enq.message}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-text-secondary">
                    {enq.phone && <span>📞 {enq.phone}</span>}
                    {enq.email && <span>✉️ {enq.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-divider mt-4 text-center">
            <Link
              href="/admin/enquiries"
              className="text-xs text-text-secondary hover:text-text-primary transition inline-flex items-center gap-1"
            >
              Open inquiries dashboard &amp; reply on WhatsApp &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
