import jwt from "jsonwebtoken";
import User from "../models/User.js";

// authorization --> xác minh user là ai
const authMiddleware = (req, res, next) => {
  try {
    // lấy access token từ header
    const authHeader = req.headers["authorization"]; // lấy ra phần authorization trong rf header mà client gửi lên
    const token = authHeader && authHeader.split(" ")[1]; // nếu có authHeader thì sẽ tách chuỗi đó ra bằng dấu cách ==> Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "Ko tìm thấy access token" });
    }

    // xác minh token có hợp lệ ko
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          console.error(err);

          return res
            .status(403)
            .json({ message: "Access token hết hạn hoặc ko đúng" });
        }

        // nếu khớp, tìm user tương úng trong db
        const user = await User.findById(decodedUser.userId).select(
          "-hashedPassword"
        ); // lấy tất cả thông tin của user trừ phần password

        if (!user) {
          return res.status(404).json({ message: "người dùng ko tồn tại" });
        }

        // trả user về trong req ==> để sau dùng mà ko cần truy vấn lại
        req.user = user;
        next();
      }
    );
  } catch (error) {
    console.error("Lỗi khi xác minh JWT trong authMiddleware", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const protectedRoute = authMiddleware;
export default authMiddleware;
