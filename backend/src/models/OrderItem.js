import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
  customRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomCakeRequest",
  },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

export default mongoose.model("OrderItem", orderItemSchema);
