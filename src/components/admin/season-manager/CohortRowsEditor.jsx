import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { COHORT_PRESETS, slugify } from './seasonGrouping';

// Edit a list of { key, label } cohorts. Key auto-derives from label until edited.
export default function CohortRowsEditor({ rows, setRows }) {
  const update = (i, label) => setRows(rows.map((r, j) => (j === i ? { label, key: slugify(label) } : r)));
  const has = (key) => rows.some((r) => r.key === key);
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input value={r.label} onChange={(e) => update(i, e.target.value)} placeholder="Cohort label, e.g. Women" />
          <code className="text-xs text-editorial-navy/50 w-24 truncate">{r.key || '—'}</code>
          <Button type="button" variant="ghost" size="icon" onClick={() => setRows(rows.filter((_, j) => j !== i))}><X className="w-4 h-4" /></Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        {COHORT_PRESETS.filter((p) => !has(p.key)).map((p) => (
          <Button key={p.key} type="button" size="sm" variant="outline" onClick={() => setRows([...rows, p])} className="border-editorial-gold/60 text-editorial-navy">
            <Plus className="w-3.5 h-3.5 mr-1" />{p.label}
          </Button>
        ))}
        <Button type="button" size="sm" variant="ghost" onClick={() => setRows([...rows, { key: '', label: '' }])} className="text-editorial-navy">
          <Plus className="w-3.5 h-3.5 mr-1" />Custom cohort
        </Button>
      </div>
    </div>
  );
}