"use client";

import Image from "next/image";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f3efe9]">

      {/* HERO BANNER */}
      <section className="relative w-full h-[300px] md:h-[340px] border-b border-amber-100 overflow-hidden">
        {/* background */}
        <Image
          src="/cakebg.png"
          alt="Liên hệ Witchy Bakery"
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
            Liên hệ với chúng tôi
          </h1>

          <p className="max-w-md text-sm md:text-base text-gray-200">
            Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại gửi cho chúng tôi nhé.
          </p>
        </div>
      </section>

      {/* FORM SECTION */}
      <div className="flex items-center justify-center px-4 py-16">
        
        {/* CARD */}
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-8 py-10">

          {/* Tiêu đề */}
          <h2 className="text-3xl font-serif text-gray-800 mb-10">
            Liên hệ với Witchy Bakery
          </h2>

          {/* FORM */}
          <form className="space-y-8">

            {/* Hàng đầu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-b border-[#d6c2a3] pb-3">
                <input
                  type="text"
                  placeholder="Nhập tên của bạn*"
                  className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
                />
              </div>

              <div className="border-b border-[#d6c2a3] pb-3">
                <input
                  type="text"
                  placeholder="Nhập số điện thoại*"
                  className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="border-b border-[#d6c2a3] pb-3">
              <input
                type="email"
                placeholder="Nhập địa chỉ email*"
                className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
              />
            </div>

            {/* Message */}
            <div className="border-b border-[#d6c2a3] pb-3">
              <textarea
                placeholder="Nhập câu hỏi của bạn ở đây:*"
                rows={4}
                className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
              />
            </div>

            {/* Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-[#1c1a17] text-white py-4 rounded-md font-semibold tracking-wide hover:opacity-90 transition"
              >
                GỬI WITCHY BAKERY
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}