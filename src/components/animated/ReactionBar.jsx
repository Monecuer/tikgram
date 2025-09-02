// src/components/ReactionBar.jsx
import { motion, AnimatePresence } from "framer-motion";

export const EMOJIS = ["❤️", "🔥", "😂", "😮", "😍", "💯"];

/**
 * ReactionBar
 * Props:
 * - summary: { [emoji]: number }   // e.g. { "❤️": 3, "🔥": 1 }
 * - myReaction: string | null      // one of EMOJIS if user has reacted
 * - onReact: (emoji: string) => void
 * - disabled: boolean
 * - className: string
 */
export default function ReactionBar({
  summary = {},
  myReaction = null,
  onReact,
  disabled = false,
  className = "",
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border border-glass bg-white/5 px-3 py-2 ${className}`}
      role="group"
      aria-label="Reactions"
    >
      {EMOJIS.map((emoji) => {
        const count = Number(summary?.[emoji] ?? 0);
        const isMine = myReaction === emoji;

        return (
          <motion.button
            key={emoji}
            type="button"
            whileTap={!disabled ? { scale: 0.85 } : undefined}
            whileHover={!disabled ? { y: -2 } : undefined}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={[
              "relative select-none rounded-xl px-2 py-1 text-lg leading-none outline-none",
              "focus-visible:ring-2 focus-visible:ring-cyan-400/70",
              disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              isMine
                ? "ring-2 ring-pink-500/70 bg-pink-500/10"
                : "ring-0 hover:bg-white/10",
            ].join(" ")}
            onClick={() => !disabled && onReact?.(emoji)}
            aria-pressed={isMine}
            aria-label={`React ${emoji}${isMine ? " (selected)" : ""}`}
            title={`React ${emoji}`}
            disabled={disabled}
          >
            <span className="inline-block">{emoji}</span>

            {/* Count badge */}
            <AnimatePresence initial={false} mode="popLayout">
              {count > 0 && (
                <motion.span
                  key={`${emoji}-count`}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -6, opacity: 0 }}
                  transition={{ type: "tween", duration: 0.18 }}
                  className="absolute -right-2 -top-2 rounded-full bg-black/70 px-1.5 text-[10px] font-semibold text-white backdrop-blur"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

/* Optional skeleton if you want a loading shimmer */
export function ReactionBarSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-glass bg-white/5 px-3 py-2">
      {Array.from({ length: EMOJIS.length }).map((_, i) => (
        <div
          key={i}
          className="h-7 w-9 animate-pulse rounded-xl bg-white/10"
        />
      ))}
    </div>
  );
}
