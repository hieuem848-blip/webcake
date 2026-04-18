// Xem danh sách đơn hàng (tất cả đơn, trang thái, theo ngày, theo user)
// Xem chi tiết 1 đơn hàng
// Cập nhật trạng thái đơn hàng pending -> confirmed -> shipping -> completed
//                                                   -> cancelled
// Hủy đơn hàng
// Thống kê

import Order from "../../models/Order.js";
import OrderItem from "../../models/OrderItem.js";
import User from "../../models/User.js";
import Address from "../../models/Address.js";

// GET /admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, userId, fromDate, toDate } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.user = userId;

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    const orders = await Order.find(filter)
      .populate("user", "displayName email phone") // fullname -> displayName
      .populate("address")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("getAllOrders error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/orders (xem chi tiết đơn hàg)
export const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "displayName email phone")
      .populate("address");

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    const items = await OrderItem.find({ order: order._id })
      .populate("product")
      .populate("variant") // thêm populate variant để lấy thông tin biến thể nếu có
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

// PUT /admin/orders/:id/status (cập nhật trạng thái đơn hàng)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = [
      "pending",
      "confirmed",
      "shipping",
      "completed",
      "cancelled",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /admin/orders/:id/cancel (hủy đơn)
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }

    if (order.status === "completed") {
      return res
        .status(400)
        .json({ message: "Không thể hủy đơn đã hoàn thành" });
    }

    order.status = "cancelled";
    order.cancelReason = reason || "Admin hủy đơn";
    await order.save();

    res.json({ message: "Đã hủy đơn hàng" });
  } catch (error) {
    console.error("cancelOrder error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/orders/statistics (thống kê)
export const getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({
      status: "completed",
    });

    const revenueAgg = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.json({
      totalOrders,
      completedOrders,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
    });
  } catch (error) {
    console.error("getOrderStatistics error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
