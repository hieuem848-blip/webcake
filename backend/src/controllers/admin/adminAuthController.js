// Admin vẫn là user, chỉ khác là :
// Có Role = admin hoặc staff
// Dùng route /api/admin riêng
// Sẽ bị chặn bởi adminMiddleware

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import UserRole from "../../models/UserRole.js";

// ADMIN LOGIN
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
      .status(400)
      .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res
      .status(400)
      .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Check role từ field role trong User model (không dùng UserRole nữa)
    if (!["ADMIN", "STAFF"].includes(user.role)) {
      return res.status(403).json({ message: "Không có quyền admin" });
    }

    // Tạo access token
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập admin thành công",
      accessToken,
      user: {
        id: user._id,
        fullName: user.displayName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("adminLogin error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ADMIN ME
export const adminMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.displayName,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ADMIN LOGOUT
export const adminLogout = async (req, res) => {
  res.json({ message: "Đăng xuất admin thành công" });
};
