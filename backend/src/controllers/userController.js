import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Order from "../models/Order.js";

// lấy thông tin user đang đăng nhập
export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ authMiddleware, vì khi tới đc cái api này thì nó đã chạy qua cái middleware rồi

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe, error");
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Xem thông tin cá nhân + đơn hàng gần nhất
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      user,
      recentOrders,
    });
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Cập nhật tên / đổi mật khẩu khi biết mật khẩu cũ
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Đổi mật khẩu
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Vui lòng nhập mật khẩu cũ" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.hashedPassword); // đổi cập nhập password
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
      }

      const salt = await bcrypt.genSalt(10);
      user.hashedPassword = await bcrypt.hash(newPassword, salt); // đổi cập nhập password
    }

    // Đổi tên
    if (fullName) {
      user.displayName = fullName;
    }

    await user.save();

    res.json({ message: "Cập nhật thông tin thành công" });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
