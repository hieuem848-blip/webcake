import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  imageUrl: { type: String, required: true },
  isMain: { type: Boolean, default: false },
});

export default mongoose.model("ProductImage", productImageSchema);
