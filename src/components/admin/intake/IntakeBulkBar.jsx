import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UserPlus, Loader2, X } from 'lucide-react';

// Selection controls and bulk actions for the visible nomination list.
export default function IntakeBulkBar({ visibleCount, selectedCount, allSelected, onToggleAll, onClear, onStatus, onApprove, onDelete, busy }) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-editorial-navy/15 bg-editorial-cream px-4 py-3">
      <label className="flex items-center gap-2 text-sm text-editorial-navy cursor-pointer">
        <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
        {selectedCount ? `${selectedCount} selected` : `Select all ${visibleCount}`}
      </label>
      {selectedCount > 0 && (
        <>
          <Select value="" onValueChange={onStatus}>
            <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Set status…" /></SelectTrigger>
            <SelectContent>{['new', 'reviewing', 'rejected', 'archived'].map((s) => <SelectItem key={s} value={s}>Mark {s}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" disabled={busy} onClick={onApprove} className="gap-1.5 bg-editorial-copper hover:bg-editorial-copper/90 text-white">
            <UserPlus className="w-4 h-4" /> Approve to pool
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={onDelete} className="gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear} className="gap-1"><X className="w-4 h-4" /> Clear</Button>
        </>
      )}
    </div>
  );
}