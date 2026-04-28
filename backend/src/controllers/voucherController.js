import Voucher from "../models/Voucher.js";

// POST /api/vouchers/apply
// Kiểm tra & tính toán giảm giá từ mã voucher
export const applyVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || !orderTotal) {
      return res.status(400).json({ message: "Thiếu mã voucher hoặc tổng tiền" });
    }

    const voucher = await Voucher.findOne({ code: code.trim().toUpperCase() });

    if (!voucher) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
    }

    if (!voucher.isActive) {
      return res.status(400).json({ message: "Mã giảm giá đã bị vô hiệu hóa" });
    }

    const now = new Date();
    if (voucher.startDate && now < voucher.startDate) {
      return res.status(400).json({ message: "Mã giảm giá chưa có hiệu lực" });
    }
    if (voucher.endDate && now > voucher.endDate) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
    }

    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    if (orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucher.minOrderValue)} để áp dụng mã này`,
      });
    }

    let discountAmount = 0;
    if (voucher.discountType === "percent") {
      discountAmount = Math.floor((orderTotal * voucher.discountValue) / 100);
      if (voucher.maxDiscountAmount !== null) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    discountAmount = Math.min(discountAmount, orderTotal);

    res.json({
      message: "Áp dụng mã giảm giá thành công",
      voucher: {
        _id: voucher._id,
        code: voucher.code,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
      discountAmount,
      finalTotal: orderTotal - discountAmount,
    });
  } catch (error) {
    console.error("applyVoucher error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};