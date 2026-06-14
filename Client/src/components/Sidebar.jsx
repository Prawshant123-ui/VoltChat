import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar.jsx";
import ConversationItem from "./ConversationItem.jsx";
import { useAuth } from "../hooks/useAuth.js";
import api from "../api/axios.js";

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onClose,
}) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState("");

  const filtered = conversations.filter((c) => {
    const other = c.participants?.find((p) => p._id !== user?.id);
    return (other?.name || "").toLowerCase().includes(search.toLowerCase());
  });

  const handleUserSearch = async (val) => {
    setUserSearch(val);
    setSelectedUser(null);
    if (!val.trim()) return setSearchResults([]);
    setSearching(true);
    try {
      const { data } = await api.get(`/chat/users/search?q=${val}`);
      setSearchResults(data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (u) => {
    setSelectedUser(u);
    setUserSearch(u.name);
    setSearchResults([]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setCreating(true);
    setErr("");
    try {
      const { data } = await api.post("/chat/conversation", {
        participantId: selectedUser._id,  
      });
      if (data?.conversation) {
        onNewConversation(data.conversation);
        setUserSearch("");
        setSelectedUser(null);
        setShowNew(false);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user?.name} size={42} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
            <div className="truncate text-xs text-gray-400">{user?.email}</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
          >✕</button>
        )}
      </div>

      
      <div className="space-y-2 px-3 py-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations"
          className="w-full rounded-lg bg-inputbar px-3 py-2 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-white/5 focus:ring-accent"
        />
        <button
          onClick={() => { setShowNew((v) => !v); setUserSearch(""); setSelectedUser(null); setSearchResults([]); setErr(""); }}
          className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-accenthover"
        >
          {showNew ? "Cancel" : "+ New Chat"}
        </button>

        <AnimatePresence>
          {showNew && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="space-y-2 overflow-hidden"
            >
              
              <input
                value={userSearch}
                onChange={(e) => handleUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg bg-inputbar px-3 py-2 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-white/5 focus:ring-accent"
              />

            
              {searching && (
                <p className="px-1 text-xs text-gray-400">Searching...</p>
              )}
              {searchResults.length > 0 && (
                <ul className="rounded-lg bg-inputbar ring-1 ring-white/10 overflow-hidden">
                  {searchResults.map((u) => (
                    <li
                      key={u._id}
                      onClick={() => handleSelect(u)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Avatar name={u.name} size={28} />
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              
              {selectedUser && (
                <div className="flex items-center gap-2 rounded-lg bg-accent/20 px-3 py-2 text-sm text-white ring-1 ring-accent/40">
                  <Avatar name={selectedUser.name} size={24} />
                  <span>{selectedUser.name}</span>
                  <button type="button" onClick={() => { setSelectedUser(null); setUserSearch(""); }} className="ml-auto text-gray-400 hover:text-white">✕</button>
                </div>
              )}

              {err && <p className="text-xs text-red-400">{err}</p>}

              <button
                type="submit"
                disabled={creating || !selectedUser}
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40"
              >
                {creating ? "Creating..." : "Start chat"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

    
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-gray-500">No conversations</p>
        )}
        {filtered.map((c) => (
          <ConversationItem
            key={c._id}
            conversation={c}
            currentUserId={user?.id}
            active={c._id === activeId}
            onClick={() => onSelect(c)}
          />
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={logout}
          className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-300"
        >
          Logout
        </button>
      </div>
    </div>
  );
}