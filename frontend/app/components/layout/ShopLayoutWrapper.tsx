"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Topbar from "./Topbar";
import ChatWidget from "@/app/components/chat/ChatWidget";

export default function ShopLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar />
      <Header />
      {children}
      <Footer />
      <ChatWidget />
    </>
  );
}
