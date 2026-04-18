import express from "express";
import {
  getProducts,
  getProductDetail,
  getProductsByCategory,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/category/:slug", getProductsByCategory); //đổi đường dẫn để tránh xung đột với route get("/:id")
router.get("/:id", getProductDetail);

export default router;
