import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime } from "../utils/formatTime.js";

export default function MessageBubble({ message, isOwn, onUnsend }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimer = useRef(null);

  
  const handlePressStart = () => {
    longPressTimer.current = setTimeout(() => setMenuOpen(true), 500);
  };
  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  
  const handleClick = () => {
    if (isOwn) setMenuOpen((v) => !v);
  };

  const handleUnsend = () => {
    setMenuOpen(false);
    onUnsend(message._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      
      <div
        onClick={handleClick}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className={`relative max-w-[75%] cursor-pointer select-none rounded-2xl px-4 py-2.5 shadow-md transition-opacity ${
          isOwn
            ? "rounded-br-md bg-accent text-white"
            : "rounded-bl-md bg-[#23234a] text-gray-100"
        }`}
      >
        {message.mediaUrl && message.mediaType === "image" && (
          <img
            src={message.mediaUrl}
            alt="attachment"
            className="mb-2 max-h-72 rounded-lg object-cover"
          />
        )}
        {message.mediaUrl && message.mediaType === "video" && (
          <video
            src={message.mediaUrl}
            controls
            className="mb-2 max-h-72 rounded-lg"
          />
        )}
        {message.text && (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.text}
          </p>
        )}
        <div className={`mt-1 text-right text-[10px] ${isOwn ? "text-white/60" : "text-gray-400"}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>

     
      <AnimatePresence>
        {menuOpen && isOwn && (
          <>
           
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
           
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 z-50 mb-2 min-w-[140px] overflow-hidden rounded-xl bg-[#1e1e3a] shadow-xl ring-1 ring-white/10"
            >
              <button
                onClick={handleUnsend}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <span>🗑</span>
                <span>Unsend message</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}