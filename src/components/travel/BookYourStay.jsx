import { Plane } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { EXPEDIA_AFFILIATE_URL } from './travelConfig';

export { EXPEDIA_AFFILIATE_URL };

// Editorial, understated travel CTA. Treated as a utility link, never a
// marketplace listing — no star ratings, no "sponsored by" language.
export default function BookYourStay({ accent = B.navy, label = 'Book your stay' }) {
  return (
    <a
      href={EXPEDIA_AFFILIATE_URL}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:opacity-80"
      style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}33` }}
    >
      <Plane className="w-3.5 h-3.5" /> {label}
    </a>
  );
}