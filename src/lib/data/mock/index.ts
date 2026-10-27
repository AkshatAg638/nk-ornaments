/**
 * Mock Data Service Implementation
 *
 * Fully supports all CRUD operations, filtering, stock calculations,
 * and storage meters in-memory without contacting external databases.
 */

import { getMockStore } from "./store";
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

export const mockDataService = {
  // ===================== CATEGORIES =====================
  async getCategories(): Promise<Category[]> {
    const store = getMockStore();
    return [...store.categories];
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const store = getMockStore();
    return store.categories.find((c) => c.slug === slug) || null;
  },

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<Category> {
    const store = getMockStore();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: data.description || null,
      created_at: new Date().toISOString(),
    };
    store.categories.push(newCat);
    return newCat;
  },

  async updateCategory(
    id: string,
    data: Partial<Category>
  ): Promise<Category> {
    const store = getMockStore();
    const index = store.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    store.categories[index] = { ...store.categories[index], ...data };
    return store.categories[index];
  },

  async deleteCategory(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    const store = getMockStore();
    // Rule: block delete if anklets exist in this category
    const hasAnklets = store.anklets.some((a) => a.category_id === id);
    if (hasAnklets) {
      return {
        success: false,
        error: "Cannot delete category: existing anklets are assigned to it. Move or delete them first.",
      };
    }
    store.categories = store.categories.filter((c) => c.id !== id);
    return { success: true };
  },

  // ===================== ANKLETS =====================
  async getAnklets(options?: {
    categorySlug?: string;
    categoryId?: string;
    search?: string;
    activeOnly?: boolean;
    stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
    limit?: number;
    offset?: number;
  }): Promise<AnkletWithImages[]> {
    const store = getMockStore();
    let result = [...store.anklets];

    // Filter by active
    if (options?.activeOnly) {
      result = result.filter((a) => a.is_active);
    }

    // Filter by category slug
    if (options?.categorySlug) {
      const cat = store.categories.find((c) => c.slug === options.categorySlug);
      if (cat) {
        result = result.filter((a) => a.category_id === cat.id);
      } else {
        return [];
      }
    }

    // Filter by category ID
    if (options?.categoryId) {
      result = result.filter((a) => a.category_id === options.categoryId);
    }

    // Filter by search query
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.sku.toLowerCase().includes(q) ||
          (a.material && a.material.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Filter by stock status
    if (options?.stockStatus && options.stockStatus !== "all") {
      result = result.filter((a) => {
        const isOut = a.stock_quantity <= 0 || a.manual_out_of_stock;
        const isLow = !isOut && a.stock_quantity <= a.low_stock_threshold;
        if (options.stockStatus === "out_of_stock") return isOut;
        if (options.stockStatus === "low_stock") return isLow;
        if (options.stockStatus === "in_stock") return !isOut && !isLow;
        return true;
      });
    }

    // Attach category details to each anklet
    result = result.map((a) => {
      const cat = store.categories.find((c) => c.id === a.category_id);
      return { ...a, category: cat };
    });

    if (options?.offset) {
      result = result.slice(options.offset);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  },

  async getAnkletById(id: string): Promise<AnkletWithImages | null> {
    const store = getMockStore();
    const item = store.anklets.find((a) => a.id === id);
    if (!item) return null;
    const cat = store.categories.find((c) => c.id === item.category_id);
    return { ...item, category: cat };
  },

  async createAnklet(
    ankletData: Omit<AnkletWithImages, "id" | "created_at" | "updated_at">
  ): Promise<AnkletWithImages> {
    const store = getMockStore();
    const id = `anklet-${Date.now()}`;
    const now = new Date().toISOString();

    const newAnklet: AnkletWithImages = {
      ...ankletData,
      id,
      created_at: now,
      updated_at: now,
      images: (ankletData.images || []).map((img, idx) => ({
        ...img,
        id: `img-${id}-${idx}`,
        anklet_id: id,
        sort_order: idx,
        is_primary: idx === 0,
      })),
    };

    store.anklets.unshift(newAnklet);
    return newAnklet;
  },

  async updateAnklet(
    id: string,
    data: Partial<AnkletWithImages>
  ): Promise<AnkletWithImages> {
    const store = getMockStore();
    const idx = store.anklets.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Anklet not found");

    store.anklets[idx] = {
      ...store.anklets[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return store.anklets[idx];
  },

  async deleteAnklet(id: string): Promise<{ success: boolean }> {
    const store = getMockStore();
    store.anklets = store.anklets.filter((a) => a.id !== id);
    return { success: true };
  },

  async updateQuickStock(
    updates: { id: string; stock_quantity: number; manual_out_of_stock: boolean }[]
  ): Promise<{ success: boolean }> {
    const store = getMockStore();
    for (const update of updates) {
      const anklet = store.anklets.find((a) => a.id === update.id);
      if (anklet) {
        anklet.stock_quantity = update.stock_quantity;
        anklet.manual_out_of_stock = update.manual_out_of_stock;
        anklet.updated_at = new Date().toISOString();
      }
    }
    return { success: true };
  },

  // ===================== CUSTOMERS =====================
  async getCustomers(): Promise<Customer[]> {
    const store = getMockStore();
    return [...store.customers];
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const store = getMockStore();
    return store.customers.find((c) => c.id === id) || null;
  },

  async updateCustomer(
    id: string,
    data: Partial<Customer>
  ): Promise<Customer> {
    const store = getMockStore();
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Customer not found");
    store.customers[idx] = { ...store.customers[idx], ...data };
    return store.customers[idx];
  },

  async createCustomer(
    data: Omit<Customer, "id" | "created_at">
  ): Promise<Customer> {
    const store = getMockStore();
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.customers.unshift(newCustomer);
    return newCustomer;
  },

  // ===================== ORDERS =====================
  async getOrders(options?: {
    customerId?: string;
    status?: string;
  }): Promise<OrderWithDetails[]> {
    const store = getMockStore();
    let result = [...store.orders];

    if (options?.customerId) {
      result = result.filter((o) => o.customer_id === options.customerId);
    }
    if (options?.status && options.status !== "all") {
      result = result.filter((o) => o.status === options.status);
    }

    return result;
  },

  async getOrderById(id: string): Promise<OrderWithDetails | null> {
    const store = getMockStore();
    return store.orders.find((o) => o.id === id) || null;
  },

  async createOrder(data: {
    customer_id: string;
    note?: string;
    items: { anklet_id: string; quantity: number }[];
  }): Promise<OrderWithDetails> {
    const store = getMockStore();
    const customer = store.customers.find((c) => c.id === data.customer_id);
    if (!customer) throw new Error("Customer profile required to place order");

    const orderId = `ord-${Date.now()}`;
    const orderNumber = `NK-ORD-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const orderItems = data.items.map((item, idx) => {
      const anklet = store.anklets.find((a) => a.id === item.anklet_id);
      if (!anklet) throw new Error(`Anklet not found: ${item.anklet_id}`);

      // Reduce stock in mock mode
      anklet.stock_quantity = Math.max(0, anklet.stock_quantity - item.quantity);

      return {
        id: `item-${orderId}-${idx}`,
        order_id: orderId,
        anklet_id: anklet.id,
        anklet_name_snapshot: anklet.name,
        price_snapshot: anklet.wholesale_price,
        quantity: item.quantity,
        primary_image: anklet.images?.[0]?.public_url,
      };
    });

    const newOrder: OrderWithDetails = {
      id: orderId,
      order_number: orderNumber,
      customer_id: data.customer_id,
      status: "pending",
      note: data.note || null,
      created_at: new Date().toISOString(),
      customer,
      items: orderItems,
    };

    store.orders.unshift(newOrder);
    return newOrder;
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<OrderWithDetails> {
    const store = getMockStore();
    const order = store.orders.find((o) => o.id === id);
    if (!order) throw new Error("Order not found");

    // If order was cancelled, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const anklet = store.anklets.find((a) => a.id === item.anklet_id);
        if (anklet) {
          anklet.stock_quantity += item.quantity;
        }
      }
    }

    order.status = status;
    if (note !== undefined) order.note = note;
    return order;
  },

  // ===================== ENQUIRIES =====================
  async getEnquiries(): Promise<Enquiry[]> {
    const store = getMockStore();
    return [...store.enquiries];
  },

  async createEnquiry(data: {
    name: string;
    phone?: string;
    email?: string;
    message: string;
  }): Promise<Enquiry> {
    const store = getMockStore();
    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}`,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      message: data.message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    store.enquiries.unshift(newEnquiry);
    return newEnquiry;
  },

  async markEnquiryRead(id: string, is_read: boolean): Promise<Enquiry> {
    const store = getMockStore();
    const enq = store.enquiries.find((e) => e.id === id);
    if (!enq) throw new Error("Enquiry not found");
    enq.is_read = is_read;
    return enq;
  },

  async deleteEnquiry(id: string): Promise<{ success: boolean }> {
    const store = getMockStore();
    store.enquiries = store.enquiries.filter((e) => e.id !== id);
    return { success: true };
  },

  // ===================== SITE SETTINGS =====================
  async getSiteSettings(): Promise<Record<string, string>> {
    const store = getMockStore();
    return { ...store.settings };
  },

  async updateSiteSettings(
    newSettings: Record<string, string>
  ): Promise<Record<string, string>> {
    const store = getMockStore();
    store.settings = { ...store.settings, ...newSettings };
    return { ...store.settings };
  },

  // ===================== STORAGE USAGE =====================
  async getStorageUsage(): Promise<StorageUsageMeter> {
    const store = getMockStore();
    let totalBytes = 0;
    let imageCount = 0;

    for (const anklet of store.anklets) {
      if (anklet.images) {
        for (const img of anklet.images) {
          totalBytes += img.size_bytes || 150000;
          imageCount++;
        }
      }
    }

    const maxBytes = 1024 * 1024 * 1024; // 1 GB free tier limit
    const percentage = Math.min(100, Math.round((totalBytes / maxBytes) * 10000) / 100);

    return {
      usedBytes: totalBytes,
      totalBytes: maxBytes,
      percentage,
      isWarning: percentage >= 80,
      imageCount,
    };
  },

  // ===================== AUTH & ROLE SWITCHER =====================
  async getCurrentAuthUser(): Promise<AuthSession> {
    const store = getMockStore();
    let role = store.activeRole || "visitor";
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieRole = cookieStore.get("nk_mock_role")?.value as UserRole | undefined;
      if (cookieRole && ["admin", "customer", "visitor"].includes(cookieRole)) {
        role = cookieRole;
      }
    } catch {
      // Running outside request context
    }

    if (role === "admin") {
      return {
        user: { id: "mock-admin-id", email: "admin@nkornaments.com" },
        role: "admin",
      };
    }

    if (role === "customer") {
      const customer = store.customers[0];
      return {
        user: { id: customer.id, email: customer.email },
        role: "customer",
        customerProfile: customer,
      };
    }

    return {
      user: null,
      role: "visitor",
    };
  },

  async setMockRole(role: UserRole): Promise<void> {
    const store = getMockStore();
    store.activeRole = role;
  },
};
