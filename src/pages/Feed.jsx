import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, authHeaders, isAuthed } from "../lib/api.js";
import PostCard from "../components/PostCard.jsx";
import FAB from "../components/animated/FAB.jsx";
import Skeleton from "../components/animated/Skeleton.jsx";
import PullToRefresh from "../components/animated/PullToRefresh.jsx";
import NotificationsBell from "../components/notifications/NotificationsBell.jsx";
import { LoginModal, SignupModal } from "../components/modals/AuthModals.jsx";
import LoginGate from "../components/auth/LoginGate.jsx";
import { Settings, User, LogIn, UserPlus, Flame, RefreshCw } from "lucide-react";

export default function Feed() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [authed, setAuthed] = useState(isAuthed());
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [tab, setTab] = useState("For You"); // "For You" | "Following" | "Trending"

  const load = async () => {
    try {
const { data } = await api.get("/api/posts", { headers: authHeaders() });
      setPosts(Array.isArray(data) ? data : []);
    } catch { setPosts([]); }
  };

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
      if (!authed) {
        // soft prompt just once
        setTimeout(() => setShowGate(true), 600);
      }
    })();
  }, []);

  const onCreated = (p) => setPosts(prev => [p, ...prev]);

  const guard = (nextTab) => {
    if (!authed && (nextTab === "Following" || nextTab === "Trending")) {
      setShowGate(true);
      return;
    }
    setTab(nextTab);
  };

  const onAuthSuccess = () => {
    setAuthed(true);
    setShowGate(false);
    load();
  };

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xl font-extrabold tracking-tight">TikGram</div>
        <div className="flex items-center gap-2">
          {authed ? (
            <>
              <NotificationsBell onOpen={() => guard("Following")} />
              <Link to="/profile" className="p-2 rounded-xl bg-white/5 border border-white/10">
                <User size={18}/>
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setOpenLogin(true)}
                className="p-2 rounded-xl bg-white/5 border border-white/10"
                title="Log in"
              >
                <LogIn size={18}/>
              </button>
              <button
                onClick={() => setOpenSignup(true)}
                className="p-2 rounded-xl bg-white/5 border border-white/10"
                title="Sign up"
              >
                <UserPlus size={18}/>
              </button>
            </>
          )}
          <Link to="/settings" className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Settings size={18}/>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {["For You", "Following", "Trending"].map((t) => {
          const active = tab === t;
          const Icon = t === "For You" ? RefreshCw : t === "Trending" ? Flame : User;
          return (
            <button
              key={t}
              onClick={() => guard(t)}
              className={`flex items-center justify-center gap-2 rounded-2xl py-2 border ${
                active
                  ? "bg-white/15 border-white/20"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <Icon size={16}/>
              <span className="text-sm font-semibold">{t}</span>
            </button>
          );
        })}
      </div>

      <PullToRefresh onRefresh={load} />

      {loading ? (
        <>
          <Skeleton className="h-60 w-full mb-4" />
          <Skeleton className="h-60 w-full mb-4" />
        </>
      ) : posts.length ? (
        posts.map((p) => (
          <PostCard
            key={p._id}
            post={p}
            onChange={(next) =>
              setPosts((prev) => prev.map((x) => (x._id === next._id ? next : x)))
            }
            // If not authed, opening comments or react will trigger gate
            onRequireAuth={() => setShowGate(true)}
          />
        ))
      ) : (
        <div className="text-center opacity-70 py-10">No posts yet.</div>
      )}

      {/* Floating create (auth required – PostCard/Upload should also warn) */}
      <FAB onClick={() => (authed ? nav("/upload") : setShowGate(true))} />

      {/* Auth bits */}
      <LoginGate
        open={showGate}
        onClose={() => setShowGate(false)}
        onLogin={() => { setShowGate(false); setOpenLogin(true); }}
        onSignup={() => { setShowGate(false); setOpenSignup(true); }}
      />
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} onSuccess={onAuthSuccess}/>
      <SignupModal open={openSignup} onClose={() => setOpenSignup(false)} onSuccess={onAuthSuccess}/>
    </div>
  );
}
