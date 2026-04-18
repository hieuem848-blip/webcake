"use client";

import { Cake, Truck, Gift, Star, Calendar } from "lucide-react";

export default function Topbar() {
  return (
    <div className="sticky top-0 left-0 w-full bg-black text-white text-sm py-2 overflow-hidden z-50">
      <div className="marquee flex items-center">

        {/* Nội dung */}
        <div className="flex items-center">
          <span className="mx-6 flex items-center gap-2">
            <Cake size={16} />
            Bánh kem tươi làm trong ngày
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Truck size={16} />
            Miễn phí giao hàng đơn từ 500.000đ
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Calendar size={16} />
            Nhận đặt bánh theo yêu cầu
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Star size={16} />
            Nguyên liệu tươi ngon, an toàn
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Gift size={16} />
            Giảm giá mỗi tuần
          </span>
        </div>

        {/* chạy nội dung lần 2 */}
        <div className="flex items-center">
          <span className="mx-6 flex items-center gap-2">
            <Cake size={16} />
            Bánh kem tươi làm trong ngày
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Truck size={16} />
            Miễn phí giao hàng đơn từ 500.000đ
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Calendar size={16} />
            Nhận đặt bánh theo yêu cầu
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Star size={16} />
            Nguyên liệu tươi ngon, an toàn
          </span>

          <span className="mx-6 flex items-center gap-2">
            <Gift size={16} />
            Giảm giá mỗi tuần
          </span>
        </div>

      </div>
    </div>
  );
}