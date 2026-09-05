import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Linkedin, Clock, ArrowRight, Loader2, CheckCircle2, UserCog } from 'lucide-react';

// Workspace-registered LinkedIn connector (APP_USER-capable). Each claimer
// connects their own account; we never use a shared/builder token for identity.
const LINKEDIN_CONNECTOR_ID = '69e951492e767a94643ab30a';

const B = {
  navyDeep: '#16293f',
  navy: '#1e3a5a',
  gold: '#c9a87c',
  cream: '#faf8f5',
  sand: '#efe7dc',
  roseGold: '#b08968',
};

function emailMatches(viewer, nominee) {
  if (!viewer?.email) return false;
  const e = viewer.email.toLowerCase().trim();
  if (nominee?.nominee_email && nominee.nominee_email.toLowerCase().trim() === e) return true;
  if (Array.isArray(nominee?.secondary_emails)) {
    return nominee.secondary_emails.some((s) => s && s.toLowerCase().trim() === e);
  }
  return false;
}

function isOwnerOf(nominee, viewer) {
  if (!viewer?.id) return false;
  if (nominee?.claimed_by_user_id && nominee.claimed_by_user_id === viewer.id) return true;
  if (nominee?.claimed_by_user_email && nominee.claimed_by_user_email === viewer?.email) return true;
  return false;
}

function claimedByOther(nominee, viewer) {
  if (!['approved'].includes(nominee?.claim_status)) return false;
  return !isOwnerOf(nominee, viewer);
}

// Role-based claim decision surface for the canonical /profiles/:id route.
// Unauthenticated → claim CTA + auth key. Authenticated non-owner → email /
// LinkedIn / admin-review path. Owner → editor handoff.
export default function NomineeClaimPanel({ nominee, viewer, onResolved }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [linkedinPending, setLinkedinPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const autoClaimed = useRef(false);

  const owner = isOwnerOf(nominee, viewer);
  const taken = claimedByOther(nominee, viewer);
  const emailEligible = emailMatches(viewer, nominee);
  const hasLinkedIn = !!nominee?.linkedin_profile_url;

  // After a successful instant claim (email or LinkedIn), surface the resolved state.
  useEffect(() => {
    if (result?.resolved && result?.claim_state === 'approved' && !autoClaimed.current) {
      autoClaimed.current = true;
      onResolved?.();
    }
  }, [result]);

  // Unauthenticated visitor → the canonical route with ?claim=1 as the return target.
  if (!viewer) {
    return (
      <ClaimShell
        icon={UserCog}
        title="Is this your profile?"
        body="If this record belongs to you, claim it to take ownership, verify it, and make it yours. Sign in or create your account to begin."
        actionLabel="Sign in to claim"
        onAction={() => {
          const next = `/profiles/${nominee.id}?claim=1`;
          base44.auth.redirectToLogin(next);
        }}
      />
    );
  }

  // Already the owner.
  if (owner) {
    return (
      <ClaimShell
        icon={CheckCircle2}
        title="You own this profile"
        body="This footprint is verified to you. Open your profile editor to keep it current."
        actionLabel="Open your profile"
        onAction={() => navigate('/Profile')}
        accent="gold"
      />
    );
  }

  // Claimed by someone else — read-only, no claim affordance.
  if (taken) {
    return (
      <ClaimShell
        icon={ShieldCheck}
        title="This profile is managed"
        body="This footprint has been claimed and is maintained by its owner."
        muted
      />
    );
  }

  // Resolved-pending state from a prior call (admin review queue).
  if (result?.claim_state === 'pending' || (nominee?.claim_status === 'pending' && !submitting && !result)) {
    return (
      <ClaimShell
        icon={Clock}
        title="Claim submitted for review"
        body={result?.error || "Neither your email nor LinkedIn matched the record, so your claim is queued for admin review. We'll be in touch."}
        muted
      />
    );
  }

  const startClaim = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await base44.functions.invoke('claimNomineeProfile', payload);
      setResult(res.data || res);
    } catch (e) {
      const data = e?.response?.data || {};
      setResult(data);
      setError(data?.error || e?.message || 'Claim request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Email match → instant self-verified claim.
  if (emailEligible) {
    return (
      <ClaimShell
        icon={ShieldCheck}
        title="You're verified by email"
        body="Your account email matches this profile. Claim is instant — no review required."
        actionLabel={submitting ? 'Claiming…' : 'Claim this profile'}
        busy={submitting}
        onAction={() => startClaim({ nominee_id: nominee.id })}
        accent="gold"
        error={error}
      />
    );
  }

  // LinkedIn path available.
  if (hasLinkedIn) {
    const handleConnect = async () => {
      setLinkedinPending(true);
      setError('');
      try {
        const url = await base44.connectors.connectAppUser(LINKEDIN_CONNECTOR_ID);
        const popup = window.open(url, '_blank', 'noopener');
        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            setLinkedinPending(false);
            startClaim({ nominee_id: nominee.id, linked_in_match: true });
          }
        }, 500);
      } catch (e) {
        setLinkedinPending(false);
        setError(e?.message || 'Could not start LinkedIn connection.');
      }
    };
    return (
      <ClaimShell
        icon={Linkedin}
        title="Verify with LinkedIn to claim"
        body="Your account email doesn't match, but this profile lists a LinkedIn URL. Connect your LinkedIn so we can confirm it's the same person."
        actionLabel={linkedinPending ? 'Connecting…' : 'Connect LinkedIn to verify'}
        busy={linkedinPending || submitting}
        onAction={handleConnect}
        secondaryLabel="Or submit for admin review"
        onSecondary={() => startClaim({ nominee_id: nominee.id })}
        accent="gold"
        error={error}
      />
    );
  }

  // No email match, no LinkedIn URL — admin review fallback.
  return (
    <ClaimShell
      icon={Clock}
      title="Submit claim for review"
      body="We can't auto-verify this one — there's no matching email or LinkedIn URL on record. Submit your claim and an admin will review it."
      actionLabel={submitting ? 'Submitting…' : 'Submit for review'}
      busy={submitting}
      onAction={() => startClaim({ nominee_id: nominee.id })}
      error={error}
    />
  );
}

// The shell keeps the on-brand editorial treatment: navy card, rose-gold accent,
// a single primary CTA, optional secondary link.
function ClaimShell({
  icon: Icon,
  title,
  body,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  busy,
  muted,
  accent,
  error,
}) {
  const isGold = accent === 'gold';
  return (
    <div className="mx-auto max-w-xl px-4 mt-4 mb-2 relative z-10">
      <div
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: B.navy, border: `1px solid ${B.gold}33` }}
      >
        <div className="flex items-start gap-4 p-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${B.gold}18`, color: B.gold, border: `1px solid ${B.gold}40` }}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {body}
            </p>
            {error && (
              <p className="mt-2 text-xs" style={{ color: '#f4b8b8' }}>{error}</p>
            )}
          </div>
        </div>
        {(actionLabel || secondaryLabel) && (
          <div className="px-5 pb-5 flex flex-wrap items-center gap-3">
            {actionLabel && (
              <button
                onClick={onAction}
                disabled={busy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: isGold ? B.gold : 'rgba(255,255,255,0.08)',
                  color: isGold ? B.navyDeep : '#fff',
                  border: isGold ? `1px solid ${B.gold}` : `1px solid ${B.gold}33`,
                }}
              >
                {actionLabel}
                {!busy && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
            {secondaryLabel && (
              <button
                onClick={onSecondary}
                disabled={busy}
                className="text-xs font-medium underline-offset-4 hover:underline"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}