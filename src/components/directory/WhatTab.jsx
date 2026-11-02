import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { C } from '@/components/crm/crmConfig';
import { WHAT_ITEMS } from './directoryConfig';

// What the platform is: every surface in one line, the ones that answer your goals first.
export default function WhatTab({ goals = [] }) {
  const fit = (i) => i.goals.some((g) => goals.includes(g));
  const items = [...WHAT_ITEMS].sort((a, b) => fit(b) - fit(a));
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((i) => (
        <Link key={i.key} to={i.to} className="group rounded-lg bg-white p-4 transition-shadow hover:shadow-md"
          style={{ border: `1px solid ${fit(i) ? C.copper : C.border}` }}>
          <div className="flex items-center justify-between">
            <span className="font-heading text-lg" style={{ color: C.navy }}>{i.label}</span>
            {fit(i) && <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: C.copper }}>For you</span>}
          </div>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.muted }}>{i.line}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.navy }}>
            Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}