import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { profileWizardSteps } from './profileWizardSteps';
import WizardField, { WIZARD_COLORS as B } from './WizardField';
import WizardReview from './WizardReview';
import SittingSelect from './SittingSelect';
import SittingOverture from './SittingOverture';
import { getSitting } from './sittings';

const FIELDS = ['avatar_url', 'publish_consent', 'industry_role', 'headline', 'location', 'one_word', 'six_word_story', 'bio', 'expertise_tags', 'linkedin_url', 'website_url'];

export default function ProfileWizard({ user, nominee, onClose, onSaved }) {
  // phase: lobby → overture → steps → review
  const [phase, setPhase] = useState('lobby');
  const [queue, setQueue] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState('forward');
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  const [form, setForm] = useState(() => {
    const seed = {};
    FIELDS.forEach((f) => { if (user?.[f] !== undefined && user?.[f] !== null) seed[f] = user[f]; });
    if (!seed.six_word_story && nominee?.six_word_story) seed.six_word_story = nominee.six_word_story;
    if (!seed.bio && nominee?.bio) seed.bio = nominee.bio;
    if (!seed.industry_role && nominee?.title) seed.industry_role = nominee.title;
    if (!seed.avatar_url && nominee?.avatar_url) seed.avatar_url = nominee.avatar_url;
    return seed;
  });

  const sitting = getSitting(queue[qIdx]);
  const sittingSteps = useMemo(
    () => profileWizardSteps.filter((s) => s.sitting === queue[qIdx]),
    [queue, qIdx]
  );
  const visibleSteps = useMemo(
    () => profileWizardSteps.filter((s) => queue.includes(s.sitting)),
    [queue]
  );

  const step = sittingSteps[stepIdx];
  const isLastInSitting = stepIdx === sittingSteps.length - 1;
  const isLastSitting = qIdx === queue.length - 1;

  const answeredBefore = useMemo(
    () => visibleSteps.findIndex((s) => s.key === step?.key),
    [visibleSteps, step]
  );
  const progress = phase === 'review'
    ? 100
    : Math.round(((Math.max(answeredBefore, 0) + 1) / (visibleSteps.length + 1)) * 100);

  const rawVal = step ? form[step.key] : null;
  const isEmpty = step?.type === 'consent'
    ? rawVal === undefined || rawVal === null
    : step?.type === 'tags'
      ? !Array.isArray(rawVal) || rawVal.length === 0
      : !rawVal || String(rawVal).trim() === '';

  useEffect(() => { setShowHelp(false); setError(null); }, [stepIdx, qIdx, phase]);

  useEffect(() => {
    if (phase !== 'steps') return;
    if (step?.type === 'consent' || step?.type === 'headshot') return;
    const t = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(t);
  }, [stepIdx, step?.type, phase]);

  const beginSittings = (ids) => {
    setQueue(ids);
    setQIdx(0);
    setStepIdx(0);
    setDir('forward');
    setPhase('overture');
  };

  const validate = (f = form) => {
    if (step?.required && (step.type === 'consent' ? (f[step.key] === undefined || f[step.key] === null) : !f[step.key] || !String(f[step.key]).trim())) {
      return 'This one is required.';
    }
    if (step?.validate) return step.validate(f);
    return null;
  };

  const goForward = () => {
    if (!isLastInSitting) { setDir('forward'); setStepIdx((i) => i + 1); return; }
    if (!isLastSitting) { setDir('forward'); setQIdx((i) => i + 1); setStepIdx(0); setPhase('overture'); return; }
    setPhase('review');
  };

  const advance = (f = form) => {
    const err = validate(f);
    if (err) { setError(err); return; }
    setError(null);
    goForward();
  };

  const goBack = () => {
    if (phase === 'review') { setPhase('steps'); return; }
    if (phase === 'overture') {
      if (qIdx > 0) {
        const prev = profileWizardSteps.filter((s) => s.sitting === queue[qIdx - 1]);
        setQIdx((i) => i - 1);
        setStepIdx(Math.max(prev.length - 1, 0));
        setDir('backward');
        setPhase('steps');
      } else {
        setPhase('lobby');
      }
      return;
    }
    if (stepIdx > 0) { setDir('backward'); setError(null); setStepIdx((i) => i - 1); return; }
    setPhase('overture');
  };

  // Consent taps commit their value and move on in one gesture
  const commitAndAdvance = (nextForm) => {
    setForm(nextForm);
    const err = step?.validate ? step.validate(nextForm) : null;
    if (err) { setError(err); return; }
    setTimeout(goForward, 220);
  };

  const jumpToStep = (key) => {
    const target = profileWizardSteps.find((s) => s.key === key);
    if (!target) return;
    const qi = queue.indexOf(target.sitting);
    const si = profileWizardSteps.filter((s) => s.sitting === target.sitting).findIndex((s) => s.key === key);
    setQIdx(Math.max(qi, 0));
    setStepIdx(Math.max(si, 0));
    setDir('backward');
    setPhase('steps');
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ ...form, profile_wizard_completed: true });

      // Mirror the editorial answers onto the nominee record so public profiles match
      if (nominee?.id) {
        await base44.entities.Nominee.update(nominee.id, {
          six_word_story: form.six_word_story,
          bio: form.bio,
          avatar_url: form.avatar_url,
        }).catch(() => {});
      }

      setDone(true);
      const colors = [B.navy, B.gold, B.cream, B.copper, B.rose];
      confetti({ particleCount: 90, spread: 72, origin: { y: 0.6 }, colors, scalar: 0.95 });
      setTimeout(() => confetti({ particleCount: 45, angle: 60, spread: 55, origin: { x: 0 }, colors }), 200);
      setTimeout(() => confetti({ particleCount: 45, angle: 120, spread: 55, origin: { x: 1 }, colors }), 380);
      setTimeout(() => { onSaved?.(); onClose(); }, 1800);
    } catch (e) {
      setError(e?.message || 'Could not save. Please try again.');
      setSaving(false);
    }
  };

  // ── Keyboard navigation ──
  useEffect(() => {
    const handler = (e) => {
      if (done || saving) return;
      const tag = document.activeElement?.tagName;

      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }

      if (phase === 'lobby') return;

      if (phase === 'overture') {
        if (e.key === 'Enter') { e.preventDefault(); setPhase('steps'); }
        return;
      }

      if (phase === 'review') {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
        if (e.key === 'Backspace' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); setPhase('steps'); }
        return;
      }

      if (step?.type === 'consent') {
        if (e.key === '1') { e.preventDefault(); commitAndAdvance({ ...form, [step.key]: true }); return; }
        if (e.key === '2') { e.preventDefault(); commitAndAdvance({ ...form, [step.key]: false }); return; }
      }
      // Tags own the Enter key for adding chips
      if (step?.type === 'tags' && tag === 'INPUT') return;

      if (e.key === 'Enter' && !e.shiftKey && tag !== 'TEXTAREA') { e.preventDefault(); advance(); return; }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && tag === 'TEXTAREA') { e.preventDefault(); advance(); return; }
      if (e.key === 'Backspace' && tag === 'INPUT' && document.activeElement.value === '') { e.preventDefault(); goBack(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stepIdx, qIdx, queue, form, step, phase, done, saving]);

  const hint = step?.type === 'consent' ? 'Press 1 or 2'
    : step?.type === 'headshot' ? '↵ to continue'
      : step?.type === 'tags' ? '↵ adds · Next to continue'
      : step?.type === 'textarea' || step?.type === 'sixword' ? '⌘ + ↵ to continue'
        : '↵ to continue';

  const nextLabel = !isLastInSitting ? 'Next' : isLastSitting ? 'Final look' : 'Next sitting';

  const chromeLabel = phase === 'lobby' ? 'The Studio'
    : phase === 'review' ? 'Final Look'
      : `${sitting?.chapter} · ${sitting?.name}`;

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !saving && !done) onClose(); }}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden max-w-xl max-h-[88vh] flex flex-col"
        style={{ background: B.cream, borderRadius: '1.25rem' }}
        onInteractOutside={(e) => { if (saving || done) e.preventDefault(); }}
      >
        <style>{`
          @keyframes pw-fwd { from { opacity:0; transform: translateX(26px) } to { opacity:1; transform:none } }
          @keyframes pw-bwd { from { opacity:0; transform: translateX(-26px) } to { opacity:1; transform:none } }
          @keyframes pw-rise { from { opacity:0; transform: translateY(14px) } to { opacity:1; transform:none } }
        `}</style>

        {/* Chrome */}
        <div className="flex items-center justify-between px-6 py-4 pr-12 flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] truncate" style={{ color: B.gold }}>
            {chromeLabel}
          </span>
          {phase === 'steps' && (
            <span className="text-[11px] font-medium tabular-nums flex-shrink-0" style={{ color: B.muted }}>
              {stepIdx + 1} / {sittingSteps.length}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {phase === 'lobby' && <SittingSelect form={form} onBegin={beginSittings} />}

          {phase === 'overture' && sitting && (
            <SittingOverture
              sitting={sitting}
              onEnter={() => { setDir('forward'); setPhase('steps'); }}
              onBack={goBack}
            />
          )}

          {phase === 'review' && (
            <WizardReview
              steps={visibleSteps}
              form={form}
              saving={saving}
              onBack={() => setPhase('steps')}
              onEdit={(i) => jumpToStep(visibleSteps[i]?.key)}
              onSubmit={handleSubmit}
            />
          )}

          {phase === 'steps' && step && (
            <>
              <div key={`${qIdx}-${stepIdx}`} style={{ animation: `${dir === 'forward' ? 'pw-fwd' : 'pw-bwd'} 0.32s ease-out` }}>
                <div className="flex items-start gap-2 mb-1.5">
                  <h2
                    className="text-2xl sm:text-[28px] font-bold leading-tight"
                    style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {step.question}
                  </h2>
                  {step.help && (
                    <button
                      onClick={() => setShowHelp((s) => !s)}
                      className="mt-2 flex-shrink-0 p-1 rounded-full transition-colors hover:bg-black/5"
                      style={{ color: showHelp ? B.copper : B.muted }}
                      aria-label="Writing guidance"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {step.subtitle && <p className="text-sm mb-5" style={{ color: B.muted }}>{step.subtitle}</p>}
                {step.help && showHelp && (
                  <div className="text-xs leading-relaxed mb-4 p-3.5 rounded-lg border" style={{ background: B.sand, borderColor: B.border, color: B.navy }}>
                    {step.help}
                  </div>
                )}

                <div className="mt-4">
                  <WizardField
                    ref={inputRef}
                    step={step}
                    form={form}
                    setForm={setForm}
                    onCommit={commitAndAdvance}
                    clearError={() => setError(null)}
                    onError={setError}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs mt-4 p-2.5 rounded-lg" style={{ background: B.rose + '14', color: B.rose }}>
                    <span>⚠</span> {error}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-7 mb-4">
                <button onClick={goBack} className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: B.muted }}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-xs hidden sm:block" style={{ color: B.muted }}>{hint}</span>
                  <Button
                    onClick={() => advance()}
                    disabled={step.required && isEmpty}
                    className="flex items-center gap-1.5"
                    style={{ background: B.navy, color: '#fff' }}
                  >
                    {nextLabel}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Progress */}
        <div className="h-1.5 w-full flex-shrink-0" style={{ background: B.sand }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${phase === 'lobby' ? 0 : progress}%`, background: `linear-gradient(90deg, ${B.navy}, ${B.gold})` }}
          />
        </div>

        {/* Completion */}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ background: 'rgba(250,248,245,0.95)', borderRadius: '1.25rem' }}>
            <div className="text-center px-8" style={{ animation: 'pw-rise 0.45s ease-out' }}>
              <div className="text-5xl mb-3">✦</div>
              <p className="text-2xl font-bold mb-2" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                You are on the record.
              </p>
              <p className="text-sm italic mb-3" style={{ color: B.muted }}>
                {getSitting(queue[queue.length - 1])?.wrap}
              </p>
              {form.one_word && (
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: B.gold }}>{form.one_word}</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}