import { Loader2, RotateCcw, Signal, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from './conferenceConfig';

// The three ways the host workspace is not yet open — reading, signed out, unreadable — held
// as one surface so both doors of the workspace answer identically.
export default function HostGate({ state, onRetry }) {
  if (state.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2" style={{ background: B.cream }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.copper }} />
        <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          Reading your standing
        </p>
      </div>
    );
  }

  if (state.signedOut) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-5 text-center" style={{ background: B.cream }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>Host workspace</p>
        <h1 className="mt-2 font-heading text-2xl" style={{ color: B.navy }}>The workspace opens with your account.</h1>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: B.muted }}>
          Sign in and the standing on your record is read — an approved host lands straight on
          their conferences.
        </p>
        <button
          type="button"
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: B.navy, color: '#fff' }}
        >
          <UserPlus className="h-3 w-3" /> Sign in
        </button>
      </div>
    );
  }

  if (state.failed) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-5 text-center" style={{ background: B.cream }}>
        <Signal className="h-5 w-5" style={{ color: B.copper }} />
        <h1 className="mt-2 font-heading text-2xl" style={{ color: B.navy }}>Your standing could not be read.</h1>
        <p className="mt-1 text-[12px]" style={{ color: B.muted }}>Nothing is lost. It is only the line.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: B.navy, color: '#fff' }}
        >
          <RotateCcw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  return null;
}