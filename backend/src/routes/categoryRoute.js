import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
} from "../controllers/categoryController.js";

const router = express.Router();

// USER CATEGORY
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

export default router;
