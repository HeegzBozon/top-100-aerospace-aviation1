import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Vote } from 'lucide-react';
import useBoardingPass from '@/components/my-top100/useBoardingPass';
import { specialtyLabel } from '@/components/flight-plan/specialties';
import { resolveBadgeTemplate } from '@/components/badge/badgeTemplates';
import { qrSrc } from '@/lib/publicCard';
import {
  readStoredDestination,
  readStoredProgram,
  resolveDestination,
  shareUrl,
} from '@/lib/shareDestinations';

// ── The Boarding Pass ──
//
// The pass is the badge. It is printed on the same plate the Fellow wears at the badge
// (their chosen stock, band and rule), and it carries the same code — whichever program or
// destination is standing on the title screen now — so a phone held across a table hands
// over exactly what the badge hands over. Nothing is asked for and nothing is filled in
// here: every line is read back from the record already held.
//
// Anything the record does not hold is simply absent. A pass with three lines on it is
// still a pass, and a blank profile is answered with the one thing worth doing about it.

const DISCIPLINE_WORDS = {
  space_rd: 'Space R&D',
  commercial_aviation: 'Commercial aviation',
  defense: 'Defence',
  manufacturing: 'Manufacturing',
  operations: 'Operations',
  engineering: 'Engineering',
  policy: 'Policy',
  entrepreneurship: 'Entrepreneurship',
};

const LABEL = 'font-body text-[8px] font-bold uppercase tracking-[0.2em]';

function initialsOf(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function BoardingPass({ user, hasExisting, onBegin, onVote }) {
  const { status, card, nominee, settings, error } = useBoardingPass(user);

  const name = card?.card_name || nominee?.name || user?.full_name || '';
  const roleLine = card?.role_line || nominee?.title || '';
  const organisation = card?.organisation || nominee?.company || '';
  const portrait = nominee?.avatar_url || '';
  const personId = nominee?.id || '';

  // The pass carries what the record holds, and nothing that has to be asked for: the base
  // they work from, the field the record names, the specialty filed on their Flight Plan,
  // and the one thing they are glad to be reached about.
  const rows = [
    { label: 'Base', value: card?.location || nominee?.location },
    { label: 'Field', value: DISCIPLINE_WORDS[nominee?.discipline] || nominee?.discipline },
    { label: 'Specialty', value: specialtyLabel(settings?.specialty_key) },
    { label: 'Reachable about', value: card?.tagline },
  ].filter((row) => row.value && String(row.value).trim());

  const template = resolveBadgeTemplate(card?.badge_template);

  // The code is the badge's code, resolved the same way it is on the badge and on the title
  // screen: a program handed over from the menu first, then the destination last chosen.
  const code = useMemo(() => {
    const holder = { name, role: roleLine, org: organisation, cardId: personId };
    const program = readStoredProgram();
    const chosen = resolveDestination(
      readStoredDestination() || (holder.cardId ? 'card' : 'platform'),
      holder
    );
    return {
      link: program?.url || shareUrl(chosen.key, holder),
      title: !program && chosen.key === 'card' ? 'Scan to connect' : 'Scan to open',
      note: program
        ? program.label || 'The program you are handing on'
        : chosen.key === 'card'
          ? 'The card saves as a contact'
          : chosen.note,
    };
  }, [name, roleLine, organisation, personId]);

  return (
    <div className="mx-auto w-full max-w-[22rem] px-4 py-6 lg:py-8">
      {status === 'loading' && (
        <div
          className="overflow-hidden rounded-[18px] bg-editorial-navy/95 p-5"
          aria-busy="true"
          aria-label="Printing your pass"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-editorial-cream/15" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-editorial-cream/20" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-editorial-cream/12" />
            </div>
          </div>
          <div className="mt-5 h-px w-full bg-editorial-cream/15" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="h-3 w-2/3 animate-pulse rounded bg-editorial-cream/12" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-editorial-cream/12" />
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div
          className="relative flex w-full flex-col overflow-hidden rounded-[18px]"
          style={{
            background: template.stock,
            boxShadow: `inset 0 0 0 1px ${template.edge}, 0 26px 50px -32px rgba(3,8,15,0.9)`,
          }}
        >
          {/* Moulded grain: fine, at the edge of reading, the way real stock catches light. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, ${template.grain} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${template.grain} 0 1px, transparent 1px 4px)`,
              opacity: 0.6,
            }}
          />

          {/* The slot the lanyard passes through, cut into the stock. */}
          <div className="relative flex justify-center pt-3">
            <div
              className="h-[6px] w-12 rounded-full"
              style={{ background: 'rgba(3,8,15,0.55)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.72)' }}
            />
          </div>

          {/* The band: which desk this pass is worn at. */}
          <div
            className="relative mx-3 mt-2 rounded-[6px] px-3 py-2"
            style={{
              background: template.band,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 ${template.ruleSoft}`,
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className={LABEL} style={{ color: template.rule }}>
                Selection Committee
              </p>
              <p className={`${LABEL} truncate`} style={{ color: 'rgba(250,248,245,0.66)' }}>
                {hasExisting ? 'Returning' : 'First flight'}
              </p>
            </div>
          </div>

          <div className="relative flex flex-col items-center px-4 pb-4 pt-5 text-center">
            <div
              className="h-[76px] w-[76px] rounded-full"
              style={{ boxShadow: `0 0 0 1px ${template.ruleSoft}, 0 16px 28px -18px rgba(3,8,15,0.95)` }}
            >
              {portrait ? (
                <img
                  src={portrait}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center rounded-full font-heading text-[26px]"
                  style={{ background: template.plate, color: '#1E3A5A' }}
                >
                  {initialsOf(name) || '—'}
                </span>
              )}
            </div>

            <p
              className="mt-3 max-w-[16rem] font-heading text-[22px] leading-[1.12]"
              style={{ color: template.ink, textShadow: template.engrave }}
            >
              {name || 'Your record is still blank'}
            </p>
            {roleLine && (
              <p
                className="mt-1.5 max-w-[16rem] font-body text-[8.5px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: template.inkSoft }}
              >
                {roleLine}
              </p>
            )}
            {organisation && (
              <p className="mt-1 max-w-[16rem] font-body text-[11px]" style={{ color: template.ink }}>
                {organisation}
              </p>
            )}
          </div>

          {rows.length > 0 && (
            <>
              <div className="relative mx-4" style={{ borderTop: `1px dashed ${template.ruleSoft}` }} />
              <dl className="relative grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4">
                {rows.map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className={LABEL} style={{ color: template.inkSoft }}>
                      {row.label}
                    </dt>
                    <dd
                      className="mt-0.5 truncate font-body text-[12px] capitalize"
                      style={{ color: template.ink }}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {/* The code: the same one the badge carries, held at a size a camera reads cold. */}
          <div
            className="relative mx-3 mb-3 flex items-center gap-3 rounded-[8px] px-3 py-2.5"
            style={{ background: template.plate, boxShadow: `inset 0 0 0 1px ${template.ruleSoft}` }}
          >
            <img
              src={qrSrc(code.link, 320, 1)}
              alt="Scan to open this pass"
              width={76}
              height={76}
              className="h-[76px] w-[76px] shrink-0"
            />
            <div className="min-w-0">
              <p className="font-body text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-navy">
                {code.title}
              </p>
              <p className="mt-1 font-body text-[9.5px] leading-snug text-editorial-navy/60">
                {code.note}
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-between px-4 pb-3">
            <p className={LABEL} style={{ color: template.inkSoft }}>
              Fellow
            </p>
            <p className={LABEL} style={{ color: template.inkSoft }}>
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-[10px] border border-editorial-copper/35 bg-editorial-cream p-5">
          <p className="font-heading text-lg text-editorial-navy">Your pass could not be printed just now.</p>
          <p className="mt-1.5 font-body text-[13px] leading-relaxed text-editorial-navy/70">
            Nothing is lost and nothing is asked of you — the desk is open either way.
            {error ? ` (${error})` : ''}
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={onBegin}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[9px] bg-editorial-copper px-5 font-body text-[11.5px] font-bold uppercase tracking-[0.14em] text-editorial-cream transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
        >
          {hasExisting ? 'Return to your Manifest' : 'Open your Manifest'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onVote}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[9px] border border-editorial-copper/55 px-5 font-body text-[11.5px] font-bold uppercase tracking-[0.14em] text-editorial-navy transition-colors hover:bg-editorial-sand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2"
        >
          <Vote className="h-4 w-4" />
          Open the Crosscheck
        </button>
      </div>

      {status === 'ready' && !card && (
        <p className="mt-3 font-body text-[11.5px] leading-relaxed text-editorial-navy/60">
          Your pass is thin because your business card is not yet set.{' '}
          <Link
            to="/record"
            className="font-semibold underline underline-offset-4 text-editorial-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper"
          >
            Set it on your record
          </Link>{' '}
          and the pass fills itself in.
        </p>
      )}

      <p className="mt-3 flex items-start gap-1.5 font-body text-[10.5px] leading-relaxed text-editorial-navy/45">
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        Your pass is display only. It is never read by discovery, ordering or measurement, and
        it carries no weight in selection.
      </p>
    </div>
  );
}