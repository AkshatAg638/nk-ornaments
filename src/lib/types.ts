/**
 * Database type definitions
 *
 * These mirror the Supabase tables defined in 001_initial_schema.sql.
 * They provide compile-time type safety throughout the app.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Anklet {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  description: string | null;
  material: string | null;
  weight: string | null;
  length: string | null;
  colour: string | null;
  wholesale_price: number;
  min_order_qty: number;
  stock_quantity: number;
  low_stock_threshold: number;
  manual_out_of_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnkletImage {
  id: string;
  anklet_id: string;
  storage_path: string;
  public_url: string;
  size_bytes: number;
  is_primary: boolean;
  sort_order: number;
}

export interface Customer {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  gst_number: string | null;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_disabled: boolean;
  created_at: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "dispatched"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  anklet_id: string;
  anklet_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
}

export interface Admin {
  user_id: string;
  created_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}

/**
 * Helper: determine if an anklet is effectively out of stock.
 * Used consistently across admin panel and public site.
 */
export function isOutOfStock(anklet: Pick<Anklet, "stock_quantity" | "manual_out_of_stock">): boolean {
  return anklet.stock_quantity <= 0 || anklet.manual_out_of_stock;
}

/**
 * Helper: determine if an anklet is in low-stock state.
 */
export function isLowStock(
  anklet: Pick<Anklet, "stock_quantity" | "low_stock_threshold" | "manual_out_of_stock">
): boolean {
  if (isOutOfStock(anklet)) return false; // out-of-stock takes priority
  return anklet.stock_quantity <= anklet.low_stock_threshold;
}
