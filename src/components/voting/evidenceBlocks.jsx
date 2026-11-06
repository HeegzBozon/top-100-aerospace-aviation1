import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';

// The small furniture the candidate's file is read with: a paragraph, a list of facts,
// a career line, a counted signal, a key to an artifact. Nothing here knows what the
// file is about — the section registry composes those — so a new section is written in
// the registry and no block ever has to grow a prop for it.

export function Prose({ children }) {
  return <p className="text-sm leading-relaxed" style={{ color: ink.body }}>{children}</p>;
}

export function Empty({ note }) {
  return <p className="text-xs italic" style={{ color: ink.soft }}>{note}</p>;
}

export function SubHead({ children }) {
  return (
    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: ink.soft }}>
      {children}
    </p>
  );
}

export function FactGrid({ facts }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {facts.map((f) => (
        <div key={f.label} className="rounded-lg px-2.5 py-2" style={{ background: 'white', border: `1px solid ${brand.navy}10` }}>
          <dt className="text-[8.5px] font-bold uppercase tracking-[0.14em]" style={{ color: ink.soft }}>{f.label}</dt>
          <dd className="mt-0.5 text-[12.5px] leading-snug" style={{ color: brand.navy }}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Timeline({ entries }) {
  return (
    <div className="space-y-2.5">
      {entries.map((c, i) => (
        <div key={`${c.role}-${i}`} className="border-l pl-2.5" style={{ borderColor: `${brand.gold}80` }}>
          <p className="text-xs font-semibold" style={{ color: brand.navy }}>
            {c.role || 'Role'}
            {c.period ? <span style={{ color: ink.soft }}> · {c.period}</span> : null}
          </p>
          {c.description ? (
            <p className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: ink.soft }}>{c.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ChipList({ items }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full px-2 py-[3px] text-[10.5px]"
          style={{ background: 'white', border: `1px solid ${brand.navy}18`, color: brand.navy }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function StatGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="rounded-lg p-2.5" style={{ background: 'white', border: `1px solid ${brand.navy}10` }}>
            <div className="mb-0.5 flex items-center gap-1.5">
              {Icon ? <Icon className="h-3 w-3" style={{ color: brand.gold }} /> : null}
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: ink.soft }}>{s.label}</span>
            </div>
            <p className="text-lg font-bold" style={{ color: brand.navy }}>{s.value}</p>
          </div>
        );
      })}
    </div>
  );
}

// A key to one of the record's artifacts. `to` is an app route; an artifact with no
// route of its own is still listed, so the file never hides what the record holds.
export function ArtifactKey({ to, label, detail }) {
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: brand.navy }}>{label}</span>
        {detail ? <span className="mt-0.5 block text-[11px] leading-snug" style={{ color: ink.soft }}>{detail}</span> : null}
      </span>
      {to ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0" style={{ color: brand.gold }} /> : null}
    </>
  );

  const className = 'flex items-center gap-2 rounded-lg px-2.5 py-2';
  const style = { background: 'white', border: `1px solid ${brand.navy}14` };

  return to
    ? <Link to={to} className={className} style={style}>{body}</Link>
    : <div className={className} style={style}>{body}</div>;
}