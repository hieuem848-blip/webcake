import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import addressRoute from "./routes/addressRoute.js";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";

import adminAuthRoutes from "./routes/admin/adminAuthRoute.js";
import adminUserRoutes from "./routes/admin/adminUserRoute.js";
import adminProductRoutes from "./routes/admin/adminProductRoute.js";
import adminCategoryRoutes from "./routes/admin/adminCategoryRoute.js";
import adminOrderRoutes from "./routes/admin/adminOrderRoute.js";
import adminCustomCakeRoutes from "./routes/admin/adminCustomCakeRoute.js";
import adminChatRoutes from "./routes/admin/adminChatRoute.js";
import adminDashboardRoutes from "./routes/admin/adminDashboardRoute.js";
import adminInventoryRoutes from "./routes/admin/adminInventoryRoute.js";

import productRoutes from "./routes/productRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import cartRoutes from "./routes/cartRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import customCakeRoutes from "./routes/customCakeRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import vnpayRoutes from "./routes/vnpayRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";
import chatRoutes from "./routes/chatRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL || "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// Serve uploaded images as static files
app.use("/uploads", express.static("uploads"));

/* ── PUBLIC ─────────────────────────────────────────────────── */
app.use("/api/auth", authRoute);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payments/vnpay", vnpayRoutes); // VNPay callback - public

/* ── PROTECTED USER ─────────────────────────────────────────── */
app.use("/api/users",        protectedRoute, userRoute);
app.use("/api/addresses",    protectedRoute, addressRoute);   //  NEW thêm 
app.use("/api/carts",        protectedRoute, cartRoutes);
app.use("/api/orders",       protectedRoute, orderRoutes);
app.use("/api/custom-cakes", protectedRoute, customCakeRoutes);
app.use("/api/payments",     protectedRoute, paymentRoutes);
app.use("/api/reviews",      reviewRoutes);
app.use("/api/chats",        protectedRoute, chatRoutes);
app.use("/api/orders", orderRoutes);

/* ── ADMIN ──────────────────────────────────────────────────── */
app.use("/api/admin/users",        adminUserRoutes);
app.use("/api/admin/products",     adminProductRoutes);
app.use("/api/admin/categories",   adminCategoryRoutes);
app.use("/api/admin/orders",       adminOrderRoutes);
app.use("/api/admin/custom-cakes", adminCustomCakeRoutes);
app.use("/api/admin/chats",        adminChatRoutes);
app.use("/api/admin/dashboards",   adminDashboardRoutes);
app.use("/api/admin/inventory",    adminInventoryRoutes);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});