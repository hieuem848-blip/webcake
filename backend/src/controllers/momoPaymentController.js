import crypto from "crypto";
import https from "https";
import Order from "../models/Order.js";

export const createMomoPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order không tồn tại" });
    }

    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const partnerCode = process.env.MOMO_PARTNER_CODE;

    const requestId = order._id.toString();
    const momoOrderId = `${partnerCode}_${Date.now()}`;
    const amount = order.totalPrice.toString();
    const orderInfo = `Thanh toán đơn ${order._id}`;
    const redirectUrl = process.env.MOMO_REDIRECT_URL;
    const ipnUrl = process.env.MOMO_IPN_URL;
    const requestType = "payWithMethod";
    const extraData = "";

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${momoOrderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode,
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      autoCapture: true,
      lang: "vi",
      signature,
    });

    const options = {
      hostname: "test-payment.momo.vn",
      port: 443,
      path: "/v2/gateway/api/create",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const momoReq = https.request(options, (momoRes) => {
      momoRes.on("data", (data) => {
        res.json(JSON.parse(data));
      });
    });

    momoReq.on("error", (err) => {
      res.status(500).json({ message: "Lỗi kết nối MoMo" });
    });

    momoReq.write(requestBody);
    momoReq.end();
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo thanh toán MoMo" });
  }
};

// IPN momo
export const momoIPN = async (req, res) => {
  const { requestId, resultCode } = req.body;

  const order = await Order.findById(requestId);
  if (!order) return res.sendStatus(404);

  if (resultCode === 0) {
    order.paymentStatus = "paid";
    order.orderStatus = "processing";
  } else {
    order.paymentStatus = "failed";
  }

  await order.save();
  res.sendStatus(200);
};
