import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createReview,
  getProductReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);
router.get("/:productId", getProductReviews);

export default router;
