/**
 * adminMiddleware - kiểm tra role của user đã được xác thực
 * Phải dùng SAU authMiddleware (req.user phải đã tồn tại)
 */
const adminMiddleware = (roles = ["ADMIN", "STAFF"]) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    next();
  };
};

export default adminMiddleware;
