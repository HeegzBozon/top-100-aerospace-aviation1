import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function EmailCaptureModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await base44.functions.invoke('hubspotLeadCapture', { email, source: 'reaction_poll' });
      localStorage.setItem('captured_email', email);
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: '#c9a87c', fontFamily: "'Playfair Display', Georgia, serif" }}>Join the Conversation</DialogTitle>
          <DialogDescription className="text-slate-400 mt-2">
            Enter your email to participate in the live polls and receive updates on the Artemis mission.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input 
            type="email" 
            placeholder="Enter your email address..." 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 h-12"
            required
          />
          <Button type="submit" className="w-full h-12 text-slate-950 font-bold text-sm hover:opacity-90" style={{ background: '#c9a87c' }} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit & Vote
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}