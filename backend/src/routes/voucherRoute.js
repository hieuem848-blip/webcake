import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { applyVoucher } from "../controllers/voucherController.js";

const router = express.Router();

router.post("/apply", authMiddleware, applyVoucher);

export default router;