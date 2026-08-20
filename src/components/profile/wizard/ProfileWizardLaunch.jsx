import { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import ProfileWizard from './ProfileWizard';

const B = { navy: '#1e3a5a', gold: '#c9a87c', sand: '#f5f0e8', muted: '#5d7a94', border: '#e8e0d4' };

const REQUIRED = ['avatar_url', 'industry_role', 'one_word', 'six_word_story'];

export default function ProfileWizardLaunch({ user, nominee, onSaved }) {
  const [open, setOpen] = useState(false);

  const filled = REQUIRED.filter((f) => {
    const v = user?.[f];
    return typeof v === 'boolean' ? v === true : v && String(v).trim();
  }).length;
  const complete = filled === REQUIRED.length;

  return (
    <>
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-6"
        style={{ background: B.navy }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 88% 0%, ${B.gold}2e, transparent 58%)` }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: B.gold }}>
              {complete ? 'Your Record' : 'Update Your Profile'}
            </p>
            <h2
              className="text-xl sm:text-2xl font-bold mb-1.5 text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {complete ? 'Revisit your guided profile' : 'Update your profile, guided'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.68)' }}>
              {complete
                ? 'Your headshot, one word, and six word story are on file. Step back through any answer.'
                : 'A short guided walk through everything we need, including your headshot, your one word, and your six word story.'}
            </p>

            {/* One word / six word preview once set */}
            {complete && (user?.avatar_url || user?.one_word || user?.six_word_story) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                {user?.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ border: `1px solid ${B.gold}` }}
                  />
                )}
                {user?.one_word && (
                  <span
                    className="text-sm uppercase tracking-[0.14em]"
                    style={{ color: B.gold, fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {user.one_word}
                  </span>
                )}
                {user?.six_word_story && (
                  <span className="text-xs italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    &ldquo;{user.six_word_story}&rdquo;
                  </span>
                )}
              </div>
            )}

            {!complete && (
              <div className="flex items-center gap-2 mt-3">
                <div className="h-1 rounded-full flex-1 max-w-[160px]" style={{ background: 'rgba(255,255,255,0.16)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(filled / REQUIRED.length) * 100}%`, background: B.gold }}
                  />
                </div>
                <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {filled} of {REQUIRED.length} essentials
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.03] flex-shrink-0 w-full sm:w-auto"
            style={{ background: B.gold, color: B.navy }}
          >
            {complete ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {complete ? 'Review my answers' : 'Update profile'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <ProfileWizard
          user={user}
          nominee={nominee}
          onClose={() => setOpen(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}