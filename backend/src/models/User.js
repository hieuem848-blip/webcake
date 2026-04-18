import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "STAFF"],
      default: "USER",
    },
    avatarUrl: {
      type: String, // lưu link CDN để hiển thị hình
    },
    avatarId: {
      type: String, //lưu cloudinary public_id, cần dùng để xóa ảnh trên cloudinary
    },
    bio: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
