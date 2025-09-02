import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NeonCard from "../components/animated/NeonCard";
import { api, authHeaders, API_BASE } from "../lib/api";

export default function EditProfile() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/users/me", { headers: authHeaders() });
      setMe(data.user);
      setBio(data.user.bio || "");
      setAvatarUrl(data.user.avatarUrl || "");
    })();
  }, []);

  const preview = file
    ? URL.createObjectURL(file)
    : (avatarUrl?.startsWith("http") ? avatarUrl : (avatarUrl ? `${API_BASE}/${avatarUrl}` : ""));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      if (file) form.append("avatar", file);
      if (avatarUrl && !file) form.append("avatarUrl", avatarUrl);
      form.append("bio", bio || "");
      await api.patch("/users/me", form, {
        headers: { ...authHeaders(), /* axios sets boundary */ },
      });
      alert("Profile updated!");
      nav("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!me) return <div className="p-4 max-w-lg mx-auto">Loading…</div>;

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <NeonCard className="p-4">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={preview || `https://api.dicebear.com/7.x/initials/svg?seed=${me.username}`}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-primary"
            />
            <div className="text-sm text-white/70">Choose a file or paste an image URL.</div>
          </div>

          <div>
            <label className="text-sm text-white/70">Avatar file</label>
            <input
              type="file" accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Avatar URL (optional)</label>
            <input
              className="mt-1 w-full bg-white/5 border border-glass rounded-xl px-3 py-2"
              placeholder="https://…"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={!!file}
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Bio</label>
            <textarea
              className="mt-1 w-full bg-white/5 border border-glass rounded-xl px-3 py-2"
              rows={4}
              maxLength={220}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Say something nice…"
            />
            <div className="text-xs text-white/50 mt-1">{bio.length}/220</div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-primary text-black"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </NeonCard>
    </div>
  );
}
