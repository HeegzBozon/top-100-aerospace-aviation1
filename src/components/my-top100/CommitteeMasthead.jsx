import { Link, useNavigate } from 'react-router-dom';
import { Archive, BookOpen, Home, Radio, Share2 } from 'lucide-react';
import { MANIFEST, CROSSCHECK } from '@/components/voting/ballotNaming';
import CommitteeCountdown from '@/components/my-top100/CommitteeCountdown';

// The head of the committee.
//
// The Selection Committee is an office of the house, so its head is set the way the
// house sets its plates: a navy band, the institution's name in rose gold above the
// office, copper closing the foot. It carries the container — the Fellow's name, the
// list and the season all belong to the surfaces beneath it — and the three doors out
// of it: the title screen, the archive, the Media Hub, and the way the record is shared.
export default function CommitteeMasthead({
  count,
  isPublished,
  saving,
  onShare,
  onOpenBriefing,
  votingEndDate = null,
}) {
  const navigate = useNavigate();

  return (
    <header className="bg-editorial-navy">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-end lg:justify-between lg:px-6 lg:py-6">
        <div className="min-w-0">
          <p className="font-body text-[9.5px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
            TOP 100 Aerospace &amp; Aviation
          </p>
          <h1 className="mt-1.5 font-heading text-[26px] leading-none text-editorial-cream sm:text-[32px]">
            The Selection Committee
          </h1>
          <p className="mt-2 max-w-xl font-body text-[11.5px] leading-relaxed text-editorial-cream/60">
            Two duties for the season: {MANIFEST}, your own TOP 100 in order — a publication you
            set and share — and {CROSSCHECK}, where the field is measured. Analysis, never a
            ranking of record.
          </p>
        </div>

        {/* The cycle's own clock belongs to the office, not to the Manifest: it is struck
            at the head of the committee, where the season is, and it is the same clock for
            every tab beneath it. */}
        <CommitteeCountdown votingEndDate={votingEndDate} className="lg:mr-2" />

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <p className="mr-1 hidden font-body text-[9.5px] uppercase tracking-[0.16em] text-editorial-cream/40 tabular-nums lg:block">
            {count} of 100 · {isPublished ? 'public' : 'draft'}
            {saving ? ' · saving' : ''}
          </p>

          {/* The briefing used to sit at the margin of the Manifest alone. It belongs to the
              office: the two duties, the ladder and the method are the committee's, and a
              Fellow standing on any tab can read them without leaving the one they are on. */}
          {onOpenBriefing && (
            <button type="button" onClick={onOpenBriefing} className="desk-key">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">How it works</span>
            </button>
          )}

          <button type="button" onClick={() => navigate('/')} className="desk-key">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/archive/696aec2d99297cdbe96ee71e')}
            className="desk-key"
          >
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Archives</span>
          </button>

          {/* The Media Hub is where a record is readied to travel: the Content Lab cuts the
              share cards, the Main Studio carries the editions. The committee hands off. */}
          <Link to="/media-hub" className="desk-key" title="Open the Media Hub">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Media Hub</span>
          </Link>

          {count > 0 && (
            <button type="button" onClick={onShare} className="desk-key desk-key-primary">
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              Share
            </button>
          )}
        </div>
      </div>

      <div className="h-[2px] w-full bg-editorial-copper" />
    </header>
  );
}