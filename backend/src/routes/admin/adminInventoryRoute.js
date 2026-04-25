import express from "express";
import multer from "multer";
import path from "path";
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
  importFromExcel,
} from "../../controllers/admin/adminInventoryController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

// Multer dành riêng cho upload Excel/CSV (lưu tạm vào uploads/)
const excelUpload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".xlsx", ".xls", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file .xlsx, .xls hoặc .csv"));
  },
});

// Stats & alerts (trước /:id)
router.get("/stats", getInventoryStats);
router.get("/logs", getLogs);
router.get("/expiry-alerts", getExpiryAlerts);
router.get("/export-csv", exportInventoryCSV);
router.get("/export-logs-csv", exportLogsCSV);

// Import từ Excel/CSV
router.post("/import-excel", excelUpload.single("file"), importFromExcel);

// CRUD nguyên liệu
router.get("/", getIngredients);
router.post("/", createIngredient);
router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

// Giao dịch kho
router.post("/:id/movement", recordMovement);

export default router;