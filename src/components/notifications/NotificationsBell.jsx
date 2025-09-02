// src/components/notifications/NotificationsBell.jsx
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api, authHeaders, isAuthed } from "../../lib/api";

export default function NotificationsBell({ onOpen }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer;

    const load = async () => {
      // If user isn't logged in, don't call the API
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
          ? data.filter((n) => !n.seen).length
          : (data?.unread ?? 0);

        setCount(unread);
      } catch (e) {
        // 401s etc — just show zero
        setCount(0);
      }
    };

    load();
    // poll every 15s
    timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <button
      onClick={onOpen}
      className="relative inline-flex items-center justify-center p-2 rounded-xl bg-white/5 border border-glass hover:bg-white/10 transition"
      aria-label="Notifications"
    >
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink-600 text-[10px] font-bold grid place-items-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
