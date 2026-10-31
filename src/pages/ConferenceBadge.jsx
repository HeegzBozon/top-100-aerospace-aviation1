import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Loader2, RefreshCw, RotateCw, Save, ScanLine, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useDevice } from '@/components/handheld/HandheldShell';
import { saveContact } from '@/lib/publicCard';
import {
  availableDestinations,
  readStoredDestination,
  resolveDestination,
  shareUrl,
  storeDestination,
} from '@/lib/shareDestinations';
import QrShareCenter from '@/components/start/QrShareCenter';
import BadgeFront from '@/components/badge/BadgeFront';
import BadgeBack from '@/components/badge/BadgeBack';
import BadgeTemplateDeck from '@/components/badge/BadgeTemplateDeck';
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

export default function ConferenceBadge() {
  const navigate = useNavigate();
  const device = useDevice();
  const { loading, error, viewer, person, card, reload, saveBadge } = useBadgePerson();

  const [face, setFace] = useState('front');
  const [plate, setPlate] = useState(null);
  const [codeOn, setCodeOn] = useState(null);
  const [copied, setCopied] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [destination, setDestination] = useState(() => readStoredDestination());

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
      if (event.key !== 'Escape' || codeOpen) return;
      if (face === 'back') setFace('front');
      else navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [face, codeOpen, navigate]);

  const template = resolveBadgeTemplate(plate || card?.badge_template);
  const showQr = codeOn ?? card?.badge_qr_visible ?? true;

  // The code printed on the badge hands over the card. The code panel behind it is where
  // the holder decides what the standing title-screen code opens, and that choice is
  // remembered the same way it always was.
  const shareHolder = useMemo(
    () => ({ name: person?.name, role: person?.role, org: person?.org, cardId: person?.profileId || '' }),
    [person]
  );
  const destinations = useMemo(() => availableDestinations(shareHolder), [shareHolder]);
  const chosen = resolveDestination(destination, shareHolder);

  const choose = (key) => {
    setDestination(key);
    storeDestination(key);
  };

  const choosePlate = (key) => {
    setPlate(key);
    saveBadge({ badge_template: key });
  };

  const toggleCode = () => {
    const next = !showQr;
    setCodeOn(next);
    saveBadge({ badge_qr_visible: next });
  };

  const share = async () => {
    const url = person?.cardUrl;
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: person?.name || 'TOP 100', url });
      } catch {
        /* the hand closed the sheet — nothing to report */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no clipboard on this origin; the code on the badge is still scannable */
    }
  };

  const actions = useMemo(() => {
    const list = [];
    if (person?.name) {
      list.push({ key: 'save', label: 'Save contact', Icon: Save, tone: 'solid', onClick: () => saveContact(person) });
    }
    if (person?.cardUrl) {
      list.push({ key: 'share', label: copied ? 'Copied' : 'Share', Icon: Share2, tone: 'line', onClick: share });
      list.push({
        key: 'open',
        label: 'Open card',
        Icon: ArrowUpRight,
        tone: 'line',
        onClick: () => window.open(person.cardUrl, '_blank', 'noopener'),
      });
    }
    return list;
  }, [person, copied]);

  return (
    <div
      className="flex min-h-[calc(100dvh-var(--hh-top)-var(--hh-nav))] flex-col md:min-h-screen"
      style={{ background: 'radial-gradient(124% 92% at 50% 0%, #152A42 0%, #0B1626 54%, #05090F 100%)' }}
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Put the badge away" className={KEY}>
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <p className="shrink-0 font-body text-[8px] font-bold uppercase tracking-[0.32em] text-editorial-gold/80">The badge</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => setCodeOpen(true)} aria-label="The code panel" className={KEY}>
            <ScanLine className="h-3.5 w-3.5" />
          </button>
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
                  qrLink={person?.cardUrl}
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

      {codeOpen ? (
        <QrShareCenter
          holder={shareHolder}
          destinations={destinations}
          destination={chosen.key}
          onDestination={choose}
          link={shareUrl(chosen.key, shareHolder)}
          onClose={() => setCodeOpen(false)}
          showWear={false}
        />
      ) : null}
    </div>
  );
}