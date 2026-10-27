/**
 * Supabase Data Service Implementation
 *
 * Interacts with real Supabase database and storage bucket when DATA_MODE=supabase.
 * Returns only real database data (or empty arrays/null with friendly empty states).
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Category,
  AnkletWithImages,
  Customer,
  OrderWithDetails,
  Enquiry,
  OrderStatus,
  StorageUsageMeter,
  AuthSession,
} from "@/lib/types";

export const supabaseDataService = {
  // ===================== CATEGORIES =====================
  async getCategories(): Promise<Category[]> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("supabaseDataService.getCategories error:", err);
      return [];
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("supabaseDataService.getCategoryBySlug error:", err);
      return null;
    }
  },

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<Category> {
    const admin = createAdminClient();
    const { data: newCat, error } = await admin
      .from("categories")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return newCat;
  },

  async updateCategory(
    id: string,
    data: Partial<Category>
  ): Promise<Category> {
    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from("categories")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async deleteCategory(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    const admin = createAdminClient();
    // Check if anklets exist in category
    const { count, error: countErr } = await admin
      .from("anklets")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (countErr) throw countErr;
    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: "Cannot delete category: existing anklets are assigned to it.",
      };
    }

    const { error } = await admin.from("categories").delete().eq("id", id);
    if (error) throw error;
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
    try {
      const supabase = await createClient();
      let query = supabase
        .from("anklets")
        .select(`
          *,
          category:categories(*),
          images:anklet_images(*)
        `)
        .order("created_at", { ascending: false });

      if (options?.activeOnly) {
        query = query.eq("is_active", true);
      }
      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
      }
      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,sku.ilike.%${options.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      let anklets = (data || []) as AnkletWithImages[];

      if (options?.categorySlug) {
        anklets = anklets.filter((a) => a.category?.slug === options.categorySlug);
      }

      if (options?.stockStatus && options.stockStatus !== "all") {
        anklets = anklets.filter((a) => {
          const isOut = a.stock_quantity <= 0 || a.manual_out_of_stock;
          const isLow = !isOut && a.stock_quantity <= a.low_stock_threshold;
          if (options.stockStatus === "out_of_stock") return isOut;
          if (options.stockStatus === "low_stock") return isLow;
          if (options.stockStatus === "in_stock") return !isOut && !isLow;
          return true;
        });
      }

      if (options?.offset) {
        anklets = anklets.slice(options.offset);
      }
      if (options?.limit) {
        anklets = anklets.slice(0, options.limit);
      }

      return anklets;
    } catch (err) {
      console.error("supabaseDataService.getAnklets error:", err);
      return [];
    }
  },

  async getAnkletById(id: string): Promise<AnkletWithImages | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("anklets")
        .select(`
          *,
          category:categories(*),
          images:anklet_images(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return (data as AnkletWithImages) || null;
    } catch (err) {
      console.error("supabaseDataService.getAnkletById error:", err);
      return null;
    }
  },

  async createAnklet(
    ankletData: Omit<AnkletWithImages, "id" | "created_at" | "updated_at">
  ): Promise<AnkletWithImages> {
    const admin = createAdminClient();
    const { images, ...productData } = ankletData;

    const { data: created, error } = await admin
      .from("anklets")
      .insert(productData)
      .select()
      .single();

    if (error) throw error;

    if (images && images.length > 0) {
      const formattedImages = images.map((img, idx) => ({
        anklet_id: created.id,
        storage_path: img.storage_path,
        public_url: img.public_url,
        size_bytes: img.size_bytes || 0,
        is_primary: idx === 0,
        sort_order: idx,
      }));
      await admin.from("anklet_images").insert(formattedImages);
    }

    return (await this.getAnkletById(created.id))!;
  },

  async updateAnklet(
    id: string,
    data: Partial<AnkletWithImages>
  ): Promise<AnkletWithImages> {
    const admin = createAdminClient();
    const { images, category, ...fieldsToUpdate } = data;

    const { error } = await admin
      .from("anklets")
      .update(fieldsToUpdate)
      .eq("id", id);

    if (error) throw error;
    return (await this.getAnkletById(id))!;
  },

  async deleteAnklet(id: string): Promise<{ success: boolean }> {
    const admin = createAdminClient();
    const { error } = await admin.from("anklets").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  async updateQuickStock(
    updates: { id: string; stock_quantity: number; manual_out_of_stock: boolean }[]
  ): Promise<{ success: boolean }> {
    const admin = createAdminClient();
    for (const update of updates) {
      await admin
        .from("anklets")
        .update({
          stock_quantity: update.stock_quantity,
          manual_out_of_stock: update.manual_out_of_stock,
        })
        .eq("id", update.id);
    }
    return { success: true };
  },

  // ===================== CUSTOMERS =====================
  async getCustomers(): Promise<Customer[]> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("supabaseDataService.getCustomers error:", err);
      return [];
    }
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("customers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("supabaseDataService.getCustomerById error:", err);
      return null;
    }
  },

  async updateCustomer(
    id: string,
    data: Partial<Customer>
  ): Promise<Customer> {
    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from("customers")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async createCustomer(
    data: Omit<Customer, "id" | "created_at"> & { id?: string }
  ): Promise<Customer> {
    const admin = createAdminClient();
    const { data: created, error } = await admin
      .from("customers")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return created;
  },

  // ===================== ORDERS =====================
  async getOrders(options?: {
    customerId?: string;
    status?: string;
  }): Promise<OrderWithDetails[]> {
    try {
      const admin = createAdminClient();
      let query = admin
        .from("orders")
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `)
        .order("created_at", { ascending: false });

      if (options?.customerId) query = query.eq("customer_id", options.customerId);
      if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as OrderWithDetails[]) || [];
    } catch (err) {
      console.error("supabaseDataService.getOrders error:", err);
      return [];
    }
  },

  async getOrderById(id: string): Promise<OrderWithDetails | null> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("orders")
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return (data as OrderWithDetails) || null;
    } catch (err) {
      console.error("supabaseDataService.getOrderById error:", err);
      return null;
    }
  },

  async createOrder(data: {
    customer_id: string;
    note?: string;
    items: { anklet_id: string; quantity: number }[];
  }): Promise<OrderWithDetails> {
    const admin = createAdminClient();
    const orderNumber = `NK-ORD-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const { data: order, error } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: data.customer_id,
        note: data.note || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    for (const item of data.items) {
      const { data: anklet } = await admin
        .from("anklets")
        .select("name, wholesale_price, stock_quantity")
        .eq("id", item.anklet_id)
        .single();

      if (anklet) {
        await admin.from("order_items").insert({
          order_id: order.id,
          anklet_id: item.anklet_id,
          anklet_name_snapshot: anklet.name,
          price_snapshot: anklet.wholesale_price,
          quantity: item.quantity,
        });

        // Deduct stock
        await admin
          .from("anklets")
          .update({
            stock_quantity: Math.max(0, anklet.stock_quantity - item.quantity),
          })
          .eq("id", item.anklet_id);
      }
    }

    return (await this.getOrderById(order.id))!;
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<OrderWithDetails> {
    const admin = createAdminClient();
    const updatePayload: Record<string, unknown> = { status };
    if (note !== undefined) updatePayload.note = note;

    const { error } = await admin
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (error) throw error;
    return (await this.getOrderById(id))!;
  },

  // ===================== ENQUIRIES =====================
  async getEnquiries(): Promise<Enquiry[]> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("supabaseDataService.getEnquiries error:", err);
      return [];
    }
  },

  async createEnquiry(data: {
    name: string;
    phone?: string;
    email?: string;
    message: string;
  }): Promise<Enquiry> {
    const supabase = await createClient();
    const { data: enq, error } = await supabase
      .from("enquiries")
      .insert({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        message: data.message,
      })
      .select()
      .single();

    if (error) throw error;
    return enq;
  },

  async markEnquiryRead(id: string, is_read: boolean): Promise<Enquiry> {
    const admin = createAdminClient();
    const { data: updated, error } = await admin
      .from("enquiries")
      .update({ is_read })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  async deleteEnquiry(id: string): Promise<{ success: boolean }> {
    const admin = createAdminClient();
    const { error } = await admin.from("enquiries").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },

  // ===================== SITE SETTINGS =====================
  async getSiteSettings(): Promise<Record<string, string>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;

      const map: Record<string, string> = {};
      data?.forEach((row) => {
        map[row.key] = row.value;
      });
      return map;
    } catch (err) {
      console.error("supabaseDataService.getSiteSettings error:", err);
      return {};
    }
  },

  async updateSiteSettings(
    newSettings: Record<string, string>
  ): Promise<Record<string, string>> {
    const admin = createAdminClient();
    for (const [key, value] of Object.entries(newSettings)) {
      await admin
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });
    }
    return this.getSiteSettings();
  },

  // ===================== STORAGE USAGE =====================
  async getStorageUsage(): Promise<StorageUsageMeter> {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin
        .from("anklet_images")
        .select("size_bytes");

      if (error) throw error;
      let usedBytes = 0;
      data?.forEach((row) => {
        usedBytes += Number(row.size_bytes || 0);
      });

      const totalBytes = 1024 * 1024 * 1024; // 1 GB
      const percentage = Math.min(100, Math.round((usedBytes / totalBytes) * 10000) / 100);

      return {
        usedBytes,
        totalBytes,
        percentage,
        isWarning: percentage >= 80,
        imageCount: data?.length || 0,
      };
    } catch (err) {
      console.error("supabaseDataService.getStorageUsage error:", err);
      return {
        usedBytes: 0,
        totalBytes: 1024 * 1024 * 1024,
        percentage: 0,
        isWarning: false,
        imageCount: 0,
      };
    }
  },

  // ===================== AUTH SESSION =====================
  async getCurrentAuthUser(): Promise<AuthSession> {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { user: null, role: "visitor" };
      }

      // Check if admin
      const admin = createAdminClient();
      const { data: adminRow } = await admin
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminRow) {
        return {
          user: { id: user.id, email: user.email || "" },
          role: "admin",
        };
      }

      // Check if customer
      const { data: customerRow } = await admin
        .from("customers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      return {
        user: { id: user.id, email: user.email || "" },
        role: "customer",
        customerProfile: customerRow || null,
      };
    } catch (err) {
      console.error("supabaseDataService.getCurrentAuthUser error:", err);
      return { user: null, role: "visitor" };
    }
  },

  async setMockRole(): Promise<void> {
    // No-op in Supabase production mode
  },
};
