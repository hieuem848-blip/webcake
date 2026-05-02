"use client";

import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function MapLocationPage() {
  return (
    <div className="bg-[#F7F6F3]">

      {/* HERO BANNER */}
      <section className="relative w-full h-[300px] md:h-[340px] border-b border-amber-100 overflow-hidden">
        {/* background */}
        <Image
          src="/cakebg.png"
          alt="Hệ thống cửa hàng"
          fill
          className="object-cover"
          priority
        />

        {/* overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* content */}
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center text-white">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 font-semibold text-amber-200">
            Witchy Bakery
          </p>

          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Hệ thống cửa hàng
          </h1>

          <p className="max-w-md text-sm md:text-base text-gray-200">
            Hệ thống cửa hàng của chúng tôi luôn sẵn sàng phục vụ bạn với bánh tươi mỗi ngày.
          </p>
        </div>
      </section>

      {/* MAP */}
      <div className="py-10 bg-[#F7F6F3]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="w-full h-[480px] overflow-hidden rounded-xl shadow">
            <iframe
              title="Google map đến Witchy Bakery"
              src="https://www.google.com/maps?q=Witchy Cafe Bakery, Ho Chi Minh&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      {/* LOCATION */}
      <section className="py-12 bg-[#F7F6F3]">
        <div className="max-w-3xl mx-auto px-6">

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Thành Phố Hồ Chí Minh
            </h2>
            <div className="w-10 h-[2px] bg-[#8B5E3C] mx-auto mb-8"></div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Phường 9
            </h3>

            <ul className="space-y-4 text-gray-500 text-sm">

              <li>
                <a
                  href="https://www.google.com/maps/place/Witchy+Cafe+Bakery/@10.8040531,106.6765734"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 items-start hover:text-[#C8A96A] hover:underline transition"
                >
                  <MapPin size={16} className="mt-1" />
                  <span>81/25A Hồ Văn Huê, Phú Nhuận, TP.HCM</span>
                </a>
              </li>

              <li className="flex gap-3 items-start hover:text-[#C8A96A] hover:underline transition">
                <Phone size={16} className="mt-1" />
                <span>1900 1234 56</span>
              </li>

              <li className="flex gap-3 items-start hover:text-[#C8A96A] hover:underline transition">
                <Mail size={16} className="mt-1" />
                <span>info@witchybakery.vn</span>
              </li>

              <li className="flex gap-3 items-start hover:text-[#C8A96A] hover:underline transition">
                <Clock size={16} className="mt-1" />
                <span>Thứ 2 - Chủ nhật: 9:00 - 21:00</span>
              </li>

            </ul>
          </div>

        </div>
      </section>

    </div>
  );
}