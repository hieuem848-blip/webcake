// Tổng quan (tổng user, tổng đơn hàng, doanh thu, đơn đang xử lí)
// Thống kê đơn hàng theo trạng thái (pending, confirmed, shipping, completed, cancelled)
// Doanh thu (hôm nay, 7 ngày, 30 ngày)
// Sản phẩm (tổng sản phẩm, sản phẩm đang bán, sản phẩm custom)
// Chat

import User from "../../models/User.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import CustomCakeRequest from "../../models/CustomCakeRequest.js";
import Chat from "../../models/Chat.js";

// GET /admin/dashboard (Tổng hợp dashboard)
export const getAdminDashboard = async (req, res) => {
  try {
    // USER
    const totalUsers = await User.countDocuments();

    // ORDER
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const confirmedOrders = await Order.countDocuments({ status: "confirmed" });
    const shippingOrders = await Order.countDocuments({ status: "shipping" });
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // REVENUE
    const revenueAgg = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // PRODUCT
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: "active" });
    const customizableProducts = await Product.countDocuments({ isCustomizable: true });

    // CUSTOM CAKE
    const customPending = await CustomCakeRequest.countDocuments({ status: "pending" });
    const customQuoted = await CustomCakeRequest.countDocuments({ status: "quoted" });
    const customCompleted = await CustomCakeRequest.countDocuments({ status: "completed" });

    // CHAT
    const openChats = await Chat.countDocuments({ status: "open" });
    const closedChats = await Chat.countDocuments({ status: "closed" });

    res.json({
      users: { total: totalUsers },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipping: shippingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      revenue: { total: totalRevenue },
      products: { total: totalProducts, active: activeProducts, customizable: customizableProducts },
      customCakes: { pending: customPending, quoted: customQuoted, completed: customCompleted },
      chats: { open: openChats, closed: closedChats },
    });
  } catch (error) {
    console.error("getAdminDashboard error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/dashboards/monthly-revenue?year=2026
export const getMonthlyRevenue = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const agg = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Tạo mảng 12 tháng, điền 0 cho tháng chưa có dữ liệu
    const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
    const monthly = MONTHS.map((label, i) => {
      const found = agg.find((a) => a._id.month === i + 1);
      return { month: label, revenue: found?.revenue || 0, orders: found?.orders || 0 };
    });

    res.json({ year, monthly });
  } catch (error) {
    console.error("getMonthlyRevenue error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};