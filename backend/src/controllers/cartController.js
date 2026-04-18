// Xem giỏ hàng
// Thêm sản phẩm vào giỏ
// Cập nhật số lượng
// Xóa sản phẩm khỏi giỏ
// Xóa toàn bộ giỏ
// Tính tổng tiền realtime

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";

// Get/api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("items.variant");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    res.json({
      cartId: cart._id,
      items: cart.items,
      totalPrice,
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST/api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.status !== "active") {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    let variant = null;
    let price = product.basePrice;

    if (variantId) {
      variant = await ProductVariant.findById(variantId);
      if (!variant) {
        return res.status(404).json({ message: "Variant không tồn tại" });
      }
      price = variant.price;
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        String(item.variant) === String(variantId || null),
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variant: variantId || null,
        price,
        quantity,
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Đã thêm vào giỏ hàng" });
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT/api/cart/update
export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const item = cart.items.id(cartItemId);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không tồn tại trong giỏ" });
    }

    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Cập nhật giỏ hàng thành công" });
  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//DELETE /api/cart/remove/:cartItemId
export const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== cartItemId,
    );

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Đã xóa sản phẩm khỏi giỏ" });
  } catch (error) {
    console.error("removeCartItem error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.json({ message: "Giỏ hàng trống" });
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
