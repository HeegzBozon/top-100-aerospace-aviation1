import { Rocket } from 'lucide-react';
import { LiveNewsPanel } from '@/components/capabilities/global-intelligence/LiveNewsPanel';

export default function EditorialLiveFeeds() {
  return (
    <div
      className="rounded-2xl overflow-hidden border h-full flex flex-col"
      style={{ borderColor: 'rgba(30,58,90,0.1)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{
          background: 'linear-gradient(135deg, #1e3a5a 0%, #152a42 100%)',
          borderColor: 'rgba(30,58,90,0.2)',
        }}
      >
        <Rocket className="w-3.5 h-3.5 text-amber-400" />
        <span
          className="text-xs font-bold text-white tracking-wide"
          style={{ fontFamily: "var(--brand-font-serif, 'Playfair Display', Georgia, serif)" }}
        >
          Next Launch Livestream
        </span>
        <div className="flex-1" />
        <span className="flex items-center gap-1 text-[9px] text-amber-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> STANDBY
        </span>
      </div>
      <div className="flex-1 min-h-0 bg-[#0a0f1e] p-2">
        <LiveNewsPanel />
      </div>
    </div>
  );
}