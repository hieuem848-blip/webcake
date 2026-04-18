import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: String,
    type: { type: String, enum: ["text", "image"], default: "text" },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
