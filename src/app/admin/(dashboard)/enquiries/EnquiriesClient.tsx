"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Enquiry } from "@/lib/types";

interface EnquiriesClientProps {
  initialEnquiries: Enquiry[];
}

export default function EnquiriesClient({
  initialEnquiries,
}: EnquiriesClientProps) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  async function handleToggleRead(enquiry: Enquiry) {
    const newStatus = !enquiry.is_read;
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update enquiry status");

      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiry.id ? { ...e, is_read: newStatus } : e))
      );
      router.refresh();
    } catch {
      alert("Failed to update status");
    }
  }

  async function handleDelete(enquiry: Enquiry) {
    if (!confirm(`Are you sure you want to delete enquiry from "${enquiry.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete enquiry");

      setEnquiries((prev) => prev.filter((e) => e.id !== enquiry.id));
      router.refresh();
    } catch {
      alert("Failed to delete enquiry");
    }
  }

  const filtered = enquiries.filter((e) => {
    if (filter === "unread") return !e.is_read;
    if (filter === "read") return e.is_read;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight font-light">
            Trade Inquiries &amp; Quotations
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Incoming wholesale enquiries from potential jewelry retailers across India.
          </p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-divider bg-bg-alt p-0.5 self-start">
          {[
            { id: "all", label: `All (${enquiries.length})` },
            { id: "unread", label: `Unread (${enquiries.filter((e) => !e.is_read).length})` },
            { id: "read", label: `Read (${enquiries.filter((e) => e.is_read).length})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as "all" | "unread" | "read")}
              className={`py-1.5 px-3 text-[11px] font-medium rounded-md transition ${
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

      {/* Enquiries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full card-pearl bg-surface-card border-divider rounded-2xl py-12 text-center text-text-secondary text-xs">
            No trade inquiries found under this filter.
          </div>
        ) : (
          filtered.map((enq) => {
            const cleanPhone = (enq.phone || "").replace(/[^0-9]/g, "");
            return (
              <div
                key={enq.id}
                className={`card-pearl bg-surface-card rounded-2xl p-5 flex flex-col justify-between transition ${
                  !enq.is_read
                    ? "border-accent/40 ring-1 ring-accent/20 shadow-sm"
                    : "border-divider"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary text-sm">
                        {enq.name}
                      </span>
                      {!enq.is_read && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-accent text-white shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>
                    <span suppressHydrationWarning className="text-[10px] text-text-secondary font-mono">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-text-primary leading-relaxed bg-bg-alt p-3.5 rounded-xl border border-divider mb-3 italic">
                    &ldquo;{enq.message}&rdquo;
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                    {enq.phone && <span>📞 {enq.phone}</span>}
                    {enq.email && <span>✉️ {enq.email}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-divider">
                  <div className="flex items-center gap-2">
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hello ${enq.name}, thank you for contacting N.K. Ornaments regarding your inquiry: "${enq.message.slice(0, 50)}..."`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#25D366]/15 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/25 transition"
                      >
                        Reply on WhatsApp
                      </a>
                    )}
                    {enq.email && (
                      <a
                        href={`mailto:${enq.email}?subject=${encodeURIComponent(
                          "N.K. Ornaments Wholesale Inquiry"
                        )}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-bg-alt border border-divider text-text-secondary hover:text-text-primary transition"
                      >
                        Email
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleRead(enq)}
                      className="px-2 py-1 text-[11px] text-text-secondary hover:text-text-primary transition"
                    >
                      {enq.is_read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => handleDelete(enq)}
                      className="p-1 text-status-out-of-stock hover:text-rose-700 transition"
                      title="Delete inquiry"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
