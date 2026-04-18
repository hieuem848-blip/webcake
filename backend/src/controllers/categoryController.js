// Xem danh sách Category đang bán
// Xem category theo slug
// Xem category + sản phẩm bên trong
// Dùng menu/ filter

import Category from "../models/Category.js";
import Product from "../models/Product.js";

// GET /api/categories (Lấy danh sách category đang hoạt động)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ status: "active" })
      .select("name slug")
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error("getAllCategories error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/categories/:slug (Lấy category theo slug + sản phẩm thuộc category đó)
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      slug,
      status: "active",
    });

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const products = await Product.find({
      category: category._id,
      status: "active",
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      category,
      products,
    });
  } catch (error) {
    console.error("getCategoryBySlug error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
