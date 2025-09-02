import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, authHeaders } from "../../lib/api";
import { Send, X } from "lucide-react";

export default function CommentsSheet({ postId, open, onClose, onAfterPost }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open || !postId) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/posts/${postId}/comments`, { headers: authHeaders() });
        setItems(data.comments || []);
      } catch (e) {
        setItems([]);
      }
    })();
  }, [open, postId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post(`/api/posts/${postId}/comment`, { text }, { headers: authHeaders() });
      setItems(data.comments || []);
      onAfterPost?.(data.commentsCount ?? (data.comments?.length ?? 0));
      setText("");
      // scroll to end
      setTimeout(() => ref.current?.scrollTo({ top: 1e9, behavior: "smooth" }), 60);
    } catch (err) {
      console.warn(err?.response?.data || err.message);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl border-t border-white/10 p-3 max-h-[75vh] flex flex-col"
            initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Comments</div>
              <button className="p-2" onClick={onClose}><X size={18} /></button>
            </div>

            <div ref={ref} className="flex-1 overflow-y-auto space-y-3 pr-1">
              {items.map((c) => (
                <div key={c._id} className="text-sm">
                  <span className="font-semibold">{c.userId?.username || "user"}: </span>
                  <span>{c.text}</span>
                </div>
              ))}
              {!items.length && <div className="text-xs text-white/50">Be first to comment</div>}
            </div>

            <form onSubmit={submit} className="mt-2 flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 outline-none"
                placeholder="Write a comment…"
              />
              <button className="px-3 py-2 rounded-xl bg-white/15 border border-white/10">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
