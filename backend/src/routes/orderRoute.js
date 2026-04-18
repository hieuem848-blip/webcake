import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
import {
  createOrderFromCart,
  createOrderFromCustomCake,
  getMyOrders,
  getOrderDetail,
  cancelOrder,
  receiveImage,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/from-cart", createOrderFromCart);
router.post("/from-custom", createOrderFromCustomCake);

router.get("/", getMyOrders);
router.get("/:id", getOrderDetail);
router.put("/:id/cancel", cancelOrder);

router.post("/ai", upload.single("file"), receiveImage);

export default router;