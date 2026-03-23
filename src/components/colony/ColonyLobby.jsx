import { useState } from 'react';
import { Users, Mic, Video, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ColonyLobby({ onJoin, isLoading }) {
  const [roomName, setRoomName] = useState('colony-main');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(roomName.trim() || 'colony-main');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Colony</h1>
          <p className="text-slate-400 mt-2 text-sm">Your virtual gathering space</p>
        </div>

        {/* Join Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="room-name" className="text-slate-300 text-sm font-medium">
              Space Name
            </Label>
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="colony-main"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
              disabled={isLoading}
              aria-label="Space name"
            />
            <p className="text-xs text-slate-500">
              Enter a space name to join an existing room or create a new one.
            </p>
          </div>

          {/* Permissions Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex gap-2 mt-0.5">
              <Mic className="w-4 h-4 text-indigo-400 shrink-0" />
              <Video className="w-4 h-4 text-indigo-400 shrink-0" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Colony will request access to your microphone and camera. You can toggle them off after joining.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl min-h-[48px] gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining space…
              </>
            ) : (
              <>
                Enter Space
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}