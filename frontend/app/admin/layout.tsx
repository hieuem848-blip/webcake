import type { Metadata } from "next";
import { AdminAuthProvider } from "../context/AdminAuthContext";

export const metadata: Metadata = {
  title: "Admin – Witchy Bakery",
  description: "Trang quản trị Witchy Bakery",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
