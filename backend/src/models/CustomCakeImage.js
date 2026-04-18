import mongoose from "mongoose";

const customCakeImageSchema = new mongoose.Schema({
  customRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomCakeRequest",
    required: true,
  },
  imageUrl: { type: String, required: true },
});

export default mongoose.model("CustomCakeImage", customCakeImageSchema);
