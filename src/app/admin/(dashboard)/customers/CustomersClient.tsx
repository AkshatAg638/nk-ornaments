"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Customer } from "@/lib/types";

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export default function CustomersClient({
  initialCustomers,
}: CustomersClientProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");

  async function handleToggleDisable(customer: Customer) {
    const newStatus = !customer.is_disabled;
    const actionName = newStatus ? "disable" : "enable";
    if (
      !confirm(
        `Are you sure you want to ${actionName} "${customer.business_name}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_disabled: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update customer status");

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customer.id ? { ...c, is_disabled: newStatus } : c
        )
      );
      router.refresh();
    } catch {
      alert("Failed to update customer account status");
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.business_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_person.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      (c.gst_number || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Wholesale Customers &amp; Retailers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered wholesale jewelry businesses, GSTIN verifications, and delivery addresses.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by business name, GST, city, or contact..."
          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Business &amp; GST</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No registered wholesalers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 sm:px-6">
                      <span className="font-semibold text-white block">
                        {cust.business_name}
                      </span>
                      {cust.gst_number ? (
                        <span className="font-mono text-[10px] text-amber-400">
                          GST: {cust.gst_number}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          No GST provided
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-white block">{cust.contact_person}</span>
                      <span className="text-[10px] text-slate-400">{cust.email}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      <div>📞 {cust.phone}</div>
                      {cust.whatsapp && (
                        <div className="text-emerald-400 text-[10px]">
                          💬 {cust.whatsapp}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      <span className="text-white block">{cust.city}, {cust.state}</span>
                      <span className="text-[10px] text-slate-500">{cust.pincode}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          cust.is_disabled
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {cust.is_disabled ? "Disabled" : "Active"}
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleToggleDisable(cust)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                          cust.is_disabled
                            ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30"
                        }`}
                      >
                        {cust.is_disabled ? "Enable Account" : "Disable Account"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
