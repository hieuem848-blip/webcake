import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  size: String,
  serving: String,
  price: { type: Number, required: true },
});

export default mongoose.model("ProductVariant", productVariantSchema);
