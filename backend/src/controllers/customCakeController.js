// USER
// Gửi yêu cầu custom cake
// Upload ảnh tham khảo
// Xem danh sách request của mình
// Xem chi tiết request
// Hủy request

import CustomCakeRequest from "../models/CustomCakeRequest.js";
import CustomCakeImage from "../models/CustomCakeImage.js";

// POST /api/custom-cakes
// Tạo yêu cầu bánh custom
export const createCustomCakeRequest = async (req, res) => {
  try {
    const {
      size,
      shape,
      cakeFlavor,
      topping,
      colorTheme,
      priceMin,
      priceMax,
      deliveryDate,
      note,
      images,
    } = req.body;

    const request = await CustomCakeRequest.create({
      user: req.user._id,
      size,
      shape,
      cakeFlavor,
      topping,
      colorTheme,
      priceMin,
      priceMax,
      deliveryDate,
      note,
      status: "pending",
    });

    if (images && images.length > 0) {
      const imageDocs = images.map((url) => ({
        customRequest: request._id,
        imageUrl: url,
      }));

      await CustomCakeImage.insertMany(imageDocs);
    }

    res.json({
      message: "Gửi yêu cầu bánh custom thành công",
      requestId: request._id,
    });
  } catch (error) {
    console.error("createCustomCakeRequest error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/custom-cakes
//Danh sách yêu cầu của user
export const getMyCustomCakeRequests = async (req, res) => {
  try {
    const requests = await CustomCakeRequest.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("getMyCustomCakeRequests error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/custom-cakes/:id
// Chi tiết yêu cầu
export const getCustomCakeDetail = async (req, res) => {
  try {
    const request = await CustomCakeRequest.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!request) {
      return res.status(404).json({ message: "Yêu cầu không tồn tại" });
    }

    const images = await CustomCakeImage.find({
      customRequest: request._id,
    });

    res.json({
      request,
      images,
    });
  } catch (error) {
    console.error("getCustomCakeDetail error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /api/custom-cakes/:id/cancel
// Hủy yêu cầu (khi chưa duyệt)
export const cancelCustomCakeRequest = async (req, res) => {
  try {
    const request = await CustomCakeRequest.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: "pending",
    });

    if (!request) {
      return res.status(400).json({ message: "Không thể hủy yêu cầu này" });
    }

    request.status = "cancelled";
    await request.save();

    res.json({ message: "Đã hủy yêu cầu bánh custom" });
  } catch (error) {
    console.error("cancelCustomCakeRequest error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
