"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AnkletWithImages } from "@/lib/types";

export interface CartItem {
  anklet_id: string;
  name: string;
  sku: string;
  wholesale_price: number;
  quantity: number;
  min_order_qty: number;
  image_url: string;
  weight?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (anklet: AnkletWithImages, quantity?: number) => void;
  updateQuantity: (ankletId: string, quantity: number) => void;
  removeItem: (ankletId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "nk_wholesale_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage:", e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn("Failed to save cart to localStorage:", e);
      }
    }
  }, [items, mounted]);

  const addItem = (anklet: AnkletWithImages, qty?: number) => {
    const addQty = qty !== undefined && qty > 0 ? qty : 1;
    const primaryImg =
      anklet.images?.find((img) => img.is_primary)?.public_url ||
      anklet.images?.[0]?.public_url ||
      "";

    setItems((prev) => {
      const existing = prev.find((item) => item.anklet_id === anklet.id);
      if (existing) {
        return prev.map((item) =>
          item.anklet_id === anklet.id
            ? { ...item, quantity: item.quantity + addQty }
            : item
        );
      }
      return [
        ...prev,
        {
          anklet_id: anklet.id,
          name: anklet.name,
          sku: anklet.sku,
          wholesale_price: anklet.wholesale_price,
          quantity: addQty,
          min_order_qty: 1,
          image_url: primaryImg,
          weight: anklet.weight,
        },
      ];
    });

    setIsOpen(true);
  };

  const updateQuantity = (ankletId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.anklet_id === ankletId) {
            if (quantity <= 0) return null;
            return {
              ...item,
              quantity: Math.max(1, quantity),
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (ankletId: string) => {
    setItems((prev) => prev.filter((item) => item.anklet_id !== ankletId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.wholesale_price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalAmount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
