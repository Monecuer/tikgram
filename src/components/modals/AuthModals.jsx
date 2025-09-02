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
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuthToken(data.token);
      onSuccess?.(data);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.msg || "Login failed");
    } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title="Log in">
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none"
          placeholder="Email" type="email" value={email}
          onChange={(e)=>setEmail(e.target.value)} required
        />
        <input
          className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none"
          placeholder="Password" type="password" value={password}
          onChange={(e)=>setPassword(e.target.value)} required
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 font-semibold"
        >
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
    </Modal>
  );
}

export function SignupModal({ open, onClose, onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api.post("/auth/signup", { username, email, password });
      // auto-login after signup:
      const { data } = await api.post("/auth/login", { email, password });
      setAuthToken(data.token);
      onSuccess?.(data);
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.msg || "Signup failed");
    } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title="Create account">
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none"
          placeholder="Username" value={username}
          onChange={(e)=>setUsername(e.target.value)} required
        />
        <input
          className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none"
          placeholder="Email" type="email" value={email}
          onChange={(e)=>setEmail(e.target.value)} required
        />
        <input
          className="w-full rounded-xl bg-white/10 px-3 py-2 outline-none"
          placeholder="Password" type="password" value={password}
          onChange={(e)=>setPassword(e.target.value)} required
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button
          disabled={busy}
          className="w-full rounded-xl bg-pink-600 hover:bg-pink-500 py-2 font-semibold"
        >
          {busy ? "Creating..." : "Sign up"}
        </button>
      </form>
    </Modal>
  );
}
