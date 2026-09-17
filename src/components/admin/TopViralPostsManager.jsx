import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, ExternalLink, Quote as QuoteIcon, AlertCircle, Inbox, Star, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NAVY = '#1e3a5a';
const GOLD = '#c9a87c';
const COPPER = '#b87333';
const CREAM = '#faf8f5';
const SAND = '#f0e9df';

const FIELDS = [
  { key: 'viral_post_link', label: 'Link to the post', kind: 'link' },
  { key: 'viral_post_impressions', label: 'Impressions / views', kind: 'text' },
  { key: 'viral_post_takeaway', label: 'Key takeaway for aerospace & aviation', kind: 'text' },
  { key: 'viral_post_wisdom', label: 'The “aha moment” readers walk away with', kind: 'text' },
];

const ordinal = (n) => `${n}`;

const Monogram = ({ name }) => {
  const initials = (name || '')
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 shrink-0"
      style={{ borderColor: GOLD, background: CREAM, color: NAVY, width: 56, height: 56 }}
    >
      <span className="font-serif text-lg tracking-wide">{initials || '✦'}</span>
    </div>
  );
};

const SubmissionCard = ({ user, onToggleFeature, featuringId }) => {
  const postUrl = user.viral_post_link;
  const featured = !!user.viral_post_featured;
  const featuring = featuringId === user.id;
  return (
    <article
      className="bg-white rounded-2xl overflow-hidden border flex flex-col"
      style={{ borderColor: 'rgba(30,58,90,0.14)' }}
    >
      {/* Masthead */}
      <div className="flex items-center gap-4 p-6 pb-5" style={{ background: NAVY }}>
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.full_name || user.email}
            className="w-14 h-14 rounded-full object-cover border-2 shrink-0"
            style={{ borderColor: GOLD }}
          />
        ) : (
          <Monogram name={user.full_name || user.email} />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg md:text-xl font-bold leading-tight truncate" style={{ color: CREAM }}>
            {user.full_name || 'Name not set'}
          </h3>
          <p className="text-xs truncate mt-0.5" style={{ color: GOLD }}>{user.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {featured && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ background: `${COPPER}1a`, color: CREAM, border: `1px solid ${COPPER}` }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Featured
            </span>
          )}
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ background: 'rgba(201,168,124,0.16)', color: GOLD, border: '1px solid rgba(201,168,124,0.3)' }}
          >
            <TrendingUp className="w-3 h-3" />
            Most Liked Post
          </span>
        </div>
      </div>

      {/* Six-word story, if present */}
      {user.six_word_story && (
        <div className="px-6 pt-6">
          <p
            className="font-serif italic text-base md:text-lg leading-relaxed text-center px-4 py-4 rounded-lg"
            style={{ background: SAND, color: NAVY, borderLeft: `3px solid ${COPPER}` }}
          >
            &ldquo;{user.six_word_story}&rdquo;
          </p>
        </div>
      )}

      {/* Submission fields */}
      <div className="p-6 flex-1 flex flex-col gap-5">
        {FIELDS.map((f) => {
          const val = user[f.key];
          if (f.kind === 'link') {
            return (
              <div key={f.key}>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: 'rgba(30,58,90,0.55)' }}>
                  {f.label}
                </div>
                {val ? (
                  <a
                    href={val}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm break-all hover:underline"
                    style={{ color: COPPER }}
                  >
                    {val}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-sm" style={{ color: 'rgba(30,58,90,0.35)' }}>—</span>
                )}
              </div>
            );
          }
          return (
            <div key={f.key}>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: 'rgba(30,58,90,0.55)' }}>
                {f.label}
              </div>
              {val ? (
                <div className="flex gap-2">
                  <QuoteIcon className="shrink-0 mt-0.5" style={{ color: GOLD, width: 15, height: 15 }} />
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(30,58,90,0.85)' }}>
                    {val}
                  </p>
                </div>
              ) : (
                <span className="text-sm" style={{ color: 'rgba(30,58,90,0.35)' }}>—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer — receipt + Feature publicly toggle */}
      <div
        className="flex items-center justify-between gap-3 px-6 py-3 text-xs"
        style={{ background: SAND, color: 'rgba(30,58,90,0.6)', borderTop: '1px solid rgba(30,58,90,0.08)' }}
      >
        <span className="truncate">Receipt sent to {user.viral_post_email || user.email}</span>
        <button
          type="button"
          disabled={featuring}
          onClick={() => onToggleFeature(user)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] transition-all disabled:opacity-50"
          style={
            featured
              ? { background: 'transparent', color: 'rgba(30,58,90,0.55)', border: '1px solid rgba(30,58,90,0.18)' }
              : { background: COPPER, color: CREAM, border: `1px solid ${COPPER}` }
          }
        >
          {featuring ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Star className="w-3 h-3" style={{ fill: featured ? 'currentColor' : 'none' }} />
          )}
          {featured ? 'Unfeature' : 'Feature publicly'}
        </button>
      </div>
    </article>
  );
};

export default function TopViralPostsManager() {
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState(null);
  const [featuringId, setFeaturingId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const users = await base44.entities.User.list('-updated_date', 1000);
        if (!alive) return;
        const filled = (users || []).filter(
          (u) => u.viral_post_link && String(u.viral_post_link).trim() !== ''
        );
        setSubmissions(filled);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Could not load submissions.');
        setSubmissions([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleToggleFeature = async (user) => {
    const next = !user.viral_post_featured;
    setFeaturingId(user.id);
    // Optimistic update — flip the flag in the local list immediately.
    setSubmissions((prev) =>
      (prev || []).map((u) => (u.id === user.id ? { ...u, viral_post_featured: next } : u))
    );
    try {
      await base44.entities.User.update(user.id, { viral_post_featured: next });
    } catch (e) {
      // Roll back on failure.
      setSubmissions((prev) =>
        (prev || []).map((u) => (u.id === user.id ? { ...u, viral_post_featured: !next } : u))
      );
      setError(e?.message || 'Could not update featured status.');
    } finally {
      setFeaturingId(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <AlertCircle className="w-10 h-10 mb-4" style={{ color: COPPER }} />
        <p className="font-serif text-xl mb-2" style={{ color: NAVY }}>Something went wrong.</p>
        <p className="text-sm" style={{ color: 'rgba(30,58,90,0.6)' }}>{error}</p>
      </div>
    );
  }

  if (submissions === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: NAVY }} />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <Inbox className="w-10 h-10 mb-4" style={{ color: GOLD }} />
        <p className="font-serif text-xl mb-2" style={{ color: NAVY }}>No Top Viral Posts yet.</p>
        <p className="text-sm max-w-md" style={{ color: 'rgba(30,58,90,0.6)' }}>
          When a Fellow completes the “Top Viral Post” sitting in The Studio, their submission appears here as a read-only record.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" style={{ color: COPPER }} />
          <span className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: COPPER }}>
            Special Editorial
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2" style={{ color: NAVY }}>
          Top Viral Posts
        </h1>
        <p className="text-sm max-w-2xl" style={{ color: 'rgba(30,58,90,0.65)' }}>
          Every Fellow’s “Most Liked Post” submission, kept as a self-serve record — no moderation queue, no approval gate. Use <span style={{ color: COPPER }}>Feature publicly</span> to surface a post on its Fellow’s public profile deck. {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'} on record.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {submissions.map((u) => (
          <SubmissionCard
            key={u.id}
            user={u}
            featuringId={featuringId}
            onToggleFeature={handleToggleFeature}
          />
        ))}
      </div>
    </div>
  );
}