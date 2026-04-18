"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { authApi, userApi, getToken, removeToken, type User } from "@/app/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  onSignIn?: () => void;  // callback cho CartProvider gọi refreshCart
  onSignOut?: () => void; // callback cho CartProvider gọi resetCart
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dùng event system để tránh circular dependency giữa Auth và Cart
export const AUTH_EVENTS = {
  SIGNED_IN: "auth:signedIn",
  SIGNED_OUT: "auth:signedOut",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await userApi.getMe();
      setUser(data.user);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = async (username: string, password: string) => {
    await authApi.signIn({ username, password });
    await refresh();
    // Thông báo CartContext load lại giỏ hàng
    window.dispatchEvent(new Event(AUTH_EVENTS.SIGNED_IN));
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    // Thông báo CartContext xóa giỏ hàng
    window.dispatchEvent(new Event(AUTH_EVENTS.SIGNED_OUT));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
