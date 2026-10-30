"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        business_name: businessName,
        contact_person: contactPerson,
        email,
        password,
        phone,
        whatsapp: whatsapp || phone,
        gst_number: gstNumber ? gstNumber.trim().toUpperCase() : undefined,
        address_line: addressLine,
        city,
        state,
        pincode,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      router.push("/varieties");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-status-out-of-stock-bg border border-status-out-of-stock/25 text-status-out-of-stock-text text-xs">
          {error}
        </div>
      )}

      {/* Business & Contact Person */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Jewelry Firm / Showroom Name *
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Royal Jewellers"
            className="input-pearl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Proprietor / Contact Person *
          </label>
          <input
            type="text"
            required
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            className="input-pearl text-xs"
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="orders@royaljewellers.com"
            className="input-pearl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Mobile / WhatsApp *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="input-pearl text-xs"
          />
        </div>
      </div>

      {/* GST Number */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-text-secondary">
            GSTIN (GST Number)
          </label>
          <span className="text-[11px] text-text-secondary">
            Optional &bull; Required for tax invoice
          </span>
        </div>
        <input
          type="text"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          placeholder="09AAAAA0000A1Z5"
          className="input-pearl text-xs uppercase font-mono"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Shop / Dispatch Address *
        </label>
        <input
          type="text"
          required
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          placeholder="Shop No. 12, Sarafa Bazar"
          className="input-pearl text-xs"
        />
      </div>

      {/* City, State, Pincode (mobile-first responsive grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            City *
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Jaipur"
            className="input-pearl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            State *
          </label>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Rajasthan"
            className="input-pearl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Pincode *
          </label>
          <input
            type="text"
            required
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="302001"
            className="input-pearl text-xs font-mono"
          />
        </div>
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Create Password *
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="input-pearl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Confirm Password *
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="input-pearl text-xs"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3.5 text-xs font-semibold tracking-wide disabled:opacity-50"
        >
          {loading ? "Registering Showroom..." : "Register & View Wholesale Rates"}
        </button>
      </div>

      <p className="text-center text-xs text-text-secondary pt-1">
        Already registered?{" "}
        <Link href="/login" className="text-accent hover:underline font-semibold">
          Sign In here &rarr;
        </Link>
      </p>
    </form>
  );
}
