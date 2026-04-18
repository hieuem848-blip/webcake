"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useScrollReveal(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function BrandSectionPage() {
  const { ref, visible } = useScrollReveal();

  return (
    <>
      <style>{`
        @keyframes brandZoomIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes brandTextFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .brand-zoom { animation: brandZoomIn 0.7s ease both; }
        .brand-t1   { animation: brandTextFade 0.6s 0.2s ease both; }
        .brand-t2   { animation: brandTextFade 0.6s 0.38s ease both; }
        .brand-t3   { animation: brandTextFade 0.6s 0.55s ease both; }
        .brand-hidden { opacity: 0; }
      `}</style>

      <section className="relative w-full h-[200px] md:h-[400px]">
        <Image src="/footer_bg.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div
            ref={ref}
            className={`bg-[#f3efe9] max-w-xl w-full rounded-lg shadow-xl px-8 py-10 text-center ${
              visible ? "brand-zoom" : "brand-hidden"
            }`}
          >
            <h2 className={`text-3xl md:text-4xl font-serif text-gray-800 mb-4 ${visible ? "brand-t1" : "brand-hidden"}`}>
              <span className="italic">Câu chuyện thương hiệu</span>
            </h2>
            <p className={`text-gray-600 text-sm md:text-base leading-relaxed mb-8 ${visible ? "brand-t2" : "brand-hidden"}`}>
              Tại Witchy Bakery, mỗi chiếc bánh kem không chỉ là một món tráng miệng.
              Một chiếc bánh nhỏ có thể lưu giữ cả một khoảnh khắc lớn.
              Chúng tôi tạo nên những chiếc bánh kem bằng sự tỉ mỉ và yêu thương,
              để mỗi lần bạn cắt bánh là một lần kỷ niệm được trọn vẹn hơn.
            </p>
            <div className={visible ? "brand-t3" : "brand-hidden"}>
              <Link href="/about">
                <button className="bg-[#1c1a17] text-white px-8 py-4 flex items-center justify-center gap-3 mx-auto hover:opacity-90 transition">
                  TÌM HIỂU THÊM
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}