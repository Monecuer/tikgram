import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import AnimatedTabs from "../components/animated/AnimatedTabs";
import NeonCard from "../components/animated/NeonCard";
import Skeleton from "../components/animated/Skeleton";
import PostCard from "../components/PostCard.jsx";
import { api, authHeaders, API_BASE } from "../lib/api";
import { Pencil, X, Save } from "lucide-react";

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}

export default function Profile() {
  const { id, username } = useParams(); // supports /u/:id and /@:username
  const path = useLocation().pathname;
  const isMeRoute = path === "/profile";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  // edit mode state
  const [edit, setEdit] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const mode = useMemo(() => {
    if (isMeRoute) return "me";
    if (username) return "username";
    return "id";
  }, [isMeRoute, username]);

  const load = async () => {
    const headers = authHeaders();
    let profRes;
    if (mode === "me")      profRes = await api.get("/users/me", { headers });
    else if (mode === "id") profRes = await api.get(`/users/${id}`, { headers });
    else                    profRes = await api.get(`/users/by-username/${username}`, { headers });

    const userId = profRes.data.user._id;
    const postsRes = await api.get(`/users/${userId}/posts`, { headers });

    setProfile(profRes.data);
    setPosts(postsRes.data);

    // seed edit fields if it’s me
    if (profRes.data.isMe) {
      setBio(profRes.data.user.bio || "");
      setAvatarUrl(profRes.data.user.avatarUrl || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    setEdit(false);
    setFile(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id, username]);

  const toggleFollow = async () => {
    const headers = authHeaders();
    const targetId = profile.user._id;
    const { data } = await api.post(`/users/${targetId}/follow`, {}, { headers });
    setProfile((p) => ({
      ...p,
      isFollowing: data.following,
      stats: { ...p.stats, followers: data.followerCount },
    }));
  };

  const preview = file
    ? URL.createObjectURL(file)
    : (avatarUrl
        ? (avatarUrl.startsWith("http") ? avatarUrl : `${API_BASE}/${avatarUrl}`)
        : `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.user?.username || "user"}`);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      if (file) form.append("avatar", file);
      if (avatarUrl && !file) form.append("avatarUrl", avatarUrl);
      form.append("bio", bio || "");
      const { data } = await api.patch("/users/me", form, {
        headers: { ...authHeaders() },
      });
      // reflect changes
      setProfile((p) => ({ ...p, user: { ...p.user, ...data.user } }));
      setEdit(false);
      setFile(null);
    } catch (e) {
      console.error(e);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 max-w-lg mx-auto">
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const u = profile.user;
  const stats = profile.stats;

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto pb-24">
      {/* Header card */}
      <NeonCard className="p-4">
        <div className="flex items-center gap-4">
          <img
            src={preview}
            className="w-20 h-20 rounded-full ring-2 ring-primary object-cover"
            alt=""
          />
          <div className="flex-1">
            <div className="text-xl font-semibold">@{u.username}</div>
            {!edit ? (
              <div className="text-sm text-white/70">{u.bio || "No bio yet"}</div>
            ) : (
              <div className="space-y-2 mt-2">
                <div>
                  <label className="text-xs text-white/60">Avatar file</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFile(e.target.files?.[0] || null);
                    }}
                    className="mt-1 block w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Avatar URL (optional)</label>
                  <input
                    className="mt-1 w-full bg-white/5 border border-glass rounded-xl px-3 py-2"
                    placeholder="https://…"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    disabled={!!file}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60">Bio</label>
                  <textarea
                    rows={3}
                    maxLength={220}
                    className="mt-1 w-full bg-white/5 border border-glass rounded-xl px-3 py-2"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Say something nice…"
                  />
                  <div className="text-[11px] text-white/50 mt-1">{bio.length}/220</div>
                </div>
              </div>
            )}
          </div>

          {/* Right side button */}
          {profile.isMe ? (
            !edit ? (
              <button
                onClick={() => setEdit(true)}
                className="p-2 rounded-xl bg-white/10 border border-glass"
                title="Edit Profile"
              >
                <Pencil size={18} />
              </button>
            ) : (
              <button
                onClick={() => { setEdit(false); setFile(null); setBio(u.bio || ""); setAvatarUrl(u.avatarUrl || ""); }}
                className="p-2 rounded-xl bg-white/10 border border-glass"
                title="Cancel"
              >
                <X size={18} />
              </button>
            )
          ) : (
            <button
              onClick={toggleFollow}
              className={`px-3 py-2 rounded-xl ${profile.isFollowing ? "bg-white/10 text-white" : "bg-primary text-black"}`}
            >
              {profile.isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <Stat label="Posts" value={stats.posts} />
          <Stat label="Followers" value={stats.followers} />
          <Stat label="Following" value={stats.following} />
          <Stat label="Likes" value={stats.totalLikes} />
        </div>

        {profile.isMe && !edit && (
          <div className="mt-3 text-xs text-white/60">
            Prefer a full page? <Link to="/settings/profile" className="underline text-primary">Edit in Settings</Link>
          </div>
        )}
      </NeonCard>

      {/* Tabs */}
      <div className="mt-4">
        <AnimatedTabs tabs={[{label:"Posts"},{label:"Remixes"},{label:"Challenges"}]} initial={0}/>
      </div>

      {/* Posts list */}
      <div className="mt-4 space-y-4">
        {posts.length === 0 ? (
          <NeonCard className="p-10 text-center text-white/60">No posts yet</NeonCard>
        ) : (
          posts.map((p) => <PostCard key={p._id} post={p} />)
        )}
      </div>

      {/* Sticky Save bar (only in edit mode) */}
      {profile.isMe && edit && (
        <div className="fixed left-0 right-0 bottom-0 z-40">
          <div className="mx-auto max-w-lg p-3">
            <div className="rounded-2xl bg-card border border-glass p-3 shadow-lift flex items-center gap-2">
              <button
                onClick={() => { setEdit(false); setFile(null); setBio(u.bio || ""); setAvatarUrl(u.avatarUrl || ""); }}
                className="flex-1 px-4 py-2 rounded-xl bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-black flex items-center justify-center gap-2"
              >
                <Save size={18} /> {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
