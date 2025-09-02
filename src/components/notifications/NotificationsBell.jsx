// src/components/notifications/NotificationsBell.jsx
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api, authHeaders, isAuthed } from "../../lib/api";

const POLL_MS = 15000;

export default function NotificationsBell({ onOpen }) {
  const [count, setCount] = useState(0);

  async function load() {
    if (!isAuthed()) {
      setCount(0);
      return;
    }
    try {
      const { data } = await api.get("/api/notifications", {
        headers: authHeaders(),
      });
      // backend may return an array or { unread }
      const unread = Array.isArray(data)
        ? data.filter((n) => !n.read).length
        : (data?.unread ?? 0);
      setCount(unread);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      onClick={onOpen}
      className="relative p-2 rounded-xl bg-white/5 border border-white/10"
      aria-label="Notifications"
    >
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 px-1 h-5 rounded-full bg-red-500 text-[10px] leading-5 text-white text-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
