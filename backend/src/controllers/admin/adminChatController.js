import Chat from "../../models/Chat.js";
import Message from "../../models/Message.js";

// GET /admin/chats (Xem danh sách chat)
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate("customer", "displayName email phone")
      .sort({ updatedAt: -1 });

    // Gắn thêm lastMessage cho mỗi chat để hiện preview ở sidebar
    const chatsWithLastMsg = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await Message.findOne({ chat: chat._id })
          .sort({ createdAt: -1 })
          .populate("sender", "displayName")
          .lean();
        return { ...chat.toObject(), lastMessage: lastMessage || null };
      })
    );

    res.json(chatsWithLastMsg);
  } catch (error) {
    console.error("getAllChats error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /admin/chats/:id (Xem chi tiết chat + tin nhắn)
export const getChatDetail = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "customer",
      "displayName email phone"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat không tồn tại" });
    }

    const messages = await Message.find({ chat: chat._id })
      .populate("sender", "displayName")
      .sort({ createdAt: 1 });

    res.json({
      chat,
      messages,
    });
  } catch (error) {
    console.error("getChatDetail error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /admin/chats/:id/message (Admin gửi tin nhắn cho khách)
export const sendAdminMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Nội dung tin nhắn rỗng" });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat không tồn tại" });
    }

    if (chat.status === "closed") {
      return res
        .status(400)
        .json({ message: "Chat đã đóng, không thể gửi thêm" });
    }

    const newMessage = new Message({
      chat: chat._id,
      sender: req.user._id, // admin/staff
      message: message.trim(),
      type: "text",
    });

    await newMessage.save();
    chat.updatedAt = new Date();
    await chat.save();

    // Trả về message đầy đủ (có populated sender) để frontend cập nhật ngay
    const populated = await newMessage.populate("sender", "displayName");
    res.json(populated);
  } catch (error) {
    console.error("sendAdminMessage error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PUT /admin/chats/:id/close (Đóng chat)
export const closeChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat không tồn tại" });
    }

    chat.status = "closed";
    await chat.save();

    res.json({ message: "Đã đóng chat" });
  } catch (error) {
    console.error("closeChat error:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
