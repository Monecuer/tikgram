import { motion } from "framer-motion";

const EMOJIS = ["❤️","🔥","😂","😮","😍","💯"];

export default function ReactionBar({ onReact }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-glass rounded-2xl px-3 py-2">
      {EMOJIS.map((e, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.8 }}
          whileHover={{ y: -1 }}
          className="text-lg"
          onClick={() => onReact?.(e)}
          aria-label={`React ${e}`}
        >
          {e}
        </motion.button>
      ))}
    </div>
  );
}
