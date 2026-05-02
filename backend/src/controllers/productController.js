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

  return products.map(p => {
    const obj = p.toObject ? p.toObject() : { ...p };
    return { ...obj, mainImage: map[obj._id.toString()] || null };
  });
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
      sort,
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

    // Thứ tự category mặc định: bánh kem > decor > topping > đồ uống
    const CATEGORY_ORDER = ["bánh kem", "decor", "topping", "đồ uống"];

    let products;

    if (sort === "price-asc" || sort === "price-desc") {
      // Sort theo giá dùng find() bình thường
      const sortOption = sort === "price-asc" ? { basePrice: 1 } : { basePrice: -1 };
      products = await Product.find(filter)
        .populate("category", "name slug")
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .sort(sortOption)
        .lean();
    } else {
      // Mặc định: sort theo thứ tự category cố định, rồi mới createdAt
      products = await Product.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryObj",
          },
        },
        { $unwind: { path: "$categoryObj", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            categoryOrder: {
              $let: {
                vars: { nameLower: { $toLower: { $ifNull: ["$categoryObj.name", ""] } } },
                in: {
                  $switch: {
                    branches: CATEGORY_ORDER.map((name, idx) => ({
                      case: { $gte: [{ $indexOfCP: ["$$nameLower", name] }, 0] },
                      then: idx,
                    })),
                    default: 99,
                  },
                },
              },
            },
            category: {
              _id: "$categoryObj._id",
              name: "$categoryObj.name",
              slug: "$categoryObj.slug",
            },
          },
        },
        { $sort: { categoryOrder: 1, createdAt: -1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
        { $project: { categoryObj: 0, categoryOrder: 0 } },
      ]);
    }

    const total = await Product.countDocuments(filter);

    // Gắn ảnh chính vào từng sản phẩm, đổi tên thành mainImageUrl
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