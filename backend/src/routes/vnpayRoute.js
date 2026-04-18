import express from "express";
import {
  createVNPayPayment,
  vnpayIPN,
} from "../controllers/vnpayPaymentController.js";

const router = express.Router();

router.post("/ipn", vnpayIPN); //đặt lên trước
router.get("/:orderId", createVNPayPayment);

export default router;
