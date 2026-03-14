import { useMemo, useRef, useEffect, useContext } from 'react';
import { Chess } from 'chess.js';
import { ThemeContext } from '@/components/core/ThemeContext';

export default function MoveHistory({ pgn }) {
  const { mode } = useContext(ThemeContext) || { mode: 'dark' };
  const isDark = mode === 'dark';
  const bottomRef = useRef(null);

  const moves = useMemo(() => {
    if (!pgn) return [];
    const chess = new Chess();
    try { chess.loadPgn(pgn); } catch { return []; }
    const history = chess.history();
    const pairs = [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({ num: Math.floor(i / 2) + 1, white: history[i], black: history[i + 1] || '' });
    }
    return pairs;
  }, [pgn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moves.length]);

  if (!moves.length) return (
    <p className={`text-xs italic text-center py-8 tracking-wide ${isDark ? 'text-white/25' : 'text-gray-400'}`}>No moves yet</p>
  );

  return (
    <div className="overflow-y-auto max-h-[340px] space-y-0.5 pr-1 scrollbar-hide" role="list" aria-label="Move history">
      {moves.map(({ num, white, black }, idx) => (
        <div
          key={num}
          className={`flex items-center text-sm font-mono gap-1.5 rounded-lg px-1 py-0.5 ${
            idx === moves.length - 1
              ? isDark ? 'bg-amber-500/10' : 'bg-yellow-100'
              : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-100'
          }`}
          role="listitem"
        >
          <span className={`w-7 shrink-0 text-xs ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{num}.</span>
          <span className={`flex-1 px-2 py-1 rounded-md text-xs ${
            idx === moves.length - 1 && !black
              ? isDark ? 'text-amber-300 font-semibold' : 'text-yellow-700 font-semibold'
              : isDark ? 'text-white/80' : 'text-gray-700'
          }`}>{white}</span>
          <span className={`flex-1 px-2 py-1 rounded-md text-xs ${
            idx === moves.length - 1 && black
              ? isDark ? 'text-amber-300 font-semibold' : 'text-yellow-700 font-semibold'
              : isDark ? 'text-white/50' : 'text-gray-600'
          }`}>{black}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}