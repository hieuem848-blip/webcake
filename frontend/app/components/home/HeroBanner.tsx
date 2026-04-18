"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/cake3.jpg",
    title: `Hòa quyện trong từng lớp bánh`,
    desc: "Những chiếc bánh kem được tạo nên từ sự tỉ mỉ và cảm hứng, mang đến trải nghiệm ngọt ngào trọn vẹn cho mọi khoảnh khắc của bạn.",
    bg: "#EC6A85",
  },
  {
    image: "/cake2.jpg",
    title: `Gửi trọn yêu thương qua mỗi sản phẩm`,
    desc: "Không chỉ là món tráng miệng, mỗi chiếc bánh là một cách để bạn chia sẻ niềm vui và những cảm xúc chân thành đến người thân yêu.",
    bg: "#f3efe9",
    textColor: "text-[#C8A96A]",
  },
  {
    image: "/cake1.jpg",
    title: `Ngọt dịu trong từng hương vị`,
    desc: "Sự kết hợp hài hòa giữa nguyên liệu chất lượng và công thức riêng, tạo nên những chiếc bánh vừa đẹp mắt vừa tinh tế.",
    bg: "#6BBF8A",
  },
];

export default function HeroBannerPage() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goTo = (next: number) => {
    setIndex(next);
    setAnimKey((k) => k + 1);
  };

  const prev = () => goTo(index === 0 ? slides.length - 1 : index - 1);
  const next = () => goTo(index === slides.length - 1 ? 0 : index + 1);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((index + 1) % slides.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [index]);

  const slide = slides[index];

  return (
    <>
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroLineIn {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        .hero-a  { animation: heroFadeUp 0.6s 0.05s ease both; }
        .hero-b  { animation: heroLineIn 0.5s 0.15s ease both; transform-origin: left; }
        .hero-c  { animation: heroFadeUp 0.7s 0.2s ease both; }
        .hero-d  { animation: heroFadeUp 0.7s 0.35s ease both; }
        .hero-e  { animation: heroFadeUp 0.7s 0.5s ease both; }
        .hero-f  { animation: heroFadeUp 0.7s 0.62s ease both; }
      `}</style>

      <section className="relative w-full h-[700px] overflow-hidden group">
        {/* SLIDER TRACK */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="w-full h-full flex shrink-0">
              <div className="w-1/2 relative overflow-hidden">
                <Image src={s.image} alt="" fill className="object-cover" />
              </div>
              <div
                className="w-1/2 flex flex-col justify-center px-24"
                style={{ backgroundColor: s.bg }}
              />
            </div>
          ))}
        </div>

        {/* CONTENT OVERLAY — always on top, re-animates on key change */}
        <div
          className={`absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center px-24 pointer-events-none ${slide.textColor ?? "text-white"}`}
          key={animKey}
        >
          <p className="hero-a uppercase tracking-[0.25em] text-sm mb-4 opacity-80">
            WITCHY BAKERY — HANDMADE
          </p>
          <div
            className="hero-b h-px w-12 mb-6"
            style={{ backgroundColor: slide.bg === "#f3efe9" ? "#C8A96A" : "white" }}
          />
          <h1 className="hero-c text-[58px] leading-[1.1] font-serif mb-6 whitespace-pre-line">
            {slide.title}
          </h1>
          <p className="hero-d text-sm mb-10 max-w-md opacity-80 leading-relaxed">
            {slide.desc}
          </p>
          <div className="hero-e flex items-center gap-4 pointer-events-auto">
            <Link
              href="/products"
              className={`px-8 py-4 flex items-center gap-3 transition ${
                slide.bg === "#f3efe9"
                  ? "bg-[#C8A96A] text-white hover:opacity-90"
                  : "bg-white text-black hover:bg-black hover:text-white"
              }`}
            >
              XEM NGAY
            </Link>
          </div>
          <div className="hero-f flex items-center gap-2 mt-10 pointer-events-auto">
            {slides.map((_, j) => (
              <button
                key={j}
                onClick={() => goTo(j)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: j === index ? "24px" : "8px",
                  backgroundColor:
                    slide.bg === "#f3efe9"
                      ? j === index ? "#C8A96A" : "rgba(200,169,106,0.35)"
                      : j === index ? "white" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/80 text-white p-3 rounded-md opacity-0 -translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/80 text-white p-3 rounded-md opacity-0 translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
        >
          <ChevronRight size={20} />
        </button>
      </section>
    </>
  );
}