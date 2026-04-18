import express from "express";
import { getUsers, getUserDetail, updateUser, toggleUserStatus, assignRole } from "../../controllers/admin/adminUserController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN"]));

router.get("/", getUsers);
router.get("/:id", getUserDetail);
router.put("/:id", updateUser);
router.patch("/:id/status", toggleUserStatus);
router.patch("/:id/role", assignRole);

export default router;
