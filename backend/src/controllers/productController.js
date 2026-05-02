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

async function attachMainImages(products) {
  const ids = products.map(p => p._id);
  const mainImgs = await ProductImage.find({
    product: { $in: ids },
    isMain: true,
  }).select("product imageUrl");

  const map = {};
  mainImgs.forEach(img => { map[img.product.toString()] = img.imageUrl; });

  return products.map(p => {
    const obj = p.toObject ? p.toObject() : { ...p };
    return { ...obj, mainImage: map[obj._id.toString()] || null };
  });
}

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const filter = { status: "active" };

    if (category) {
      const cate = await Category.findOne({ slug: category });
      if (cate) filter.category = cate._id;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    // Sort toàn bộ DB trước, sau đó mới phân trang
    let sortOption = { createdAt: -1 };
    if (sort === "price-asc")  sortOption = { basePrice: 1 };
    if (sort === "price-desc") sortOption = { basePrice: -1 };

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    const productsWithImages = await attachMainImages(products);
    const productsOut = productsWithImages.map(p => ({
      ...p,
      mainImageUrl: p.mainImage || null,
    }));

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      products: productsOut,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
  }
};

// GET /api/products/:id
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

    res.json({ product, images, variants });
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