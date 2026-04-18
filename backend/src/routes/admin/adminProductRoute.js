import express from "express";
import {
  getProducts, getProductDetail, createProduct, updateProduct,
  deleteProduct, softDeleteProduct,
  addVariant, deleteVariant,
  addProductImage, deleteProductImage, setMainImage
} from "../../controllers/admin/adminProductController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

router.get("/", getProducts);
router.post("/", createProduct);

// Variant & Image - must come BEFORE /:id
router.post("/variant/add", addVariant);
router.delete("/variant/:id", deleteVariant);
router.post("/image/add", addProductImage);
router.delete("/image/:id", deleteProductImage);
router.patch("/image/:id/main", setMainImage);

router.get("/:id", getProductDetail);
router.put("/:id", updateProduct);
router.patch("/:id/hide", softDeleteProduct);   // ẩn sản phẩm
router.delete("/:id", deleteProduct);           // xóa hẳn

export default router;
