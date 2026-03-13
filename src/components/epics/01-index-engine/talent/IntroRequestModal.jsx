import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Send, Loader2, CheckCircle, Sparkles } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function IntroRequestModal({ 
  isOpen, 
  onClose, 
  targetType, // 'job' | 'service'
  targetId,
  targetTitle,
  recipientEmail,
  companyName 
}) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const user = await base44.auth.me();
      
      await base44.entities.IntroRequest.create({
        requester_email: user.email,
        requester_name: user.full_name,
        target_type: targetType,
        target_id: targetId,
        target_title: targetTitle,
        recipient_email: recipientEmail,
        message: message.trim() || null,
        status: 'pending'
      });

      // Send notification email with direct dashboard link
      const dashboardUrl = targetType === 'job' 
        ? `${window.location.origin}${createPageUrl('MissionControl') + '?module=employer'}?tab=intros`
        : `${window.location.origin}${createPageUrl('MissionControl') + '?module=provider'}`;

      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `🤝 New Introduction Request: ${targetTitle}`,
        body: `
Hello,

${user.full_name} has requested an introduction for your ${targetType === 'job' ? 'job posting' : 'service'}: "${targetTitle}".

${message ? `Their message:\n"${message}"\n` : ''}Contact: ${user.email}

➡️ Respond now: ${dashboardUrl}

Best,
TOP 100 Talent Exchange
        `.trim()
      });

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error('Intro request failed:', err);
      setStatus('error');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: brandColors.navyDeep }}>
            <Sparkles className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
            Request Introduction
          </DialogTitle>
          <DialogDescription>
            Connect with {companyName || 'the team'} about this {targetType === 'job' ? 'opportunity' : 'service'}.
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-semibold text-lg" style={{ color: brandColors.navyDeep }}>Request Sent!</h3>
            <p className="text-sm text-slate-500 mt-1">They'll be notified and can respond directly.</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: brandColors.navyDeep }}>
                {targetTitle}
              </p>
              <p className="text-xs text-slate-500">{companyName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Add a message (optional)
              </label>
              <Textarea
                placeholder="Briefly introduce yourself or share why you're interested..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/500</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={status === 'loading'}
              className="w-full"
              style={{ background: brandColors.goldPrestige, color: 'white' }}
            >
              {status === 'loading' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Request Intro</>
              )}
            </Button>

            {status === 'error' && (
              <p className="text-sm text-red-500 text-center">Something went wrong. Please try again.</p>
            )}

            <p className="text-xs text-slate-400 text-center">
              Your contact info will be shared with {companyName || 'the provider'}.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}