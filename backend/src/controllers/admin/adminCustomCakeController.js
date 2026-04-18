// Xem danh sách yêu cầu bánh custom
// Xem chi tiết 1 yêu cầu
// Admin báo giá và phản hồi
// Từ chối yêu cầu
// Xác minh hoàn thành

import CustomCakeRequest from "../../models/CustomCakeRequest.js";
import CustomCakeImage from "../../models/CustomCakeImage.js";
import User from "../../models/User.js";

// GET /admin/custom-cakes (Danh sách yêu cầu bánh custom)
export const getAllCustomCakeRequests = async (req, res) => {
  try {
    const { status, userId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const requests = await CustomCakeRequest.find(filter)
      .populate("user", "displayName email phone") // fullname -> displayName
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("getAllCustomCakeRequests error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/custom-cakes/:id (Chi tiết yêu cầu custom cake)
export const getCustomCakeDetail = async (req, res) => {
  try {
    const request = await CustomCakeRequest.findById(req.params.id).populate(
      "user",
      "displayName email phone"
    );

    if (!request) {
      return res
        .status(404)
        .json({ message: "Yêu cầu bánh custom không tồn tại" });
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

// PUT /admin/custom-cakes/:id/quote (Admin báo giá bánh)
export const quoteCustomCake = async (req, res) => {
  try {
    const { price, note } = req.body;

    const request = await CustomCakeRequest.findById(req.params.id);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Yêu cầu bánh custom không tồn tại" });
    }

    request.quotedPrice = price;
    request.adminNote = note;
    request.status = "quoted";

    await request.save();

    res.json({ message: "Đã báo giá cho khách" });
  } catch (error) {
    console.error("quoteCustomCake error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /admin/custom-cakes/:id/reject (Từ chối yêu cầu custom cake)
export const rejectCustomCake = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await CustomCakeRequest.findById(req.params.id);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Yêu cầu bánh custom không tồn tại" });
    }

    request.status = "rejected";
    request.adminNote = reason || "Không thể thực hiện yêu cầu";

    await request.save();

    res.json({ message: "Đã từ chối yêu cầu bánh" });
  } catch (error) {
    console.error("rejectCustomCake error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /admin/custom-cakes/:id/complete (Xác nhận hoàn thành bánh)
export const completeCustomCake = async (req, res) => {
  try {
    const request = await CustomCakeRequest.findById(req.params.id);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Yêu cầu bánh custom không tồn tại" });
    }

    request.status = "completed";
    await request.save();

    res.json({ message: "Đã hoàn thành bánh custom" });
  } catch (error) {
    console.error("completeCustomCake error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
