export default function EditorialTerminal({ children, heroSlot }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5efe8 40%, #faf8f5 100%)' }}>
      {/* Main content area */}
      <div className="max-w-[1800px] mx-auto px-3 md:px-5 pt-0 pb-4">

        {/* ── Hero header ── */}
        <div className="w-full mb-0">
          {heroSlot}
        </div>

        <div className="max-w-[1400px] mx-auto space-y-2 md:space-y-3">
          {/* ── Editorial sections injected as children ── */}
          {children}
        </div>
      </div>
    </div>
  );
}