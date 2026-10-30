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
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight font-light">
            Quick Stock &amp; Inventory Table
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Bulk adjust production stock and toggle manual out-of-stock overrides in real time.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="btn btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5 shadow-sm active:scale-95 disabled:opacity-50 shrink-0 font-medium"
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
        <div className="bg-status-in-stock-bg border border-status-in-stock-border rounded-xl p-4 text-xs text-status-in-stock flex items-center gap-2">
          <svg className="w-4 h-4 text-status-in-stock" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>All stock quantities and override states have been updated live!</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 card-pearl bg-surface-card border-divider p-3.5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or SKU..."
          className="input-pearl w-full text-xs"
        />

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

        <div className="flex rounded-lg overflow-hidden border border-divider bg-bg-alt p-0.5">
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
                  ? "bg-surface-card text-text-primary font-semibold shadow-sm border border-divider/60"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="card-pearl bg-surface-card border-divider overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-alt border-b border-divider text-text-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Anklet Details</th>
                <th className="py-3.5 px-4">Wholesale Rate</th>
                <th className="py-3.5 px-4 text-center">Stock Quantity (Pairs)</th>
                <th className="py-3.5 px-4 text-center">Low-Stock Mark</th>
                <th className="py-3.5 px-4 text-center">Manual Out-of-Stock</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Computed Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/60 text-text-primary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
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
                    <tr key={item.id} className="hover:bg-bg-alt/40 transition">
                      {/* Product Thumbnail & SKU */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-divider shrink-0 bg-bg-alt"
                          />
                          <div>
                            <span className="font-medium text-text-primary block">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-mono text-accent font-medium">
                              {item.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Wholesale Rate */}
                      <td className="py-3 px-4 font-serif text-sm font-medium text-text-primary">
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
                            className="w-6 h-6 rounded bg-bg-alt hover:bg-surface-card border border-divider text-text-secondary hover:text-text-primary font-bold flex items-center justify-center transition"
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
                            className="input-pearl w-16 px-1.5 py-1 text-center font-bold text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                state.stock_quantity + 1
                              )
                            }
                            className="w-6 h-6 rounded bg-bg-alt hover:bg-surface-card border border-divider text-text-secondary hover:text-text-primary font-bold flex items-center justify-center transition"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="py-3 px-4 text-center text-text-secondary font-mono">
                        &le; {item.low_stock_threshold} pairs
                      </td>

                      {/* Manual Out of Stock Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleManualToggle(item.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition ${
                            state.manual_out_of_stock
                              ? "bg-status-out-of-stock-bg text-status-out-of-stock border-status-out-of-stock-border"
                              : "bg-bg-alt text-text-secondary hover:text-text-primary border-divider"
                          }`}
                        >
                          {state.manual_out_of_stock ? "Manual Override ON" : "Off"}
                        </button>
                      </td>

                      {/* Computed Status Pill */}
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
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
