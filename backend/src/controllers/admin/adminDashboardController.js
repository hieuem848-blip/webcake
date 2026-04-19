// Tổng quan (tổng user, tổng đơn hàng, doanh thu, đơn đang xử lí)
// Thống kê đơn hàng theo trạng thái (pending, confirmed, shipping, completed, cancelled)
// Doanh thu (hôm nay, 7 ngày, 30 ngày)
// Sản phẩm (tổng sản phẩm, sản phẩm đang bán, sản phẩm custom)
// Chat

import User from "../../models/User.js";
import Order from "../../models/Order.js";
import OrderItem from "../../models/OrderItem.js";
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

// GET /admin/dashboards/daily-revenue?year=2026&month=4
export const getDailyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const year  = parseInt(req.query.year)  || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);

    const agg = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, i) => {
      const day   = i + 1;
      const found = agg.find((a) => a._id.day === day);
      return { day: `${day}/${month}`, revenue: found?.revenue || 0, orders: found?.orders || 0 };
    });

    res.json({ year, month, daily });
  } catch (error) {
    console.error("getDailyRevenue error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/dashboards/weekly-revenue?year=2026&month=4
export const getWeeklyRevenue = async (req, res) => {
  try {
    const now = new Date();
    const year  = parseInt(req.query.year)  || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);

    const agg = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    // Nhóm theo 4 tuần cố định: T1=1-7, T2=8-14, T3=15-21, T4=22-hết tháng
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeks = [
      { label: "Tuần 1", from: 1,  to: 7 },
      { label: "Tuần 2", from: 8,  to: 14 },
      { label: "Tuần 3", from: 15, to: 21 },
      { label: "Tuần 4", from: 22, to: daysInMonth },
    ];

    const weekly = weeks.map((w) => {
      let revenue = 0;
      let orders  = 0;
      for (let d = w.from; d <= w.to; d++) {
        const found = agg.find((a) => a._id.day === d);
        revenue += found?.revenue || 0;
        orders  += found?.orders  || 0;
      }
      return { week: w.label, revenue, orders };
    });

    res.json({ year, month, weekly });
  } catch (error) {
    console.error("getWeeklyRevenue error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/dashboards/top-products?limit=5
export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const agg = await OrderItem.aggregate([
      // Chỉ tính đơn hoàn thành
      {
        $lookup: {
          from: "orders",
          localField: "order",
          foreignField: "_id",
          as: "orderData",
        },
      },
      { $unwind: "$orderData" },
      { $match: { "orderData.status": "completed", product: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue:  { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: "$product.name",
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.json({ topProducts: agg });
  } catch (error) {
    console.error("getTopProducts error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/dashboards/top-customers?limit=5
export const getTopCustomers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const agg = await Order.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$user",
          totalOrders:  { $sum: 1 },
          totalSpent:   { $sum: "$totalPrice" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.displayName",
          email: "$user.email",
          totalOrders: 1,
          totalSpent: 1,
        },
      },
    ]);

    res.json({ topCustomers: agg });
  } catch (error) {
    console.error("getTopCustomers error:", error);
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