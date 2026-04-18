import express from "express";
import { startOrGetChat, getChatMessages, sendUserMessage } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/start", startOrGetChat);
router.get("/:id/messages", getChatMessages);
router.post("/:id/message", sendUserMessage);

export default router;
