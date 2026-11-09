import { Loader2 } from 'lucide-react';
import ManifestMeasure from '@/components/my-top100/ManifestMeasure';

// The head of the Manifest.
//
// Set like the masthead of a publication: a copper rule struck across the top of a sand
// plate, the list's own title at heading size, and the measure of the order carried across
// the plate beneath it rather than in a card of its own. The title is the platform's — a
// Fellow's list is named for what it is — so the head carries no rename key and opens
// straight into the line below it.
export default function ManifestMasthead({ listName, saving, count, onOpenBriefing }) {
  return (
    <div className="relative overflow-hidden border border-b-0 border-editorial-copper/30 bg-editorial-sand/50 px-4 pb-3.5 pt-3.5">
      <span className="absolute inset-x-0 top-0 h-[2px] bg-editorial-copper" aria-hidden="true" />

      <div className="flex items-center justify-between gap-2">
        <h1 className="min-w-0 truncate font-heading text-[24px] leading-[1.1] tracking-[-0.01em] text-editorial-navy sm:text-[28px]">
          {listName}
        </h1>
        {saving && (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-editorial-navy/35" aria-label="Saving" />
        )}
      </div>

      <ManifestMeasure count={count} onOpenBriefing={onOpenBriefing} />
    </div>
  );
}