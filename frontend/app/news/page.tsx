"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const posts = [
  {
    id: 1,
    title: "Nghệ thuật làm bánh kem thủ công",
    slug: "nghe-thuat-lam-banh",
    excerpt: "Mỗi chiếc bánh tại Witchy Bakery đều được tạo nên từ sự tỉ mỉ, đam mê và tình yêu dành cho từng chi tiết nhỏ.",
    image: "/cake1.jpg",
    tag: "Câu chuyện",
    date: "10 Tháng 4, 2026",
    content: `Tại Witchy Bakery, mỗi chiếc bánh là một tác phẩm nghệ thuật.\n\nTừ việc đánh kem, tạo hình cho đến trang trí, tất cả đều được thực hiện thủ công.\n\nChúng tôi không chỉ làm bánh — chúng tôi tạo ra cảm xúc.`,
  },
  {
    id: 2,
    title: "Top 5 bánh sinh nhật được yêu thích nhất 2026",
    slug: "top-banh-sinh-nhat",
    excerpt: "Khám phá những mẫu bánh sinh nhật được yêu thích nhất, từ dâu tây tươi đến socola đậm đà.",
    image: "/cake2.jpg",
    tag: "Xu hướng",
    date: "5 Tháng 4, 2026",
    content: `Top bánh bán chạy:\n\n1. Bánh dâu tây\n2. Bánh socola\n3. Bánh matcha\n4. Bánh trái cây\n5. Tiramisu`,
  },
  {
    id: 3,
    title: "Bí mật đằng sau nguyên liệu tươi mỗi ngày",
    slug: "nguyen-lieu-tuoi",
    excerpt: "Chúng tôi lựa chọn nguyên liệu tươi mỗi ngày — đây là cam kết không thể thiếu của Witchy Bakery.",
    image: "/cake3.jpg",
    tag: "Nguyên liệu",
    date: "1 Tháng 4, 2026",
    content: `Nguyên liệu luôn:\n\n✔ Tươi mỗi ngày\n✔ Không chất bảo quản\n✔ Chọn lọc kỹ`,
  },
  {
    id: 4,
    title: "Cách bảo quản bánh kem đúng cách",
    slug: "bao-quan-banh",
    excerpt: "Giữ bánh luôn tươi ngon với những mẹo đơn giản mà hiệu quả từ chuyên gia của chúng tôi.",
    image: "/cake1.jpg",
    tag: "Mẹo hay",
    date: "28 Tháng 3, 2026",
    content: `✔ Bảo quản 2-6°C\n✔ Không để ngoài quá lâu\n✔ Dùng trong 24h`,
  },
  {
    id: 5,
    title: "Xu hướng bánh kem 2026: Minimal & Pastel",
    slug: "xu-huong-2026",
    excerpt: "Phong cách bánh kem nhẹ nhàng, tinh tế đang lên ngôi trong giới yêu bánh năm nay.",
    image: "/cake2.jpg",
    tag: "Xu hướng",
    date: "20 Tháng 3, 2026",
    content: `Trend 2026:\n\n- Minimal\n- Pastel\n- Vintage Hàn`,
  },
  {
    id: 6,
    title: "Bánh cưới sang trọng — Chọn sao cho đúng?",
    slug: "banh-cuoi",
    excerpt: "Lựa chọn bánh cưới hoàn hảo cho ngày trọng đại — tinh tế, sang trọng và mang dấu ấn riêng.",
    image: "/cake3.jpg",
    tag: "Cưới hỏi",
    date: "15 Tháng 3, 2026",
    content: `Bánh cưới cần:\n\n✔ Tinh tế\n✔ Sang trọng\n✔ Cá nhân hóa`,
  },
];

const allTags = ["Tất cả", ...Array.from(new Set(posts.map((p) => p.tag)))];

export default function NewsPage() {
  const [activeTag, setActiveTag] = useState("Tất cả");
  const featured = posts[0];
  const filtered = (activeTag === "Tất cả" ? posts.slice(1) : posts.filter((p) => p.tag === activeTag && p.id !== 1));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .news-root { font-family: 'DM Sans', sans-serif; }
        .news-serif { font-family: 'Playfair Display', serif; }

        @keyframes newsPageFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .news-fade-up { animation: newsPageFadeUp 0.6s ease both; }
        .news-fade-up-d1 { animation: newsPageFadeUp 0.6s 0.1s ease both; }
        .news-fade-up-d2 { animation: newsPageFadeUp 0.6s 0.2s ease both; }

        .news-card-img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
        .news-card:hover .news-card-img { transform: scale(1.05); }

        .tag-btn { transition: all 0.2s ease; }
        .tag-btn.active { background: #1c1a17; color: white; }
        .tag-btn:not(.active):hover { background: #f3efe9; }
      `}</style>

      <main className="news-root bg-white min-h-screen">

        {/* ── HERO HEADER ── */}
        <section className="relative h-[340px] md:h-[420px] overflow-hidden">
          <Image src="/cakebg.png" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end pb-14 px-8 md:px-20">
            <p className="text-white/60 text-xs tracking-[0.35em] uppercase mb-3 news-fade-up">
              Witchy Bakery — Journal
            </p>
            <h1 className="news-serif text-white text-5xl md:text-6xl font-normal leading-tight news-fade-up-d1">
              Tin tức &<br /><em>Cảm hứng</em>
            </h1>
          </div>
        </section>

        {/* ── TAG FILTER ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto scrollbar-hide">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`tag-btn shrink-0 text-xs font-medium px-4 py-2 rounded-full border border-gray-200 ${activeTag === tag ? "active" : "text-gray-600"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-14">

          {/* ── FEATURED POST ── */}
          {activeTag === "Tất cả" && (
            <Link href={`/news/${featured.slug}`} className="news-card group block mb-16">
              <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_50px_rgba(0,0,0,0.14)] transition-shadow duration-400">
                <div className="relative h-[280px] md:h-[420px] overflow-hidden">
                  <Image src={featured.image} alt={featured.title} fill className="news-card-img object-cover" />
                </div>
                <div className="bg-[#faf8f5] flex flex-col justify-center px-10 py-12">
                  <span className="inline-block text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C8A96A] bg-[#C8A96A]/10 px-3 py-1 rounded-full mb-6 w-fit">
                    {featured.tag}
                  </span>
                  <h2 className="news-serif text-3xl md:text-4xl font-normal text-gray-900 leading-snug mb-5 group-hover:text-[#C8A96A] transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{featured.date}</span>
                    <span className="text-sm font-medium text-[#1c1a17] underline underline-offset-4 group-hover:text-[#C8A96A] transition-colors">
                      Đọc bài viết →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* ── DIVIDER ── */}
          {activeTag === "Tất cả" && (
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-px bg-gray-100" />
              <p className="text-xs text-gray-400 tracking-[0.2em] uppercase">Bài viết mới nhất</p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          )}

          {/* ── GRID ── */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <Link key={post.id} href={`/news/${post.slug}`} className="news-card group flex flex-col">
                <div className="relative h-[220px] rounded-xl overflow-hidden mb-5">
                  <Image src={post.image} alt={post.title} fill className="news-card-img object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C8A96A] mb-2">
                  {post.tag}
                </span>
                <h3 className="news-serif text-lg font-normal text-gray-900 leading-snug mb-3 group-hover:text-[#C8A96A] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-[#C8A96A] transition-colors">
                    Đọc tiếp →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🎂</p>
              <p>Không có bài viết trong danh mục này</p>
            </div>
          )}
        </div>

        {/* ── NEWSLETTER STRIP ── */}
        <section className="bg-[#1c1a17] text-white py-14 px-6 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8A96A] mb-3">Newsletter</p>
          <h3 className="news-serif text-3xl font-normal mb-4">Không bỏ lỡ điều gì từ Witchy</h3>
          <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
            Đăng ký để nhận công thức, xu hướng và ưu đãi độc quyền mỗi tuần.
          </p>
          <div className="flex justify-center gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm placeholder:text-white/40 text-white outline-none focus:border-[#C8A96A] transition"
            />
            <button className="bg-[#C8A96A] text-white px-5 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition">
              Đăng ký
            </button>
          </div>
        </section>
      </main>
    </>
  );
}