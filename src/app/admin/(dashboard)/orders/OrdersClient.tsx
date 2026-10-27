"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderWithDetails, OrderStatus, formatINR } from "@/lib/types";

interface OrdersClientProps {
  initialOrders: OrderWithDetails[];
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<OrderStatus>("pending");
  const [noteUpdate, setNoteUpdate] = useState("");
  const [saving, setSaving] = useState(false);

  function openOrderModal(order: OrderWithDetails) {
    setSelectedOrder(order);
    setStatusUpdate(order.status);
    setNoteUpdate(order.note || "");
  }

  async function handleStatusSave() {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusUpdate, note: noteUpdate }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Failed to update order");

      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...updated } : o))
      );
      setSelectedOrder((prev) => (prev ? { ...prev, ...updated } : null));
      router.refresh();
    } catch {
      alert("Failed to update order status");
    } finally {
      setSaving(false);
    }
  }

  function getWhatsAppShareUrl(order: OrderWithDetails) {
    const phone = (order.customer?.whatsapp || order.customer?.phone || "")
      .replace(/[^0-9]/g, "");
    const totalAmount = order.items.reduce(
      (sum, it) => sum + it.price_snapshot * it.quantity,
      0
    );

    const itemsSummary = order.items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.anklet_name_snapshot} (${it.quantity} pairs @ ₹${it.price_snapshot}) = ₹${it.price_snapshot * it.quantity}`
      )
      .join("\n");

    const message = `*N.K. Ornaments - Wholesale Order Confirmation*\n\n` +
      `*Order No:* ${order.order_number}\n` +
      `*Customer:* ${order.customer?.business_name}\n` +
      `*Contact:* ${order.customer?.contact_person} (${order.customer?.phone})\n` +
      `*Status:* ${order.status.toUpperCase()}\n\n` +
      `*Order Items:*\n${itemsSummary}\n\n` +
      `*Total Value:* ₹${totalAmount.toLocaleString("en-IN")}\n\n` +
      `Thank you for doing business with N.K. Ornaments, Mathura. (Proprietor: Sachin Chaudhary)`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.business_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.city || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Wholesale Order Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review incoming wholesaler bookings, manage dispatch logistics, and generate WhatsApp summaries.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, business name, or city..."
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />

        <div className="flex overflow-x-auto rounded-lg border border-slate-700/80 bg-slate-950 p-0.5">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "dispatched", label: "Dispatched" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`flex-1 py-1 px-2.5 text-[11px] font-medium rounded-md whitespace-nowrap transition ${
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

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Order #</th>
                <th className="py-3.5 px-4">Wholesaler</th>
                <th className="py-3.5 px-4">City / State</th>
                <th className="py-3.5 px-4">Designs &amp; Pairs</th>
                <th className="py-3.5 px-4">Total Value</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => {
                  const totalPairs = ord.items.reduce(
                    (sum, it) => sum + it.quantity,
                    0
                  );
                  const totalValue = ord.items.reduce(
                    (sum, it) => sum + it.price_snapshot * it.quantity,
                    0
                  );

                  return (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 sm:px-6 font-mono font-semibold text-white">
                        {ord.order_number}
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">
                          {ord.customer?.business_name || "Guest Order"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ord.customer?.contact_person}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {ord.customer ? `${ord.customer.city}, ${ord.customer.state}` : "—"}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="font-semibold">{ord.items.length}</span> models &bull;{" "}
                        <span className="font-semibold">{totalPairs}</span> pairs
                      </td>

                      <td className="py-3 px-4 font-semibold text-amber-400">
                        {formatINR(totalValue)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
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
                      </td>

                      <td className="py-3 px-4 sm:px-6 text-right space-x-2">
                        <button
                          onClick={() => openOrderModal(ord)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-[11px]"
                        >
                          View &amp; Fulfill
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                  Wholesale Order Details
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {selectedOrder.order_number}
                </h2>
                <p className="text-xs text-slate-400">
                  Booked on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Wholesaler Info Card */}
            {selectedOrder.customer && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm">
                    {selectedOrder.customer.business_name}
                  </h3>
                  {selectedOrder.customer.gst_number && (
                    <span className="font-mono text-amber-400 text-[11px]">
                      GSTIN: {selectedOrder.customer.gst_number}
                    </span>
                  )}
                </div>
                <p className="text-slate-300">
                  <strong className="text-slate-400 font-normal">Contact Person:</strong>{" "}
                  {selectedOrder.customer.contact_person} &bull; 📞 {selectedOrder.customer.phone}
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-400 font-normal">Dispatch Address:</strong>{" "}
                  {selectedOrder.customer.address_line}, {selectedOrder.customer.city},{" "}
                  {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                </p>
              </div>
            )}

            {/* Items Table Snapshot */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Booked Anklet Models
              </h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
                {selectedOrder.items.map((it) => (
                  <div
                    key={it.id}
                    className="p-3 bg-slate-950 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {it.primary_image && (
                        <img
                          src={it.primary_image}
                          alt={it.anklet_name_snapshot}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                        />
                      )}
                      <div>
                        <span className="font-medium text-white block">
                          {it.anklet_name_snapshot}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {it.quantity} pairs &times; {formatINR(it.price_snapshot)}
                        </span>
                      </div>
                    </div>
                    <span className="font-semibold text-amber-400">
                      {formatINR(it.price_snapshot * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-3 flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs">
                <span className="font-medium text-slate-300">Total Order Value:</span>
                <span className="text-base font-bold text-amber-400">
                  {formatINR(
                    selectedOrder.items.reduce(
                      (sum, it) => sum + it.price_snapshot * it.quantity,
                      0
                    )
                  )}
                </span>
              </div>
            </div>

            {/* Status & Fulfillment Controls */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold text-white">
                Update Order Status &amp; Internal Log
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Order Status
                  </label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="pending">Pending (Awaiting Review)</option>
                    <option value="confirmed">Confirmed (Advance Received)</option>
                    <option value="dispatched">Dispatched (In Transit)</option>
                    <option value="completed">Completed (Delivered)</option>
                    <option value="cancelled">Cancelled (Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Internal Note / Tracking AWB
                  </label>
                  <input
                    type="text"
                    value={noteUpdate}
                    onChange={(e) => setNoteUpdate(e.target.value)}
                    placeholder="e.g. Sequel AWB #9981273"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <a
                  href={getWhatsAppShareUrl(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow shadow-emerald-600/20"
                >
                  <span>💬 Share Summary on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleStatusSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition shadow disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Save Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
