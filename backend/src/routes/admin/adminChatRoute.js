import express from "express";
import { getAllChats, getChatDetail, sendAdminMessage, closeChat } from "../../controllers/admin/adminChatController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import adminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();
router.use(authMiddleware, adminMiddleware(["ADMIN", "STAFF"]));

router.get("/", getAllChats);
router.get("/:id", getChatDetail);
router.post("/:id/message", sendAdminMessage);
router.put("/:id/close", closeChat);

export default router;
