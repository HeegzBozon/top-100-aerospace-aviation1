import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, UserCheck, ShieldOff, Zap, Loader2 } from 'lucide-react';

// Selection + bulk actions for the visible nominee list. Approve routes through
// the pool resolver; reject/activate are direct status transitions.
export default function NomineeBulkBar({ visibleCount, selectedCount, pendingSelectedCount, allSelected, onToggleAll, onClear, onApprove, onReject, onActivate, busy }) {
  const inPoolSelected = selectedCount - pendingSelectedCount;
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--brand-navy-18)] bg-[var(--brand-cream)] px-4 py-3">
      <label className="flex items-center gap-2 text-sm text-[var(--brand-navy)] cursor-pointer">
        <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
        {selectedCount ? `${selectedCount} selected` : `Select all ${visibleCount}`}
      </label>
      {selectedCount > 0 && (
        <>
          {pendingSelectedCount > 0 ? (
            <Button size="sm" disabled={busy} onClick={onApprove} className="gap-1.5 bg-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/90 text-[var(--brand-navy)]">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />} Approve to pool ({pendingSelectedCount})
            </Button>
          ) : (
            <span className="text-xs text-[var(--brand-navy-60)] italic">All {inPoolSelected} selected nominee(s) are already in the pool.</span>
          )}
          <Button size="sm" variant="outline" disabled={busy} onClick={onActivate} className="gap-1.5 border-[var(--brand-navy-20)] text-[var(--brand-navy)]">
            <Zap className="w-4 h-4" /> Activate
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={onReject} className="gap-1.5">
            <ShieldOff className="w-4 h-4" /> Reject
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear} className="gap-1 text-[var(--brand-navy)]">
            <X className="w-4 h-4" /> Clear
          </Button>
        </>
      )}
    </div>
  );
}