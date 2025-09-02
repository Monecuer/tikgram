import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PullToRefresh({ onRefresh }) {
  const area = useRef(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let startY = 0, active = false;
    const el = area.current;

    const start = (e) => {
      if (window.scrollY > 0) return;
      active = true;
      startY = (e.touches?.[0]?.clientY ?? e.clientY);
    };
    const move = (e) => {
      if (!active) return;
      const y = (e.touches?.[0]?.clientY ?? e.clientY);
      const delta = Math.max(0, y - startY);
      setPull(Math.min(delta, 120));
    };
    const end = async () => {
      if (!active) return;
      active = false;
      if (pull > 80 && onRefresh) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
      setPull(0);
    };

    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    el.addEventListener("touchend", end);
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
    };
  }, [pull, onRefresh]);

  return (
    <div ref={area} className="relative">
      <AnimatePresence>
        {(pull > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, height: refreshing ? 64 : pull/2 }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex items-center justify-center text-xs text-white/70"
          >
            <div className="w-40 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, (pull/80)*100)}%` }}
              />
            </div>
            <span className="ml-2">{refreshing ? "Refreshing…" : "Pull to refresh"}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
