import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { syncLocalLegendToGhl } from '@/functions/syncLocalLegendToGhl';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };
const SURVEY_ID = '69f268344d7b4a8cc0888abf';

function Slide({ children, direction }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function ChoiceQuestion({ question, value, onChange, onAutoAdvance }) {
  const opts = question.options || [];
  return (
    <div className="space-y-2.5">
      {opts.map((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const selected = value === opt;
        return (
          <button
            key={i}
            onClick={() => { onChange(opt); onAutoAdvance(); }}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              selected
                ? 'border-[#c9a87c] bg-[#c9a87c]/8 shadow-sm'
                : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25 bg-white/60'
            }`}
          >
            <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              selected ? 'bg-[#c9a87c] text-white' : 'bg-[#1e3a5a]/5 text-[#1e3a5a]/60'
            }`}>{letter}</span>
            <span className="text-[15px] text-[#1e3a5a] leading-snug pt-0.5">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function TextInput({ question, value, onChange }) {
  const ref = useRef(null);
  const isLong = question.type === 'textarea';
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);

  return isLong ? (
    <Textarea
      ref={ref}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Type your answer here…"
      rows={4}
      className="text-lg border-0 border-b-2 border-[#1e3a5a]/15 rounded-none bg-transparent focus:border-[#c9a87c] focus-visible:ring-0 resize-none px-0"
    />
  ) : (
    <Input
      ref={ref}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Type your answer here…"
      className="text-lg border-0 border-b-2 border-[#1e3a5a]/15 rounded-none bg-transparent focus:border-[#c9a87c] focus-visible:ring-0 px-0 h-12"
    />
  );
}

const HELP_TEXT = {
  biz_name: 'Your business name as it appears publicly',
  your_name: 'First and last',
  your_role: 'Owner, Manager, etc.',
  phone: 'Optional. Faster if you want a quick call.',
  website_or_ig: 'So we can do our homework before we reach out',
  one_sentence: 'We use this to introduce you to the community',
  anything_else: 'Optional',
};

export default function LocalLegendsApply() {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0 = welcome, 1+ = questions
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({});
  const answersRef = useRef({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const containerRef = useRef(null);

  const questions = survey?.questions || [];
  const totalSteps = questions.length + 1; // welcome + questions
  const currentQuestion = step >= 1 ? questions[step - 1] : null;

  useEffect(() => {
    base44.entities.Survey.filter({ id: SURVEY_ID })
      .then(r => { if (r[0]) setSurvey(r[0]); })
      .finally(() => setLoading(false));
  }, []);

  const setAnswer = (qId, val) => {
    setAnswers(prev => {
      const next = { ...prev, [qId]: val };
      answersRef.current = next;
      return next;
    });
  };

  const validate = (s) => {
    if (s < 1) return true;
    const q = questions[s - 1];
    const val = answersRef.current[q?.id];
    if (q?.required && (!val || (typeof val === 'string' && !val.trim()))) {
      toast({ title: 'This question is required', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validate(step)) return;
    if (step >= totalSteps) return;
    setDirection(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step <= 0) return;
    setDirection(-1);
    setStep(s => s - 1);
  };

  const autoAdvance = () => {
    setTimeout(() => {
      if (step < totalSteps - 1) {
        setDirection(1);
        setStep(s => s + 1);
      }
    }, 350);
  };

  const handleSubmit = async () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const val = answersRef.current[q.id];
      if (q.required && (!val || (typeof val === 'string' && !val.trim()))) {
        toast({ title: `Please answer: ${q.label}`, variant: 'destructive' });
        setDirection(1);
        setStep(i + 1);
        return;
      }
    }
    setSubmitting(true);

    // Get email from answers for respondent_email
    const email = answersRef.current['email'] || 'anonymous@locallegends.app';
    const name = answersRef.current['your_name'] || '';

    const submission = await base44.entities.SurveyResponse.create({
      survey_id: SURVEY_ID,
      respondent_email: email,
      respondent_name: name,
      answers: answersRef.current,
      completed: true,
    });

    await syncLocalLegendToGhl({
      surveyResponseId: submission.id,
      answers: answersRef.current,
    });

    await base44.entities.Survey.update(SURVEY_ID, {
      response_count: (survey.response_count || 0) + 1,
    });

    setSubmitted(true);
    setSubmitting(false);
  };

  const handleKeyDown = (e) => {
    const tag = e.target.tagName;
    const isText = tag === 'INPUT' || tag === 'TEXTAREA';
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSubmit(); return; }
    if (isText && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); goNext(); return; }
    if (!isText && e.key === 'Enter') { e.preventDefault(); goNext(); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brand.cream }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand.gold }} />
      </div>
    );
  }

  /* ── Thank You ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: `${brand.gold}20` }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: brand.gold }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Application Received!
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-8">
            We review every application personally. If you're a fit, you'll hear from us within <strong className="text-white/80">3 business days</strong>. The spotlight is free. No strings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="https://calendar.app.google/JVH1VgC5abQPy5NK7" target="_blank" rel="noopener noreferrer">
              <Button className="rounded-full px-8 text-white gap-2" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}>
                Schedule a Call <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Link to="/local-legends">
              <Button variant="outline" className="rounded-full px-8 text-white/80 border-white/20 hover:bg-white/10 hover:text-white gap-2">
                Back to Local Legends
              </Button>
            </Link>
          </div>
          <p className="text-white/15 text-[10px] tracking-widest uppercase mt-12">
            Local Legends • A TOP 100 Aerospace & Aviation Initiative
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── Application Form ── */
  const progress = totalSteps > 1 ? (step / totalSteps) * 100 : 0;
  const isLastStep = step === totalSteps;

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col outline-none"
      style={{ background: `linear-gradient(180deg, ${brand.cream}, #f0ebe4)` }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Progress bar */}
      <div className="h-1 bg-[#1e3a5a]/5 shrink-0">
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${brand.navy}, ${brand.gold})` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" initial={false}>

            {/* Welcome */}
            {step === 0 && (
              <Slide key="welcome" direction={direction}>
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30` }}>
                    <MapPin className="w-3 h-3" />
                    Local Legends
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
                    Apply for Your Free{' '}
                    <span style={{ color: brand.gold }}>Spotlight</span>
                  </h1>
                  <p className="text-lg leading-relaxed" style={{ color: `${brand.navy}99` }}>
                    Tell us about your business. We'll take it from here.
                  </p>
                  <div className="flex items-center gap-3 text-sm" style={{ color: `${brand.navy}60` }}>
                    <span>{questions.length} questions</span>
                    <span>·</span>
                    <span>~2 min</span>
                  </div>
                  <Button
                    onClick={goNext}
                    className="gap-2 rounded-full px-8 py-6 text-base text-white cursor-pointer"
                    style={{ background: brand.navy }}
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Slide>
            )}

            {/* Questions */}
            {step >= 1 && step <= questions.length && currentQuestion && (
              <Slide key={currentQuestion.id} direction={direction}>
                <div className="space-y-5">
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: brand.gold }}>
                    {step} of {questions.length}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
                    {currentQuestion.label}
                    {currentQuestion.required && <span style={{ color: brand.gold }}> *</span>}
                  </h2>
                  {HELP_TEXT[currentQuestion.id] && (
                    <p className="text-sm" style={{ color: `${brand.navy}60` }}>{HELP_TEXT[currentQuestion.id]}</p>
                  )}

                  {currentQuestion.type === 'single_choice' && (
                    <ChoiceQuestion question={currentQuestion} value={answers[currentQuestion.id]} onChange={val => setAnswer(currentQuestion.id, val)} onAutoAdvance={autoAdvance} />
                  )}
                  {(currentQuestion.type === 'text' || currentQuestion.type === 'textarea') && (
                    <TextInput question={currentQuestion} value={answers[currentQuestion.id]} onChange={val => setAnswer(currentQuestion.id, val)} />
                  )}
                </div>
              </Slide>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      {step > 0 && (
        <div className="shrink-0 border-t bg-white/60 backdrop-blur-sm px-6 py-4" style={{ borderColor: `${brand.navy}10` }}>
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} className="gap-2 cursor-pointer" style={{ color: `${brand.navy}80` }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: `${brand.navy}40` }}>{step} / {questions.length}</span>
              {step > questions.length - 1 && step === questions.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="gap-2 rounded-full px-6 font-bold cursor-pointer text-white"
                  style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Apply for My Spotlight <Sparkles className="w-4 h-4" /></>}
                </Button>
              ) : (
                <Button onClick={goNext} className="gap-2 rounded-full px-6 cursor-pointer text-white" style={{ background: brand.navy }}>
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Fine print on last step */}
          {step === questions.length && (
            <p className="text-center text-[10px] mt-3 max-w-lg mx-auto leading-relaxed" style={{ color: `${brand.navy}40` }}>
              Local Legends is a TOP 100 Aerospace & Aviation initiative. By submitting this form you agree to be contacted by our team regarding your spotlight feature.
            </p>
          )}
        </div>
      )}
    </div>
  );
}