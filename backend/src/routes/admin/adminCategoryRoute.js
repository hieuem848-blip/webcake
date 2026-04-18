import express from "express";
import { createCategory, getAllCategoriesAdmin, getCategoryById, updateCategory, deleteCategory, toggleCategoryStatus } from "../../controllers/admin/adminCategoryController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

router.get("/", getAllCategoriesAdmin);
router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.patch("/:id/toggle", toggleCategoryStatus);

export default router;
