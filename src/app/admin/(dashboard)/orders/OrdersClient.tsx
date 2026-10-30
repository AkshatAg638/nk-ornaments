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
      `Thank you for doing business with N.K. Ornaments, Mathura. (Proprietor: Sachin Chaudhary: +91 98377 55055)`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function getWhatsAppDispatchUrl(order: OrderWithDetails, trackingNote: string) {
    const phone = (order.customer?.whatsapp || order.customer?.phone || "")
      .replace(/[^0-9]/g, "");

    const message = `*N.K. Ornaments, Mathura — Consignment Dispatch Alert*\n\n` +
      `*Order Ref:* #${order.order_number}\n` +
      `*Customer:* ${order.customer?.business_name || "Valued Buyer"}\n` +
      `*Status:* DISPATCHED / IN TRANSIT 🚚\n` +
      `*Tracking / Transport Note:* ${trackingNote || "Consignment handed over to transport service"}\n\n` +
      `Your German Silver payal order has been packed and dispatched from our Chowk Bazar workshop. Please keep the delivery acknowledgement ready upon arrival.\n\n` +
      `For any transit query, contact Sachin Chaudhary: +91 98377 55055.`;

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
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight font-light">
            Wholesale Order Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review incoming wholesaler bookings, manage dispatch logistics, and generate WhatsApp summaries.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 card-pearl bg-surface-card border-divider p-3.5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, business name, or city..."
          className="input-pearl w-full text-xs"
        />

        <div className="flex overflow-x-auto rounded-lg border border-divider bg-bg-alt p-0.5">
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
                  ? "bg-surface-card text-text-primary font-semibold shadow-sm border border-divider/60"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-pearl bg-surface-card border-divider overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-alt border-b border-divider text-text-secondary font-medium uppercase tracking-wider text-[11px]">
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
            <tbody className="divide-y divide-divider/60 text-text-primary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-secondary">
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
                    <tr key={ord.id} className="hover:bg-bg-alt/40 transition">
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-medium text-text-primary">
                        {ord.order_number}
                        <span suppressHydrationWarning className="text-[10px] text-text-secondary block font-sans">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-text-primary block">
                          {ord.customer?.business_name || "Guest Order"}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {ord.customer?.contact_person}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-text-secondary">
                        {ord.customer ? `${ord.customer.city}, ${ord.customer.state}` : "—"}
                      </td>

                      <td className="py-3.5 px-4 text-text-secondary">
                        <span className="font-medium text-text-primary">{ord.items.length}</span> models &bull;{" "}
                        <span className="font-medium text-text-primary">{totalPairs}</span> pairs
                      </td>

                      <td className="py-3.5 px-4 font-serif text-sm font-medium text-text-primary">
                        {formatINR(totalValue)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${
                            ord.status === "pending"
                              ? "bg-status-low-stock-bg text-status-low-stock border-status-low-stock-border"
                              : ord.status === "confirmed"
                              ? "bg-status-in-stock-bg text-status-in-stock border-status-in-stock-border"
                              : ord.status === "dispatched"
                              ? "bg-accent/15 text-text-primary border-accent/30"
                              : ord.status === "completed"
                              ? "bg-bg-alt text-text-primary border-divider"
                              : "bg-status-out-of-stock-bg text-status-out-of-stock border-status-out-of-stock-border"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                        <button
                          onClick={() => openOrderModal(ord)}
                          className="btn btn-outline text-[11px] py-1 px-2.5 inline-block"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="card-pearl bg-surface-card border-divider rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-divider pb-4">
              <div>
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest block font-medium">
                  Wholesale Order Details
                </span>
                <h2 className="text-xl font-serif text-text-primary mt-0.5">
                  {selectedOrder.order_number}
                </h2>
                <p className="text-xs text-text-secondary">
                  Booked on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Wholesaler Info Card */}
            {selectedOrder.customer && (
              <div className="bg-bg-alt p-4 rounded-xl border border-divider text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-medium text-text-primary text-base">
                    {selectedOrder.customer.business_name}
                  </h3>
                  {selectedOrder.customer.gst_number && (
                    <span className="font-mono text-accent text-[11px] font-medium">
                      GSTIN: {selectedOrder.customer.gst_number}
                    </span>
                  )}
                </div>
                <p className="text-text-secondary">
                  <strong className="text-text-primary font-normal">Contact Person:</strong>{" "}
                  {selectedOrder.customer.contact_person} &bull; 📞 {selectedOrder.customer.phone}
                </p>
                <p className="text-text-secondary">
                  <strong className="text-text-primary font-normal">Dispatch Address:</strong>{" "}
                  {selectedOrder.customer.address_line}, {selectedOrder.customer.city},{" "}
                  {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                </p>
              </div>
            )}

            {/* Items Table Snapshot */}
            <div>
              <h3 className="text-xs font-semibold text-text-primary mb-2 uppercase tracking-wider">
                Booked Anklet Models
              </h3>
              <div className="border border-divider rounded-xl overflow-hidden divide-y divide-divider/60">
                {selectedOrder.items.map((it) => (
                  <div
                    key={it.id}
                    className="p-3 bg-surface-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {it.primary_image && (
                        <img
                          src={it.primary_image}
                          alt={it.anklet_name_snapshot}
                          className="w-10 h-10 rounded-lg object-cover border border-divider bg-bg-alt"
                        />
                      )}
                      <div>
                        <span className="font-medium text-text-primary block">
                          {it.anklet_name_snapshot}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                          {it.quantity} pairs &times; {formatINR(it.price_snapshot)}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif text-sm font-medium text-text-primary">
                      {formatINR(it.price_snapshot * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-3 flex items-center justify-between p-3.5 bg-bg-alt border border-divider rounded-xl text-xs">
                <span className="font-medium text-text-secondary">Total Order Value:</span>
                <span className="text-base font-serif font-medium text-text-primary">
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
            <div className="bg-bg-alt p-4 rounded-xl border border-divider space-y-3">
              <h3 className="text-xs font-semibold text-text-primary">
                Update Order Status &amp; Internal Log
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Order Status
                  </label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value as OrderStatus)}
                    className="input-pearl bg-surface-card w-full text-xs"
                  >
                    <option value="pending">Pending (Awaiting Review)</option>
                    <option value="confirmed">Confirmed (Advance Received)</option>
                    <option value="dispatched">Dispatched (In Transit)</option>
                    <option value="completed">Completed (Delivered)</option>
                    <option value="cancelled">Cancelled (Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Internal Note / Tracking AWB
                  </label>
                  <input
                    type="text"
                    value={noteUpdate}
                    onChange={(e) => setNoteUpdate(e.target.value)}
                    placeholder="e.g. Sequel AWB #9981273"
                    className="input-pearl bg-surface-card w-full text-xs"
                  >
                  </input>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-divider">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={getWhatsAppShareUrl(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/15 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/25 transition"
                  >
                    <span>💬 Share Order Summary</span>
                  </a>

                  <a
                    href={getWhatsAppDispatchUrl(selectedOrder, noteUpdate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition"
                  >
                    <span>🚚 Share Dispatch / AWB</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleStatusSave}
                  disabled={saving}
                  className="btn btn-primary text-xs py-2 px-4 shadow-sm disabled:opacity-50"
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
