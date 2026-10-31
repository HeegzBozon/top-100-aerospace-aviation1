import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Loader2, RefreshCw, RotateCw, Save, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useDevice } from '@/components/handheld/HandheldShell';
import { saveContact } from '@/lib/publicCard';
import { copyText } from '@/lib/clipboard';
import {
  availableDestinations,
  readStoredDestination,
  resolveDestination,
  shareUrl,
  storeDestination,
} from '@/lib/shareDestinations';
import BadgeFront from '@/components/badge/BadgeFront';
import BadgeBack from '@/components/badge/BadgeBack';
import BadgeTemplateDeck from '@/components/badge/BadgeTemplateDeck';
import BadgeShareDock from '@/components/badge/BadgeShareDock';
import { resolveBadgeTemplate } from '@/components/badge/badgeTemplates';
import useBadgePerson from '@/components/badge/useBadgePerson';

// THE BADGE, HELD UP.
//
// The one object a Fellow carries into a room: printed as a lanyard badge for the person
// in front of them and turned over into the card they keep. It is worn on the whole glass,
// so the console goes away while it is up — a wheel and a keypad on a badge is a machine
// being shown, not a person being met.
const KEY =
  'inline-flex items-center gap-1.5 rounded-full border border-editorial-cream/20 px-3 py-1.5 font-body text-[8.5px] font-bold uppercase tracking-[0.18em] text-editorial-cream/80 transition-colors hover:border-editorial-gold/60 hover:text-editorial-cream';

// A program key hands the badge its own address: pressing share on the menu wears the
// badge for that program, with the code already printed to it. Anything else worn here
// points at the destination the Fellow last chose.
const readIncoming = (state) => {
  const url = state?.shareUrl;
  if (!url) return null;
  return {
    url: /^https?:/i.test(url) ? url : `${window.location.origin}${url}`,
    label: state?.shareLabel || '',
  };
};

export default function ConferenceBadge() {
  const navigate = useNavigate();
  const location = useLocation();
  const device = useDevice();
  const { loading, error, viewer, person, card, reload, saveBadge } = useBadgePerson();

  const [face, setFace] = useState('front');
  const [plate, setPlate] = useState(null);
  const [codeOn, setCodeOn] = useState(null);
  const [copied, setCopied] = useState(false);
  const [destination, setDestination] = useState(() => readStoredDestination());
  const [incoming, setIncoming] = useState(() => readIncoming(location.state));

  // Worn full screen: the controls centre is put away for as long as the badge is up,
  // and the clearance it holds is handed back to the picture (see globals: body.hh-badge).
  useEffect(() => {
    device?.setPutAway?.(true);
    document.body.classList.add('hh-badge');
    return () => {
      device?.setPutAway?.(false);
      document.body.classList.remove('hh-badge');
    };
  }, [device]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (face === 'back') setFace('front');
      else navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [face, navigate]);

  const template = resolveBadgeTemplate(plate || card?.badge_template);
  const showQr = codeOn ?? card?.badge_qr_visible ?? true;

  // Who the badge is worn for, in the shape the share centre already reads: a name, the
  // lines under it, and the record the card opens.
  const holder = useMemo(
    () => ({
      name: person?.name || '',
      role: person?.role || '',
      org: person?.org || '',
      cardId: person?.profileId || '',
    }),
    [person]
  );

  const destinations = useMemo(() => availableDestinations(holder), [holder]);
  const chosen = resolveDestination(destination || (holder.cardId ? 'card' : 'platform'), holder);
  // What the code prints: the program the menu handed over, or the destination last set.
  const link = incoming?.url || shareUrl(chosen.key, holder);

  const qrTitle = !incoming && chosen.key === 'card' ? 'Scan to connect' : 'Scan to open';
  const qrNote = incoming
    ? incoming.label || 'The program you are handing on'
    : chosen.key === 'card'
      ? 'The card saves as a contact'
      : chosen.note;

  const choosePlate = (key) => {
    setPlate(key);
    saveBadge({ badge_template: key });
  };

  const toggleCode = () => {
    const next = !showQr;
    setCodeOn(next);
    saveBadge({ badge_qr_visible: next });
  };

  // The choice is remembered, so the code standing on the title screen is always the one
  // last set on the badge.
  const chooseDestination = (key) => {
    setIncoming(null);
    setDestination(key);
    storeDestination(key);
  };

  const copy = async () => {
    const ok = await copyText(link);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: person?.name || 'TOP 100 Aerospace & Aviation', url: link });
    } catch {
      /* the hand closed the sheet — nothing to report */
    }
    return undefined;
  };

  const openLink = () => window.open(link, '_blank', 'noopener');

  const actions = useMemo(() => {
    const list = [];
    if (person?.name) {
      list.push({ key: 'save', label: 'Save contact', Icon: Save, tone: 'solid', onClick: () => saveContact(person) });
    }
    if (link) {
      list.push({ key: 'share', label: copied ? 'Copied' : 'Share', Icon: Share2, tone: 'line', onClick: share });
      list.push({ key: 'open', label: 'Open', Icon: ArrowUpRight, tone: 'line', onClick: openLink });
    }
    return list;
  }, [person, copied, link]);

  return (
    <div
      className="flex min-h-[calc(100dvh-var(--hh-top)-var(--hh-nav))] flex-col md:min-h-screen"
      style={{ background: 'radial-gradient(124% 92% at 50% 0%, #152A42 0%, #0B1626 54%, #05090F 100%)' }}
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Put the badge away" className={KEY}>
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <p className="font-body text-[8px] font-bold uppercase tracking-[0.32em] text-editorial-gold/80">The badge</p>
        <button
          type="button"
          onClick={() => setFace(face === 'front' ? 'back' : 'front')}
          aria-pressed={face === 'back'}
          className={KEY}
        >
          <RotateCw className="h-3.5 w-3.5" />
          {face === 'front' ? 'Card' : 'Badge'}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-16">
          <Loader2 className="h-5 w-5 animate-spin text-editorial-gold" />
          <p className="font-body text-[8.5px] font-bold uppercase tracking-[0.26em] text-editorial-cream/45">
            Printing the plate
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-16 text-center">
          <p className="font-heading text-lg text-editorial-cream">The badge did not print.</p>
          <p className="font-body text-[11px] leading-relaxed text-editorial-cream/55">
            {error.message || 'The record could not be read just now.'}
          </p>
          <button type="button" onClick={reload} className={KEY}>
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 pb-4">
          <div className="min-h-0 flex-1 px-3" style={{ perspective: '1500px' }}>
            <div
              onClick={() => setFace(face === 'front' ? 'back' : 'front')}
              className="relative mx-auto h-full min-h-[330px] w-full max-w-sm transition-transform duration-700"
              style={{
                transformStyle: 'preserve-3d',
                transform: face === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                <BadgeFront
                  person={person}
                  template={template}
                  qrLink={link}
                  qrTitle={qrTitle}
                  qrNote={qrNote}
                  showQr={showQr}
                  year={new Date().getFullYear()}
                />
              </div>
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <BadgeBack person={person} actions={actions} />
              </div>
            </div>
          </div>

          <BadgeTemplateDeck value={template.key} onChange={choosePlate} showQr={showQr} onToggleQr={toggleCode} />

          {/* What the code hands on, and the ways of passing it on without a scan. */}
          <BadgeShareDock
            destinations={destinations}
            selectedKey={chosen.key}
            onSelect={chooseDestination}
            incoming={incoming}
            link={link}
            copied={copied}
            onCopy={copy}
            onShare={share}
            onOpen={openLink}
          />

          <p className="px-5 text-center font-body text-[8.5px] leading-relaxed text-editorial-cream/35">
            Tap the plate to turn it over. The badge is what you wear; the card behind it is what they keep.
          </p>

          {!viewer?.email ? (
            <div className="px-4">
              <button
                type="button"
                onClick={() => base44.auth.redirectToLogin('/badge')}
                className="w-full rounded-full border border-editorial-gold/50 px-4 py-2 font-body text-[8.5px] font-bold uppercase tracking-[0.2em] text-editorial-gold"
              >
                Sign in to wear your own
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}