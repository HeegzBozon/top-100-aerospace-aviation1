import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bot, Zap, Brain, Cpu } from 'lucide-react';
import { chessManageChallenge } from '@/functions/chessManageChallenge';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const BOTS = [
  {
    difficulty: 'simple',
    name: 'Rookie',
    icon: Bot,
    elo: '~800',
    tagline: 'Plays random moves',
    description: 'Perfect for learning the game. Rookie makes no strategic decisions.',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
  },
  {
    difficulty: 'intermediate',
    name: 'Strategist',
    icon: Brain,
    elo: '~1400',
    tagline: 'Basic positional awareness',
    description: 'Evaluates material and positions 2 moves ahead. A genuine challenge.',
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/50',
  },
  {
    difficulty: 'advanced',
    name: 'Commander',
    icon: Cpu,
    elo: '~1900',
    tagline: 'Calculates 4 moves ahead',
    description: 'Full minimax with alpha-beta pruning and piece-square tables. Bring your A-game.',
    accent: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/50',
  },
];

export default function BotSelectModal({ open, onClose }) {
  const [loading, setLoading] = useState(null);

  const handleSelect = async (difficulty) => {
    setLoading(difficulty);
    try {
      const res = await chessManageChallenge({ action: 'start_bot_game', bot_difficulty: difficulty });
      if (res?.data?.error) {
        toast.error(res.data.error);
      } else {
        const gameId = res?.data?.game?.id;
        if (gameId) {
          window.location.href = createPageUrl(`ChessGame?id=${gameId}`);
        }
      }
    } catch {
      toast.error('Failed to start bot game. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111] border-black/10 dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-base font-black tracking-tight text-black dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4" /> Play vs Bot
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {BOTS.map(({ difficulty, name, icon: Icon, elo, tagline, description, accent, bg, border }) => (
            <button
              key={difficulty}
              disabled={!!loading}
              onClick={() => handleSelect(difficulty)}
              className={`w-full text-left p-4 rounded-lg border transition-all min-h-[44px] ${bg} ${border} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={`Play against ${name} bot`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${accent}`}>
                  {loading === difficulty
                    ? <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    : <Icon className="w-5 h-5" aria-hidden="true" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold text-sm ${accent}`}>{name}</span>
                    <span className="text-[10px] font-semibold tabular-nums text-black/40 dark:text-white/40 uppercase tracking-wide">ELO {elo}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-black/60 dark:text-white/60 mt-0.5">{tagline}</p>
                  <p className="text-[11px] text-black/40 dark:text-white/40 mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}