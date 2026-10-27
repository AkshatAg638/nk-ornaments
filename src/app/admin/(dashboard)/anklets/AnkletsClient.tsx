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
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Anklets Inventory &amp; Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage wholesale products, upload WebP compressed photos, and configure order limits.
          </p>
        </div>

        <Link
          href="/admin/anklets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add New Anklet</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or material..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock Only</option>
            <option value="low_stock">Low Stock (≤ Threshold)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
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
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
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
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* Product Thumbnail + Title */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700/60 shrink-0 bg-slate-950"
                          />
                          <div>
                            <span className="font-semibold text-white block">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-amber-400">
                              SKU: {item.sku}
                            </span>
                            {item.weight && (
                              <span className="text-[10px] text-slate-500 ml-2">
                                ({item.weight})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300">
                        {item.category?.name || "—"}
                      </td>

                      {/* Wholesale Price */}
                      <td className="py-3 px-4 font-semibold text-amber-400">
                        {formatINR(item.wholesale_price)}
                        <span className="text-[10px] text-slate-500 font-normal block">
                          per pair
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {item.weight || "—"}
                      </td>

                      {/* Stock Status Pill */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isOut
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : isLow
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {isOut
                              ? "Out of Stock"
                              : isLow
                              ? `Low Stock (${item.stock_quantity})`
                              : `In Stock (${item.stock_quantity})`}
                          </span>
                          {item.manual_out_of_stock && (
                            <span className="text-[9px] text-amber-400/90 italic">
                              (Admin override)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active/Hidden Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition ${
                            item.is_active
                              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {item.is_active ? "Visible" : "Hidden"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 sm:px-6 text-right space-x-2">
                        <Link
                          href={`/admin/anklets/${item.id}/edit`}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] inline-block"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition text-[11px]"
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
