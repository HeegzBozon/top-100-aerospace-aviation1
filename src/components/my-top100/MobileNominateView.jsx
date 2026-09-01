import { Sparkles, Compass } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import SubmittedNominationsList from '@/components/my-top100/SubmittedNominationsList';
import ContextualTip from '@/components/my-top100/ContextualTip';

// The mobile Nominate side (default view of the in-tab toggle). A calm,
// editorial intake surface: a short header, a first-time contextual tip,
// and the submitted-nominations list. The primary action lives in the
// bottom-anchored QuickAddBar (owned by the page) so nominate stays one
// thumb-tap from anywhere. pb-28 keeps the last list item clear of that bar.
export default function MobileNominateView({
  user,
  submittedNominations,
  onRemoveNomination,
  addedIds,
  onOpenExplorer,
}) {
  const total =
    (submittedNominations.women?.length || 0) +
    (submittedNominations.men?.length || 0) +
    (submittedNominations.angels?.length || 0);

  return (
    <div className="px-4 pt-4 pb-28">
      <div className="mb-3">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
          style={{ color: `${brand.navy}45` }}
        >
          Nominate
        </p>
        <h1
          className="text-xl font-bold leading-tight mb-1.5"
          style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Who deserves to be in the Top 100?
        </h1>
        <p className="text-[12.5px] leading-relaxed" style={{ color: `${brand.navy}60` }}>
          Put forward the women, men, and angels shaping aerospace &amp; aviation. Every
          nomination is reviewed personally.
        </p>
      </div>

      <div className="mb-3">
        <ContextualTip userEmail={user?.email} tipKey="nominate_hub_nominate">
          Choose a track — Women, Men, or Angels. You can also recognize someone as an
          Angel investor during the flow. Each name goes to our review queue.
        </ContextualTip>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: `${brand.navy}45` }}
        >
          {total > 0 ? `Your nominations · ${total}` : 'Your nominations'}
        </p>
        <button
          onClick={onOpenExplorer}
          className="inline-flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: brand.gold }}
        >
          <Compass className="w-3 h-3" /> Browse directory
        </button>
      </div>

      <SubmittedNominationsList
        submittedNominations={submittedNominations}
        onRemoveNomination={onRemoveNomination}
        addedIds={addedIds}
        compact
      />
    </div>
  );
}