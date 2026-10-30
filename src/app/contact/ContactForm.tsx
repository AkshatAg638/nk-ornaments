"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submittedData, setSubmittedData] = useState<{
    name: string;
    phone: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit enquiry");

      setSubmittedData({ name, phone, message });
      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error sending message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-status-in-stock-bg border border-status-in-stock/25 rounded-xl p-4 text-xs text-status-in-stock-text space-y-3">
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-status-in-stock shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <span className="font-semibold block text-sm">Inquiry Submitted Successfully!</span>
              <span className="text-text-secondary mt-0.5 block leading-relaxed">
                Your message has been received at our Mathura workshop. For an immediate reply or live photo catalog, chat directly with Sachin Chaudhary on WhatsApp below.
              </span>
            </div>
          </div>
          {submittedData && (
            <a
              href={`https://wa.me/919837755055?text=${encodeURIComponent(
                `Hello Sachin ji, I just submitted an inquiry on N.K. Ornaments.\n\n*Name:* ${submittedData.name}\n*Phone:* ${submittedData.phone}\n*Inquiry:* ${submittedData.message}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span>Chat with Sachin Chaudhary on WhatsApp &rarr;</span>
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="bg-status-out-of-stock-bg border border-status-out-of-stock/25 rounded-xl p-4 text-xs text-status-out-of-stock-text">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Full Name / Firm Contact *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ramesh Chandra (Chandra Jewellers)"
          className="input-pearl text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Phone / WhatsApp Number *
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98290 12345"
            className="input-pearl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. trade@firm.com"
            className="input-pearl text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Inquiry Details / Requirements *
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Specify models of interest, estimated monthly pair requirements, custom design needs, or questions..."
          className="input-pearl text-xs resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full py-3.5 text-xs font-medium tracking-wide disabled:opacity-50"
      >
        {loading ? "Sending Inquiry..." : "Submit Trade Inquiry"}
      </button>
    </form>
  );
}
