export const createPayment = async (req, res) => {
  const { orderId, method } = req.body;

  if (!orderId || !method) {
    return res.status(400).json({ message: "Thiếu orderId hoặc method" });
  }

  if (method === "momo") {
    return res.redirect(`/api/payments/momo/${orderId}`);
  }

  if (method === "vnpay") {
    return res.redirect(`/api/payments/vnpay/${orderId}`);
  }

  // thêm xử lý COD
  if (method === "cod") {
    await Payment.create({ order: orderId, method: "cod", amount: 0, status: "pending" });
    return res.json({ message: "Đặt hàng COD thành công" });
  }

  return res
    .status(400)
    .json({ message: "Phương thức thanh toán không hỗ trợ" });
};
