import { useEffect, useState, useMemo } from "react";
import { api, authHeaders, API_BASE } from "../lib/api";
import ProVideo from "../components/video/ProVideo";
import LikeButton from "../components/animated/LikeButton";
import ReactionBar from "../components/animated/ReactionBar";
import { Eye, MessageSquare } from "lucide-react";

const toUrl = (u) => (u?.startsWith("http") ? u : `${API_BASE}/${u}`);

export default function Reels() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get("/posts", { headers: authHeaders() });
    // prefer videos first
    data.sort((a, b) => (b.mediaType === "video") - (a.mediaType === "video"));
    setPosts(data);
  };

  useEffect(() => {
    (async ()=>{ await load(); setLoading(false); })();
  }, []);

  const like = async (p) => {
    const { data } = await api.post(`/posts/${p._id}/like`, {}, { headers: authHeaders() });
    setPosts(prev => prev.map(x => x._id === p._id ? { ...x, likes: data.likes } : x));
  };

  const react = async (p, emoji) => {
    const { data } = await api.post(`/posts/${p._id}/react`, { type: emoji }, { headers: authHeaders() });
    setPosts(prev => prev.map(x => x._id === p._id ? { ...x, reactionsSummary: data.reactionsSummary } : x));
  };

  if (loading) return <div className="h-screen grid place-items-center">Loading…</div>;

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {posts.map((p, idx) => {
        const url = toUrl(p.mediaUrl);
        const isVideo = p.mediaType === "video" || url.endsWith(".mp4") || url.endsWith(".m3u8");
        return (
          <section key={p._id} className="h-screen w-full snap-start relative">
            <div className="absolute inset-0">
              {isVideo ? (
                <ProVideo
                  src={url}
                  poster={p.thumbUrl}
                  postId={p._id}
                  onViewUpdate={(counts) => {
                    setPosts(prev => prev.map(x => x._id === p._id ? { ...x, ...counts } : x));
                  }}
                  className="h-full w-full"
                />
              ) : (
                <img src={url} alt="" className="h-full w-full object-contain bg-black" />
              )}
            </div>

            {/* Overlay UI (right side controls) */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-3">
              <button onClick={() => like(p)} className="px-3 py-2 rounded-xl bg-white/10 text-white">
                ❤️ {Array.isArray(p.likes) ? p.likes.length : (p.likes || 0)}
              </button>
              <button className="px-3 py-2 rounded-xl bg-white/10 text-white">
                <MessageSquare className="inline mr-1" size={16}/> {p.commentsCount ?? (p.comments?.length || 0)}
              </button>
              <div className="px-3 py-2 rounded-xl bg-white/10 text-white text-sm">
                <Eye className="inline mr-1" size={14}/> {p.viewsCount ?? 0}
              </div>
            </div>

            {/* Reactions footer */}
            <div className="absolute left-0 right-0 bottom-3 px-4">
              <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-2">
                {["❤️","🔥","😂","😮","😍","💯"].map(e => (
                  <button
                    key={e}
                    onClick={() => react(p, e)}
                    className="px-3 py-2 rounded-xl bg-white/10 text-xl hover:bg-white/20"
                  >
                    {e} {(p.reactionsSummary?.[e] || 0)}
                  </button>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
