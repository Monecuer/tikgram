import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import { api, setAuthToken } from "../../lib/api.js";

export function LoginModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");

    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      const token = data?.token || data?.jwt || data?.accessToken;
      if (!token) throw new Error("No token returned");
      setAuthToken(token);
      onSuccess?.(data?.user || null);
      onClose?.();
      // optional: refresh feed
      window.location.reload();
    } catch (e) {
      setErr(e?.response?.data?.msg || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log in">
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-lg bg-black/30 p-2 border border-white/10"
               placeholder="Email" type="email" value={email}
               onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full rounded-lg bg-black/30 p-2 border border-white/10"
               placeholder="Password" type="password" value={password}
               onChange={(e)=>setPassword(e.target.value)} />
        {err && <div className="text-pink-400 text-sm">{err}</div>}
        <button disabled={busy}
          className={`w-full rounded-xl px-4 py-2 font-semibold transition ${
            busy ? "bg-white/20 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-500"
          }`}>
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>
    </Modal>
  );
}

export function SignupModal({ open, onClose, onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");

    try {
      const { data } = await api.post("/api/auth/signup", { username, email, password });
      const token = data?.token || data?.jwt || data?.accessToken;
      if (!token) throw new Error("No token returned");
      setAuthToken(token);
      onSuccess?.(data?.user || null);
      onClose?.();
      window.location.reload();
    } catch (e) {
      setErr(e?.response?.data?.msg || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Sign up">
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-lg bg-black/30 p-2 border border-white/10"
               placeholder="Username" value={username}
               onChange={(e)=>setUsername(e.target.value)} />
        <input className="w-full rounded-lg bg-black/30 p-2 border border-white/10"
               placeholder="Email" type="email" value={email}
               onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full rounded-lg bg-black/30 p-2 border border-white/10"
               placeholder="Password" type="password" value={password}
               onChange={(e)=>setPassword(e.target.value)} />
        {err && <div className="text-pink-400 text-sm">{err}</div>}
        <button disabled={busy}
          className={`w-full rounded-xl px-4 py-2 font-semibold transition ${
            busy ? "bg-white/20 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-500"
          }`}>
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
    </Modal>
  );
}
