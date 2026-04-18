"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { posts } from "../page";

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="text-center py-20">
        <p>Không tìm thấy bài viết</p>
      </div>
    );
  }

  return (
    <main className="bg-gray-100 min-h-screen">

      {/* HERO */}
      <section className="relative h-[300px] md:h-[400px]">
        <Image src={post.image} alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-6">
          <h1 className="text-3xl md:text-5xl font-bold max-w-2xl">
            {post.title}
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        <Link href="/news" className="text-[#C8A96A] mb-6 inline-block">
          ← Quay lại tin tức
        </Link>

        <p className="text-gray-500 mb-6">{post.excerpt}</p>

        <div className="text-gray-700 whitespace-pre-line leading-relaxed space-y-4">
          {post.content}
        </div>

      </div>
    </main>
  );
}