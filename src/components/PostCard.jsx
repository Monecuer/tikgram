import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, MessageSquare, Eye } from "lucide-react";
import { motion } from "framer-motion";
import ProVideo from "./video/ProVideo.jsx";
import CommentsSheet from "./animated/CommentsSheet.jsx";
import { api, authHeaders, absUrl } from "../lib/api";

function likeCount(likes) {
  return Array.isArray(likes) ? likes.length : Number(likes || 0);
}

export default function PostCard({ post, onChange }) {
  const [openComments, setOpenComments] = useState(false);
  const [local, setLocal] = useState(post);

  useEffect(() => setLocal(post), [post?._id]); // update when parent changes

  const mediaUrl = useMemo(() => absUrl(local.mediaUrl), [local.mediaUrl]);
  const isVideo = useMemo(() => {
    const u = (mediaUrl || "").toLowerCase();
    return local.mediaType === "video" || u.endsWith(".mp4") || u.endsWith(".m3u8") || u.endsWith(".mov");
  }, [local.mediaType, mediaUrl]);

  async function toggleLike() {
    try {
      const { data } = await api.post(`/api/posts/${local._id}/like`, null, { headers: authHeaders() });
      const next = { ...local, likes: Array(data.likes).fill(1) }; // we only care about count in UI
      setLocal(next);
      onChange?.(next);
    } catch (e) {
      console.warn(e?.response?.data || e.message);
    }
  }

  async function pingView() {
    // fire & forget: no token needed (authOptional on backend)
    try {
      await api.post(`/api/posts/${local._id}/view`);
    } catch (_e) {}
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-3 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div className="text-sm">
            <div className="font-semibold">{local.userId?.username ?? "Anonymous"}</div>
            <div className="text-xs text-white/60">{new Date(local.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {mediaUrl && (
        isVideo ? (
          <ProVideo
            src={mediaUrl}
            poster={absUrl(local.thumbUrl)}
            className="rounded-xl overflow-hidden"
            onBecameVisible={pingView}
            onDoubleLike={toggleLike}
          />
        ) : (
          <img
            src={mediaUrl}
            alt=""
            className="w-full h-auto rounded-xl"
            loading="lazy"
            onLoad={pingView}
          />
        )
      )}

      {local.caption && (
        <p className="text-sm mt-3 whitespace-pre-wrap">{local.caption}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1"
            onClick={toggleLike}
          >
            <Heart size={16} />
            <span className="text-xs">{likeCount(local.likes)}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 flex items-center gap-1"
            onClick={() => setOpenComments(true)}
          >
            <MessageSquare size={16} />
            <span className="text-xs">{local.commentsCount ?? local.comments?.length ?? 0}</span>
          </motion.button>
        </div>

        <div className="text-xs text-white/60 flex items-center gap-1">
          <Eye size={14} /> {local.viewsCount ?? 0}
        </div>
      </div>

      <CommentsSheet
        postId={local._id}
        open={openComments}
        onClose={() => setOpenComments(false)}
        onAfterPost={(count) => {
          const next = { ...local, commentsCount: count };
          setLocal(next);
          onChange?.(next);
        }}
      />
    </div>
  );
}
