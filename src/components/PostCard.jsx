import { useState } from "react";
import NeonCard from "./animated/NeonCard";
import LikeButton from "./animated/LikeButton";
import ReactionBar from "./animated/ReactionBar";
 import CommentsSheet from "./animated/CommentsSheet.jsx";
import ProVideo from "./video/ProVideo";
import { api, authHeaders } from "../lib/api";
import { MessageSquare, Eye } from "lucide-react";

function likeCount(likes) {
  return Array.isArray(likes) ? likes.length : (typeof likes === "number" ? likes : 0);
}
function tallyReactionsSummary(mapOrArr) {
  if (!mapOrArr) return {};
  if (Array.isArray(mapOrArr)) {
    return mapOrArr.reduce((m, r) => ((m[r.type] = (m[r.type] || 0) + 1), m), {});
  }
  return mapOrArr; // assume object map { "❤️": 3, ... }
}

export default function PostCard({ post, onChange }) {
  const [openComments, setOpenComments] = useState(false);
  const [local, setLocal] = useState(post);

  const mediaUrl = local.mediaUrl?.startsWith("http")
    ? local.mediaUrl
    : (local.mediaUrl ? `${API_BASE}/${local.mediaUrl}` : "");

  const isVideo =
    local.mediaType === "video" ||
    mediaUrl?.toLowerCase().endsWith(".mp4") ||
    mediaUrl?.toLowerCase().endsWith(".m3u8");

  const like = async () => {
    try {
      const { data } = await api.post(`/posts/${local._id}/like`, {}, { headers: authHeaders() });
      const liked = !local.liked;
      const nextLikes =
        typeof data?.likes === "number" ? data.likes : likeCount(local.likes) + (liked ? 1 : -1);
      const next = { ...local, liked, likes: nextLikes };
      setLocal(next);
      onChange?.(next);
    } catch (e) {
      console.error(e);
    }
  };

  const react = async (emoji) => {
    try {
      const { data } = await api.post(
        `/posts/${local._id}/react`,
        { type: emoji },
        { headers: authHeaders() }
      );
      const next = {
        ...local,
        reactions: data?.reactions || [],
        reactionsSummary: data?.reactionsSummary || tallyReactionsSummary(data?.reactions),
      };
      setLocal(next);
      onChange?.(next);
    } catch (e) {
      console.error(e);
    }
  };

  const onViewUpdate = (counts) => {
    // counts = { viewsCount, commentsCount, reactionsSummary, likes }
    const next = {
      ...local,
      viewsCount: counts?.viewsCount ?? local.viewsCount ?? 0,
      commentsCount: counts?.commentsCount ?? local.commentsCount ?? local.comments?.length ?? 0,
      reactionsSummary:
        counts?.reactionsSummary ?? local.reactionsSummary ?? tallyReactionsSummary(local.reactions),
      likes: typeof counts?.likes === "number" ? counts.likes : local.likes,
    };
    setLocal(next);
    onChange?.(next);
  };

  const counts = tallyReactionsSummary(local.reactionsSummary || local.reactions);
  const commentsCount =
    typeof local.commentsCount === "number"
      ? local.commentsCount
      : Array.isArray(local.comments)
      ? local.comments.length
      : 0;

  return (
    <>
      <NeonCard className="mb-6 p-4">
        {/* header */}
        <div className="flex items-center justify-between">
          <p className="font-semibold">{local.userId?.username || "Anonymous"}</p>
          <span className="text-xs text-white/60">
            {local.createdAt ? new Date(local.createdAt).toLocaleString() : ""}
          </span>
        </div>

        {/* media */}
        {mediaUrl && (
          isVideo ? (
            <ProVideo
              src={mediaUrl}
              poster={local.thumbUrl}
              postId={local._id}
              onDoubleLike={like}
              onViewUpdate={onViewUpdate}
              className="mt-3 shadow-lift"
            />
          ) : (
            <img
              src={mediaUrl}
              alt=""
              className="w-full h-auto rounded mt-3 shadow-lift object-cover"
            />
          )
        )}

        {/* caption */}
        {local.caption && <p className="mt-3">{local.caption}</p>}

        {/* actions */}
        <div className="mt-3 flex items-center justify-between">
          <LikeButton liked={!!local.liked} count={likeCount(local.likes)} onClick={like} />
          <ReactionBar onReact={react} summary={counts} />
          <button
            onClick={() => setOpenComments(true)}
            className="px-3 py-2 rounded-xl bg-white/5 text-white/80 flex items-center gap-2"
            title="Comments"
          >
            <MessageSquare size={18} />
            <span className="text-sm">{commentsCount}</span>
          </button>
        </div>

        {/* footer stats */}
        <div className="mt-2 text-xs text-white/60 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Eye size={14} /> {local.viewsCount ?? 0}
          </span>
          <span>
            {Object.entries(counts)
              .filter(([_, v]) => v > 0)
              .map(([k, v]) => `${k} ${v}`)
              .join("  •  ")}
          </span>
        </div>
      </NeonCard>

      <CommentsSheet
        postId={local._id}
        open={openComments}
        onClose={() => setOpenComments(false)}
        onAfterPost={(newList) => {
          const next = { ...local, comments: newList, commentsCount: newList.length };
          setLocal(next);
          onChange?.(next);
        }}
      />
    </>
  );
}
