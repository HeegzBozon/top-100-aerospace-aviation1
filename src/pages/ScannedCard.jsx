import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Bell, Check, Loader2, MessageSquare, Save, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useProfileResolution } from '@/hooks/useProfileResolution';
import { enabledModes } from '@/components/profile/intent/intentConfig';
import InquirySheet from '@/components/profile/intent/InquirySheet';
import CardActions from '@/components/card/CardActions';
import { cardUrl, saveContact } from '@/lib/publicCard';

const NAVY_DEEP = '#16293f';

// The card a code opens.
//
// This is the far end of the handshake: someone points a phone at a Fellow's title
// screen and arrives here, most often without an account and never having heard of the
// platform. So the page carries the person, not the institution: the contact saves in
// one press with no sign-up at all, and everything that needs a name on it — connecting,
// following, writing — sends the reader through the door and straight back here, where
// the key they pressed is still standing.
//
// The record itself is the canonical profile; this is its handover face, so it is left
// out of the index and points at /profiles/:id for the reading.
export default function ScannedCard() {
  const { id } = useParams();
  const [busy, setBusy] = useState(false);
  const [enquiry, setEnquiry] = useState(false);

  const { data: viewer } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: profiles, isLoading, isError } = useProfileResolution(id);

  const person = useMemo(() => {
    if (!profiles) return null;
    const nominee = profiles.nominee;
    const user = profiles.user;
    if (!nominee && !user) return null;
    const profileId = nominee?.id || user?.id || '';
    return {
      name: nominee?.name || user?.full_name || 'A Fellow',
      role: nominee?.title || nominee?.professional_role || '',
      org: nominee?.company || nominee?.organization || '',
      place: nominee?.country || '',
      tagline: nominee?.description || '',
      avatarUrl: nominee?.avatar_url || nominee?.photo_url || user?.avatar_url || '',
      email: nominee?.nominee_email || user?.email || '',
      nomineeId: nominee?.id || '',
      linkedin: nominee?.linkedin_profile_url || '',
      website: nominee?.website_url || '',
      profileId,
      cardUrl: profileId ? cardUrl(profileId) : '',
    };
  }, [profiles]);

  // A handover face is never indexed: the record it prints is /profiles/:id.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,follow';
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  useEffect(() => {
    if (isLoading || person) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, [isLoading, person]);

  const targetEmail = person?.email || '';
  const signedIn = !!viewer?.email;
  const isOwner = signedIn && !!targetEmail && viewer.email === targetEmail;

  // What already stands between the reader and this person, so no key offers to do
  // something that is already done.
  const { data: link, refetch } = useQuery({
    queryKey: ['card-link', viewer?.email, targetEmail],
    enabled: signedIn && !!targetEmail && !isOwner,
    queryFn: async () => {
      try {
        const [connections, follows] = await Promise.all([
          base44.entities.Connection.filter(
            {
              $or: [
                { requester_email: viewer.email, recipient_email: targetEmail },
                { requester_email: targetEmail, recipient_email: viewer.email },
              ],
            },
            { limit: 2 },
          ),
          base44.entities.Follow.filter(
            { follower_email: viewer.email, following_email: targetEmail },
            { limit: 1 },
          ),
        ]);
        return {
          connection: (connections?.items || [])[0] || null,
          follow: (follows?.items || [])[0] || null,
        };
      } catch {
        return { connection: null, follow: null };
      }
    },
  });

  // Writing to a Fellow is only offered where they have opened a door of their own.
  const { data: settings } = useQuery({
    queryKey: ['card-settings', targetEmail],
    enabled: !!targetEmail,
    queryFn: () =>
      base44.entities.FellowProfileSettings.filter({ fellow_email: targetEmail })
        .then((rows) => rows?.[0] || null)
        .catch(() => null),
  });
  const mode = enabledModes(settings)[0] || '';
  const canWrite = !!person?.nomineeId && !!mode;

  const signIn = () => base44.auth.redirectToLogin(window.location.href);

  const send = async (work) => {
    setBusy(true);
    try {
      await work();
      await refetch();
    } finally {
      setBusy(false);
    }
  };

  const connection = link?.connection || null;
  const following = !!link?.follow;
  const incoming = connection?.status === 'pending' && connection?.recipient_email === viewer?.email;
  const accepted = connection?.status === 'accepted';

  const connect = () => {
    if (!signedIn) return signIn();
    if (!targetEmail || isOwner) return undefined;
    return send(() =>
      base44.entities.Connection.create({
        requester_email: viewer.email,
        requester_name: viewer.full_name || '',
        requester_avatar_url: viewer.avatar_url || '',
        recipient_email: targetEmail,
        recipient_name: person.name,
        recipient_avatar_url: person.avatarUrl || '',
        status: 'pending',
      }),
    );
  };

  const accept = () =>
    send(() =>
      base44.entities.Connection.update(connection.id, {
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      }),
    );

  const follow = () => {
    if (!signedIn) return signIn();
    if (!targetEmail || isOwner) return undefined;
    return send(() =>
      link?.follow
        ? base44.entities.Follow.delete(link.follow.id)
        : base44.entities.Follow.create({
            follower_email: viewer.email,
            follower_name: viewer.full_name || '',
            follower_avatar_url: viewer.avatar_url || '',
            following_email: targetEmail,
            following_name: person.name,
            following_avatar_url: person.avatarUrl || '',
          }),
    );
  };

  const onSave = () => saveContact(person);

  const onWrite = () => (signedIn ? setEnquiry(true) : signIn());

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center" style={{ background: NAVY_DEEP }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#C9A87C' }} />
        <span className="mt-4 font-body text-[9px] font-bold uppercase tracking-[0.3em] text-editorial-gold/80">
          Opening the card
        </span>
      </div>
    );
  }

  if (isError || !person) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: NAVY_DEEP }}>
        <h1 className="font-heading text-[26px] text-editorial-cream">This card has been put away.</h1>
        <p className="mt-2 max-w-xs font-body text-[12px] leading-relaxed text-editorial-cream/55">
          The record may have been merged into a canonical profile. The directory still has it.
        </p>
        <Link to="/Top100Women2025" className="mt-6 inline-flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold">
          Open the directory <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const connectLabel = accepted
    ? 'Connected'
    : incoming
      ? 'Accept connection'
      : connection
        ? 'Request sent'
        : 'Connect';

  const actions = isOwner
    ? []
    : [
        {
          key: 'connect',
          label: connectLabel,
          Icon: accepted ? Check : UserPlus,
          tone: connection ? 'done' : 'solid',
          disabled: (!!connection && !incoming) || busy,
          onClick: incoming ? accept : connect,
        },
        { key: 'save', label: 'Save contact', Icon: Save, tone: 'line', onClick: onSave },
        {
          key: 'follow',
          label: following ? 'Following' : 'Follow',
          Icon: Bell,
          tone: following ? 'done' : 'line',
          disabled: busy,
          onClick: follow,
        },
        ...(canWrite
          ? [{ key: 'write', label: 'Message', Icon: MessageSquare, tone: 'line', onClick: onWrite }]
          : []),
      ];

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: NAVY_DEEP }}>
      <div className="mx-auto w-full max-w-[420px]">
        <p className="font-body text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-gold/80">
          A card, handed over
        </p>

        <div
          className="mt-2 rounded-2xl px-5 py-5"
          style={{
            background: '#FAF8F5',
            border: '1px solid rgba(184,115,51,0.5)',
            boxShadow: '0 28px 60px -28px rgba(3,8,15,0.9)',
          }}
        >
          <div className="flex items-start gap-3">
            {person.avatarUrl ? (
              <img
                src={person.avatarUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full object-cover"
                style={{ border: '1px solid rgba(184,115,51,0.55)' }}
              />
            ) : (
              <div
                className="h-16 w-16 shrink-0 rounded-full"
                style={{ border: '1px solid rgba(184,115,51,0.55)', background: 'rgba(30,58,90,0.06)' }}
              />
            )}
            <div className="min-w-0">
              <h1 className="font-heading text-[22px] leading-tight" style={{ color: '#1E3A5A' }}>
                {person.name}
              </h1>
              {(person.role || person.org) ? (
                <p className="mt-1 font-body text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgb(var(--editorial-label-rgb))' }}>
                  {[person.role, person.org].filter(Boolean).join(' · ')}
                </p>
              ) : null}
              {person.place ? (
                <p className="mt-1 font-body text-[10.5px]" style={{ color: 'rgba(30,58,90,0.6)' }}>
                  {person.place}
                </p>
              ) : null}
            </div>
          </div>

          {person.tagline ? (
            <p className="mt-3 font-body text-[12px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.78)' }}>
              {person.tagline}
            </p>
          ) : null}

          <div className="my-4 h-px w-full" style={{ background: 'linear-gradient(90deg, #B87333, rgba(30,58,90,0.12))' }} />

          {isOwner ? (
            <p className="font-body text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.7)' }}>
              This is your card. Hand the screen over, and whoever scans it lands here.
            </p>
          ) : (
            <>
              <CardActions actions={actions} busy={busy} />
              <p className="mt-2.5 font-body text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
                {signedIn
                  ? 'Connecting is mutual: they answer it in their own network.'
                  : 'Saving the contact needs no account. Connecting, following and writing ask you to sign in — and bring you straight back to this card.'}
              </p>
            </>
          )}

          <Link
            to={`/profiles/${person.profileId}`}
            className="mt-3 inline-flex items-center gap-1 font-body text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: '#1E3A5A' }}
          >
            Read the full record <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <p className="mt-4 text-center font-body text-[9px] leading-relaxed text-editorial-cream/45">
          TOP 100 Aerospace &amp; Aviation · a measured record, held by the institution
        </p>
      </div>

      {enquiry && person.nomineeId ? (
        <InquirySheet
          nominee={profiles.nominee}
          mode={mode}
          requestType={mode === 'hire' ? 'role_conversation' : 'introduction'}
          onClose={() => setEnquiry(false)}
        />
      ) : null}
    </div>
  );
}