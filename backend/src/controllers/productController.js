// Xem danh sách sản phẩm
// Xem chi tiết sản phẩm
// Lọc theo Category
// Tìm tiếm theo tên
// Lọc theo giá
// Xem variant (size, serving, giá)
// Xem nhiều hình ảnh sả phẩm
// Hiển thị sản phẩm status = active

import Product from "../models/Product.js";
import ProductImage from "../models/ProductImage.js";
import ProductVariant from "../models/ProductVariant.js";
import Category from "../models/Category.js";

// Hàm phụ để gắn ảnh chính vào mỗi sản phẩm trong danh sách
async function attachMainImages(products) {
  const ids = products.map(p => p._id);
  const mainImgs = await ProductImage.find({
    product: { $in: ids },
    isMain: true,
  }).select("product imageUrl");

  const map = {};
  mainImgs.forEach(img => { map[img.product.toString()] = img.imageUrl; });

  return products.map(p => ({
    ...p.toObject(),
    mainImage: map[p._id.toString()] || null,
  }));
}

//GET /api/products (Danh sách sản phẩm + lọc + search + pagination)
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = { status: "active" };

    // lọc theo category
    if (category) {
      const cate = await Category.findOne({ slug: category });
      if (cate) filter.category = cate._id;
    }

    // search theo tên
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // lọc theo giá
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
  }
};

// GET /api/products/:id (Chi tiết sản phẩm)
export const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      status: "active",
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const images = await ProductImage.find({ product: id });
    const variants = await ProductVariant.find({ product: id });

    res.json({
      product,
      images,
      variants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy chi tiết sản phẩm" });
  }
};

// GET /api/products/category/:slug
export const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const products = await Product.find({
      category: category._id,
      status: "active",
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy sản phẩm theo danh mục" });
  }
};
