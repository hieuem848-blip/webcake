"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  adminChatApi,
  type AdminChatSession,
  type AdminChatMessage,
} from "@/app/lib/adminApi";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import AdminShell from "../components/AdminShell";

export default function AdminChatPage() {
  const { user } = useAdminAuth();

  const [chats, setChats] = useState<AdminChatSession[]>([]);
  const [selectedChat, setSelectedChat] =
    useState<AdminChatSession | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [input, setInput] = useState("");

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // ================= HELPERS =================
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCustomerName = (chat: AdminChatSession) =>
    typeof chat.customer === "object"
      ? chat.customer.displayName
      : "Khách hàng";

  const getCustomerEmail = (chat: AdminChatSession) =>
    typeof chat.customer === "object" ? chat.customer.email : "";

  const isAdminMsg = (msg: AdminChatMessage) => {
    if (!user) return false;
    const senderId =
      typeof msg.sender === "object" ? msg.sender._id : msg.sender;

    return (
      senderId === (user as any).id ||
      senderId === (user as any)._id
    );
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / 86400000
    );

    if (diffDays === 0)
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diffDays === 1) return "Hôm qua";

    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatFullTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ================= API =================
  const loadChats = useCallback(async () => {
    try {
      const data = await adminChatApi.getAll();
      setChats(data);
    } catch {
      // silent
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (chatId: string, silent = false) => {
      if (!silent) setLoadingMessages(true);

      try {
        const data = await adminChatApi.getDetail(chatId);
        setMessages(data.messages);

        if (!silent) {
          setSelectedChat(data.chat);
        }
      } catch {
        if (!silent) setError("Không tải được tin nhắn");
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    []
  );

  const handleSend = async () => {
    if (!input.trim() || !selectedChat || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      const newMsg = await adminChatApi.sendMessage(
        selectedChat._id,
        text
      );

      setMessages((prev) => [...prev, newMsg]);
      loadChats();
    } catch {
      setError("Gửi thất bại");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 8000);
    return () => clearInterval(interval);
  }, [loadChats]);

  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(() => {
      loadMessages(selectedChat._id, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedChat, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ================= EVENTS =================
  const handleSelectChat = (chat: AdminChatSession) => {
    setSelectedChat(chat);
    setMessages([]);
    setError("");
    loadMessages(chat._id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ================= FILTER =================
  const filteredChats = chats.filter((c) => {
    if (!search.trim()) return true;

    const name = getCustomerName(c).toLowerCase();
    const email = getCustomerEmail(c).toLowerCase();

    return (
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase())
    );
  });

  // ================= UI =================
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* ── Page heading ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tin nhắn khách hàng</h1>
            <p className="text-sm text-gray-400 mt-0.5">Quản lý và phản hồi hội thoại với khách hàng</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-500">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        
        <div className="flex gap-6 h-[calc(100vh-170px)]">    
        {/* SIDEBAR */}
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-5 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-xl font-bold text-slate-800">
                Tin nhắn
              </h1>
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm khách hàng..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-200 bg-slate-50 transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingChats ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  selected={selectedChat?._id === chat._id}
                  onClick={() => handleSelectChat(chat)}
                  getCustomerName={getCustomerName}
                  getCustomerEmail={getCustomerEmail}
                  formatTime={formatTime}
                />
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA - Khung nhắn tin */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm overflow-hidden">
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-4">
                <svg width="40" height="40" fill="none" stroke="#e879a0" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-600">Chọn một cuộc hội thoại</p>
              <p className="text-sm mt-1">để bắt đầu trả lời khách hàng</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {getCustomerName(selectedChat).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{getCustomerName(selectedChat)}</p>
                    <p className="text-xs text-slate-400">{getCustomerEmail(selectedChat)}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm">Chưa có tin nhắn trong cuộc hội thoại này</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const mine = isAdminMsg(msg);
                    const senderName = typeof msg.sender === "object" ? msg.sender.displayName : "Khách hàng";
                    return (
                      <div key={msg._id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                        {!mine && (
                          <p className="text-xs text-slate-500 mb-1 ml-1">{senderName}</p>
                        )}
                        <div
                          className={`max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            mine
                              ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-sm"
                              : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 mx-1">{formatFullTime(msg.createdAt)}</p>
                      </div>
                    );
                  })
                )}
                {error && (
                  <p className="text-xs text-center text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="px-6 py-4 bg-white border-t border-slate-200">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập tin nhắn trả lời... (Enter để gửi)"
                      rows={2}
                      className="flex-1 resize-none text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-200 bg-slate-50 transition"
                      style={{ maxHeight: "120px" }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="h-11 px-5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      {sending ? "Gửi..." : "Gửi"}
                    </button>
                  </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </AdminShell>
  );
}

// ================= ITEM =================
function ChatListItem({
  chat,
  selected,
  onClick,
  getCustomerName,
  getCustomerEmail,
  formatTime,
}: {
  chat: AdminChatSession;
  selected: boolean;
  onClick: () => void;
  getCustomerName: (c: AdminChatSession) => string;
  getCustomerEmail: (c: AdminChatSession) => string;
  formatTime: (iso: string) => string;
}) {
  const name = getCustomerName(chat);
  const email = getCustomerEmail(chat);
  const lastMsg = chat.lastMessage;

  const preview = lastMsg
    ? lastMsg.message.length > 40
      ? lastMsg.message.slice(0, 40) + "..."
      : lastMsg.message
    : email;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all duration-150 hover:bg-pink-50 ${
        selected ? "bg-pink-50 border-r-2 border-pink-500" : ""
      }`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
        style={{
          background: selected
            ? "linear-gradient(135deg,#e879a0,#f472b6)"
            : "#f9a8d4",
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-2">
          <p
            className={`text-sm truncate ${
              selected
                ? "font-semibold text-pink-700"
                : "font-medium text-slate-700"
            }`}
          >
            {name}
          </p>

          <span className="text-xs text-slate-400 flex-shrink-0">
            {formatTime(chat.updatedAt)}
          </span>
        </div>

        <p className="text-xs text-slate-400 truncate mt-0.5">
          {preview}
        </p>
      </div>
    </button>
  );
}