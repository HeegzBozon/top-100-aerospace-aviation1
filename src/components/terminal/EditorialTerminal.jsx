import EditorialTickerBar from './EditorialTickerBar';

export default function EditorialTerminal({ children, heroSlot }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5efe8 40%, #faf8f5 100%)' }}>
      {/* Ticker bar */}
      <EditorialTickerBar />

      {/* Main content area */}
      <div className="max-w-[1800px] mx-auto px-3 md:px-5 py-4">

        {/* ── Hero header ── */}
        <div className="w-full mb-6">
          {heroSlot}
        </div>

        <div className="max-w-[1400px] mx-auto space-y-5">
          {/* ── Editorial sections injected as children ── */}
          {children}
        </div>
      </div>
    </div>
  );
}