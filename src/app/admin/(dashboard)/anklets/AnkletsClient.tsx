"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnkletWithImages, Category, formatINR, isLowStock, isOutOfStock } from "@/lib/types";

interface AnkletsClientProps {
  initialAnklets: AnkletWithImages[];
  categories: Category[];
}

export default function AnkletsClient({
  initialAnklets,
  categories,
}: AnkletsClientProps) {
  const router = useRouter();
  const [anklets, setAnklets] = useState<AnkletWithImages[]>(initialAnklets);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  async function handleToggleActive(anklet: AnkletWithImages) {
    try {
      const newStatus = !anklet.is_active;
      const res = await fetch(`/api/admin/anklets/${anklet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setAnklets((prev) =>
        prev.map((a) => (a.id === anklet.id ? { ...a, is_active: newStatus } : a))
      );
      router.refresh();
    } catch {
      alert("Failed to toggle visibility status");
    }
  }

  async function handleDelete(anklet: AnkletWithImages) {
    if (
      !confirm(
        `Are you sure you want to delete "${anklet.name}" (${anklet.sku})? This will also remove its photos from storage.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/anklets/${anklet.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete anklet");
      setAnklets((prev) => prev.filter((a) => a.id !== anklet.id));
      router.refresh();
    } catch {
      alert("Failed to delete anklet");
    }
  }

  const filtered = anklets.filter((a) => {
    // Search filter
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.sku.toLowerCase().includes(search.toLowerCase()) ||
      (a.material && a.material.toLowerCase().includes(search.toLowerCase()));

    // Category filter
    const matchesCategory =
      selectedCategory === "all" || a.category_id === selectedCategory;

    // Stock status filter
    const isOut = isOutOfStock(a);
    const isLow = isLowStock(a);
    let matchesStock = true;
    if (stockFilter === "in_stock") matchesStock = !isOut && !isLow;
    if (stockFilter === "low_stock") matchesStock = isLow;
    if (stockFilter === "out_of_stock") matchesStock = isOut;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight font-light">
            Anklets Inventory &amp; Catalog
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage wholesale products, upload WebP compressed photos, and configure order limits.
          </p>
        </div>

        <Link
          href="/admin/anklets/new"
          className="btn btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-4 shadow-sm active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add New Anklet</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 card-pearl bg-surface-card border-divider p-3.5">
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or material..."
            className="input-pearl w-full text-xs"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-pearl w-full text-xs"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="input-pearl w-full text-xs"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low Stock (≤ Threshold)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-pearl bg-surface-card border-divider overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-alt border-b border-divider text-text-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Wholesale Price</th>
                <th className="py-3.5 px-4">⚖️ Weight</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-center">Live Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/60 text-text-primary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-secondary">
                    No anklets match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const primaryImg =
                    item.images.find((img) => img.is_primary)?.public_url ||
                    item.images[0]?.public_url ||
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80";

                  const isOut = isOutOfStock(item);
                  const isLow = isLowStock(item);

                  return (
                    <tr key={item.id} className="hover:bg-bg-alt/40 transition">
                      {/* Product Thumbnail + Title */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-divider shrink-0 bg-bg-alt"
                          />
                          <div>
                            <span className="font-medium text-text-primary block">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-accent font-medium">
                              SKU: {item.sku}
                            </span>
                            {item.weight && (
                              <span className="text-[10px] text-text-secondary ml-2">
                                ({item.weight})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-text-secondary">
                        {item.category?.name || "—"}
                      </td>

                      {/* Wholesale Price */}
                      <td className="py-3.5 px-4 font-serif text-sm font-medium text-text-primary">
                        {formatINR(item.wholesale_price)}
                        <span className="text-[10px] text-text-secondary font-sans font-normal block">
                          per pair
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-4 font-medium text-accent">
                        {item.weight || "—"}
                      </td>

                      {/* Stock Status Pill */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isOut
                                ? "bg-status-out-of-stock-bg text-status-out-of-stock border-status-out-of-stock-border"
                                : isLow
                                ? "bg-status-low-stock-bg text-status-low-stock border-status-low-stock-border"
                                : "bg-status-in-stock-bg text-status-in-stock border-status-in-stock-border"
                            }`}
                          >
                            {isOut
                              ? "Out of Stock"
                              : isLow
                              ? `Low Stock (${item.stock_quantity})`
                              : `In Stock (${item.stock_quantity})`}
                          </span>
                          {item.manual_out_of_stock && (
                            <span className="text-[9px] text-accent italic">
                              (Admin override)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active/Hidden Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition ${
                            item.is_active
                              ? "bg-status-in-stock-bg text-status-in-stock border-status-in-stock-border hover:opacity-80"
                              : "bg-bg-alt text-text-secondary border-divider hover:text-text-primary"
                          }`}
                        >
                          {item.is_active ? "Visible" : "Hidden"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                        <Link
                          href={`/admin/anklets/${item.id}/edit`}
                          className="btn btn-outline text-[11px] py-1 px-2.5 inline-block"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-2.5 py-1 rounded-lg bg-status-out-of-stock-bg hover:bg-rose-100 text-status-out-of-stock border border-status-out-of-stock-border transition text-[11px]"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
