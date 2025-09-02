import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, authHeaders } from "../../lib/api";
import { Image as Img, Video, Type, X } from "lucide-react";

export default function CreatePostModal({ open, onClose, onCreated }) {
  const [mode, setMode] = useState("photo"); // photo | video | text
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setMode("photo");
      setCaption("");
      setFile(null);
      setBusy(false);
    }
  }, [open]);

  const submit = async (e) => {
    e?.preventDefault?.();
    setBusy(true);
    try {
      if (mode === "text") {
        // JSON post (no media)
        const { data } = await api.post("/posts", { caption }, { headers: authHeaders() });
        onCreated?.(data);
      } else {
        if (!file) { alert("Choose a file"); setBusy(false); return; }
        const form = new FormData();
        form.append("caption", caption);
        form.append("media", file);
        const { data } = await api.post("/posts", form, { headers: authHeaders() });
        onCreated?.(data);
      }
      onClose?.();
    } catch (e) {
      console.error(e);
      alert("Failed to create post");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-bg border border-glass shadow-neon overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-3 border-b border-glass flex items-center justify-between">
              <div className="font-semibold">Create</div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5"><X size={16} /></button>
            </div>

            <div className="p-3 space-y-3">
              {/* Mode picker */}
              <div className="grid grid-cols-3 gap-2">
                <Choice icon={<Img size={16}/>} label="Photo" active={mode==="photo"} onClick={()=>{ setMode("photo"); setFile(null); }} />
                <Choice icon={<Video size={16}/>} label="Video" active={mode==="video"} onClick={()=>{ setMode("video"); setFile(null); }} />
                <Choice icon={<Type size={16}/>}  label="Text"  active={mode==="text"}  onClick={()=>{ setMode("text");  setFile(null); }} />
              </div>

              {/* Inputs */}
              {mode !== "text" && (
                <div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept={mode==="photo" ? "image/*" : "video/*"}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm"
                  />
                  {file && <div className="text-xs text-white/60 mt-1">{file.name}</div>}
                </div>
              )}

              <div>
                <textarea
                  rows={3}
                  maxLength={2200}
                  className="w-full bg-white/5 border border-glass rounded-xl px-3 py-2"
                  placeholder={mode==="text" ? "What's happening?" : "Write a caption…"}
                  value={caption}
                  onChange={(e)=>setCaption(e.target.value)}
                />
                <div className="text-[11px] text-white/50 mt-1">{caption.length}/2200</div>
              </div>

              <button
                onClick={submit}
                disabled={busy}
                className="w-full px-4 py-2 rounded-xl bg-primary text-black"
              >
                {busy ? "Posting…" : "Post"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Choice({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border ${active ? "border-primary bg-primary/10" : "border-glass bg-white/5"} flex items-center justify-center gap-2`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}
