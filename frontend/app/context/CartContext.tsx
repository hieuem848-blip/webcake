"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartApi, type CartItem, type CartResponse, getToken } from "@/app/lib/api";
import { AUTH_EVENTS } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const EMPTY: CartResponse = { cartId: "", items: [], totalPrice: 0 };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartData, setCartData] = useState<CartResponse>(EMPTY);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    const token = getToken();
    if (!token) { setCartData(EMPTY); return; }
    try {
      const data = await cartApi.get();
      setCartData(data);
    } catch {
      setCartData(EMPTY);
    }
  }, []);

  useEffect(() => {
    refreshCart();

    // Khi đăng nhập → load giỏ hàng từ server
    const onSignIn = () => refreshCart();
    // Khi đăng xuất → xóa giỏ hàng local
    const onSignOut = () => setCartData(EMPTY);

    window.addEventListener(AUTH_EVENTS.SIGNED_IN, onSignIn);
    window.addEventListener(AUTH_EVENTS.SIGNED_OUT, onSignOut);
    return () => {
      window.removeEventListener(AUTH_EVENTS.SIGNED_IN, onSignIn);
      window.removeEventListener(AUTH_EVENTS.SIGNED_OUT, onSignOut);
    };
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1, variantId?: string) => {
    setLoading(true);
    try {
      await cartApi.add({ productId, quantity, variantId });
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    setLoading(true);
    try {
      await cartApi.remove(cartItemId);
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(cartItemId);
    setLoading(true);
    try {
      await cartApi.update({ cartItemId, quantity });
      await refreshCart();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await cartApi.clear();
      setCartData(EMPTY);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      items: cartData.items,
      totalPrice: cartData.totalPrice,
      totalItems: cartData.items.reduce((s, i) => s + i.quantity, 0),
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
