import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Linkedin, Clock, ArrowRight, Loader2, CheckCircle2, UserCog, X } from 'lucide-react';

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
export default function NomineeClaimPanel({ nominee, viewer, onResolved, variant = 'floating' }) {
  // Seated: the band is part of the record's own frame, printed under the book's
  // bar. Floating: the original overlay, kept for any surface that still shows it
  // over a page it must not disturb.
  const seated = variant === 'seated';
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
        seated={seated}
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

  // Already the owner: one key, straight into the editor. The record is theirs, so
  // it needs no band explaining that to them.
  if (owner) {
    return (
      <ClaimShell
        icon={CheckCircle2}
        seated={seated}
        compact
        title="You own this profile"
        body="Open your profile editor to keep it current."
        actionLabel="Edit profile"
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
        seated={seated}
        title="This profile is managed"
        body="This footprint has been claimed and is maintained by its owner."
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

  // Identity match is tested BEFORE any record-level review state: an exact email
  // match self-verifies instantly, even when an earlier claim on this record is
  // still queued. A stale pending request must never hide the instant path — that
  // is what queued 33 matching claimers behind 'we'll be in touch'.
  if (emailEligible) {
    return (
      <ClaimShell
        icon={ShieldCheck}
        seated={seated}
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

  // Resolved-pending state from a prior call (admin review queue). Only reaches
  // here when the viewer's identity could not be matched to the record.
  if (result?.claim_state === 'pending' || (nominee?.claim_status === 'pending' && !submitting && !result)) {
    return (
      <ClaimShell
        icon={Clock}
        seated={seated}
        title="Claim submitted for review"
        body={result?.error || "Neither your email nor LinkedIn matched the record, so your claim is queued for admin review. We'll be in touch."}
        muted
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
        seated={seated}
        title="Verify with LinkedIn to claim"
        body="Your account email doesn't match, but this profile lists a LinkedIn profile. Connect LinkedIn so we can confirm it's you — if we can't confirm it automatically, your claim goes to our team for review."
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
      seated={seated}
      title="Submit claim for review"
      body="We can't auto-verify this one — there's no matching email or LinkedIn URL on record. Submit your claim and an admin will review it."
      actionLabel={submitting ? 'Submitting…' : 'Submit for review'}
      busy={submitting}
      onAction={() => startClaim({ nominee_id: nominee.id })}
      error={error}
    />
  );
}

// Floating glass banner that overlays the top of the profile deck so the
// slides remain full-bleed. Compact, dismissible, on-brand navy + rose gold.
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
  seated,
  compact,
  error,
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const isGold = accent === 'gold';

  // The owner's key alone, seated in the record's frame: a button, not a band.
  if (seated && compact) {
    return (
      <div
        className="flex items-center justify-end gap-1 px-4 py-1.5 sm:px-8"
        style={{
          background: isGold ? '#173049' : '#132539',
          borderBottom: '1px solid rgba(201,168,124,0.28)',
        }}
      >
        <button
          type="button"
          onClick={onAction}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-[9.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
          style={{
            background: isGold ? B.gold : 'rgba(250,248,245,0.10)',
            color: isGold ? B.navyDeep : '#fff',
            border: `1px solid ${isGold ? B.gold : 'rgba(201,168,124,0.4)'}`,
          }}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
          {actionLabel}
          {!busy && <ArrowRight className="h-3 w-3" />}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="rounded-full p-1 transition-colors hover:bg-white/10"
          style={{ color: 'rgba(250,248,245,0.5)' }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // Seated in the record's own frame: a band under the book's bar, printed on the
  // same navy as the page it belongs to — never a card laid over the reading.
  if (seated) {
    return (
      <div
        className="flex flex-wrap items-center gap-3 px-4 py-2.5 sm:px-8"
        style={{
          background: isGold ? '#173049' : '#132539',
          borderBottom: '1px solid rgba(201,168,124,0.28)',
        }}
      >
        <span
          className="flex h-8 w-8 flex-none items-center justify-center rounded-lg"
          style={{
            background: 'rgba(201,168,124,0.14)',
            border: '1px solid rgba(201,168,124,0.32)',
            color: B.gold,
          }}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className="font-body text-[9.5px] font-bold uppercase tracking-[0.22em]"
            style={{ color: B.gold }}
          >
            {title}
          </p>
          <p
            className="mt-0.5 font-body text-[12px] leading-relaxed"
            style={{ color: 'rgba(250,248,245,0.66)' }}
          >
            {body}
          </p>
          {error && (
            <p className="mt-1 font-body text-[11px]" style={{ color: '#f4b8b8' }}>
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-none flex-wrap items-center gap-2">
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] disabled:opacity-50"
              style={{
                background: isGold ? B.gold : 'rgba(250,248,245,0.10)',
                color: isGold ? B.navyDeep : '#fff',
                border: `1px solid ${isGold ? B.gold : 'rgba(201,168,124,0.4)'}`,
              }}
            >
              {actionLabel}
              {!busy && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          )}
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              disabled={busy}
              className="font-body text-[10px] underline underline-offset-2 disabled:opacity-50"
              style={{ color: 'rgba(250,248,245,0.62)' }}
            >
              {secondaryLabel}
            </button>
          )}
          {!muted && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10"
              style={{ color: 'rgba(250,248,245,0.5)' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] w-[calc(100%-1.5rem)] max-w-2xl px-2">
      <div
        className="rounded-2xl overflow-hidden shadow-2xl ppc-rise"
        style={{
          background: 'rgba(22,41,63,0.92)',
          border: `1px solid ${B.gold}40`,
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        }}
      >
        <div className="flex items-center gap-3 p-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${B.gold}18`, color: B.gold, border: `1px solid ${B.gold}40` }}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              {title}
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {body}
            </p>
            {error && (
              <p className="mt-1 text-[11px]" style={{ color: '#f4b8b8' }}>{error}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actionLabel && (
              <button
                onClick={onAction}
                disabled={busy}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: isGold ? B.gold : 'rgba(255,255,255,0.08)',
                  color: isGold ? B.navyDeep : '#fff',
                  border: isGold ? `1px solid ${B.gold}` : `1px solid ${B.gold}33`,
                }}
              >
                {actionLabel}
                {!busy && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            )}
            {secondaryLabel && (
              <button
                onClick={onSecondary}
                disabled={busy}
                className="hidden md:inline-flex text-[11px] font-medium underline-offset-4 hover:underline"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                {secondaryLabel}
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Mobile action row — keeps the CTA reachable on small screens */}
        {actionLabel && (
          <div className="flex items-center gap-2 px-3.5 pb-3.5 sm:hidden">
            <button
              onClick={onAction}
              disabled={busy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-transform active:scale-[0.98] disabled:opacity-50"
              style={{
                background: isGold ? B.gold : 'rgba(255,255,255,0.08)',
                color: isGold ? B.navyDeep : '#fff',
                border: isGold ? `1px solid ${B.gold}` : `1px solid ${B.gold}33`,
              }}
            >
              {actionLabel}
              {!busy && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
            {secondaryLabel && (
              <button
                onClick={onSecondary}
                disabled={busy}
                className="text-[11px] font-medium underline-offset-4 hover:underline px-1"
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