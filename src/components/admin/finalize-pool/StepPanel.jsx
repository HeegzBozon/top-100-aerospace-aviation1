import { Loader2, AlertTriangle } from 'lucide-react';

// Shared chrome for each wizard step: title, lede, and designed loading/error states.
export default function StepPanel({ title, lede, loading, error, children }) {
  return (
    <section className="rounded-2xl border border-editorial-navy/10 bg-white p-6 md:p-8 shadow-sm">
      <h3 className="font-heading text-2xl text-editorial-navy">{title}</h3>
      {lede && <p className="text-sm text-editorial-navy/60 mt-2 max-w-2xl">{lede}</p>}
      <div className="h-px bg-editorial-copper/40 my-6" />
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-editorial-navy/60">
          <Loader2 className="w-7 h-7 animate-spin text-editorial-gold" />
          <span className="text-xs uppercase tracking-widest">Auditing the pool…</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex gap-3 text-sm text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </div>
      ) : children}
    </section>
  );
}

export function CleanState({ icon: Icon, title, body }) {
  return (
    <div className="rounded-xl bg-editorial-cream border border-editorial-gold/30 py-12 px-6 text-center">
      <Icon className="w-9 h-9 mx-auto text-editorial-gold mb-3" />
      <p className="font-heading text-lg text-editorial-navy">{title}</p>
      <p className="text-sm text-editorial-navy/60 mt-1 max-w-md mx-auto">{body}</p>
    </div>
  );
}

export function AckBox({ checked, onChange, label }) {
  return (
    <label className="mt-6 flex items-start gap-3 rounded-xl border border-editorial-copper/40 bg-editorial-cream p-4 text-sm text-editorial-navy cursor-pointer">
      <input type="checkbox" className="mt-0.5 accent-[#B87333]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}