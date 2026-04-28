"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  ShoppingBag,
  Folder,
  ClipboardList,
  Users,
  Cake,
  Boxes,
  MessageSquare,
  Mail,
  LogOut,
  Menu,
  Calendar,
  Tag,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
};

const NAV: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    icon: <ShoppingBag size={20} />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/categories",
    label: "Danh mục",
    icon: <Folder size={20} />,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    icon: <ClipboardList size={20} />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/users",
    label: "Khách hàng",
    icon: <Users size={20} />,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/custom-cakes",
    label: "Bánh Custom",
    icon: <Cake size={20} />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/inventory",
    label: "Kho nguyên liệu",
    icon: <Boxes size={20} />,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/vouchers",
    label: "Mã giảm giá",
    icon: <Tag size={20} />,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/chats",
    label: "Tin nhắn",
    icon: <MessageSquare size={20} />,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/admin/email",
    label: "Email",
    icon: <Mail size={20} />,
    roles: ["ADMIN"],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentNav = NAV.find(
    (n) =>
      pathname === n.href ||
      (n.href !== "/admin/dashboard" && pathname.startsWith(n.href))
  );

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen z-30 w-64 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300
        lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex flex-col items-center text-[#C8A96A] m-3 mt-6 pb-4 border-b border-gray-500">
          <span className="text-2xl font-bold uppercase tracking-wider">
            Witchy Bakery
          </span>
          <span className="text-[10px] tracking-[0.3em] text-gray-400 mt-1 mb-3">
            ADMIN PANEL
          </span>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-3">
            Menu
          </p>

          {NAV.filter(item => item.roles.includes(user.role)).map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-amber-50 text-amber-700 border border-amber-100 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <span className={active ? "text-amber-600" : "text-gray-400"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* đăng xuất */}
        <div className="m-3 pt-4 border-t border-gray-500 flex justify-center">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 hover:scale-105 transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* HEADER */}
        <header className="sticky top-2 mx-4 z-10 flex items-center justify-between px-4 py-3 bg-white rounded-2xl shadow-md">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Link href="/admin/dashboard" className="text-black font-medium">
                Admin
              </Link>

              {currentNav && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-700 font-semibold">
                    {currentNav.label}
                  </span>
                </>
              )}
            </div>
          </div>

         {/* RIGHT */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-amber-400 to-amber-700">
              {user.fullName?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {user.fullName}
              </p>
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                {user.role}
              </span>
            </div>
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}