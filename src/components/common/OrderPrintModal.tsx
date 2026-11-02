"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { OrderWithDetails, Customer, formatINR } from "@/lib/types";
import { calculateItemPrice, PAIRS_PER_DOZEN, numberToIndianWords } from "@/lib/pricing";

export interface PrintableOrderInput {
  order_number: string;
  created_at: string;
  status: string;
  note?: string | null;
  customer?: Partial<Customer> | null;
  items: {
    id?: string;
    anklet_name_snapshot: string;
    price_snapshot: number;
    quantity: number;
    anklet?: {
      sku?: string;
      weight?: string | null;
      material?: string | null;
    } | null;
  }[];
}

interface OrderPrintModalProps {
  order: OrderWithDetails | PrintableOrderInput;
  onClose: () => void;
}

export default function OrderPrintModal({ order, onClose }: OrderPrintModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add("print-modal-open");
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("print-modal-open");
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const totalDozens = order.items.reduce((sum, it) => sum + it.quantity, 0);
  const totalPairs = totalDozens * PAIRS_PER_DOZEN;
  const totalGrams = order.items.reduce((sum, it) => {
    const calc = calculateItemPrice(it.quantity, it.price_snapshot, it.anklet?.weight);
    return sum + calc.totalGrams;
  }, 0);
  const totalValue = order.items.reduce((sum, it) => {
    const calc = calculateItemPrice(it.quantity, it.price_snapshot, it.anklet?.weight);
    return sum + calc.estimatedPrice;
  }, 0);

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  function handlePrint() {
    window.print();
  }

  if (!mounted) return null;

  return createPortal(
    <div
      id="nk-print-portal"
      className="print-modal-backdrop fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex items-start justify-center"
    >
      {/* Print isolation stylesheet for 100% clean A4 printout */}
      <style>{`
        @media print {
          /* Hide EVERYTHING in body except this portal */
          body > *:not(#nk-print-portal) {
            display: none !important;
          }
          #nk-print-portal {
            position: static !important;
            inset: auto !important;
            display: block !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
          #nk-print-portal .print-toolbar {
            display: none !important;
          }
          #nk-print-portal .print-modal-card {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: transparent !important;
          }
          #printable-slip {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      <div className="print-modal-card w-full max-w-4xl my-4 sm:my-8 space-y-4">
        {/* On-Screen Action Toolbar (Hidden during print) */}
        <div className="print-toolbar bg-surface-card border border-divider rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧾</span>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Wholesale Estimate / Bill Receipt
              </h3>
              <p className="text-[11px] text-text-secondary">
                Original Mathura factory invoice format. Ready for A4 print or Save as PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="btn btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              <span>Print Bill Slip / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary text-xs py-2 px-4 hover:bg-bg-alt"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Sheet (Original Indian Jewelry Wholesale Bill Format) */}
        <div
          id="printable-slip"
          className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-2xl border border-slate-300 font-sans print:shadow-none print:border-none print:p-0 print:m-0"
        >
          {/* Top Auspicious Shloka */}
          <div className="text-center mb-2">
            <p className="font-serif text-xs font-semibold text-slate-700 tracking-[0.25em]">
              ॥ श्री गणेशाय नमः ॥
            </p>
          </div>

          {/* Firm Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <img
                  src="/brand-logo.png"
                  alt="N.K. Ornaments Logo"
                  className="w-16 h-16 rounded-full object-cover border border-slate-400 shadow-xs shrink-0"
                />
                <div>
                  <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-950 uppercase">
                    N.K. ORNAMENTS
                  </h1>
                  <p className="text-xs font-bold text-slate-800 tracking-wider mt-0.5 uppercase">
                    FINE GERMAN SILVER PAYAL &bull; FACTORY MANUFACTURERS &amp; WHOLESALERS
                  </p>
                  <div className="text-[11px] text-slate-600 mt-1.5 space-y-0.5 leading-relaxed">
                    <p>
                      <strong className="text-slate-900">Workshop &amp; Dispatch:</strong> Near Hathras Kachodi Wala, Chowk Bazar, Mathura - 281001 (U.P.)
                    </p>
                    <p>
                      <strong className="text-slate-900">Proprietor:</strong> Sachin Chaudhary &bull;{" "}
                      <strong className="text-slate-900">Phone / WhatsApp:</strong> +91 98377 55055, +91 98370 00000
                    </p>
                    <p>
                      <strong className="text-slate-900">Specialization:</strong> Ghungroo, Antique Chot, Bridal &amp; Fancy Payal (All Varieties)
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill Details Box */}
              <div className="sm:text-right bg-slate-50 border-2 border-slate-900 p-3 sm:p-4 rounded-lg min-w-[220px]">
                <div className="text-[11px] font-bold uppercase tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded text-center">
                  ESTIMATE / BILL RECEIPT
                </div>
                <div className="text-[10px] text-slate-600 text-center font-medium mt-0.5">
                  (कच्चा बिल / अनुमान पर्ची)
                </div>
                <div className="mt-2.5 text-sm font-bold font-mono text-slate-950">
                  #{order.order_number}
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  Date: <span className="font-bold text-slate-950">{formattedDate}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Dispatch: <span className="font-medium text-slate-800">Chowk Bazar Counter</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consignee / Retailer Details */}
          <div className="my-4 p-4 bg-slate-50 border border-slate-300 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Billed To (ग्राहक का नाम व पता):
              </span>
              <p className="font-bold text-sm text-slate-950">
                M/s {order.customer?.business_name || "Wholesale Counter Retailer"}
              </p>
              {order.customer?.contact_person && (
                <p className="text-slate-700 mt-0.5">
                  <strong className="text-slate-900">Attn:</strong> {order.customer.contact_person}
                </p>
              )}
              {(order.customer?.phone || order.customer?.whatsapp) && (
                <p className="text-slate-700 mt-0.5">
                  <strong className="text-slate-900">Phone / Mo:</strong>{" "}
                  {order.customer?.phone || order.customer?.whatsapp}
                </p>
              )}
              {order.customer?.gst_number ? (
                <p className="text-slate-700 font-mono mt-0.5">
                  <strong className="text-slate-900">GSTIN:</strong> {order.customer.gst_number}
                </p>
              ) : (
                <p className="text-slate-500 text-[10px] mt-0.5">Trade Buyer (Unregistered)</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Destination Station / Transport:
              </span>
              <p className="text-slate-800 leading-relaxed">
                {order.customer?.address_line ? (
                  <>
                    {order.customer.address_line}
                    <br />
                    {order.customer.city || "Mathura"}, {order.customer.state || "Uttar Pradesh"} -{" "}
                    {order.customer.pincode || "281001"}
                  </>
                ) : (
                  order.customer?.city ? `${order.customer.city}, ${order.customer.state || "U.P."}` : "Mathura Workshop Counter Delivery"
                )}
              </p>
              {order.note && (
                <div className="mt-2 text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-300">
                  <strong className="text-slate-900">Special Packing Note:</strong> {order.note}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Bill Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full text-left text-xs border-collapse border border-slate-900">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-950 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center border-r border-slate-300">क्र.</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">विवरण (Item / Payal Model)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">मार्क (SKU)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">वज़न/जोड़ी</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">मात्रा (Qty)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">कुल वज़न (Batch)</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-300">भाव (₹/kg)</th>
                  <th className="py-2.5 px-3 text-right">रकम (Amount ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-800">
                {order.items.map((it, idx) => {
                  const calc = calculateItemPrice(it.quantity, it.price_snapshot, it.anklet?.weight);
                  const itemWeight = it.anklet?.weight || "—";
                  return (
                    <tr key={it.id || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 border-r border-slate-300">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-300">
                        <span className="font-bold text-slate-950 block text-[13px]">
                          {it.anklet_name_snapshot}
                        </span>
                        {it.anklet?.material && (
                          <span className="text-[10px] text-slate-600 font-medium">
                            {it.anklet.material}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-700 border-r border-slate-300 font-semibold">
                        {it.anklet?.sku || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-700 border-r border-slate-300">
                        {itemWeight}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-950 border-r border-slate-300">
                        {it.quantity} dz ({calc.totalPairs} pairs)
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-900 border-r border-slate-300 font-semibold">
                        ~{calc.totalGrams}g ({calc.totalKg} kg)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900 border-r border-slate-300">
                        ₹{it.price_snapshot.toLocaleString("en-IN")}/kg
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950 text-sm">
                        {formatINR(calc.estimatedPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculations, Words & Summary Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4 pt-2 border-t-2 border-slate-900">
            {/* Left: Amount in Words & Terms */}
            <div className="space-y-3">
              {/* Amount in words */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Amount in Words (शब्दों में):
                </span>
                <p className="font-serif font-bold text-slate-950 text-xs mt-1">
                  {numberToIndianWords(totalValue)}
                </p>
              </div>

              {/* Wholesale Terms */}
              <div className="text-[10px] text-slate-600 space-y-1 leading-relaxed">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                  शर्तें एवं नियम (Wholesale Terms &amp; Conditions):
                </p>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>
                    माल जर्मन सिल्वर अलॉय (German Silver White Metal) का है। इसमें वास्तविक चाँदी नहीं होती है।
                  </li>
                  <li>
                    भाव व वज़न मथुरा वर्कशॉप काउंटर के नियमानुसार कुल वज़न (₹/kg) पर निकाला गया है।
                  </li>
                  <li>
                    ट्रांसपोर्ट भाड़ा / कूरियर व जीएसटी नियमानुसार अलग से देय होगा।
                  </li>
                  <li>
                    माल प्राप्ति के 24 घंटे के उपरांत किसी भी प्रकार की शिकायत मान्य नहीं होगी।
                  </li>
                  <li>
                    समस्त विवादों का न्यायक्षेत्र केवल मथुरा न्यायालय रहेगा (Subject to Mathura Jurisdiction)।
                  </li>
                </ol>
              </div>
            </div>

            {/* Right: Batch Totals */}
            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-900 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>कुल डिज़ाइन (Total Models):</span>
                <span className="font-bold text-slate-950">{order.items.length} designs</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>कुल मात्रा (Total Ordered):</span>
                <span className="font-bold text-slate-950">{totalDozens} Dozen ({totalPairs} Pairs)</span>
              </div>
              {totalGrams > 0 && (
                <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-1.5">
                  <span>कुल शुद्ध वज़न (Total Net Alloy Wt):</span>
                  <span className="font-mono font-bold text-slate-950 text-sm">
                    ~{Math.round(totalGrams).toLocaleString("en-IN")}g ({(totalGrams / 1000).toFixed(3)} kg)
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-900 pt-2 border-t-2 border-slate-900">
                <span className="font-bold text-sm">कुल रकम (Total Wholesale Value):</span>
                <span className="font-bold font-mono text-lg text-slate-950">
                  {formatINR(totalValue)}
                </span>
              </div>
              <div className="pt-1.5 border-t border-slate-300 text-[10px] text-slate-500 text-right">
                * Rates ex-factory Mathura Chowk Bazar calculated on total batch weight @ ₹/kg
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-10 pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">
                ग्राहक / प्रापक के हस्ताक्षर (Receiver&apos;s Seal &amp; Sign):
              </p>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-900 tracking-wider">
                वास्ते: N.K. ORNAMENTS (मथुरा)
              </p>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
              <p className="text-[11px] font-bold text-slate-950 mt-1">
                सचिन चौधरी (अधिकृत हस्ताक्षरकर्ता / Authorized Signatory)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
