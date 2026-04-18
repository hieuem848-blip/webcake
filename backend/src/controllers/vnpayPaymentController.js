import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

export const createVNPayPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secureSecret: process.env.VNPAY_SECRET,
      vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: order.totalPrice,
      vnp_IpAddr: req.ip,
      vnp_TxnRef: order._id.toString(),
      vnp_OrderInfo: `Thanh toán đơn hàng ${order._id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNPAY_RETURN_URL, // frontend
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
    });

    // Lưu payment pending
    await Payment.create({
      order: order._id,
      method: "vnpay",
      amount: order.totalPrice,
      status: "pending",
    });

    return res.json({ payUrl: paymentUrl });
  } catch (error) {
    console.error("VNPay error:", error);
    res.status(500).json({ message: "Lỗi tạo thanh toán VNPay" });
  }
};

//IPN VNPay
export const vnpayIPN = async (req, res) => {
  try {
    const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo } = req.query;

    const payment = await Payment.findOne({
      order: vnp_TxnRef,
      method: "vnpay",
    });

    if (!payment) return res.status(404).send("Payment not found");

    if (vnp_ResponseCode === "00") {
      payment.status = "paid";
      payment.transactionCode = vnp_TransactionNo;
      await payment.save();

      await Order.findByIdAndUpdate(vnp_TxnRef, {
        status: "paid",
      });
    } else {
      payment.status = "failed";
      await payment.save();
    }

    res.send("OK");
  } catch (err) {
    console.error("VNPay IPN error:", err);
    res.status(500).send("ERROR");
  }
};
