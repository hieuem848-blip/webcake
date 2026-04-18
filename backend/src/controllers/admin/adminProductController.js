// Danh sách sản phẩm
// Xem chi tiết sản phẩm
// Tạo sản phẩm mới
// Cập nhật sản phẩm
// Xóa sản phẩm
// Quản lí variant
// Quản lí hình ảnh sản phẩm
// Bật / tắt bán sản phẩm
// Phân loại theo category
// Phân biệt sản phẩm bán thường / custom / nước

import Product from "../../models/Product.js";
import ProductVariant from "../../models/ProductVariant.js";
import ProductImage from "../../models/ProductImage.js";
import Category from "../../models/Category.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../../../../uploads/products");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// GET LIST PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "", category } = req.query;

    const query = { 
      name: { $regex: keyword, $options: "i" } 
    };

    if (category) query.category = category;

    const products = await Product.find(query)
      .populate("category")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({ 
      data: products, 
      total, 
      page: Number(page), 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET PRODUCT DETAIL
export const getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const variants = await ProductVariant.find({ product: req.params.id });
    const images = await ProductImage.find({ product: req.params.id });

    res.json({ 
      product, 
      variants, 
      images });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, description, basePrice, category, isCustomizable } = req.body;

    const categoryExist = await Category.findById(category);

    if (!categoryExist) {
      return res.status(400).json({ message: "Category không tồn tại" });
    }

    const product = await Product.create({ 
      name, 
      description, 
      basePrice, 
      category, 
      isCustomizable, 
      status: "active" 
    });

    res.status(201).json({ 
      message: "Tạo sản phẩm thành công", 
      product 
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { 
      new: true 
    });

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    
    res.json({ message: "Cập nhật thành công", product });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// SOFT DELETE (ẩn sản phẩm)
export const softDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      { status: "inactive" }, 
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.json({ message: "Đã ẩn sản phẩm" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// HARD DELETE (xóa hẳn sản phẩm + ảnh + variants)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const images = await ProductImage.find({ product: req.params.id });
    for (const img of images) {
      if (img.imageUrl && img.imageUrl.startsWith("/uploads/")) {
        const filePath = path.resolve(img.imageUrl.slice(1));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await img.deleteOne();
    }
    await ProductVariant.deleteMany({ product: req.params.id });
    await product.deleteOne();
    res.json({ message: "Đã xóa sản phẩm vĩnh viễn" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ADD VARIANT
export const addVariant = async (req, res) => {
  try {
    const { productId, size, serving, price } = req.body;

    if (!productId || !size || !price) return res.status(400).json({ message: "Thiếu thông tin variant" });
    
    const variant = await ProductVariant.create({ 
      product: productId, 
      size, 
      serving, 
      price });

    res.status(201).json({ message: "Thêm variant thành công", variant });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DELETE VARIANT
export const deleteVariant = async (req, res) => {
  try {
    await ProductVariant.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa variant" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// ADD IMAGE (hỗ trợ URL hoặc base64 file)
export const addProductImage = async (req, res) => {
  try {
    const { productId, imageUrl, imageBase64, isMain } = req.body;
    if (!productId) return res.status(400).json({ message: "Thiếu productId" });
    if (!imageUrl && !imageBase64) return res.status(400).json({ message: "Thiếu hình ảnh" });

    let finalUrl = imageUrl;

    if (imageBase64 && !imageUrl) {
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ message: "Dữ liệu ảnh không hợp lệ" });
      const ext = matches[1].split("/")[1] || "jpg";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);
      fs.writeFileSync(filePath, Buffer.from(matches[2], "base64"));
      finalUrl = `/uploads/products/${uniqueName}`;
    }

    if (isMain) await ProductImage.updateMany({ product: productId }, { isMain: false });
    const image = await ProductImage.create({ product: productId, imageUrl: finalUrl, isMain: !!isMain });
    res.status(201).json({ message: "Thêm ảnh thành công", image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DELETE IMAGE
export const deleteProductImage = async (req, res) => {
  try {
    const image = await ProductImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Ảnh không tồn tại" });
    if (image.imageUrl && image.imageUrl.startsWith("/uploads/")) {
      const filePath = path.resolve(image.imageUrl.slice(1));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await image.deleteOne();
    res.json({ message: "Đã xóa ảnh" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// SET MAIN IMAGE
export const setMainImage = async (req, res) => {
  try {
    const image = await ProductImage.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Ảnh không tồn tại" });
    await ProductImage.updateMany({ product: image.product }, { isMain: false });
    image.isMain = true;
    await image.save();
    res.json({ message: "Đã đặt ảnh chính", image });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
