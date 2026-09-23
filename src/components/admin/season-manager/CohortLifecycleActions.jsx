import { useState } from 'react';
import { Season } from '@/entities/Season';
import { Nominee } from '@/entities/Nominee';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { statusOf } from './seasonStatusConfig';

export default function CohortLifecycleActions({ season, onChanged, onRollover }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const actions = statusOf(season).actions;
  if (!actions.length) return null;

  const run = async (action) => {
    if (action.requiresRollover) return onRollover(season);
    if (action.requiresValidation) {
      const approved = await Nominee.filter({ season_id: season.id, status: 'approved' }, '-created_date', 2);
      if (approved.length < 2) {
        toast({ variant: 'destructive', title: 'Cannot open voting', description: 'At least 2 approved nominees are required.' });
        return;
      }
    }
    if (!confirm(`${action.label} for "${season.name}"?`)) return;
    setBusy(true);
    await Season.update(season.id, { status: action.nextStatus });
    toast({ title: action.label, description: `"${season.name}" updated.` });
    setBusy(false);
    onChanged?.();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        const primary = a.variant === 'primary';
        return (
          <Button key={a.label} size="sm" variant={primary ? 'default' : 'outline'} disabled={busy} onClick={() => run(a)}
            className={primary ? 'bg-editorial-copper hover:bg-editorial-copper/90 text-white' : 'border-editorial-navy/20 text-editorial-navy'}>
            {busy ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Icon className="w-3.5 h-3.5 mr-1.5" />}
            {a.label}
          </Button>
        );
      })}
    </div>
  );
}