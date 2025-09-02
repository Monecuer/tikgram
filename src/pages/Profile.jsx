// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { api, authHeaders } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // editable fields
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/users/me", { headers: authHeaders() });
        setMe(data);
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
      } catch (e) {
        // if not authed, bounce to login
        nav("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nav]);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreview(url);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      // send the *file* if user picked one
      if (file) fd.append("avatar", file);
      // otherwise keep current avatarUrl (optional, backend can ignore if file present)
      if (avatarUrl && !file) fd.append("avatarUrl", avatarUrl);
      fd.append("bio", bio || "");

      const res = await api.patch("/api/users/me", fd, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      // reflect returned user
      setMe(res.data);
      setAvatarUrl(res.data.avatarUrl || avatarUrl);
      setFile(null);
      setPreview("");
    } catch (err) {
      console.error("Save failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.msg || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="h-24 w-24 animate-pulse rounded-full bg-white/10 mb-4" />
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-4 text-2xl font-bold">Your Profile</h1>

      <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-glass bg-white/5 p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* preview order: picked file -> preview -> avatarUrl from backend */}
            <img
              src={preview || (me?.avatarUrl ? me.avatarUrl : "/avatar-placeholder.png")}
              alt="avatar"
              className="h-24 w-24 rounded-full object-cover border border-white/10"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Change avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={onPickFile}
              className="block text-sm"
            />
            {!file && (
              <input
                type="url"
                placeholder="Or paste image URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-2 w-full rounded-lg bg-black/30 p-2 text-sm outline-none border border-white/10"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg bg-black/30 p-3 outline-none border border-white/10"
            maxLength={2200}
          />
          <div className="mt-1 text-right text-xs text-white/60">{bio.length}/2200</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60">
            @{me?.username}
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`rounded-xl px-4 py-2 font-semibold transition ${
              saving
                ? "bg-white/20 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-500"
            }`}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
