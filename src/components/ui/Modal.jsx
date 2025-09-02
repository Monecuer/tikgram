import { AnimatePresence, motion } from "framer-motion";

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 shadow-xl"
          >
            {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
