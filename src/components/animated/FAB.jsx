import { Plus } from "lucide-react";

export default function FAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-4 z-40 w-14 h-14 rounded-full bg-primary text-black shadow-neon flex items-center justify-center"
      title="Create"
    >
      <Plus size={24} />
    </button>
  );
}
