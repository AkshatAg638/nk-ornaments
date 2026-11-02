import { OrderWithDetails, Customer, formatINR } from "@/lib/types";

/**
 * Helper to parse weight string (e.g. "145g", "120-140g", "150 grams") into numeric grams
 */
export function parseWeightGrams(weightStr?: string | null): number {
  if (!weightStr) return 0;
  const cleaned = weightStr.toLowerCase().replace(/grams?|gm|g/g, "").trim();
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-").map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
    if (parts.length > 0) {
      return parts.reduce((a, b) => a + b, 0) / parts.length;
    }
  }
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/**
 * Escapes a cell value for standard CSV format.
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Downloads a CSV string as a file in the user's browser with UTF-8 BOM.
 */
function triggerCsvDownload(csvContent: string, fileName: string) {
  // \uFEFF is UTF-8 Byte Order Mark (BOM) to ensure Microsoft Excel and Sheets display special characters correctly.
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a list of wholesale orders to a structured CSV file compatible with Excel, Tally, and Vyapar.
 */
export function exportOrdersToCSV(orders: OrderWithDetails[], filenamePrefix = "NK_Ornaments_Wholesale_Orders") {
  if (!orders || orders.length === 0) {
    alert("No orders available to export.");
    return;
  }

  const headers = [
    "Order Number",
    "Booking Date",
    "Status",
    "Wholesale Business Name",
    "Contact Person",
    "Phone / WhatsApp",
    "GSTIN",
    "Address",
    "City",
    "State",
    "Pincode",
    "Total Models Count",
    "Total Ordered Dozens",
    "Total Ordered Pairs",
    "Batch Net Weight (Grams)",
    "Batch Net Weight (Kg)",
    "Total Order Value (INR)",
    "Itemized Breakdown",
    "Transport / AWB Tracking Note",
    "Buyer Instructions",
  ];

  const rows = orders.map((order) => {
    const totalDozens = order.items.reduce((sum, it) => sum + it.quantity, 0);
    const totalPairs = totalDozens * 12;

    let totalGrams = 0;
    let totalValue = 0;

    const itemsBreakdown = order.items
      .map((it, idx) => {
        const gramsPerPair = parseWeightGrams(it.anklet?.weight) || 30;
        const linePairs = it.quantity * 12;
        const lineGrams = linePairs * gramsPerPair;
        const lineKg = lineGrams / 1000;
        const linePrice = Math.round(lineKg * it.price_snapshot);

        totalGrams += lineGrams;
        totalValue += linePrice;

        return `${idx + 1}. ${it.anklet_name_snapshot} [SKU: ${
          it.anklet?.sku || "—"
        }, Qty: ${it.quantity} dz (${linePairs} pairs, ~${lineGrams}g) @ ₹${
          it.price_snapshot
        }/kg = ₹${linePrice}]`;
      })
      .join(" | ");

    const formattedDate = new Date(order.created_at).toISOString().split("T")[0];

    return [
      escapeCsvCell(order.order_number),
      escapeCsvCell(formattedDate),
      escapeCsvCell(order.status.toUpperCase()),
      escapeCsvCell(order.customer?.business_name || "Guest Wholesale Order"),
      escapeCsvCell(order.customer?.contact_person || "—"),
      escapeCsvCell(order.customer?.phone || order.customer?.whatsapp || "—"),
      escapeCsvCell(order.customer?.gst_number || "Unregistered / Composition"),
      escapeCsvCell(order.customer?.address_line || "—"),
      escapeCsvCell(order.customer?.city || "—"),
      escapeCsvCell(order.customer?.state || "—"),
      escapeCsvCell(order.customer?.pincode || "—"),
      escapeCsvCell(order.items.length),
      escapeCsvCell(totalDozens),
      escapeCsvCell(totalPairs),
      escapeCsvCell(totalGrams > 0 ? Math.round(totalGrams) : "—"),
      escapeCsvCell(totalGrams > 0 ? (totalGrams / 1000).toFixed(2) : "—"),
      escapeCsvCell(totalValue),
      escapeCsvCell(itemsBreakdown),
      escapeCsvCell(order.note || "—"),
      escapeCsvCell(order.note || "—"),
    ].join(",");
  });

  const csvString = [headers.join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  triggerCsvDownload(csvString, `${filenamePrefix}_${dateStr}.csv`);
}

/**
 * Exports wholesale customer profiles to CSV.
 */
export function exportCustomersToCSV(customers: Customer[], filenamePrefix = "NK_Ornaments_Wholesale_Retailers") {
  if (!customers || customers.length === 0) {
    alert("No customers available to export.");
    return;
  }

  const headers = [
    "Firm / Business Name",
    "Contact Person",
    "Phone",
    "WhatsApp",
    "Email",
    "GSTIN",
    "Dispatch Address",
    "City",
    "State",
    "Pincode",
    "Account Status",
    "Registration Date",
  ];

  const rows = customers.map((c) => [
    escapeCsvCell(c.business_name),
    escapeCsvCell(c.contact_person),
    escapeCsvCell(c.phone),
    escapeCsvCell(c.whatsapp || "—"),
    escapeCsvCell(c.email),
    escapeCsvCell(c.gst_number || "Unregistered"),
    escapeCsvCell(c.address_line),
    escapeCsvCell(c.city),
    escapeCsvCell(c.state),
    escapeCsvCell(c.pincode),
    escapeCsvCell(c.is_disabled ? "Disabled" : "Active"),
    escapeCsvCell(new Date(c.created_at).toISOString().split("T")[0]),
  ].join(","));

  const csvString = [headers.join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];
  triggerCsvDownload(csvString, `${filenamePrefix}_${dateStr}.csv`);
}
