"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useScrollReveal(threshold = 0.2) {
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

export default function OrderCakePage() {
  const { ref, visible } = useScrollReveal();

  return (
    <>
      <style>{`
        @keyframes orderSlideRight {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes orderImgReveal {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        .order-content { animation: orderSlideRight 0.8s ease both; }
        .order-t1 { animation: orderSlideRight 0.7s 0.15s ease both; }
        .order-t2 { animation: orderSlideRight 0.7s 0.3s ease both; }
        .order-t3 { animation: orderSlideRight 0.7s 0.45s ease both; }
        .order-hidden { opacity: 0; }
      `}</style>

      <section className="relative w-full h-[720px] overflow-hidden" ref={ref}>
        <Image
          src="/cakebg.png"
          alt="Nhận đặt bánh theo yêu cầu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className={`max-w-xl text-white ${visible ? "order-content" : "order-hidden"}`}>
              <p className={`text-xs tracking-[0.3em] uppercase text-amber-300 mb-4 font-semibold ${visible ? "order-t1" : "order-hidden"}`}>
                Witchy Bakery
              </p>
              <h1
                className={`text-5xl md:text-6xl font-extrabold leading-tight mb-4 ${visible ? "order-t2" : "order-hidden"}`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Nhận đặt bánh<br />
                <span className="text-[#C8A96A]">theo yêu cầu</span>
              </h1>
              <p className={`text-white/75 text-base mb-8 leading-relaxed max-w-sm ${visible ? "order-t3" : "order-hidden"}`}>
                Thiết kế riêng theo ý tưởng của bạn — chữ, màu sắc, hình ảnh, chủ đề.
                Mỗi chiếc bánh là một tác phẩm nghệ thuật.
              </p>
              <div className={`flex flex-wrap gap-3 ${visible ? "order-t3" : "order-hidden"}`}>
                <Link
                  href="/products"
                  className="bg-[#C8A96A] text-white px-7 py-3.5 text-sm tracking-wide hover:bg-[#a0823e] transition"
                >
                  Xem sản phẩm
                </Link>
                <Link
                  href="/custom-cake"
                  className="bg-white text-black px-7 py-3.5 text-sm tracking-wide hover:text-[#C8A96A] transition"
                >
                  Liên hệ đặt bánh
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}