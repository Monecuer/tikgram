import Modal from "../ui/Modal.jsx";

export default function LoginGate({ open, onClose, onLogin, onSignup }) {
  return (
    <Modal open={open} onClose={onClose} title="Unlock more with a free account">
      <div className="space-y-3">
        <p className="text-sm text-white/80">
          Log in or sign up to see <b>Daily</b> and <b>Trending</b>, react with emojis,
          leave comments, and follow creators.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onLogin}
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 font-semibold"
          >
            Log in
          </button>
          <button
            onClick={onSignup}
            className="flex-1 rounded-xl bg-pink-600 hover:bg-pink-500 py-2 font-semibold"
          >
            Sign up
          </button>
        </div>
        <button onClick={onClose} className="w-full text-sm opacity-70 hover:opacity-100">
          Maybe later
        </button>
      </div>
    </Modal>
  );
}
