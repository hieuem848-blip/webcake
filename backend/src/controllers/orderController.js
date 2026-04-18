// Tạo đơn hàng từ giỏ
// Tạo đơn từ custom cake
// Xem danh sách đơn hàng
// Xem chi tiết đơn hàng
// Hủy đơn (khi chưa giao dịch)

import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Address from "../models/Address.js";
import CustomCakeRequest from "../models/CustomCakeRequest.js";

// POST /api/orders/from-cart
// Tạo đơn hàng từ giỏ
export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(400).json({ message: "Địa chỉ không hợp lệ" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      user: userId,
      address: addressId,
      totalPrice,
      status: "pending",
      orderType: "normal",
    });

    const orderItems = cart.items.map((item) => ({
      order: order._id,
      product: item.product,
      variant: item.variant,
      price: item.price,
      quantity: item.quantity,
    }));

    await OrderItem.insertMany(orderItems);

    cart.items = [];
    await cart.save();

    res.json({
      message: "Tạo đơn hàng thành công",
      orderId: order._id,
    });
  } catch (error) {
    console.error("createOrderFromCart error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /api/orders/from-custom
// Tạo đơn từ bánh custom đã duyệt
export const createOrderFromCustomCake = async (req, res) => {
  try {
    const userId = req.user._id;
    const { customRequestId, addressId } = req.body;

    const customRequest = await CustomCakeRequest.findOne({
      _id: customRequestId,
      user: userId,
      status: "approved",
    });

    if (!customRequest) {
      return res.status(400).json({ message: "Yêu cầu bánh chưa được duyệt" });
    }

    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(400).json({ message: "Địa chỉ không hợp lệ" });
    }

    const price = customRequest.aiSuggestedPrice;

    const order = await Order.create({
      user: userId,
      address: addressId,
      totalPrice: price,
      status: "pending",
      orderType: "custom",
    });

    await OrderItem.create({
      order: order._id,
      customRequest: customRequest._id,
      price,
      quantity: 1,
    });

    res.json({
      message: "Tạo đơn bánh custom thành công",
      orderId: order._id,
    });
  } catch (error) {
    console.error("createOrderFromCustomCake error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/orders
// Lịch sử đơn hàng
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("address");

    res.json(orders);
  } catch (error) {
    console.error("getMyOrders error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/orders/:id
// Chi tiết đơn hàng
export const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("address");

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    const items = await OrderItem.find({ order: order._id })
      .populate("product")
      .populate("customRequest");

    res.json({
      order,
      items,
    });
  } catch (error) {
    console.error("getOrderDetail error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /api/orders/:id/cancel
// Hủy đơn (khi chưa giao)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "pending",
    });

    if (!order) {
      return res.status(400).json({ message: "Không thể hủy đơn này" });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Đã hủy đơn hàng" });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const receiveImage = async (req, res) => {
  try {
    console.log("Đã nhận file");

    console.log(req.file);

    res.json({
      message: "Upload thành công",
      file: req.file.filename,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};