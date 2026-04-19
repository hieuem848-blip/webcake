import express from "express";
import { getAdminDashboard, getMonthlyRevenue, getDailyRevenue, getWeeklyRevenue, getTopProducts, getTopCustomers } from "../../controllers/admin/adminDashboardController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

router.get("/", getAdminDashboard);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/daily-revenue", getDailyRevenue);
router.get("/weekly-revenue", getWeeklyRevenue);
router.get("/top-products", getTopProducts);
router.get("/top-customers", getTopCustomers);

export default router;