import express from "express";
import { createPayment } from "../controllers/paymentController.js";
import {
  createMomoPayment,
  momoIPN,
} from "../controllers/momoPaymentController.js";

const router = express.Router();

// điều hướng
router.post("/create", createPayment);

// momo
router.get("/momo/:orderId", createMomoPayment);
router.post("/momo/ipn", momoIPN);

export default router;
