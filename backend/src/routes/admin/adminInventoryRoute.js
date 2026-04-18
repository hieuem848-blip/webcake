import express from "express";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  recordMovement,
  getLogs,
  getInventoryStats,
  getExpiryAlerts,
  exportInventoryCSV,
  exportLogsCSV,
} from "../../controllers/admin/adminInventoryController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

// Stats & alerts (trước /:id)
router.get("/stats", getInventoryStats);
router.get("/logs", getLogs);
router.get("/expiry-alerts", getExpiryAlerts);
router.get("/export-csv", exportInventoryCSV);
router.get("/export-logs-csv", exportLogsCSV);

// CRUD nguyên liệu
router.get("/", getIngredients);
router.post("/", createIngredient);
router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

// Giao dịch kho
router.post("/:id/movement", recordMovement);

export default router;