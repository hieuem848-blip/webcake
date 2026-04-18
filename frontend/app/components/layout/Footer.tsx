"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#FEFBF4] text-[#5A544B] text-sm">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Logo + giới thiệu */}
        <div>
          <h2 className="text-[#C8A96A] text-2xl font-bold uppercase tracking-wide mb-4">
            Witchy Bakery
          </h2>

          <p className="leading-6 mb-6 text-[#8F877A]">
            Chúng tôi tạo nên những chiếc bánh kem không chỉ đẹp mắt mà còn đậm đà hương vị,
            giúp bạn lưu giữ những kỷ niệm ngọt ngào trong từng khoảnh khắc.
          </p>

          <div className="flex gap-4">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <Icon
                key={i}
                size={18}
                className="text-[#A79F91] hover:text-[#C8A96A] transition duration-300 cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Sản phẩm */}
        <div>
          <h3 className="text-lg font-semibold text-[#403C35] mb-5">
            Sản phẩm
          </h3>

          <ul className="space-y-3">
            <li>
              <Link href="/products" className="group relative inline-block">
                <span className="group-hover:text-[#C8A96A] transition">
                  Tất cả sản phẩm
                </span>
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C8A96A] group-hover:w-full transition-all duration-300"></span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Thông tin */}
        <div>
          <h3 className="text-lg font-semibold text-[#403C35] mb-5">
            Thông tin
          </h3>

          <ul className="space-y-3">
            {[
              { href: "/about", label: "Về chúng tôi" },
              { href: "/news", label: "Tin tức & Bài viết" },
              { href: "/maplocation", label: "Cửa hàng" },
              { href: "/careers", label: "Tuyển dụng" },
              { href: "/contact", label: "Liên hệ" },
            ].map((item, i) => (
              <li key={i}>
                <Link href={item.href} className="group relative inline-block">
                  <span className="group-hover:text-[#C8A96A] transition">
                    {item.label}
                  </span>
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C8A96A] group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h3 className="text-lg font-semibold text-[#403C35] mb-4">
            Liên hệ
          </h3>

          <ul className="space-y-4">
            {[
              {
                icon: MapPin,
                text: "81/25A Hồ Văn Huê, Phú Nhuận, TP.HCM",
                link: "https://www.google.com/maps",
              },
              { icon: Phone, text: "1900 1234 56" },
              { icon: Mail, text: "info@witchybakery.vn" },
              { icon: Clock, text: "Thứ 2 - Chủ nhật: 9:00 - 21:00" },
            ].map((item, i) => {
              const Icon = item.icon;

              return (
                <li key={i}>
                  <div className="group relative inline-flex items-center gap-3 cursor-pointer">
                    <Icon size={16} className="text-[#A79F91]" />

                    <span className="group-hover:text-[#C8A96A] transition">
                      {item.text}
                    </span>

                    <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#C8A96A] group-hover:w-full transition-all duration-300"></span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-[#201A13] text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 py-5 text-xs text-[#A79F91]">
          © 2025 Witchy Bakery Việt Nam. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}