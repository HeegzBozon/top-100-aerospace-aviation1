import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Swords } from 'lucide-react';
import { chessManageChallenge } from '@/functions/chessManageChallenge';

export default function ChallengeModal({ open, onClose, targetUser }) {
  const [gameType, setGameType] = useState('turn_based');
  const [timeControl, setTimeControl] = useState('10+0');
  const [loading, setLoading] = useState(false);

  const handleChallenge = async () => {
    if (!targetUser) return;
    setLoading(true);
    await chessManageChallenge({
      action: 'create',
      challenged_email: targetUser.email,
      challenged_name: targetUser.full_name || targetUser.email,
      game_type: gameType,
      time_control: timeControl
    });
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--accent,#c9a84c)] mb-1">New Challenge</p>
          <DialogTitle className="text-lg font-bold tracking-tight">
            vs {targetUser?.full_name || targetUser?.email}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/35">Game Type</Label>
            <Select value={gameType} onValueChange={setGameType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="turn_based">Turn-Based (async)</SelectItem>
                <SelectItem value="real_time">Real-Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/35">Time Control</Label>
            <Select value={timeControl} onValueChange={setTimeControl}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-white/10 text-white">
                <SelectItem value="3+2">3+2 Blitz</SelectItem>
                <SelectItem value="5+0">5+0 Blitz</SelectItem>
                <SelectItem value="10+0">10+0 Rapid</SelectItem>
                <SelectItem value="15+10">15+10 Rapid</SelectItem>
                <SelectItem value="1 day">1 Day/Move</SelectItem>
                <SelectItem value="3 days">3 Days/Move</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1 border-white/10 text-white/50 hover:text-white h-10 text-sm" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1 bg-[var(--accent,#c9a84c)] text-black hover:bg-[var(--accent,#c9a84c)]/90 h-10 text-sm font-semibold"
              onClick={handleChallenge}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send Challenge'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}