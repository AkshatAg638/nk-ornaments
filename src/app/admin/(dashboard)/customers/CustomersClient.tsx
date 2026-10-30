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
          <h1 className="text-2xl sm:text-3xl font-serif text-text-primary tracking-tight font-light">
            Wholesale Customers &amp; Retailers
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
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
          className="input-pearl w-full text-xs"
        />
      </div>

      {/* Table */}
      <div className="card-pearl bg-surface-card border-divider overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-alt border-b border-divider text-text-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Business &amp; GST</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/60 text-text-primary">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    No registered wholesalers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((cust) => (
                  <tr key={cust.id} className="hover:bg-bg-alt/40 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="font-medium text-text-primary block">
                        {cust.business_name}
                      </span>
                      {cust.gst_number ? (
                        <span className="font-mono text-[10px] text-accent font-medium">
                          GST: {cust.gst_number}
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-secondary">
                          No GST provided
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-text-primary block">{cust.contact_person}</span>
                      <span className="text-[10px] text-text-secondary">{cust.email}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-text-secondary">
                      <div className="text-text-primary">📞 {cust.phone}</div>
                      {cust.whatsapp && (
                        <div className="text-accent text-[10px] font-medium">
                          💬 {cust.whatsapp}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-text-secondary">
                      <span className="text-text-primary block font-medium">{cust.city}, {cust.state}</span>
                      <span className="text-[10px] text-text-secondary">{cust.pincode}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          cust.is_disabled
                            ? "bg-status-out-of-stock-bg text-status-out-of-stock border-status-out-of-stock-border"
                            : "bg-status-in-stock-bg text-status-in-stock border-status-in-stock-border"
                        }`}
                      >
                        {cust.is_disabled ? "Disabled" : "Active"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <button
                        onClick={() => handleToggleDisable(cust)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                          cust.is_disabled
                            ? "bg-status-in-stock-bg text-status-in-stock hover:bg-emerald-100 border-status-in-stock-border"
                            : "bg-status-out-of-stock-bg text-status-out-of-stock hover:bg-rose-100 border-status-out-of-stock-border"
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
