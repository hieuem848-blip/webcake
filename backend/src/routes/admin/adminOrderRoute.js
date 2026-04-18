import express from "express";
import { getAllOrders, getOrderDetail, updateOrderStatus, cancelOrder, getOrderStatistics } from "../../controllers/admin/adminOrderController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

router.get("/statistics", getOrderStatistics);
router.get("/", getAllOrders);
router.get("/:id", getOrderDetail);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

export default router;
