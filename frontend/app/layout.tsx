import type { Metadata } from "next";
import Footer from "@/app/components/layout/Footer";
import "./globals.css";
import Header from "@/app/components/layout/Header";
import Topbar from "@/app/components/layout/Topbar";
import { CartProvider } from "@/app/context/CartContext";
import { AuthProvider } from "@/app/context/AuthContext";
import ShopLayoutWrapper from "@/app/components/layout/ShopLayoutWrapper";

export const metadata: Metadata = {
  title: "Witchy Bakery – Tiệm bánh kem online",
  description: "Đặt bánh kem sinh nhật, bánh cưới, bánh custom theo yêu cầu. Giao hàng tận nơi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>

      <body>
        <AuthProvider>
          <CartProvider>
            <ShopLayoutWrapper>
              {children}
            </ShopLayoutWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
      
    </html>
  );
}
