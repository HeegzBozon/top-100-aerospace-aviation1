/**
 * LivePoll — reusable component for host to push a poll to the room.
 * Used in both SessionSelector and WarmUpLibrary.
 * 
 * Props:
 *   liveSession    - the current LiveSession record
 *   options        - array of { id, label, desc? } 
 *   question       - string
 *   pollType       - 'warmup_pick' | 'session_pick' | 'custom'
 *   onClose        - callback
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vote, X, CheckCircle2, Radio, BarChart3, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LivePoll({ liveSession, options, question, pollType, onClose, onResult }) {
  const [pollState, setPollState] = useState(null);
  const [launched, setLaunched] = useState(false);

  // Subscribe to live updates
  useEffect(() => {
    if (!liveSession?.id) return;
    const unsub = base44.entities.LiveSession.subscribe((event) => {
      if (event.id === liveSession.id && event.data?.active_poll) {
        setPollState(event.data.active_poll);
      }
    });
    // Load initial
    base44.entities.LiveSession.filter({ id: liveSession.id }, '', 1)
      .then(r => { if (r?.[0]?.active_poll) setPollState(r[0].active_poll); })
      .catch(() => {});
    return unsub;
  }, [liveSession?.id]);

  const totalVotes = pollState
    ? Object.values(pollState.votes || {}).reduce((a, b) => a + b, 0)
    : 0;

  const launchPoll = async () => {
    const poll = {
      question,
      type: pollType,
      options: options.map(o => ({ id: o.id, label: o.label, desc: o.desc || '' })),
      votes: Object.fromEntries(options.map(o => [o.id, 0])),
      voter_ids: [],
      is_open: true,
    };
    await base44.entities.LiveSession.update(liveSession.id, { active_poll: poll, status: 'selecting' });
    setPollState(poll);
    setLaunched(true);
  };

  const closePoll = async () => {
    if (!pollState) return;
    const closed = { ...pollState, is_open: false };
    await base44.entities.LiveSession.update(liveSession.id, { active_poll: closed });
    setPollState(closed);
    // Find winner
    const votes = closed.votes || {};
    const winnerId = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
    const winner = options.find(o => o.id === winnerId);
    if (onResult && winner) onResult(winner);
  };

  if (!liveSession) {
    return (
      <div className="rounded-2xl border border-white/10 p-5 text-center"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <Vote className="w-5 h-5 text-white/30 mx-auto mb-2" />
        <p className="text-white/40 text-sm">Start a live session first to open voting to participants.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#c9a87c]/25 overflow-hidden"
      style={{ background: 'rgba(201,168,124,0.05)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Vote className="w-4 h-4 text-[#c9a87c]" />
          <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Community Vote</span>
          {launched && pollState?.is_open && (
            <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-4">
        <p className="text-white font-semibold text-sm mb-4">{question}</p>

        {/* Options with live vote bars */}
        <div className="space-y-2 mb-5">
          {options.map(opt => {
            const count = pollState?.votes?.[opt.id] || 0;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isWinning = launched && !pollState?.is_open &&
              count === Math.max(...Object.values(pollState?.votes || {}));
            return (
              <div key={opt.id} className={`relative rounded-xl border overflow-hidden transition-all ${isWinning ? 'border-[#c9a87c]/60' : 'border-white/10'}`}
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                {/* Vote bar */}
                <div className="absolute inset-0 transition-all duration-700 rounded-xl"
                  style={{ width: `${pct}%`, background: isWinning ? 'rgba(201,168,124,0.18)' : 'rgba(255,255,255,0.05)' }} />
                <div className="relative flex items-center gap-3 px-4 py-3">
                  {isWinning && <CheckCircle2 className="w-4 h-4 text-[#c9a87c] shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isWinning ? 'text-[#c9a87c]' : 'text-white'}`}>{opt.label}</p>
                    {opt.desc && <p className="text-white/40 text-xs">{opt.desc}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white text-sm font-bold">{count}</p>
                    {launched && <p className="text-white/40 text-[10px]">{pct}%</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalVotes > 0 && (
          <p className="text-white/40 text-xs mb-4">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast</p>
        )}

        {!launched ? (
          <button onClick={launchPoll}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-[#07111f]"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
            <Send className="w-4 h-4" /> Open Vote to Room ({liveSession.participant_count || 0} in room)
          </button>
        ) : pollState?.is_open ? (
          <button onClick={closePoll}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-[#c9a87c]/40 text-[#c9a87c] hover:bg-[#c9a87c]/10 transition-colors">
            <BarChart3 className="w-4 h-4" /> Close Vote & See Winner
          </button>
        ) : (
          <div className="text-center">
            <p className="text-green-400 text-sm font-bold mb-1">✓ Vote closed</p>
            {onResult && <p className="text-white/40 text-xs">Winner applied.</p>}
          </div>
        )}
      </div>
    </div>
  );
}