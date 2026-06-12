import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ListOrdered } from 'lucide-react';
import { brand } from './NominateConfig';
import { Link } from 'react-router-dom';

export default function StageWelcome({ onBegin }) {
  return (
    <div className="space-y-7 py-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30` }}>
        <Sparkles className="w-3 h-3" /> Nominations Open
      </div>

      <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
        You know someone who deserves this.
      </h1>

      <div className="space-y-4 text-base sm:text-lg leading-relaxed" style={{ color: `${brand.navy}99` }}>
        <p>The aerospace and aviation community is full of people doing remarkable work. Most of them will never be asked to step forward.</p>
        <p className="font-semibold" style={{ color: brand.navy }}>You're about to change that for someone.</p>
        <p>TOP 100 Aerospace & Aviation has recognized over 300 Fellows across 40+ countries since 2021. This year we're expanding. More programs. More recognition. More community.</p>
        <p className="text-sm" style={{ color: `${brand.navy}70` }}>This form takes about 3 minutes per nomination. There's no limit on how many people you nominate. Every single one gets reviewed personally.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onBegin}
          size="lg"
          className="rounded-full px-8 py-6 text-base text-white gap-2 cursor-pointer shadow-lg"
          style={{ background: brand.navy }}
        >
          Begin Nominations <ArrowRight className="w-4 h-4" />
        </Button>

        <Link to="/my-top100">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 py-6 text-base gap-2 cursor-pointer w-full sm:w-auto"
            style={{ borderColor: brand.gold, color: brand.gold }}
          >
            <ListOrdered className="w-4 h-4" />
            Build My Top 100 List
          </Button>
        </Link>
      </div>

      <p className="text-[11px]" style={{ color: `${brand.navy}45` }}>
        New: Curate and rank your personal Top 100 — it doubles as your ranked choice ballot.
      </p>
    </div>
  );
}