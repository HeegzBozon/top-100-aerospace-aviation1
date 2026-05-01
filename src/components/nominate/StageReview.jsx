import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Pencil, Sparkles } from 'lucide-react';
import { brand } from './NominateConfig';

export default function StageReview({ nominations, onEdit, onSubmit, submitting }) {
  const all = [
    ...nominations.women.map(n => ({ name: n.name, category: 'TOP 100 Women', detail: n.role_org, stage: 'women' })),
    ...nominations.men.map(n => ({ name: n.name, category: 'TOP 100 Men', detail: n.role_org, stage: 'men' })),
    ...nominations.angels.map(n => ({ name: n.name, category: 'TOP 100 Angels', detail: n.firm, stage: 'angels' })),
    ...nominations.local_legends.map(n => ({ name: n.business_name, category: 'Local Legends', detail: n.city, stage: 'local_legends' })),
  ].filter(x => x.name?.trim());

  return (
    <div className="space-y-6 py-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30` }}>
          <Sparkles className="w-3 h-3" /> Almost There
        </div>
        <h1 className="text-2xl md:text-4xl font-bold leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
          Here's who you're putting forward.
        </h1>
      </div>

      {all.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: `${brand.navy}20` }}>
          <p className="text-sm" style={{ color: `${brand.navy}60` }}>You haven't added any nominations yet. Go back and add at least one.</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: `${brand.navy}10` }}>
          {all.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 sm:p-5 border-b last:border-b-0"
              style={{ borderColor: `${brand.navy}08` }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base truncate" style={{ color: brand.navy }}>{item.name}</div>
                {item.detail && <div className="text-xs truncate mt-0.5" style={{ color: `${brand.navy}55` }}>{item.detail}</div>}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest ml-3 shrink-0" style={{ color: brand.gold }}>
                {item.category}
              </div>
            </div>
          ))}
        </div>
      )}

      {all.length > 0 && (
        <p className="text-sm text-center" style={{ color: `${brand.navy}70` }}>
          Everything look right?
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onEdit}
          className="rounded-full px-6 py-5 cursor-pointer gap-2 w-full sm:w-auto"
          style={{ borderColor: `${brand.navy}30`, color: brand.navy }}
        >
          <Pencil className="w-4 h-4" /> Edit
        </Button>
        <Button
          onClick={onSubmit}
          disabled={submitting || all.length === 0}
          size="lg"
          className="rounded-full px-8 py-6 text-base font-bold text-white gap-2 cursor-pointer shadow-xl w-full sm:w-auto"
          style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
        >
          {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <>Submit All Nominations <ArrowRight className="w-5 h-5" /></>}
        </Button>
      </div>
    </div>
  );
}