"use client";

import Link from "next/link";
import { ShoppingBag, User, LogOut, Package, ChevronDown, Menu, X } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LoginForm } from "@/app/auth/login/page";
import { RegisterForm } from "@/app/auth/register/page";
import { ForgotForm } from "@/app/auth/forgot-password/page";

type AuthModalView = "login" | "register" | "forgot" | null;

export default function Header() {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalView, setModalView] = useState<AuthModalView>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/products", label: "Sản phẩm" },
    { href: "/news", label: "Tin tức & Bài viết" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/contact", label: "Liên hệ" },
    { href: "/maplocation", label: "Cửa hàng" },
  ];

  return (
    <>
      {/* Modal overlay */}
      {modalView && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setModalView(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            {modalView === "login" && (
              <LoginForm
                onSuccess={() => setModalView(null)}
                onNavigate={setModalView}
                onClose={() => setModalView(null)}
              />
            )}
            {modalView === "register" && (
              <RegisterForm
                onSuccess={() => setModalView("login")}
                onNavigate={setModalView}
                onClose={() => setModalView(null)}
              />
            )}
            {modalView === "forgot" && (
              <ForgotForm
                onNavigate={setModalView}
                onClose={() => setModalView(null)}
              />
            )}
          </div>
        </div>
      )}

    <header className="sticky top-9 z-40 w-full border-b bg-[#FEFBF4] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4">

        {/* Logo */}
        <div className="flex flex-col items-center leading-tight text-[#C8A96A]">
          <span className="text-xs tracking-widest font-light">the</span>
          <Link href="/">
            <span className="text-2xl md:text-3xl font-bold uppercase tracking-wider">WitchyBakery</span>
          </Link>
          <span className="text-[10px] tracking-[0.3em] text-gray-400 mt-0.5">ORIGINAL VIETNAM</span>
        </div>

        {/* Nav desktop */}
        <nav className="hidden md:flex gap-8 text-gray-700 text-m -ml-10">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href}
              className={`relative group transition ${pathname === item.href ? "text-[#C8A96A]" : ""}`}>
              <span className="group-hover:text-[#C8A96A] transition">{item.label}</span>
              <span className={`absolute left-0 -bottom-1 h-[2px] bg-[#C8A96A] transition-all duration-300 ${pathname === item.href ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-8">

          {/* User dropdown */}
          {user ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#C8A96A] transition">
                <div className="w-8 h-8 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 flex items-center justify-center text-[#C8A96A] font-bold text-xs shrink-0">
                  {user.displayName?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:block max-w-[90px] truncate text-xs font-medium">{user.displayName}</span>
                <ChevronDown size={12} className={`transition ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-800 truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#C8A96A] transition">
                    <User size={14} /> Tài khoản của tôi
                  </Link>
                  <Link href="/orders" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-[#C8A96A] transition">
                    <Package size={14} /> Đơn hàng của tôi
                  </Link>
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setModalView("login")}
              className="relative group flex items-center gap-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-gray-700 group-hover:text-[#C8A96A] transition">
                <User size={20} />
              </span>
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C8A96A] group-hover:w-full transition-all duration-300"></span>
            </button>
          )}

          {/* Cart icon */} 
          <Link href="/cart" className="relative group flex items-center">
            <span className="group-hover:text-[#C8A96A] text-gray-700 transition">
              <ShoppingBag size={20} />
            </span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C8A96A] group-hover:w-full transition-all duration-300"></span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#C8A96A] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button className="md:hidden text-gray-500 hover:text-[#C8A96A] transition" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href}
              className={`block py-2.5 text-sm font-medium transition ${pathname === item.href ? "text-[#C8A96A]" : "text-gray-700 hover:text-[#C8A96A]"}`}>
              {item.label}
            </Link>
          ))}
          {!user && (
            <div className="pt-3 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setMobileOpen(false); setModalView("login"); }}
                className="flex-1 text-center py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-[#C8A96A]">
                Đăng nhập
              </button>
              <button onClick={() => { setMobileOpen(false); setModalView("register"); }}
                className="flex-1 text-center py-2 bg-[#C8A96A] rounded-xl text-sm text-white font-semibold">
                Đăng ký
              </button>
            </div>
          )}
        </div>
      )}
    </header>
    </>
  );
}