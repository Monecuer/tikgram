import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageSquare, UserPlus, Laugh } from "lucide-react";
import { api, authHeaders, API_BASE } from "../../lib/api";
import { timeAgo } from "../../lib/timeago";
import { useNavigate } from "react-router-dom";

function Row({ n, onClick }) {
  const icon =
    n.type === "like" ? <Heart size={16}/> :
    n.type === "comment" ? <MessageSquare size={16}/> :
    n.type === "follow" ? <UserPlus size={16}/> :
    <Laugh size={16}/>;

  const actor = n.actor?.username || "Someone";
  let text = "";
  if (n.type === "like") text = "liked your post";
  if (n.type === "comment") text = `commented: ${n.meta?.text || ""}`;
  if (n.type === "reaction") text = `reacted ${n.meta?.reaction || ""} to your post`;
  if (n.type === "follow") text = "started following you";

  const avatar = n.actor?.avatarUrl
    ? (n.actor.avatarUrl.startsWith("http") ? n.actor.avatarUrl : `${API_BASE}/${n.actor.avatarUrl}`)
    : `https://api.dicebear.com/7.x/initials/svg?seed=${actor}`;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border ${n.isRead ? "border-transparent bg-white/5" : "border-primary/40 bg-primary/10"}`}
    >
      <img src={avatar} className="w-8 h-8 rounded-full object-cover" />
      <div className="flex-1">
        <div className="text-sm">
          <b>@{actor}</b> {text}
        </div>
        <div className="text-xs text-white/60">{timeAgo(n.createdAt)}</div>
      </div>
      <div className="opacity-70">{icon}</div>
    </button>
  );
}

export default function NotificationsPanel({ open, onClose }) {
  const nav = useNavigate();
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/notifications", { headers: authHeaders() });
      setItems(data);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { if (open) load(); }, [open]);

  const go = async (n) => {
    try {
      await api.patch(`/notifications/${n._id}/read`, {}, { headers: authHeaders() });
    } catch {}
    if (n.type === "follow") {
      nav(`/u/${n.actor?._id || ""}`);
    } else if (n.post?._id) {
      // send user to feed for now (you can implement /post/:id route later)
      nav("/feed");
      // optional: you could open a modal & focus post id
    } else {
      nav("/feed");
    }
    onClose?.();
  };

  const markAll = async () => {
    try {
      await api.post("/notifications/read", {}, { headers: authHeaders() });
      await load();
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-3 top-3 bottom-3 w-[92vw] max-w-sm z-50 bg-bg border border-glass rounded-2xl overflow-hidden shadow-neon"
            initial={{ x: 500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 500, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <div className="p-3 border-b border-glass flex items-center justify-between">
              <div className="font-semibold">Notifications</div>
              <button onClick={markAll} className="text-sm text-primary">Mark all read</button>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto h-full">
              {items.length === 0 && <div className="text-white/60 text-sm">No notifications yet.</div>}
              {items.map(n => <Row key={n._id} n={n} onClick={()=>go(n)} />)}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
