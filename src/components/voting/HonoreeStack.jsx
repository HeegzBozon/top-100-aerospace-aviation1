import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { brand } from '@/components/nominate/NominateConfig';
import HonoreeChip from '@/components/voting/HonoreeChip';

// The record in one line, however deep it runs. The most recent distinction rides a
// chip; everything behind it becomes a stack — one plate with the count on it, opened
// into the whole ledger. A candidate six volumes deep and a candidate one volume deep
// therefore cost the card exactly the same height, which is the point: the card is a
// plate, and the record is a footnote on it, not a tower.
export default function HonoreeStack({ volumes = [], className = '' }) {
  const [open, setOpen] = useState(false);
  if (volumes.length === 0) return null;

  const [lead, ...rest] = volumes;

  return (
    <div className={`flex min-w-0 shrink-0 items-center gap-1 ${className}`}>
      <HonoreeChip volume={lead} />

      {rest.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              aria-label={`${rest.length} earlier volume${rest.length === 1 ? '' : 's'} on the record. Open the full record.`}
              className="inline-flex shrink-0 items-center rounded-full px-1.5 py-[1px] text-[7.5px] font-bold leading-tight tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 md:text-[8.5px]"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${brand.gold}80`,
                color: '#8F5C2C',
                /* the plate behind the plate: the stack itself, in one printed edge */
                boxShadow: `1.5px 1.5px 0 -0.5px #FFFFFF, 1.5px 1.5px 0 0 ${brand.gold}80`,
              }}
            >
              +{rest.length}
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            sideOffset={6}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="w-[232px] rounded-[12px] border-0 p-0"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)',
              boxShadow: `inset 0 0 0 1px ${brand.gold}99, 0 18px 34px -20px rgba(7,17,31,0.60)`,
            }}
          >
            <div className="p-2.5">
              <div className="flex items-center gap-1.5">
                <Award className="h-3 w-3 shrink-0" style={{ color: brand.gold }} aria-hidden />
                <p className="text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: '#8F5C2C' }}>
                  The record
                </p>
              </div>
              <p
                className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.12em]"
                style={{ color: `${brand.navy}66` }}
              >
                {volumes.length} volumes on the archive
              </p>

              <ul className="mt-1.5 flex flex-col">
                {volumes.map((volume, i) => (
                  <li key={volume.seasonId} style={{ borderTop: i === 0 ? 'none' : `1px solid ${brand.navy}12` }}>
                    <Link
                      to={`/archive/${volume.seasonId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-baseline justify-between gap-2 py-[3px] focus-visible:outline-none"
                    >
                      <span className="font-heading text-[12.5px]" style={{ color: brand.navy }}>
                        {volume.year}
                      </span>
                      <span
                        className="text-[8px] font-bold uppercase tracking-[0.12em]"
                        style={{ color: volume.rank != null ? '#8F5C2C' : `${brand.navy}55` }}
                      >
                        {volume.rank != null ? `No. ${volume.rank}` : 'On record'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}