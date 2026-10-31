import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { qrSrc } from '@/lib/publicCard';
import {
  readStoredDestination,
  readStoredProgram,
  resolveDestination,
  shareUrl,
} from '@/lib/shareDestinations';

// The code standing on the title screen.
//
// It is a badge worn at the masthead, and it is printed at a size a camera reads across a
// table — the hand-over needs no tap at all. Tapping wears the badge full screen, where
// the code is larger still and the holder chooses what it opens: their own card, the
// edition, the record, the archive, or the program last handed over from the menu. That
// choice is remembered, so the code on the title screen is always the one last set.
export default function TitleCardQr({ user = null, variant = 'glass', className = '' }) {
  const navigate = useNavigate();
  const [nominee, setNominee] = useState(null);
  const [destination] = useState(() => readStoredDestination());
  const [program] = useState(() => readStoredProgram());
  const signedIn = !!user?.email;

  useEffect(() => {
    if (!signedIn) {
      setNominee(null);
      return undefined;
    }
    let alive = true;
    base44.entities.Nominee
      .filter({ nominee_email: user.email }, { limit: 1 })
      .then((page) => {
        if (alive) setNominee(page?.items?.[0] || null);
      })
      .catch(() => {
        if (alive) setNominee(null);
      });
    return () => {
      alive = false;
    };
  }, [signedIn, user?.email]);

  // Who the badge is worn for: the Fellow's own record when there is one behind the
  // screen, and the platform itself when there is not — the code still hands something on.
  const holder = useMemo(() => {
    if (nominee?.id) {
      return {
        name: nominee.name || user?.full_name || 'A Fellow',
        role: nominee.title || nominee.professional_role || '',
        org: nominee.company || nominee.organization || '',
        cardId: nominee.id,
      };
    }
    return {
      name: signedIn ? user?.full_name || 'A Fellow' : 'TOP 100 Aerospace & Aviation',
      role: signedIn ? 'Fellow' : 'The platform',
      org: '',
      cardId: '',
    };
  }, [nominee, signedIn, user?.full_name]);

  // With no account behind the screen there is no card to hand over, so an unset code
  // opens the platform itself rather than a page the visitor never chose.
  const chosen = resolveDestination(destination || (signedIn ? '' : 'platform'), holder);
  // A program handed over from the menu outranks the destination: that is the code the
  // badge is carrying, and this is the same code printed large enough to scan cold.
  const link = program?.url || shareUrl(chosen.key, holder);

  const size = variant === 'desk' ? 132 : 92;

  return (
    <div className={`shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => navigate('/badge')}
        aria-label={`Wear the badge: ${program?.label || chosen.label}. Scan the code, or open it larger.`}
        className="block text-right transition-transform active:scale-[0.98]"
      >
        <span
          className="block rounded-[7px]"
          style={{
            padding: 6,
            background: '#FFFFFF',
            border: '1px solid rgb(var(--editorial-gold-rgb) / 0.85)',
            boxShadow: '0 10px 22px -12px rgba(3,6,13,0.75), inset 0 0 0 1px rgba(30,58,90,0.10)',
          }}
        >
          <img
            src={qrSrc(link, variant === 'desk' ? 400 : 340, 2)}
            alt=""
            width={size}
            height={size}
            className="block"
            style={{ width: size, height: size }}
          />
        </span>
      </button>
    </div>
  );
}