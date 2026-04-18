import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    ingredientName: {
      type: String,
      required: true,
    },
    ingredientUnit: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["import", "export", "spoilage", "adjust"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    // Giá nhập (chỉ áp dụng cho type=import)
    costPrice: {
      type: Number,
      default: 0,
    },
    // Nhà cung cấp (cho lần nhập này)
    supplier: {
      type: String,
      default: "",
    },
    // Ngày hết hạn của lô hàng (cho type=import)
    expiryDate: {
      type: Date,
      default: null,
    },
    // Số lô / ghi chú lô hàng
    batchNote: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
    },
    // Tồn kho trước và sau giao dịch (để audit)
    stockBefore: {
      type: Number,
      default: 0,
    },
    stockAfter: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index để query nhanh
inventoryLogSchema.index({ ingredient: 1, createdAt: -1 });
inventoryLogSchema.index({ type: 1, createdAt: -1 });
inventoryLogSchema.index({ expiryDate: 1 });

export default mongoose.model("InventoryLog", inventoryLogSchema);