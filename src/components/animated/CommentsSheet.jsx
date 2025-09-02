// src/components/animated/CommentsSheet.jsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, authHeaders } from "../../lib/api";
import { Send, X } from "lucide-react";

export default function CommentsSheet({ postId, open, onClose, onAfterPost }) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open || !postId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/posts/${postId}/comments`, { headers: authHeaders() });
        const list = Array.isArray(res?.data?.comments) ? res.data.comments : (res?.data || []);
        if (mounted) setComments(list);
      } catch (e) {
        console.error(e);
        if (mounted) setComments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open, postId]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [open]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await api.post(
        `/posts/${postId}/comment`,
        { text: text.trim() },
        { headers: authHeaders() }
      );
      const list = Array.isArray(res?.data?.comments) ? res.data.comments : [];
      setComments(list);
      onAfterPost?.(list);
      setText("");
      inputRef.current?.focus();
    } catch (e) {
      console.error(e);
      alert("Failed to post comment");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-50 max-h-[75vh] bg-bg border-t border-glass rounded-t-2xl shadow-neon flex flex-col"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="p-3 border-b border-glass flex items-center justify-between">
              <div className="font-semibold">Comments</div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {loading ? (
                <div className="text-sm text-white/60">Loading…</div>
              ) : comments.length === 0 ? (
                <div className="text-sm text-white/60">Be the first to comment.</div>
              ) : (
                comments.map((c) => (
                  <div key={c._id || `${c.userId?._id}-${c.createdAt}`} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 grid place-items-center text-xs">
                      {(c.userId?.username || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <b>@{c.userId?.username || "user"}</b>{" "}
                        <span className="text-white/70">{c.text}</span>
                      </div>
                      {c.createdAt && (
                        <div className="text-[11px] text-white/50">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={submit} className="p-3 border-t border-glass flex items-center gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 bg-white/5 border border-glass rounded-xl px-3 py-2"
                maxLength={2200}
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="px-3 py-2 rounded-xl bg-primary text-black flex items-center gap-2 disabled:opacity-60"
                title="Send"
              >
                <Send size={16} />
                Send
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
