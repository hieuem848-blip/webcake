"use client";

import Image from "next/image";

const jobs = [
  {
    id: 1,
    title: "Nhân viên bán hàng",
    location: "TP HCM",
    type: "Part-time",
    salary: "4 - 6 triệu",
    desc: "Tư vấn khách hàng, trưng bày sản phẩm và hỗ trợ bán hàng tại cửa hàng.",
  },
  {
    id: 2,
    title: "Thợ làm bánh",
    location: "TP HCM",
    type: "Full-time",
    salary: "6 - 8 triệu",
    desc: "Chuẩn bị nguyên liệu, làm bánh theo công thức và đảm bảo chất lượng sản phẩm.",
  },
  {
    id: 3,
    title: "Nhân viên marketing",
    location: "Remote / Part-time",
    type: "Part-time",
    salary: "Thỏa thuận",
    desc: "Quản lý nội dung mạng xã hội, chụp ảnh sản phẩm và chạy chiến dịch marketing.",
  },
  {
    id: 4,
    title: "Nhân viên phục vụ",
    location: "TP HCM",
    type: "Part-time",
    salary: "22-25k/giờ",
    desc: "Phục vụ khách, giữ vệ sinh cửa hàng và hỗ trợ các công việc chung.",
  },
];

export default function CareersPage() {
  return (
    <main className="bg-[#f3efe9] min-h-screen">

      {/* HERO */}
      <section className="relative h-[260px] md:h-[320px]">
        <Image
          src="/cakebg.png"
          alt="Tuyển dụng Witchy Bakery"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-6">
          <p className="text-xs tracking-[0.3em] mb-3">Witchy Bakery</p>
          <h1 className="text-3xl md:text-5xl font-bold">
            Tuyển dụng
          </h1>
          <p className="mt-3 text-sm opacity-80 max-w-md">
            Gia nhập đội ngũ Witchy Bakery và cùng tạo nên những chiếc bánh đầy cảm hứng
          </p>
        </div>
      </section>

      {/* INTRO */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Vì sao chọn Witchy Bakery?
        </h2>
        <p className="text-gray-500 leading-relaxed">
          Môi trường trẻ trung, sáng tạo, được học hỏi và phát triển mỗi ngày.
          Chúng tôi luôn chào đón những bạn có đam mê với bánh và dịch vụ.
        </p>
      </div>

      {/* JOB LIST */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">
          Vị trí đang tuyển
        </h3>

        <div className="grid md:grid-cols-2 gap-6">

          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {job.title}
              </h4>

              <div className="text-sm text-gray-500 mb-3 space-y-1">
                <p>📍 {job.location}</p>
                <p>💼 {job.type}</p>
                <p>💰 {job.salary}</p>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {job.desc}
              </p>

              <button
                onClick={() => {
                  document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-4 py-2 bg-[#C8A96A] text-white rounded-lg text-sm hover:opacity-90 transition"
              >
                Ứng tuyển ngay
              </button>
            </div>
          ))}

        </div>
      </div>

      {/* FORM APPLY */}
      <div id="apply-form" className="flex items-center justify-center px-4 pb-14">

        <div className="w-full max-w-3xl bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-8 py-10">

          <h2 className="text-2xl font-serif text-gray-800 mb-10">
            Ứng tuyển ngay
          </h2>

          <form className="space-y-8">

            {/* Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="border-b border-[#d6c2a3] pb-3">
                <input
                  type="text"
                  placeholder="Họ và tên*"
                  className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
                />
              </div>

              <div className="border-b border-[#d6c2a3] pb-3">
                <input
                  type="text"
                  placeholder="Số điện thoại*"
                  className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
                />
              </div>

            </div>

            {/* Email */}
            <div className="border-b border-[#d6c2a3] pb-3">
              <input
                type="email"
                placeholder="Email*"
                className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
              />
            </div>

            {/* Position */}
            <div className="border-b border-[#d6c2a3] pb-3">
              <input
                type="text"
                placeholder="Vị trí ứng tuyển*"
                className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
              />
            </div>

            {/* Message */}
            <div className="border-b border-[#d6c2a3] pb-3">
              <textarea
                placeholder="Giới thiệu bản thân hoặc kinh nghiệm*"
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
                GỬI ỨNG TUYỂN
              </button>
            </div>

          </form>

        </div>
      </div>

    </main>
  );
}