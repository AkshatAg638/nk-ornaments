import { parseWeightGrams } from "./exportCsv";

export const PAIRS_PER_DOZEN = 12;

/**
 * Calculates item weight in grams and kilograms.
 * 1 Dozen = 12 Pairs.
 * Weight in database is stored per pair (e.g. "30g / pair", "30g", "45g").
 */
export function calculateItemWeight(quantityDozens: number, weightStr?: string | null) {
  const safeDozens = Math.max(1, Number(quantityDozens) || 1);
  const gramsPerPair = parseWeightGrams(weightStr) || 30; // fallback default 30g
  const totalPairs = safeDozens * PAIRS_PER_DOZEN;
  const totalGrams = Math.round(totalPairs * gramsPerPair);
  const totalKg = Number((totalGrams / 1000).toFixed(3));

  return {
    gramsPerPair,
    totalPairs,
    totalGrams,
    totalKg,
    quantityDozens: safeDozens,
  };
}

/**
 * Calculates item wholesale value from weight and wholesale rate per kg.
 * Price = (Total Net Weight in Kg) * (Wholesale Rate per Kg)
 * @param quantityDozens Number of dozens (e.g. 1 dz, 2 dz)
 * @param ratePerKg Wholesale rate in ₹ / kg (e.g. ₹3,000 / kg)
 * @param weightStr Weight string per pair (e.g. "30g / pair")
 */
export function calculateItemPrice(
  quantityDozens: number,
  ratePerKg: number,
  weightStr?: string | null
) {
  const { gramsPerPair, totalPairs, totalGrams, totalKg, quantityDozens: safeDozens } =
    calculateItemWeight(quantityDozens, weightStr);

  const safeRate = Number(ratePerKg) || 0;
  // Total line price = Total Kg * Rate per Kg
  const estimatedPrice = Math.round(totalKg * safeRate);
  // Also price for 1 single dozen for reference display
  const pricePerDozen = Math.round(((gramsPerPair * PAIRS_PER_DOZEN) / 1000) * safeRate);

  return {
    estimatedPrice,
    pricePerDozen,
    totalKg,
    totalGrams,
    totalPairs,
    gramsPerPair,
    quantityDozens: safeDozens,
  };
}

/**
 * Converts a numerical amount in INR to words in the Indian numbering system.
 * e.g. 1080 -> "One Thousand Eighty Rupees Only"
 */
export function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";

  const single = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function formatBelowThousand(n: number): string {
    let str = "";
    if (n >= 100) {
      str += single[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 ? " " + single[n % 10] : "");
    } else if (n > 0) {
      str += single[n];
    }
    return str.trim();
  }

  const intPart = Math.floor(num);
  let remaining = intPart;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundred = remaining;

  const parts: string[] = [];
  if (crore > 0) parts.push(formatBelowThousand(crore) + " Crore");
  if (lakh > 0) parts.push(formatBelowThousand(lakh) + " Lakh");
  if (thousand > 0) parts.push(formatBelowThousand(thousand) + " Thousand");
  if (hundred > 0) parts.push(formatBelowThousand(hundred));

  return (parts.join(" ").trim() || "Zero") + " Rupees Only";
}
