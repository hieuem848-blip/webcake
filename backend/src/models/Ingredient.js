import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["bot_duong", "chat_long", "trung_sua", "trang_tri", "bao_bi", "khac"],
      default: "khac",
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minThreshold: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Giá nhập gần nhất (VNĐ / đơn vị)
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Nhà cung cấp thường dùng
    supplier: {
      type: String,
      trim: true,
      default: "",
    },
    // Ghi chú (cách bảo quản, lưu ý...)
    note: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ingredient", ingredientSchema);