"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const commitments = [
  {
    img: "/cake.jpg",
    title: "Nguyên liệu tươi mới",
    subtitle: "CHỌN LỌC KỸ LƯỠNG",
    desc: "Witchy Bakery cam kết sử dụng nguyên liệu tươi mỗi ngày, được chọn lọc kỹ lưỡng để đảm bảo chất lượng và hương vị tự nhiên trong từng chiếc bánh.",
  },
  {
    img: "/cake1.jpg",
    title: "An toàn & tự nhiên",
    subtitle: "KHÔNG CHẤT BẢO QUẢN",
    desc: "Chúng tôi ưu tiên nguyên liệu tự nhiên, hạn chế phụ gia và không sử dụng chất bảo quản, mang đến sự an tâm cho sức khỏe của bạn.",
  },
  {
    img: "/cake2.jpg",
    title: "Làm bánh với sự tận tâm",
    subtitle: "TỪNG CHI TIẾT NHỎ",
    desc: "Mỗi chiếc bánh đều được làm thủ công với sự tỉ mỉ và đam mê, gửi gắm trọn vẹn yêu thương trong từng sản phẩm.",
  },
];

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

export default function CommitmentSectionPage() {
  const { ref, visible } = useScrollReveal();

  return (
    <>
      <style>{`
        @keyframes commitFlipIn {
          from { opacity: 0; transform: perspective(600px) rotateY(25deg) translateY(20px); }
          to   { opacity: 1; transform: perspective(600px) rotateY(0deg) translateY(0); }
        }
        @keyframes commitTitleSlide {
          from { opacity: 0; letter-spacing: 0.05em; }
          to   { opacity: 1; letter-spacing: 0.12em; }
        }
        .commit-title { animation: commitTitleSlide 0.8s ease both; }
        .commit-c0    { animation: commitFlipIn 0.65s 0.1s ease both; }
        .commit-c1    { animation: commitFlipIn 0.65s 0.28s ease both; }
        .commit-c2    { animation: commitFlipIn 0.65s 0.46s ease both; }
        .commit-hidden { opacity: 0; }
      `}</style>

      <section className="bg-[#F7F6F3]  py-20 px-6" ref={ref}>
        <h2 className={`text-center text-xl font-serif tracking-widest text-[#1c1a17] mb-16 ${visible ? "commit-title" : "commit-hidden"}`}>
          WITCHY BAKERY VỚI SỰ TIN TƯỞNG NGƯỜI DÙNG
          <p>CHÚNG TÔI LUÔN ĐẢM BẢO</p>
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {commitments.map((item, i) => (
            <div
              key={i}
              className={`flex flex-col items-center ${visible ? `commit-c${i}` : "commit-hidden"}`}
            >
              <div className="w-24 h-24 relative mb-6 rounded-full overflow-hidden shadow-lg">
                <Image src={item.img} alt="" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-serif text-gray-800 mb-2">{item.title}</h3>
              <p className="text-xs tracking-widest text-[#C8A96A] mb-4">{item.subtitle}</p>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}