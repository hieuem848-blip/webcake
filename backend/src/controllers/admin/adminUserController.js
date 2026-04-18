// Xem danh sách user (phân trang, search)
// Xem chi tiết 1 user
// Khóa / mở khóa 1 user
// Cập nhật thông tin user
// Xóa user
// Gán role cho user
// Xem lịch sử đơn hàng của user
// Xem tổng tiền user đã mua (cho thống kê)

import User from "../../models/User.js";
import UserRole from "../../models/UserRole.js";
import Role from "../../models/Role.js";
import Order from "../../models/Order.js";

// GET LIST USERS
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const query = keyword
      ? { $or: [
          { displayName: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ]}
      : {};

    const users = await User.find(query)
      .select("-hashedPassword") //password -> handedPassword
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({ 
      data: users, 
      total, page: Number(page), 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET USER DETAIL
export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-hashedPassword");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });

    const totalSpent = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.totalPrice, 0); // tính tổng tiền đã mua từ các đơn hàng đã hoàn thành

    res.json({ 
      user, 
      role: user.role, 
      orders, 
      totalSpent });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { displayName, phone, status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(displayName && { displayName }), ...(phone && { phone }), ...(status && { status }) },
      { new: true }
    ).select("-hashedPassword");

    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json({ message: "Cập nhật thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// TOGGLE STATUS
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.json({ message: `Tài khoản đã được ${user.status === "active" ? "mở khóa" : "khóa"}`, user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ASSIGN ROLE - gán trực tiếp vào User.role
export const assignRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    const validRoles = ["USER", "STAFF", "ADMIN"];
    if (!validRoles.includes(roleName)) return res.status(400).json({ message: "Role không hợp lệ" });

    const user = await User.findByIdAndUpdate(req.params.id, { role: roleName }, { new: true }).select("-hashedPassword");
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    res.json({ message: "Gán role thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
