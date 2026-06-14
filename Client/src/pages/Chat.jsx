import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import api from "../api/axios.js";

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(() => {
    try {
      const saved = sessionStorage.getItem("activeConversation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadConversations = async () => {
    try {
      const { data } = await api.get("/chat/conversation");
      const list = data?.conversations || [];
      setConversations(list);

     
      if (active) {
        const updated = list.find((c) => c._id === active._id);
        if (updated) {
          setActive(updated);
          sessionStorage.setItem("activeConversation", JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error("load conversations failed", e);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelect = (c) => {
    setActive(c);
    sessionStorage.setItem("activeConversation", JSON.stringify(c));
    setSidebarOpen(false);
  };

  const handleNew = (c) => {
    setConversations((prev) => {
      if (prev.some((x) => x._id === c._id)) return prev;
      return [c, ...prev];
    });
    setActive(c);
    sessionStorage.setItem("activeConversation", JSON.stringify(c));
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0b18]">
     
      <aside className="hidden w-80 border-r border-white/5 md:block">
        <Sidebar
          conversations={conversations}
          activeId={active?._id}
          onSelect={handleSelect}
          onNewConversation={handleNew}
        />
      </aside>

     
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-40 w-80 max-w-[85%] border-r border-white/5 md:hidden"
            >
              <Sidebar
                conversations={conversations}
                activeId={active?._id}
                onSelect={handleSelect}
                onNewConversation={handleNew}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

     
      <main className="flex flex-1 flex-col">
        <ChatWindow
          conversation={active}
          onOpenSidebar={() => setSidebarOpen(true)}
          onMessageSent={loadConversations}
        />
      </main>
    </div>
  );
}