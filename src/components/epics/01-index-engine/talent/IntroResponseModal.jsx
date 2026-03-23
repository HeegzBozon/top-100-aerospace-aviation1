import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, CheckCircle } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function IntroResponseModal({ 
  isOpen, 
  onClose, 
  request,
  onSuccess
}) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const user = await base44.auth.me();
      
      // Update request status
      await base44.entities.IntroRequest.update(request.id, {
        status: 'responded',
        responded_date: new Date().toISOString()
      });

      // Send email to requester
      await base44.integrations.Core.SendEmail({
        to: request.requester_email,
        subject: `🎉 Response to your Introduction Request: ${request.target_title}`,
        body: `
Hello ${request.requester_name || ''},

Great news! ${user.full_name || user.email} has responded to your introduction request for "${request.target_title}".

${message ? `Their message:\n"${message}"\n` : ''}
You can reply directly to this email or contact them at: ${user.email}

Best,
TOP 100 Talent Exchange
        `.trim()
      });

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setMessage('');
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error('Response failed:', err);
      setStatus('idle');
    }
  };

  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: brandColors.navyDeep }}>
            Respond to {request.requester_name || request.requester_email}
          </DialogTitle>
          <DialogDescription>
            Send a message about "{request.target_title}"
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-semibold text-lg" style={{ color: brandColors.navyDeep }}>Response Sent!</h3>
            <p className="text-sm text-slate-500 mt-1">They'll receive your message via email.</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {request.message && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="text-xs text-slate-500 mb-1">Their message:</p>
                <p className="text-slate-700">"{request.message}"</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Your response
              </label>
              <Textarea
                placeholder="Write a message to introduce yourself, share availability, or ask questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={status === 'loading' || !message.trim()}
              className="w-full"
              style={{ background: brandColors.goldPrestige, color: 'white' }}
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send Response</>
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              Your email will be shared so they can reply directly.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}