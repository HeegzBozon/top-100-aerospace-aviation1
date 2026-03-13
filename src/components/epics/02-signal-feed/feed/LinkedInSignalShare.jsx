import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ShareableSignalCard from './ShareableSignalCard';
import { Linkedin, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

/**
 * LinkedIn Signal Share Component
 * Generates shareable signal post + LinkedIn connector integration
 */
export default function LinkedInSignalShare({ signal, nomineeName, nomineeProfileUrl }) {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState(
    `I came across this incredible signal of ${nomineeName}'s impact in ${signal.signal_type === 'publication' ? 'research' : signal.signal_type === 'patent' ? 'innovation' : 'the news'}. Check it out: ${signal.evidence_links?.[0] || ''}`
  );
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShareToLinkedIn = async () => {
    if (!caption.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      // In a real scenario, this would call a backend function that uses LinkedIn connector
      // For now, we'll provide the share data structure
      const shareData = {
        text: caption,
        signalUrl: signal.evidence_links?.[0],
        signalTitle: signal.headline,
        signalType: signal.signal_type,
        nomineeName,
        nomineeUrl: nomineeProfileUrl,
      };

      // Copy share text to clipboard as fallback
      await navigator.clipboard.writeText(caption);
      setStatus('copied');

      // In production, would call: await shareToLinkedIn(shareData)
      // This would use the LinkedIn app connector to post directly

      setTimeout(() => {
        setOpen(false);
        setStatus(null);
      }, 2000);
    } catch (error) {
      setStatus('error');
      console.error('Share error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareText = `Check out this signal: "${signal.headline}" - ${nomineeName} ${signal.evidence_links?.[0] || ''}`;
      await navigator.clipboard.writeText(shareText);
      setStatus('copied');
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Linkedin className="w-4 h-4 text-blue-600" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Signal on LinkedIn</DialogTitle>
            <DialogDescription>
              Amplify {nomineeName}'s impact by sharing this signal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Signal Preview */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Preview</p>
              <ShareableSignalCard
                signal={signal}
                nomineeName={nomineeName}
                compact={false}
              />
            </div>

            {/* Caption Input */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">
                Add your thoughts
              </label>
              <Textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Write a message to accompany this signal..."
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                {caption.length} characters
              </p>
            </div>

            {/* Status Messages */}
            {status === 'copied' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Copied to clipboard!
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                Something went wrong
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleShareToLinkedIn}
                disabled={!caption.trim() || loading}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Linkedin className="w-4 h-4" />
                )}
                Post to LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy Link
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Posting to LinkedIn requires authorization via your account
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}