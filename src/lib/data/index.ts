/**
 * Unified Data Layer
 *
 * Single point of access for all application data operations.
 * Dynamically dispatches between Mock Data Mode and Live Supabase Mode based on DATA_MODE.
 *
 * Rule: Components and pages must ONLY import from this file and never call
 * Supabase or mock files directly.
 */

import { isMockMode } from "./config";
import { mockDataService } from "./mock";
import { supabaseDataService } from "./supabase";
import {
  Category,
  AnkletWithImages,
  Customer,
  OrderWithDetails,
  Enquiry,
  OrderStatus,
  StorageUsageMeter,
  UserRole,
  AuthSession,
} from "@/lib/types";

function getService() {
  return isMockMode() ? mockDataService : supabaseDataService;
}

export { isMockMode };

// ===================== CATEGORIES =====================
export async function getCategories(): Promise<Category[]> {
  return getService().getCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return getService().getCategoryBySlug(slug);
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Category> {
  return getService().createCategory(data);
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category> {
  return getService().updateCategory(id, data);
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return getService().deleteCategory(id);
}

// ===================== ANKLETS =====================
export async function getAnklets(options?: {
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  limit?: number;
  offset?: number;
}): Promise<AnkletWithImages[]> {
  return getService().getAnklets(options);
}

export async function getAnkletById(id: string): Promise<AnkletWithImages | null> {
  return getService().getAnkletById(id);
}

export async function createAnklet(
  ankletData: Omit<AnkletWithImages, "id" | "created_at" | "updated_at">
): Promise<AnkletWithImages> {
  return getService().createAnklet(ankletData);
}

export async function updateAnklet(
  id: string,
  data: Partial<AnkletWithImages>
): Promise<AnkletWithImages> {
  return getService().updateAnklet(id, data);
}

export async function deleteAnklet(id: string): Promise<{ success: boolean }> {
  return getService().deleteAnklet(id);
}

export async function updateQuickStock(
  updates: { id: string; stock_quantity: number; manual_out_of_stock: boolean }[]
): Promise<{ success: boolean }> {
  return getService().updateQuickStock(updates);
}

// ===================== CUSTOMERS =====================
export async function getCustomers(): Promise<Customer[]> {
  return getService().getCustomers();
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return getService().getCustomerById(id);
}

export async function updateCustomer(
  id: string,
  data: Partial<Customer>
): Promise<Customer> {
  return getService().updateCustomer(id, data);
}

export async function createCustomer(
  data: Omit<Customer, "id" | "created_at"> & { id?: string }
): Promise<Customer> {
  return getService().createCustomer(data);
}

// ===================== ORDERS =====================
export async function getOrders(options?: {
  customerId?: string;
  status?: string;
}): Promise<OrderWithDetails[]> {
  return getService().getOrders(options);
}

export async function getOrderById(id: string): Promise<OrderWithDetails | null> {
  return getService().getOrderById(id);
}

export async function createOrder(data: {
  customer_id: string;
  note?: string;
  items: { anklet_id: string; quantity: number }[];
}): Promise<OrderWithDetails> {
  return getService().createOrder(data);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string
): Promise<OrderWithDetails> {
  return getService().updateOrderStatus(id, status, note);
}

// ===================== ENQUIRIES =====================
export async function getEnquiries(): Promise<Enquiry[]> {
  return getService().getEnquiries();
}

export async function createEnquiry(data: {
  name: string;
  phone?: string;
  email?: string;
  message: string;
}): Promise<Enquiry> {
  return getService().createEnquiry(data);
}

export async function markEnquiryRead(
  id: string,
  is_read: boolean
): Promise<Enquiry> {
  return getService().markEnquiryRead(id, is_read);
}

export async function deleteEnquiry(id: string): Promise<{ success: boolean }> {
  return getService().deleteEnquiry(id);
}

// ===================== SITE SETTINGS =====================
export async function getSiteSettings(): Promise<Record<string, string>> {
  return getService().getSiteSettings();
}

export async function updateSiteSettings(
  settings: Record<string, string>
): Promise<Record<string, string>> {
  return getService().updateSiteSettings(settings);
}

// ===================== STORAGE METER =====================
export async function getStorageUsage(): Promise<StorageUsageMeter> {
  return getService().getStorageUsage();
}

// ===================== AUTH SESSION & ROLE SWITCHER =====================
export async function getCurrentAuthUser(): Promise<AuthSession> {
  return getService().getCurrentAuthUser();
}

export async function setMockRole(role: UserRole): Promise<void> {
  return getService().setMockRole(role);
}
