import { useMemo } from "react";

export default function ProgressBar({ current, duration, bufferedRanges = [], onSeek }) {
  const pct = duration ? (current / duration) * 100 : 0;
  const buffers = useMemo(() => {
    if (!duration) return [];
    return bufferedRanges.map(([s, e], i) => {
      const left = (s / duration) * 100;
      const width = ((e - s) / duration) * 100;
      return <div key={i} className="absolute top-0 h-1 bg-white/30 rounded" style={{ left: `${left}%`, width: `${width}%` }} />;
    });
  }, [bufferedRanges, duration]);

  const click = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    onSeek?.(ratio * duration);
  };

  return (
    <div className="relative h-1 w-full bg-white/10 rounded cursor-pointer" onClick={click}>
      {buffers}
      <div className="absolute top-0 h-1 bg-primary rounded" style={{ width: `${pct}%` }} />
    </div>
  );
}
