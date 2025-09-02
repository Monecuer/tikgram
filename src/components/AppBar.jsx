export default function AppBar() {
  return (
    <div className="sticky top-0 z-20 bg-bg/80 backdrop-blur-glass border-b border-glass">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="font-semibold">TikGram</a>
        <div className="flex items-center gap-3 text-sm">
          <a href="/upload" className="text-primary">Upload</a>
          <a href="/login" className="text-white/70 hover:text-white">Login</a>
        </div>
      </div>
    </div>
  );
}
