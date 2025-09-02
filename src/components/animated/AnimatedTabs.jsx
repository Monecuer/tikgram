import { useState, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { cx } from "../../lib/cx";

export default function AnimatedTabs({ tabs = [], initial = 0, onChange }) {
  const [active, setActive] = useState(initial);
  const refs = useRef([]);

  const [bar, setBar] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const el = refs.current[active];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement.getBoundingClientRect();
      setBar({ left: rect.left - parent.left, width: rect.width });
    }
  }, [active, tabs.length]);

  const select = (i) => {
    setActive(i);
    onChange?.(i);
  };

  return (
    <div className="relative">
      <div className="flex gap-1 bg-white/5 rounded-2xl p-1 border border-glass">
        {tabs.map((t, i) => (
          <button
            key={i}
            ref={(el) => (refs.current[i] = el)}
            onClick={() => select(i)}
            className={cx(
              "relative z-10 px-4 py-2 rounded-xl text-sm",
              i === active ? "text-black" : "text-white/80"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* sliding highlight */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-xl bg-primary shadow-neon"
        initial={false}
        animate={{ left: bar.left, width: bar.width }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
      />
    </div>
  );
}

/** Usage
<AnimatedTabs
  tabs={[
    { label: "Posts", content: <PostsGrid/> },
    { label: "Remixes", content: <RemixesGrid/> },
    { label: "Challenges", content: <ChallengesGrid/> },
  ]}
  onChange={(i)=>setTab(i)}
/>
*/
