"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { chatApi, type ChatMessage, type ChatSession } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevCountRef = useRef(0);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(async (chatId: string, silent = false) => {
    try {
      const data = await chatApi.getMessages(chatId);
      setMessages((prev) => {
        const newCount = data.messages.length;
        if (newCount > prevCountRef.current) {
          if (!open) setUnread((u) => u + (newCount - prevCountRef.current));
        }
        prevCountRef.current = newCount;
        return data.messages;
      });
      setChatSession(data.chat);
    } catch {
      if (!silent) setError("Không thể tải tin nhắn");
    }
  }, [open]);

  // Polling mỗi 5 giây khi chat đang mở hoặc đã có session
  useEffect(() => {
    if (!chatSession) return;
    pollingRef.current = setInterval(() => {
      fetchMessages(chatSession._id, true);
    }, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [chatSession, fetchMessages]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleOpen = async () => {
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }
    setOpen(true);
    setUnread(0);
    if (!chatSession) {
      setLoading(true);
      try {
        const data = await chatApi.startOrGet();
        setChatSession(data.chat);
        setMessages(data.messages);
        prevCountRef.current = data.messages.length;
      } catch {
        setError("Không thể kết nối hỗ trợ. Thử lại sau.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await chatApi.sendMessage(chatSession._id, text);
      setMessages((prev) => [...prev, msg]);
      prevCountRef.current += 1;
    } catch {
      setError("Gửi thất bại. Thử lại.");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getUserId = () => {
    if (!user) return null;
    return typeof user === "object" ? (user as { id?: string; _id?: string }).id || (user as { _id?: string })._id : null;
  };

  const isMyMessage = (msg: ChatMessage) => {
    const uid = getUserId();
    const senderId = typeof msg.sender === "object" ? msg.sender._id : msg.sender;
    return uid && senderId === uid;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* ── BUBBLE BUTTON ── */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #e879a0, #f472b6)" }}
        title="Chat với chúng tôi"
      >
        {open ? (
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* ── CHAT WINDOW ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px", background: "#fff", border: "1px solid #f9a8d4" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white"
            style={{ background: "linear-gradient(135deg, #e879a0, #f472b6)" }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 1 3 3v1H9V5a3 3 0 0 1 3-3z"/>
                <path d="M4 6h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6z"/>
                <path d="M4 14h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">Witchy Bakery</p>
              <p className="text-xs text-white/80">Hỗ trợ khách hàng</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Online" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: "#fdf2f8" }}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎂</div>
                <p className="text-sm font-medium text-gray-700">Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
                <p className="text-xs text-gray-400 mt-1">Nhắn tin ngay để được tư vấn</p>
              </div>
            )}

            {messages.map((msg) => {
              const mine = isMyMessage(msg);
              const senderName = typeof msg.sender === "object" ? msg.sender.displayName : "Staff";
              return (
                <div key={msg._id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  {!mine && (
                    <p className="text-xs text-gray-400 mb-1 px-1">{senderName}</p>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      mine
                        ? "text-white rounded-br-sm"
                        : "text-gray-800 rounded-bl-sm"
                    }`}
                    style={mine ? { background: "linear-gradient(135deg, #e879a0, #f472b6)" } : { background: "#fff", border: "1px solid #fce7f3" }}
                  >
                    {msg.message}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">{formatTime(msg.createdAt)}</p>
                </div>
              );
            })}

            {error && (
              <p className="text-xs text-center text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-pink-100 bg-white">
            {chatSession?.status === "closed" ? (
              <p className="text-center text-xs text-gray-400 py-2">Chat đã đóng. Cảm ơn bạn! 🌸</p>
            ) : (
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhắn tin..."
                  rows={1}
                  className="flex-1 resize-none text-sm px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-300 bg-pink-50/50"
                  style={{ maxHeight: "100px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #e879a0, #f472b6)" }}
                >
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
