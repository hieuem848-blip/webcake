import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";
import {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  toggleVoucher,
} from "../../controllers/admin/adminVoucherController.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN"]));

router.get("/", getAllVouchers);
router.get("/:id", getVoucherById);
router.post("/", createVoucher);
router.put("/:id", updateVoucher);
router.delete("/:id", deleteVoucher);
router.patch("/:id/toggle", toggleVoucher);

export default router;