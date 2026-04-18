import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

// POST /api/chats/start  – Tạo hoặc lấy lại chat của user hiện tại
export const startOrGetChat = async (req, res) => {
  try {
    let chat = await Chat.findOne({ customer: req.user._id, status: { $ne: "closed" } });

    if (!chat) {
      chat = new Chat({ customer: req.user._id });
      await chat.save();
    }

    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "displayName")
      .sort({ createdAt: 1 });

    res.json({ chat, messages });
  } catch (error) {
    console.error("startOrGetChat error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/chats/:id/messages  – Lấy tin nhắn của 1 chat
export const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, customer: req.user._id });

    if (!chat) {
      return res.status(404).json({ message: "Chat không tồn tại" });
    }

    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "displayName")
      .sort({ createdAt: 1 });

    res.json({ chat, messages });
  } catch (error) {
    console.error("getChatMessages error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /api/chats/:id/message  – User gửi tin nhắn
export const sendUserMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Nội dung tin nhắn rỗng" });
    }

    const chat = await Chat.findOne({ _id: req.params.id, customer: req.user._id });

    if (!chat) {
      return res.status(404).json({ message: "Chat không tồn tại" });
    }

    if (chat.status === "closed") {
      return res.status(400).json({ message: "Chat đã đóng" });
    }

    const newMessage = new Message({
      chat: chat._id,
      sender: req.user._id,
      message: message.trim(),
      type: "text",
    });

    await newMessage.save();
    chat.updatedAt = new Date();
    await chat.save();

    const populated = await newMessage.populate("sender", "displayName");
    res.json(populated);
  } catch (error) {
    console.error("sendUserMessage error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
