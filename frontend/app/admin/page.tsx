"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminToken } from "../lib/adminApi";

export default function AdminRootPage() {
  const router = useRouter();
  useEffect(() => {
    const token = getAdminToken();
    router.replace(token ? "/admin/dashboard" : "/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdf6ec" }}>
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "#C8A96A", borderTopColor: "transparent" }} />
    </div>
  );
}
