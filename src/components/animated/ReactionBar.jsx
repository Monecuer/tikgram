import { motion } from "framer-motion";

const EMOJIS = ["❤️","🔥","😂","😮","😍","💯"];

export default function ReactionBar({ onReact }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-glass rounded-2xl px-3 py-2">
      {EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -1 }}
          className="text-lg"
          onClick={() => onReact?.(emoji)}
          aria-label={`React ${emoji}`}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
