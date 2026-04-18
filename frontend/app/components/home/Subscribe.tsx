"use client";

import { useEffect, useRef, useState } from "react";

function useScrollReveal(threshold = 0.3) {
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

export default function SubscribePage() {
  const { ref, visible } = useScrollReveal();

  return (
    <>
      <style>{`
        @keyframes subDropIn {
          0%   { opacity: 0; transform: translateY(-50px) scale(0.94); }
          60%  { transform: translateY(6px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes subFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sub-card { animation: subDropIn 0.75s cubic-bezier(0.34,1.56,0.64,1) both; }
        .sub-t1   { animation: subFadeUp 0.5s 0.35s ease both; }
        .sub-t2   { animation: subFadeUp 0.5s 0.5s ease both; }
        .sub-t3   { animation: subFadeUp 0.5s 0.65s ease both; }
        .sub-hidden { opacity: 0; }
      `}</style>

      <div className="bg-[#f3efe9] py-10 px-4 flex justify-center" ref={ref}>
        <div className={`w-full max-w-xl bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] px-8 py-10 ${visible ? "sub-card" : "sub-hidden"}`}>
          <h1 className={`text-3xl font-serif text-gray-800 mb-6 text-center ${visible ? "sub-t1" : "sub-hidden"}`}>
            Đăng ký nhận thông tin
          </h1>
          <p className={`text-sm text-gray-500 mb-8 text-center ${visible ? "sub-t2" : "sub-hidden"}`}>
            Đăng ký để nhận thông tin liên lạc về các sản phẩm, dịch vụ, cửa hàng, sự kiện và các vấn đề đáng quan tâm của Witchy Bakery.
          </p>
          <form className={`space-y-8 ${visible ? "sub-t3" : "sub-hidden"}`}>
            <div className="border-b border-[#d6c2a3] pb-3 focus-within:border-[#c8a46b]">
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn*"
                className="w-full bg-transparent outline-none placeholder:text-[#c8a46b] text-gray-800 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#1c1a17] text-white py-4 rounded-md font-semibold tracking-wide hover:opacity-90 transition"
            >
              ĐĂNG KÝ
            </button>
          </form>
        </div>
      </div>
    </>
  );
}