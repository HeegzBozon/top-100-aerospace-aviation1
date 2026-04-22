import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import {
  X, Loader2, ChevronRight, ChevronLeft, Sparkles, BookOpen,
  Compass, Trophy, Target, Layers, Feather, Rocket, CheckCircle2, Save, Send
} from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const STEPS = [
  {
    id: 'welcome',
    icon: BookOpen,
    title: 'Let\'s write your story together',
    subtitle: 'I\'m your personal biographer. Think of this as a warm conversation — not a form. Your story matters, and I\'m here to help you tell it beautifully.',
    prompt: null,
  },
  {
    id: 'concept',
    icon: Compass,
    title: 'The Why',
    subtitle: 'Every great story starts with a reason. What made you fall in love with aerospace & aviation? Was it a moment, a person, a dream?',
    prompt: 'Tell me about that spark — the moment you knew this was your world…',
    tip: 'Don\'t overthink it. Your first memory is usually the most powerful.',
  },
  {
    id: 'explore',
    icon: Rocket,
    title: 'The Journey',
    subtitle: 'Stories help us navigate the unknown. Walk me through the path you\'ve taken — the pivots, the breakthroughs, the surprises.',
    prompt: 'What has your journey looked like? The twists, the wins, the unexpected turns…',
    tip: 'The messy parts are often the most interesting. Don\'t skip them.',
  },
  {
    id: 'character',
    icon: Trophy,
    title: 'Your Role',
    subtitle: 'In every story, the character is what makes us care. What do you bring to the table that nobody else does?',
    prompt: 'What\'s your superpower? What do people come to you for?',
    tip: 'Think about what colleagues or mentors have said about you.',
  },
  {
    id: 'function',
    icon: Target,
    title: 'The Impact',
    subtitle: 'Stories are more effective than facts alone. What change are you making in the world? What problems are you solving?',
    prompt: 'What impact does your work have? Who benefits from what you do?',
    tip: 'Be specific — one real example beats ten vague claims.',
  },
  {
    id: 'structure',
    icon: Layers,
    title: 'What\'s Next',
    subtitle: 'The best stories have momentum. Where are you headed? What\'s the next chapter you\'re writing?',
    prompt: 'What are you working toward? What excites you about the future?',
    tip: 'Dream big here. This is your story — own the ending.',
  },
  {
    id: 'style',
    icon: Feather,
    title: 'Your Voice',
    subtitle: 'Last question — how do you want to sound? This helps me write in YOUR voice, not a generic corporate tone.',
    prompt: 'Pick a few words that describe your vibe: bold, warm, technical, visionary, approachable, witty…',
    tip: 'There\'s no wrong answer. Be you.',
  },
];

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-500"
          style={{
            width: i === current ? 24 : 8,
            background: i <= current ? brand.gold : `${brand.navy}15`,
          }}
        />
      ))}
    </div>
  );
}

export default function StoryBuilderModal({ open, onClose, onBioGenerated, userName }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Restore saved progress when modal opens
  useEffect(() => {
    if (!open || loaded) return;
    (async () => {
      const me = await base44.auth.me();
      const draft = me?.story_builder_draft;
      if (draft?.answers && Object.keys(draft.answers).length > 0) {
        setAnswers(draft.answers);
        setStep(draft.step || 0);
      }
      setLoaded(true);
    })();
  }, [open, loaded]);

  // Reset loaded flag when modal closes so it reloads next time
  useEffect(() => {
    if (!open) setLoaded(false);
  }, [open]);

  const saveDraft = async () => {
    setSavingDraft(true);
    await base44.auth.updateMe({ story_builder_draft: { answers, step } });
    setSavingDraft(false);
  };

  const clearDraft = async () => {
    await base44.auth.updateMe({ story_builder_draft: null });
  };

  if (!open) return null;

  const currentStep = STEPS[step];
  const isWelcome = step === 0;
  const isLast = step === STEPS.length - 1;
  const canAdvance = isWelcome || (answers[currentStep.id] && answers[currentStep.id].trim().length > 10);
  const answeredCount = STEPS.filter(s => s.prompt && answers[s.id]?.trim().length > 0).length;
  const totalPrompts = STEPS.filter(s => s.prompt).length;
  const hasSavedProgress = answeredCount > 0;

  const handleSubmit = async () => {
    setGenerating(true);
    try {
      const me = await base44.auth.me();
      // Create bio submission record
      await base44.entities.BioSubmission.create({
        user_email: me.email,
        user_name: userName || me.full_name || me.email,
        answers,
        status: 'submitted',
      });
      // Clear draft
      await clearDraft();
      setDone(true);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDismiss = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
    onClose();
  };

  const handleSaveAndExit = async () => {
    await saveDraft();
    onClose();
  };

  const handleDiscard = () => {
    clearDraft();
    setStep(0);
    setAnswers({});
    setDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={handleSaveAndExit}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: brand.gold }} />
          <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" style={{ color: brand.gold }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: brand.gold }}>Your Personal Biographer</span>
            </div>
            <button onClick={handleSaveAndExit} className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors" title="Save & close">
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
          {!done && <StepIndicator current={step} total={STEPS.length} />}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center py-4">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: `${brand.gold}15` }}>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
                    Your story has been submitted!
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Our editorial team will review your answers and craft a polished, publication-ready biography just for you.
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 mx-auto max-w-sm">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-800 text-left leading-relaxed">
                    <strong>Expect a notification within 48 hours</strong> when your biography is ready. We'll email you!
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brand.gold}15` }}>
                    <currentStep.icon className="w-5 h-5" style={{ color: brand.gold }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
                      {currentStep.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-1">{currentStep.subtitle}</p>
                    {isWelcome && hasSavedProgress && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 bg-green-50">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-xs text-green-700">
                          You have saved progress ({answeredCount}/{totalPrompts} questions answered). Pick up where you left off!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {currentStep.prompt && (
                  <div className="space-y-2">
                    <Textarea
                      value={answers[currentStep.id] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [currentStep.id]: e.target.value }))}
                      placeholder={currentStep.prompt}
                      className="min-h-[120px] text-sm border-slate-200 rounded-xl resize-none focus:border-slate-400 transition-colors leading-relaxed"
                      autoFocus
                    />
                    {currentStep.tip && (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-amber-700">{currentStep.tip}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {done ? (
            <>
              <div />
              <Button onClick={handleDismiss} size="sm" className="gap-2 rounded-full px-5 text-white font-semibold" style={{ background: brand.navy }}>
                <CheckCircle2 className="w-4 h-4" /> Done
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="text-xs text-slate-500 gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                {!isWelcome && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveAndExit}
                    disabled={savingDraft}
                    className="text-xs gap-1"
                    style={{ color: brand.gold }}
                  >
                    {savingDraft ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save & Exit
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isWelcome && !isLast && (
                  <button onClick={() => setStep(step + 1)} className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                    Skip
                  </button>
                )}
                {isLast ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={generating}
                    size="sm"
                    className="gap-2 rounded-full px-5 text-white font-semibold"
                    style={{ background: `linear-gradient(135deg, ${brand.navy}, #2a5080)` }}
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {generating ? 'Submitting…' : 'Submit My Story'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canAdvance && !isWelcome}
                    size="sm"
                    className="gap-1 rounded-full px-5 text-white font-semibold"
                    style={{ background: brand.navy }}
                  >
                    {isWelcome ? 'Let\'s Begin' : 'Next'} <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}