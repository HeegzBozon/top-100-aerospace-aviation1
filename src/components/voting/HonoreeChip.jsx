import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { brand } from '@/components/nominate/NominateConfig';

// The year alone rides the card; the volume, the recorded position and the way into the
// archive are one press, or one hover, away. The chip never selects the card under it.
// `size` is the only thing the surroundings change: the card carries the chip at card
// scale, the information panel at reading scale. Both are the same record.
export default function HonoreeChip({ volume, size = 'sm' }) {
  const dense = size !== 'lg';
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const openNow = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 240);
  };

  const title = volume.artifact || volume.seasonName || `The ${volume.year} volume`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onPointerEnter={(e) => e.pointerType === 'mouse' && openNow()}
          onPointerLeave={(e) => e.pointerType === 'mouse' && closeSoon()}
          onClick={(e) => {
            e.stopPropagation();
            openNow();
          }}
          aria-label={`${volume.year} honoree${volume.rank != null ? `, measured at number ${volume.rank}` : ''}. Show the volume and the archived record.`}
          className={`inline-flex items-center whitespace-nowrap rounded-full font-bold leading-tight tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
            dense
              ? 'gap-1 px-1.5 py-[1px] text-[7.5px] md:text-[8.5px]'
              : 'gap-1.5 px-2.5 py-1 text-[11px]'
          }`}
          style={{ background: `${brand.gold}1F`, border: `1px solid ${brand.gold}80`, color: brand.navy }}
        >
          <Award className={dense ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} style={{ color: brand.gold }} aria-hidden />
          {volume.year}
          {volume.rank != null && (
            <span style={{ color: '#8F5C2C' }}>No.&nbsp;{volume.rank}</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerEnter={openNow}
        onPointerLeave={() => setOpen(false)}
        className="w-[236px] rounded-[12px] border-0 p-0"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7EF 100%)',
          boxShadow: `inset 0 0 0 1px ${brand.gold}99, 0 18px 34px -20px rgba(7,17,31,0.60)`,
        }}
      >
        <div className="p-2.5">
          <div className="flex items-center gap-1.5">
            <Award className="h-3 w-3 shrink-0" style={{ color: brand.gold }} aria-hidden />
            <p className="text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: '#8F5C2C' }}>
              Honoree &middot; {volume.year}
            </p>
          </div>

          <p className="mt-1 font-heading text-[12.5px] leading-snug" style={{ color: brand.navy }}>
            {title}
          </p>

          <div
            className="mt-1.5 flex items-baseline justify-between gap-2 border-t pt-1.5"
            style={{ borderColor: `${brand.navy}14` }}
          >
            <span className="text-[7.5px] font-bold uppercase tracking-[0.12em]" style={{ color: `${brand.navy}70` }}>
              Measured
            </span>
            <span className="font-heading text-[13px]" style={{ color: brand.navy }}>
              {volume.rank != null ? `No. ${volume.rank} of 100` : 'On record'}
            </span>
          </div>

          {volume.volume && (
            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: `${brand.navy}55` }}>
              Volume {volume.volume}
            </p>
          )}

          <Link
            to={`/archive/${volume.seasonId}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 inline-flex items-center gap-1 border-b pb-px text-[8px] font-bold uppercase tracking-[0.12em] focus-visible:outline-none"
            style={{ color: '#8F5C2C', borderColor: `${brand.gold}99` }}
          >
            Open the archive
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}