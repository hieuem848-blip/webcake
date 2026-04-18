// Tạo danh mục
// Sửa danh mục
// Xóa danh mục
// Ẩn / hiện danh mục
// Xem danh sách (phân trang + tìm kiếm)
// Xem chi tiết danh mục
// Kiểm tra danh mục có đang được dùng bởi product không

import Category from "../../models/Category.js";
import Product from "../../models/Product.js";
import slugify from "slugify";

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name)
      return res.status(400).json({ message: "Category name is required" });

    const exist = await Category.findOne({ name });
    if (exist)
      return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      createdBy: req.user._id,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL CATEGORIES (ADMIN)
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const { keyword = "", page = 1, limit = 10 } = req.query;

    const query = {
      isDeleted: false,
      name: { $regex: keyword, $options: "i" },
    };

    const categories = await Category.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Category.countDocuments(query);

    res.json({
      categories,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CATEGORY BY ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted)
      return res.status(404).json({ message: "Category not found" });

    if (name) {
      category.name = name;
      category.slug = slugify(name, { lower: true });
    }

    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted)
      return res.status(404).json({ message: "Category not found" });

    // Check category is used
    const used = await Product.findOne({ category: category._id });
    if (used)
      return res.status(400).json({
        message: "Cannot delete category because it is used by products",
      });

    category.isDeleted = true;
    await category.save();

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE ACTIVE / INACTIVE
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted)
      return res.status(404).json({ message: "Category not found" });

    category.isActive = !category.isActive;
    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
