import express from "express";
import { adminLogin, adminMe, adminLogout } from "../../controllers/admin/adminAuthController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

// Public: Admin login
router.post("/login", adminLogin);

// Protected: lấy thông tin admin hiện tại
router.get("/me", authMiddleware, adminMiddleware(["ADMIN", "STAFF"]), adminMe);

// Protected: logout
router.post("/logout", authMiddleware, adminMiddleware(["ADMIN", "STAFF"]), adminLogout);

export default router;
