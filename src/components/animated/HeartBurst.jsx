import { motion, AnimatePresence } from "framer-motion";

export default function HeartBurst({ show, x, y, onDone }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, x, y }}
          animate={{ opacity: 1, scale: 1, x, y }}
          exit={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pointer-events-none fixed z-[60]"
          onAnimationComplete={onDone}
        >
          <div className="text-primary drop-shadow-[0_0_20px_rgba(124,255,196,.6)] text-5xl select-none">❤️</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
