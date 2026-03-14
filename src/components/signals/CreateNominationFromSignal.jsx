import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateNominationFromSignal({
  signal,
  nomineeName,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [reason, setReason] = useState(
    `Detected signal: ${signal?.headline || ''}`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await base44.auth.me();

      await base44.entities.Nomination.create({
        nominee_id: signal.nominee_id,
        nominee_name: nomineeName,
        nominated_by: user.email,
        reason: reason,
        source_type: 'signal_detection',
        source_signal_id: signal.id,
        status: 'pending',
      });

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setReason(`Detected signal: ${signal?.headline || ''}`);
        setSuccess(false);
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create nomination');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Nomination from Signal</DialogTitle>
          <DialogDescription>
            Nominate {nomineeName} based on this signal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Signal Preview */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="font-medium text-sm text-slate-900 line-clamp-2">
              {signal?.headline}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {signal?.signal_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {signal?.source_name}
              </Badge>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Nomination Reason
            </label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why should this person be nominated?"
              className="min-h-20"
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700">Nomination created!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {success ? 'Created!' : 'Create Nomination'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}