import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { careerCopilot } from '@/functions/careerCopilot';
import { saveProfileSettings } from '@/functions/saveProfileSettings';
import { B, accentValue, accentForDiscipline } from '@/components/fellow-home/fellowHomeConfig';
import GoalPicker from '@/components/profile-copilot/GoalPicker';
import ProposalReview from '@/components/profile-copilot/ProposalReview';
import PitchLibrary from '@/components/profile-copilot/PitchLibrary';

// The Career Copilot. It reads one Fellow's own record, composes a pitch for the
// goal they choose, and shows its evidence. It writes nothing until the Fellow
// approves: no profile change, no share, no message.
export default function CareerCopilot() {
  const [me, setMe] = useState(null);
  const [settings, setSettings] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [goal, setGoal] = useState(null);
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState('');
  const [proposal, setProposal] = useState(null);

  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');
  const [notice, setNotice] = useState('');

  // Internal surface: never indexed, never crawled.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const current = await base44.auth.me().catch(() => null);
        if (!current) {
          base44.auth.redirectToLogin(window.location.href);
          return;
        }
        if (!live) return;
        setMe(current);

        const [settingsRows, pitchPage, nomineeRows] = await Promise.all([
          base44.entities.FellowProfileSettings.filter({ fellow_email: current.email }).catch(() => []),
          base44.entities.CareerPitch
            .filter({ fellow_email: current.email, status: 'approved' }, { sort: '-approved_at', limit: 12 })
            .catch(() => ({ items: [] })),
          base44.entities.Nominee.filter({ nominee_email: current.email }).catch(() => []),
        ]);
        if (!live) return;
        setSettings((settingsRows || [])[0] || null);
        setPitches(pitchPage?.items || pitchPage || []);
        setNominee((nomineeRows || [])[0] || null);
      } catch {
        if (live) setLoadError('We could not open your record just now.');
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  const accent = accentValue(settings?.domain_accent || accentForDiscipline(nominee?.discipline));
  const publicUrl = nominee?.id
    ? `${window.location.origin}/profiles/${nominee.id}`
    : me?.email
      ? `${window.location.origin}/ProfileView?user=${encodeURIComponent(me.email)}`
      : '';

  const compose = async () => {
    if (!goal) return;
    setComposing(true);
    setComposeError('');
    setNotice('');
    try {
      const res = await careerCopilot({ goal });
      const data = res?.data ?? res;
      if (!data?.proposal) throw new Error(data?.error || 'No proposal returned');
      setProposal({ ...data.proposal, stagedAt: Date.now() });
    } catch (error) {
      setComposeError(
        error?.response?.data?.error || 'The Copilot could not compose a pitch from your record. Try again.'
      );
    } finally {
      setComposing(false);
    }
  };

  const approve = async ({ headline, pitch, slides }) => {
    setApproving(true);
    setApproveError('');
    try {
      // The slide order goes through the server validator, not the browser.
      const saved = await saveProfileSettings({ slide_order: ['identity', 'verification', ...slides] });
      if (saved?.data?.settings) setSettings(saved.data.settings);

      const record = await base44.entities.CareerPitch.create({
        fellow_email: me.email,
        fellow_id: nominee?.id,
        goal: proposal.goal,
        headline,
        pitch,
        verified_points: proposal.verified_points || [],
        expression_points: proposal.expression_points || [],
        gaps: proposal.gaps || [],
        recommended_slides: slides,
        availability_note: proposal.availability_note || '',
        resources: proposal.resources || [],
        status: 'approved',
        approved_at: new Date().toISOString(),
      });
      setPitches((list) => [record, ...list]);
      setProposal(null);
      setGoal(null);
      setNotice('Approved. Your presentation now opens in that order.');
    } catch (error) {
      setApproveError(error?.response?.data?.error || 'That approval did not complete. Try again.');
    } finally {
      setApproving(false);
    }
  };

  const recordShare = async (pitch) => {
    try {
      const updated = await base44.entities.CareerPitch.update(pitch.id, {
        shared_at: new Date().toISOString(),
      });
      setPitches((list) => list.map((p) => (p.id === pitch.id ? updated : p)));
    } catch {
      /* The share already happened; the timestamp is a courtesy, not the point. */
    }
  };

  const archive = async (pitch) => {
    try {
      await base44.entities.CareerPitch.update(pitch.id, { status: 'archived' });
      setPitches((list) => list.filter((p) => p.id !== pitch.id));
    } catch {
      setNotice('That presentation could not be archived.');
    }
  };

  return (
    <div className="min-h-screen sf-pro" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8 py-8 sm:py-12">
        <Link
          to="/Profile"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] hover:opacity-70"
          style={{ color: B.muted }}
        >
          <ArrowLeft className="w-3 h-3" /> Back to my profile
        </Link>

        <header className="mt-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: B.copper }}>
            Career Copilot
          </p>
          <h1
            className="text-3xl sm:text-4xl font-bold leading-[1.05]"
            style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            One record. A pitch built for the room.
          </h1>
          <div className="h-px w-20 mt-5 mb-4" style={{ background: B.gold }} />
          <p className="text-[13px] leading-relaxed max-w-xl" style={{ color: B.muted }}>
            The Copilot works only from what your record already says, and shows you which part is verified and which
            part is yours. You edit it, you approve it, and only then does it reach your profile.
          </p>
        </header>

        {loading ? (
          <div className="mt-10 space-y-3" aria-label="Loading your record">
            <div className="h-24 rounded-2xl animate-pulse" style={{ background: `${B.navy}0d` }} />
            <div className="h-24 rounded-2xl animate-pulse" style={{ background: `${B.navy}0d` }} />
          </div>
        ) : loadError ? (
          <div className="mt-10 rounded-2xl px-5 py-8 text-center" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <p className="text-sm" style={{ color: B.navy }}>{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] px-4 py-2.5 rounded-full"
              style={{ background: B.copper, color: '#fff' }}
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mt-10 space-y-9">
            {notice && (
              <p className="text-[12px] rounded-xl px-4 py-3" style={{ background: '#fff', border: `1px solid ${accent}55`, color: B.navy }}>
                {notice}
              </p>
            )}

            {!proposal && (
              <section>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: B.muted }}>
                  Choose what you are preparing for
                </p>
                <GoalPicker value={goal} onChange={setGoal} disabled={composing} />

                <div className="flex items-center gap-3 flex-wrap mt-5">
                  <button
                    type="button"
                    onClick={compose}
                    disabled={!goal || composing}
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] px-5 py-3 rounded-full transition-opacity hover:opacity-90 disabled:opacity-45"
                    style={{ background: B.copper, color: '#fff' }}
                  >
                    {composing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {composing ? 'Reading your record' : 'Compose my pitch'}
                  </button>
                  {!goal && (
                    <p className="text-[10px]" style={{ color: B.muted }}>Pick a goal first.</p>
                  )}
                </div>

                {composeError && (
                  <p className="text-[12px] rounded-xl px-4 py-3 mt-4" style={{ background: '#fff', border: `1px solid ${B.copper}55`, color: B.copper }}>
                    {composeError}
                  </p>
                )}
              </section>
            )}

            {proposal && (
              <ProposalReview
                key={proposal.stagedAt}
                proposal={proposal}
                accent={accent}
                approving={approving}
                error={approveError}
                onApprove={approve}
                onDiscard={() => { setProposal(null); setApproveError(''); }}
              />
            )}

            {!proposal && pitches.length === 0 && (
              <div className="rounded-2xl px-5 py-8 text-center" style={{ border: `1px dashed ${B.border}`, background: '#fff' }}>
                <p className="text-sm font-semibold" style={{ color: B.navy }}>Nothing composed yet.</p>
                <p className="text-[12px] mt-1.5 leading-relaxed" style={{ color: B.muted }}>
                  Choose a goal above. The Copilot will read your credential, your record and your availability, then
                  show you what it would say and why.
                </p>
              </div>
            )}

            <PitchLibrary
              pitches={pitches}
              accent={accent}
              publicUrl={publicUrl}
              onShare={recordShare}
              onRemove={archive}
            />

            <p className="text-[10px] leading-relaxed pt-2" style={{ color: B.muted }}>
              The Copilot never invents a credential and never measures you. It carries no weight in measurement,
              directory position or selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}