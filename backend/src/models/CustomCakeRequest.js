import mongoose from "mongoose";

const customCakeRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Chi tiết yêu cầu
    description: { type: String, default: "" },  // mô tả tổng thể (frontend gửi lên)
    size: String,
    shape: String,
    cakeFlavor: String,
    topping: String,
    colorTheme: String,
    priceMin: Number,
    priceMax: Number,
    deliveryDate: Date,
    note: String,

    // Admin xử lý
    status: {
      type: String,
      enum: ["pending", "quoted", "accepted", "rejected", "completed"],
      default: "pending",
    },
    quotedPrice: { type: Number },       // admin báo giá
    adminNote:   { type: String },        // ghi chú của admin (từ chối / báo giá)
    aiSuggestedPrice: Number,
  },
  { timestamps: true }
);

export default mongoose.model("CustomCakeRequest", customCakeRequestSchema);
