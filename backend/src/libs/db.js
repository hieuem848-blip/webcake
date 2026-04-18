import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
    console.log("Database connection successful!");
  } catch (error) {
    console.log("Database connection error:", error);
    process.exit(1); // dừng ch tr nếu ko nết nối được với database
  }
};
