import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { api } from "../../lib/api";
import { Pause, Play, Volume2, VolumeX, Loader2 } from "lucide-react";

/**
 * TikTok-style video:
 * - Autoplay when >=65% in view; pause when <35%; stop (reset) at 0%
 * - Only ONE video plays at a time (global event)
 * - Custom UI (spinner, play/pause, mute, progress)
 * - View ping after ~3s watched -> POST /posts/:id/view
 */
export default function ProVideo({
  src,
  poster,
  className = "",
  postId,
  onViewUpdate,       // ({ viewsCount, commentsCount, reactionsSummary, likes })
  onDoubleLike,       // optional
}) {
  const vRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const sentViewRef = useRef(false);
  const lastTRef = useRef(0);
  const watchMsRef = useRef(0);

  // load source (HLS/MP4)
  useEffect(() => {
    const v = vRef.current;
    if (!v || !src) return;

    setReady(false);
    setBuffering(true);
    setPlaying(false);
    sentViewRef.current = false;
    watchMsRef.current = 0;
    lastTRef.current = 0;

    let hls;
    const onLoaded = () => { setReady(true); setBuffering(false); };

    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      hls = new Hls({ autoStartLoad: true });
      hls.loadSource(src);
      hls.attachMedia(v);
      hls.on(Hls.Events.MANIFEST_PARSED, onLoaded);
      hls.on(Hls.Events.ERROR, () => setBuffering(false));
    } else {
      v.addEventListener("loadedmetadata", onLoaded);
      if (v.readyState >= 1) onLoaded();
    }

    return () => {
      v.removeEventListener("loadedmetadata", onLoaded);
      hls?.destroy();
    };
  }, [src]);

  // intersection autoplay/pause/stop
  useEffect(() => {
    const v = vRef.current;
    if (!v) return;

    const io = new IntersectionObserver((entries) => {
      const r = entries[0].intersectionRatio;

      if (r >= 0.65) {
        // try to play muted
        if (v.paused) {
          v.muted = true; setMuted(true);
          v.playsInline = true;
          v.play().catch(()=>{});
        }
      } else if (r <= 0.35) {
        if (!v.paused) v.pause();
      }

      if (r === 0) {
        if (!v.paused) v.pause();
        try { v.currentTime = 0; } catch {}
      }
    }, { threshold: [0, 0.35, 0.65, 1] });

    io.observe(v);
    return () => io.disconnect();
  }, []);

  // single-video policy
  useEffect(() => {
    const v = vRef.current;
    if (!v) return;

    const onGlobalPlay = (ev) => {
      const other = ev.detail?.el;
      if (other && other !== v && !v.paused) v.pause();
    };
    const onPlay = () => {
      document.dispatchEvent(new CustomEvent("tikgram:video-playing", { detail: { el: v } }));
    };

    document.addEventListener("tikgram:video-playing", onGlobalPlay);
    v.addEventListener("play", onPlay);
    return () => {
      document.removeEventListener("tikgram:video-playing", onGlobalPlay);
      v.removeEventListener("play", onPlay);
    };
  }, []);

  // events: progress, buffering, view ping
  useEffect(() => {
    const v = vRef.current;
    if (!v) return;

    const onWaiting = () => setBuffering(true);
    const onPlaying = () => { setBuffering(false); setPlaying(true); };
    const onPause   = () => setPlaying(false);
    const onEnded   = () => setPlaying(false);
    const onTime    = () => {
      const dur = v.duration || 0;
      if (dur > 0) setProgress(v.currentTime / dur);

      if (!v.paused) {
        const nowT = v.currentTime;
        const deltaMs = Math.max(0, (nowT - lastTRef.current) * 1000);
        watchMsRef.current += deltaMs;
        lastTRef.current = nowT;

        if (!sentViewRef.current && watchMsRef.current >= 3000 && postId) {
          sentViewRef.current = true;
          const headers = {};
          const token = localStorage.getItem("token");
          if (token) headers.Authorization = `Bearer ${token}`;
          api.post(`/posts/${postId}/view`, { watchMs: Math.round(watchMsRef.current) }, { headers })
            .then((res) => onViewUpdate?.(res.data))
            .catch(()=>{});
        }
      }
    };

    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("timeupdate", onTime);
    return () => {
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("timeupdate", onTime);
    };
  }, [postId, onViewUpdate]);

  const togglePlay = () => {
    const v = vRef.current; if (!v) return;
    if (v.paused) v.play().catch(()=>{});
    else v.pause();
  };
  const toggleMute = () => {
    const v = vRef.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };
  const seek = (e) => {
    const v = vRef.current; if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    try { v.currentTime = (v.duration || 0) * ratio; } catch {}
  };
  const onDbl = () => onDoubleLike?.();

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} onDoubleClick={onDbl}>
      <video
        ref={vRef}
        src={src.endsWith(".m3u8") ? undefined : src}
        poster={poster}
        playsInline
        muted
        controls={false}               // hide native controls
        disablePictureInPicture
        className="w-full h-auto bg-black"
      />

      {/* Spinner */}
      {(!ready || buffering) && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="rounded-full px-3 py-2 bg-black/40 backdrop-blur border border-white/10 flex items-center gap-2">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm">Loading…</span>
          </div>
        </div>
      )}

      {/* Center play/pause */}
      <button
        onClick={togglePlay}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-3 bg-black/40 border border-white/10 backdrop-blur transition-opacity ${playing ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={24}/> : <Play size={24}/>}
      </button>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute right-2 top-2 rounded-full p-2 bg-black/40 border border-white/10 backdrop-blur"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
      </button>

      {/* Progress bar (seek) */}
      <div className="absolute left-0 right-0 bottom-0 p-3">
        <div className="h-1 w-full bg-white/20 rounded cursor-pointer" onClick={seek}>
          <div className="h-1 bg-primary rounded" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
