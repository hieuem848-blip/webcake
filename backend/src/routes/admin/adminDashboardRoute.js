import express from "express";
import { getAdminDashboard, getMonthlyRevenue } from "../../controllers/admin/adminDashboardController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

router.get("/", getAdminDashboard);
router.get("/monthly-revenue", getMonthlyRevenue);

export default router;