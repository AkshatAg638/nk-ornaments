/**
 * In-Memory Mock Store
 *
 * Maintains mutable state across requests in mock mode so that admin edits,
 * stock toggles, category creation, and order placement take effect live.
 */

import {
  initialMockCategories,
  initialMockAnklets,
  initialMockCustomers,
  initialMockOrders,
  initialMockEnquiries,
  initialMockSettings,
} from "@/mock/data";

import {
  Category,
  AnkletWithImages,
  Customer,
  OrderWithDetails,
  Enquiry,
  UserRole,
} from "@/lib/types";

interface MockStoreState {
  categories: Category[];
  anklets: AnkletWithImages[];
  customers: Customer[];
  orders: OrderWithDetails[];
  enquiries: Enquiry[];
  settings: Record<string, string>;
  activeRole: UserRole;
}

// Attach to globalThis to preserve in-memory state during development hot reloads
const globalForMock = globalThis as unknown as {
  __nkMockStore?: MockStoreState;
};

export function getMockStore(): MockStoreState {
  if (!globalForMock.__nkMockStore) {
    globalForMock.__nkMockStore = {
      categories: JSON.parse(JSON.stringify(initialMockCategories)),
      anklets: JSON.parse(JSON.stringify(initialMockAnklets)),
      customers: JSON.parse(JSON.stringify(initialMockCustomers)),
      orders: JSON.parse(JSON.stringify(initialMockOrders)),
      enquiries: JSON.parse(JSON.stringify(initialMockEnquiries)),
      settings: JSON.parse(JSON.stringify(initialMockSettings)),
      activeRole: "visitor", // Default to visitor so customer Login and Register Wholesale are shown
    };
  }
  return globalForMock.__nkMockStore;
}

export function resetMockStore(): void {
  globalForMock.__nkMockStore = {
    categories: JSON.parse(JSON.stringify(initialMockCategories)),
    anklets: JSON.parse(JSON.stringify(initialMockAnklets)),
    customers: JSON.parse(JSON.stringify(initialMockCustomers)),
    orders: JSON.parse(JSON.stringify(initialMockOrders)),
    enquiries: JSON.parse(JSON.stringify(initialMockEnquiries)),
    settings: JSON.parse(JSON.stringify(initialMockSettings)),
    activeRole: "admin",
  };
}
