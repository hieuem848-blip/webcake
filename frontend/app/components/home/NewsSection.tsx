"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type NewsItem = {
  id: number;
  title: string;
  desc: string;
  image: string;
  category: string;
};

const newsData: NewsItem[] = [
  {
    id: 1,
    title: "BÁNH KEM TRÁI CÂY – XU HƯỚNG NGỌT NGÀO CHO MÙA HÈ",
    desc: "Những chiếc bánh kem kết hợp trái cây tươi như dâu, kiwi, xoài đang trở thành lựa chọn hàng đầu trong mùa hè nhờ hương vị thanh mát và ít ngấy.",
    image: "/footer_bg.jpg",
    category: "Bánh kem",
  },
  {
    id: 2,
    title: "Bánh kem socola – Lựa chọn không bao giờ lỗi thời",
    desc: "Socola đậm vị kết hợp lớp kem mềm mịn tạo nên chiếc bánh hoàn hảo cho mọi dịp sinh nhật và kỷ niệm.",
    image: "/cake1.jpg",
    category: "Bánh kem",
  },
  {
    id: 3,
    title: "Bánh kem matcha – Hương vị Nhật Bản tinh tế",
    desc: "Matcha thanh nhẹ, ít ngọt, phù hợp với những ai yêu thích sự nhẹ nhàng và tốt cho sức khỏe.",
    image: "/cake2.jpg",
    category: "Bánh kem",
  },
  {
    id: 4,
    title: "Bánh kem mini – Xu hướng mới cho giới trẻ",
    desc: "Nhỏ gọn, xinh xắn, phù hợp làm quà tặng hoặc check-in sống ảo cực chất.",
    image: "/cake3.jpg",
    category: "Bánh kem",
  },
];

function useScrollReveal(threshold = 0.15) {
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

export default function NewsSectionPage() {
  const mainNews = newsData[0];
  const subNews = newsData.slice(1);
  const { ref, visible } = useScrollReveal();

  return (
    <>
      <style>{`
        @keyframes newsFadeLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes newsFadeRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes newsSubCard {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .news-main  { animation: newsFadeLeft 0.7s ease both; }
        .news-head  { animation: newsFadeRight 0.7s 0.1s ease both; }
        .news-sub0  { animation: newsSubCard 0.6s 0.2s ease both; }
        .news-sub1  { animation: newsSubCard 0.6s 0.35s ease both; }
        .news-sub2  { animation: newsSubCard 0.6s 0.5s ease both; }
        .news-hidden { opacity: 0; }
      `}</style>

      <div className="bg-[#FEFBF4] min-h-screen py-10 px-6" ref={ref}>
        <div className="max-w-6xl mx-auto">
          <h2 className={`text-3xl text-left font-bold text-gray-800 mb-6 ${visible ? "news-head" : "news-hidden"}`}>
            Tin tức & bài viết
          </h2>

          {/* Main News */}
          <div className={`bg-white rounded-xl shadow-md p-4 mb-8 hover:shadow-lg transition duration-300 ${visible ? "news-main" : "news-hidden"}`}>
            <div className="relative w-full h-[280px] overflow-hidden rounded-lg group">
              <Image
                src={mainNews.image}
                alt={mainNews.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="mt-4">
              <div className="flex gap-2 text-xs mb-2">
                <span className="bg-pink-200 text-pink-700 px-2 py-1 rounded">{mainNews.category}</span>
                <span className="bg-[#6FC2B6] text-white px-2 py-1 rounded">Tin tức</span>
              </div>
              <h3 className="text-xl font-serif text-gray-800 mb-2">{mainNews.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{mainNews.desc}</p>
              <button className="text-sm text-gray-700 border border-gray-300 px-3 py-1 rounded-md transition duration-300 hover:bg-gray-800 hover:text-white hover:border-gray-800">
                Đọc tiếp
              </button>
            </div>
          </div>

          {/* Sub News */}
          <div className="grid md:grid-cols-3 gap-6">
            {subNews.map((item, i) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition duration-300 ${visible ? `news-sub${i}` : "news-hidden"}`}
              >
                <div className="relative w-full h-[160px] overflow-hidden rounded-lg group">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="mt-3">
                  <div className="flex gap-2 text-xs mb-2">
                    <span className="bg-pink-200 text-pink-700 px-2 py-1 rounded">{item.category}</span>
                    <span className="bg-[#6FC2B6] text-white px-2 py-1 rounded">Tin tức</span>
                  </div>
                  <h4 className="text-xl font-serif text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm mb-3">{item.desc}</p>
                  <button className="text-sm text-gray-700 border border-gray-300 px-3 py-1 rounded-md transition duration-300 hover:bg-gray-800 hover:text-white hover:border-gray-800">
                    Đọc tiếp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}