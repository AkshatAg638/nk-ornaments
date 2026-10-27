"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnkletWithImages, Category, formatINR, isLowStock, isOutOfStock } from "@/lib/types";

interface StockClientProps {
  initialAnklets: AnkletWithImages[];
  categories: Category[];
  initialFilter?: string;
}

export default function StockClient({
  initialAnklets,
  categories,
  initialFilter = "all",
}: StockClientProps) {
  const router = useRouter();

  // Local editable state
  const [stockMap, setStockMap] = useState<
    Record<string, { stock_quantity: number; manual_out_of_stock: boolean }>
  >(() => {
    const map: Record<
      string,
      { stock_quantity: number; manual_out_of_stock: boolean }
    > = {};
    initialAnklets.forEach((a) => {
      map[a.id] = {
        stock_quantity: a.stock_quantity,
        manual_out_of_stock: a.manual_out_of_stock,
      };
    });
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filter, setFilter] = useState(initialFilter);

  function handleQuantityChange(id: string, qty: number) {
    setStockMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        stock_quantity: Math.max(0, qty),
      },
    }));
    setSuccess(false);
  }

  function handleManualToggle(id: string) {
    setStockMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        manual_out_of_stock: !prev[id].manual_out_of_stock,
      },
    }));
    setSuccess(false);
  }

  async function handleSaveAll() {
    setSaving(true);
    setSuccess(false);

    try {
      const updates = Object.entries(stockMap).map(([id, val]) => ({
        id,
        stock_quantity: val.stock_quantity,
        manual_out_of_stock: val.manual_out_of_stock,
      }));

      const res = await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) throw new Error("Failed to update stock");

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Failed to save stock updates. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = initialAnklets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || a.category_id === selectedCategory;

    const currentStock = stockMap[a.id]?.stock_quantity ?? a.stock_quantity;
    const isManualOut =
      stockMap[a.id]?.manual_out_of_stock ?? a.manual_out_of_stock;
    const isOut = isOutOfStock({
      stock_quantity: currentStock,
      manual_out_of_stock: isManualOut,
    });
    const isLow = isLowStock({
      stock_quantity: currentStock,
      low_stock_threshold: a.low_stock_threshold,
      manual_out_of_stock: isManualOut,
    });

    let matchesFilter = true;
    if (filter === "low_stock") matchesFilter = isLow;
    if (filter === "out_of_stock") matchesFilter = isOut;
    if (filter === "in_stock") matchesFilter = !isOut && !isLow;

    return matchesSearch && matchesCategory && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Quick Stock &amp; Inventory Table
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bulk adjust production stock and toggle manual out-of-stock overrides in real time.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 shrink-0"
        >
          {saving ? (
            <span>Saving Changes...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>Save All Stock Changes</span>
            </>
          )}
        </button>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>All stock quantities and override states have been updated live!</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or SKU..."
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />

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

        <div className="flex rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 p-0.5">
          {[
            { id: "all", label: "All" },
            { id: "in_stock", label: "In Stock" },
            { id: "low_stock", label: "Low Stock" },
            { id: "out_of_stock", label: "Out of Stock" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition ${
                filter === item.id
                  ? "bg-amber-500 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Anklet Details</th>
                <th className="py-3.5 px-4">Wholesale Rate</th>
                <th className="py-3.5 px-4 text-center">Stock Quantity (Pairs)</th>
                <th className="py-3.5 px-4 text-center">Low-Stock Mark</th>
                <th className="py-3.5 px-4 text-center">Manual Out-of-Stock</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Computed Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No anklets match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const state = stockMap[item.id] || {
                    stock_quantity: item.stock_quantity,
                    manual_out_of_stock: item.manual_out_of_stock,
                  };

                  const isOut = isOutOfStock({
                    stock_quantity: state.stock_quantity,
                    manual_out_of_stock: state.manual_out_of_stock,
                  });

                  const isLow = isLowStock({
                    stock_quantity: state.stock_quantity,
                    low_stock_threshold: item.low_stock_threshold,
                    manual_out_of_stock: state.manual_out_of_stock,
                  });

                  const primaryImg =
                    item.images[0]?.public_url ||
                    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80";

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      {/* Product Thumbnail & SKU */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700/60 shrink-0 bg-slate-950"
                          />
                          <div>
                            <span className="font-semibold text-white block">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-amber-400">
                              {item.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Wholesale Rate */}
                      <td className="py-3 px-4 font-semibold text-amber-400">
                        {formatINR(item.wholesale_price)}
                      </td>

                      {/* Stock Quantity Input */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                state.stock_quantity - 1
                              )
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={state.stock_quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 px-2 py-1 text-center font-bold text-white bg-slate-950 border border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                state.stock_quantity + 1
                              )
                            }
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">
                        &le; {item.low_stock_threshold} pairs
                      </td>

                      {/* Manual Out of Stock Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleManualToggle(item.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold transition ${
                            state.manual_out_of_stock
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {state.manual_out_of_stock ? "Manual Override ON" : "Off"}
                        </button>
                      </td>

                      {/* Computed Status Pill */}
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
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
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
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
