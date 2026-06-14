import { motion } from "framer-motion";
import Avatar from "./Avatar.jsx";
import { formatTime } from "../utils/formatTime.js";

export default function ConversationItem({
  conversation,
  currentUserId,
  active,
  onClick,
}) {
  const other =
    conversation.participants?.find((p) => p._id !== currentUserId) ||
    conversation.participants?.[0] ||
    { name: "Unknown" };

  const last = conversation.lastMessage;
  const preview = last
    ? last.text ||
      (last.mediaType === "image"
        ? "📷 Photo"
        : last.mediaType === "video"
        ? "🎥 Video"
        : "")
    : "No messages yet";

  return (
    <motion.button
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        active
          ? "bg-accent/20 ring-1 ring-accent/40"
          : "hover:bg-white/5"
      }`}
    >
      <Avatar name={other.name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-white">
            {other.name}
          </span>
          <span className="shrink-0 text-[10px] text-gray-400">
            {formatTime(conversation.updatedAt)}
          </span>
        </div>
        <p className="truncate text-xs text-gray-400">{preview}</p>
      </div>
    </motion.button>
  );
}
