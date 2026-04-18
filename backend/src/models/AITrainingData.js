import mongoose from "mongoose";

const aiTrainingDataSchema = new mongoose.Schema(
  {
    inputText: String,
    imageFeatures: String,
    price: Number,
  },
  { timestamps: true }
);

export default mongoose.model("AITrainingData", aiTrainingDataSchema);
