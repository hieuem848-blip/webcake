import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m"; // thường chỉ tồn tại dưới 15 phút
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày tính theo ms

export const signUp = async (req, res) => {
  try {
    const { username, password, email, phone, firstName, lastName } = req.body;

    if (!username || !password || !email || !phone || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Không thể thiếu username, password, email, phone, firstName, lastName",
      });
    }

    // Kiểm tra username tồn tại chưa
    const duplicate = await User.findOne({ username });

    if (duplicate) {
      return res.status(409).json({ message: "username đã tồn tại" });
    }

    // Mã hóa password
    const hashedPassword = await bcrypt.hash(password, 10); //salt = 10 (số lần mà bcrypt thực hiện mà hóa, 10 là 2^10 = 1024 vòng tính toán để ra số mã hóa, 2^12 lâu gấp 4 lần 2^10, càng chậm thì hacker càng khó tìm ra cái đúng theo cách thử đi thử lại các số khác nhau)

    // Tạo user mới
    await User.create({
      username,
      hashedPassword,
      email,
      phone,
      displayName: `${firstName} ${lastName}`,
    });

    //return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signIn = async (req, res) => {
  try {
    // lấy inputs từ req.body người dùng gửi
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu username hoặc password" });
    }

    // lấy hashedPassword trong db để ss với pw ng dùng vừa nhập
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    // kiểm tra password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "username hoặc password không chính xác" });
    }

    // nếu giống, tạo accessToken với JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // lưu refresh token vào 1 session trong db, access token chỉ tồn tại đc vài phút nên ko cần lưu, còn refresh token tt lâu hơn nên cần lưu, khi hack có tấn công vào rf token thì chỉ cần xóa rf token trong database, còn nếu ko lưu vẫn đc, nhưng nếu bị hacker lấy thì đành phải đợi nó hết hạn thì thôi :')
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), // Đặt time hết hạn của rf token là 14 ngày
    });

    // gửi refresh token về thông wa cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // cookie này ko thể bị truy cập từ javascript
      secure: true, // đảm bảo chỉ gửi wa https
      sameSite: "lax", // Frontend và backend deploy trên 1 domain, còn nếu FE và BE chạy trên 2 domain khác nhau thì dùng sameSite: 'none', hạn chế dùng strict  vì Redirect từ link email có thể mất cookie, dễ lỗi
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả access token về res
    return res.status(200).json({
      message: `User ${user.displayName} đã login!`,
      accessToken,
    });
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const signOut = async (req, res) => {
  try {
    // lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // xóa rf token trong session
      await Session.deleteOne({ refreshToken: token });

      // xóa rf token trong cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
