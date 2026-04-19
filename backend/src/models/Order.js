import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    orderType: {
      type: String,
      enum: ["normal", "custom"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },
    cancelReason: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "momo", "vnpay"],
      default: "cod",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);