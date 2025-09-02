import { motion } from "framer-motion";
import { cx } from "../../lib/cx";

export default function NeonCard({ className, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cx(
        "rounded-2xl bg-card backdrop-blur-glass border border-glass shadow-neon",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
