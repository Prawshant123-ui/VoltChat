import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Avatar from "./Avatar.jsx";
import MessageBubble from "./MessageBubble.jsx";
import api from "../api/axios.js";
import { useAuth } from "../hooks/useAuth.js";
import { useSocket } from "../hooks/useSocket.js";

export default function ChatWindow({ conversation, onOpenSidebar, onMessageSent }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  const other =
    conversation?.participants?.find((p) => p._id !== user?.id) ||
    conversation?.participants?.[0];

  
  useEffect(() => {
    if (!conversation?._id) return;
    let cancelled = false;
    setLoading(true);
    setMessages([]);
    api
      .get(`/chat/message/${conversation._id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const list = data?.messages || data?.message || [];
        setMessages(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));

    if (socket) socket.emit("joinConversation", conversation._id);
    return () => {
      cancelled = true;
      if (socket) socket.emit("leaveConversation", conversation._id);
    };
  }, [conversation?._id, socket]);

  
  useEffect(() => {
    if (!socket) return;

    const onReceive = (msg) => {
      if (!msg) return;
      const msgConvId = msg.conversation?._id || msg.conversation;
      if (msgConvId && msgConvId !== conversation?._id) return;
      setMessages((prev) => {
        if (msg._id && prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const onUnsent = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on("receiveMessage", onReceive);
    socket.on("messageUnsent", onUnsent);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("messageUnsent", onUnsent);
    };
  }, [socket, conversation?._id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendPayload = async (payload) => {
    try {
      const { data } = await api.post("/chat/message", payload);
      const newMsg = data?.message;
      if (newMsg) {
        setMessages((prev) =>
          prev.some((m) => m._id === newMsg._id) ? prev : [...prev, newMsg]
        );
        onMessageSent?.();
      }
    } catch (e) {
      console.error("send failed", e);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    await sendPayload({ conversationId: conversation._id, text: value });
    setText("");
    setSending(false);
  };

  const handleUnsend = async (messageId) => {
    try {
      await api.delete(`/chat/message/${messageId}`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      onMessageSent?.();
    } catch (e) {
      console.error("unsend failed", e);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("Max file size is 50MB");
      return;
    }
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      alert("Only images and videos allowed");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const endpoint = isImage ? "/upload/image" : "/upload/video";
      const { data } = await api.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) {
        await sendPayload({
          conversationId: conversation._id,
          text: "",
          mediaUrl: data.url,
          mediaType: isImage ? "image" : "video",
        });
      }
    } catch (err) {
      console.error("upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-chatbg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-3xl">
            💬
          </div>
          <h2 className="text-lg font-semibold text-white">Select a conversation</h2>
          <p className="mt-1 text-sm text-gray-400">
            Pick a chat from the sidebar or start a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-chatbg">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-1.5 text-gray-300 hover:bg-white/5 md:hidden"
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}
        <Avatar name={other?.name} size={40} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {other?.name || "Chat"}
          </div>
          <div className="truncate text-xs text-gray-400">{other?.email || ""}</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading && (
          <p className="py-8 text-center text-sm text-gray-500">Loading...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            No messages yet 
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const senderId = m.sender?._id || m.sender;
            const isOwn = senderId === user?.id;
            return (
              <MessageBubble
                key={m._id || `${senderId}-${m.createdAt}`}
                message={m}
                isOwn={isOwn}
                onUnsend={isOwn ? handleUnsend : null}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-white/5 bg-inputbar px-3 py-3"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-white/5 px-3 py-2 text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
          aria-label="Attach file"
        >
          {uploading ? "⬆..." : "📎"}
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-lg bg-[#0f0f1f] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-white/5 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-accenthover disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}