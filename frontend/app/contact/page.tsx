"use client";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f3efe9] flex items-center justify-center px-4">
      
      {/* CARD */}
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-8 py-10 relative">

        {/* Tiêu đề */}
        <h1 className="text-3xl font-serif text-gray-800 mb-10">
          Liên hệ với Witchy Bakery
        </h1>

        {/* FORM */}
        <form className="space-y-8">

          {/* Hàng đầu tiên "tên + số điện thoại" */}
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

          {/* Tin nhắn */}
          <div className="border-b border-[#d6c2a3] pb-3">
            <textarea
              placeholder="Nhập câu hỏi của bạn ở đây:*"
              rows={4}
              className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
            />
          </div>

          {/* Button */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            
            <button
              type="submit"
              className="flex-1 bg-[#1c1a17] text-white py-4 rounded-md font-semibold tracking-wide hover:opacity-90 transition"
            >
              GỬI WITCHY BAKERY
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}