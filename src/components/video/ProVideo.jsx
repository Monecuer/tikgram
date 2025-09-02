import { useEffect, useRef, useState } from "react";

export default function ProVideo({
  src,
  poster,
  className = "",
  onDoubleLike,
  preloadNextSrc
}) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(true);

  // autoplay/pause by visibility
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          el.muted = true;
          el.playsInline = true;
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.25, 0.6, 0.9] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // preload next video lightly
  useEffect(() => {
    if (!preloadNextSrc) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = preloadNextSrc;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, [preloadNextSrc]);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-black/40">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}
      <video
        ref={ref}
        src={src}
        poster={poster}
        playsInline
        muted
        loop
        preload="metadata"
        className="w-full h-auto block"
        onLoadedData={() => setLoading(false)}
        onDoubleClick={onDoubleLike}
        controls={false}
      />
    </div>
  );
}
