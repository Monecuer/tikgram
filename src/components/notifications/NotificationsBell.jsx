import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api, authHeaders, isAuthed } from "../../lib/api.js";

export default function NotificationsBell({ onOpen }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthed()) return; // don’t poll if logged out
    let t;
    const load = async () => {
      try {
        const { data } = await api.get("/notifications", { headers: authHeaders() });
        setCount(Array.isArray(data) ? data.length : data.count || 0);
      } catch { /* ignore */ }
    };
    load();
    t = setInterval(load, 20_000);
    return () => t && clearInterval(t);
  }, []);

  return (
    <button
      onClick={onOpen}
      className="relative p-2 rounded-xl bg-white/5 border border-white/10"
      title={isAuthed() ? "Notifications" : "Login to enable notifications"}
    >
      <Bell size={18}/>
      {isAuthed() && count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full text-xs bg-pink-600 grid place-items-center">
          {count}
        </span>
      )}
    </button>
  );
}
