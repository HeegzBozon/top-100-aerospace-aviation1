import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Loader2, AlertCircle, Rocket, ArrowRight, ArrowLeft,
  ChevronDown, Home, Calendar, TrendingUp, ExternalLink
} from 'lucide-react';

/* ── Slide wrapper ── */
function Slide({ children, direction }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

/* ── Question renderers ── */
function ChoiceQuestion({ question, value, onChange, onNext }) {
  const isSingle = question.type === 'single_choice';
  return (
    <div className="space-y-3">
      {(question.options || []).map((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const selected = isSingle ? value === opt : (Array.isArray(value) && value.includes(opt));
        return (
          <button
            key={i}
            onClick={() => {
              if (isSingle) { onChange(opt); setTimeout(() => onNext?.(), 350); }
              else {
                const arr = Array.isArray(value) ? [...value] : [];
                onChange(selected ? arr.filter(v => v !== opt) : [...arr, opt]);
              }
            }}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer group ${
              selected
                ? 'border-[#c9a87c] bg-[#c9a87c]/8 shadow-sm'
                : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25 hover:bg-white/60'
            }`}
          >
            <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              selected ? 'bg-[#c9a87c] text-white' : 'bg-[#1e3a5a]/5 text-[#1e3a5a]/60 group-hover:bg-[#1e3a5a]/10'
            }`}>{letter}</span>
            <span className="text-[15px] text-[#1e3a5a] leading-snug pt-0.5">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function RatingQuestion({ question, value, onChange, onNext }) {
  const isNps = question.type === 'nps';
  const range = isNps ? [0,1,2,3,4,5,6,7,8,9,10] : [1,2,3,4,5];
  return (
    <div className="space-y-3">
      <div className={`flex gap-2 ${isNps ? 'flex-wrap' : ''} justify-center`}>
        {range.map(n => (
          <button
            key={n}
            onClick={() => { onChange(n); setTimeout(() => onNext?.(), 350); }}
            className={`${isNps ? 'w-11 h-11' : 'w-14 h-14'} rounded-xl font-bold transition-all cursor-pointer ${
              value === n
                ? 'bg-[#c9a87c] text-white shadow-lg scale-110'
                : 'bg-white border-2 border-[#1e3a5a]/10 text-[#1e3a5a] hover:border-[#c9a87c]/40 hover:scale-105'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-[#1e3a5a]/40 px-2">
        <span>{question.min_label || (isNps ? 'Not at all likely' : 'Poor')}</span>
        <span>{question.max_label || (isNps ? 'Extremely likely' : 'Excellent')}</span>
      </div>
    </div>
  );
}

function TextQuestion({ question, value, onChange }) {
  const isLong = question.type === 'textarea';
  return isLong ? (
    <Textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Type your answer here..."
      rows={4}
      className="text-lg border-0 border-b-2 border-[#1e3a5a]/15 rounded-none bg-transparent focus:border-[#c9a87c] focus-visible:ring-0 resize-none px-0"
    />
  ) : (
    <Input
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Type your answer here..."
      className="text-lg border-0 border-b-2 border-[#1e3a5a]/15 rounded-none bg-transparent focus:border-[#c9a87c] focus-visible:ring-0 px-0 h-12"
    />
  );
}

/* ── Main ── */
export default function SurveyPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get('id');
  const isPreview = urlParams.get('preview') === 'true';

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Slides: 0 = welcome/intro, 1 = name/email, 2..N+1 = questions, N+2 = submitting
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const { toast } = useToast();

  const questions = survey?.questions || [];
  const totalSteps = questions.length + 2; // intro + contact + questions

  useEffect(() => {
    if (!surveyId) { setError('No survey specified.'); setLoading(false); return; }
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    setLoading(true);
    const all = await base44.entities.Survey.filter({ id: surveyId });
    const s = all[0];
    if (!s) { setError('Survey not found.'); setLoading(false); return; }
    if (!isPreview && s.status !== 'active') { setError('This survey is not currently accepting responses.'); setLoading(false); return; }
    setSurvey(s);

    // Pre-fill from auth if available
    const authed = await base44.auth.isAuthenticated();
    if (authed) {
      const me = await base44.auth.me();
      setRespondentName(me.full_name || '');
      setRespondentEmail(me.email || '');
      if (!isPreview) {
        const existing = await base44.entities.SurveyResponse.filter({ survey_id: surveyId, respondent_email: me.email });
        if (existing.length > 0) setAlreadyResponded(true);
      }
    }
    setLoading(false);
  };

  const goNext = () => {
    // Validate current step
    if (step === 1) {
      if (!respondentName.trim() || !respondentEmail.trim()) {
        toast({ title: 'Please enter your name and email', variant: 'destructive' }); return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentEmail)) {
        toast({ title: 'Please enter a valid email address', variant: 'destructive' }); return;
      }
    }
    if (step >= 2) {
      const q = questions[step - 2];
      const val = answers[q?.id];
      if (q?.required && (val === undefined || val === '' || (Array.isArray(val) && val.length === 0))) {
        toast({ title: 'This question is required', variant: 'destructive' }); return;
      }
    }
    // If last question, submit
    if (step === totalSteps - 1) { handleSubmit(); return; }
    setDirection(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step <= 0) return;
    setDirection(-1);
    setStep(s => s - 1);
  };

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const handleSubmit = async () => {
    if (isPreview) { setSubmitted(true); return; }
    setSubmitting(true);
    await base44.entities.SurveyResponse.create({
      survey_id: surveyId,
      respondent_email: respondentEmail,
      respondent_name: respondentName,
      answers,
      completed: true,
    });
    await base44.entities.Survey.update(surveyId, { response_count: (survey.response_count || 0) + 1 });
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); goNext(); }
  };

  /* ── Loading / Error / Already ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f5] to-[#f0ebe4]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a87c]" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f5] to-[#f0ebe4] p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#1e3a5a]/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1e3a5a] mb-2">Survey Unavailable</h2>
          <p className="text-sm text-[#1e3a5a]/60">{error}</p>
        </div>
      </div>
    );
  }
  if (alreadyResponded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f5] to-[#f0ebe4] p-6">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-12 h-12 text-[#c9a87c] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1e3a5a] mb-2">Already Responded</h2>
          <p className="text-sm text-[#1e3a5a]/60">You have already submitted a response to this survey.</p>
        </div>
      </div>
    );
  }

  /* ── Thank You ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1526] via-[#1e3a5a] to-[#0a1526] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center max-w-lg"
        >
          <div className="w-20 h-20 rounded-full bg-[#c9a87c]/15 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-[#c9a87c]" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Thank You{respondentName ? `, ${respondentName.split(' ')[0]}` : ''}.
          </h2>
          <p className="text-white/60 text-base mb-10 leading-relaxed">
            Your signal has been received. We're building the future of aerospace recognition — and your input shapes the trajectory.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/">
              <Button className="w-full sm:w-auto gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6 py-5 cursor-pointer backdrop-blur-sm">
                <Home className="w-4 h-4" /> Return Home
              </Button>
            </a>
            <a href="https://calendar.app.google/TrL8saY6XS6tdVj1A" target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto gap-2 rounded-full px-6 py-5 cursor-pointer text-[#0a1526] font-bold" style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}>
                <Calendar className="w-4 h-4" /> Let's Talk!
              </Button>
            </a>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6 py-5 cursor-pointer backdrop-blur-sm">
                <TrendingUp className="w-4 h-4" /> Follow Our Fundraising Journey
              </Button>
            </a>
          </div>

          <p className="text-white/20 text-[10px] tracking-widest uppercase mt-12">top100aero.space</p>
        </motion.div>
      </div>
    );
  }

  /* ── Progress ── */
  const progress = ((step) / totalSteps) * 100;
  const currentQuestion = step >= 2 ? questions[step - 2] : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#faf8f5] to-[#f0ebe4]" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Preview banner */}
      {isPreview && (
        <div className="bg-[#1e3a5a] text-white text-center py-2 text-xs font-bold tracking-widest shrink-0">
          PREVIEW MODE
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1 bg-[#1e3a5a]/5 shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-[#1e3a5a] to-[#c9a87c]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" initial={false}>

            {/* Step 0: Welcome */}
            {step === 0 && (
              <Slide key="welcome" direction={direction}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-[#c9a87c]" />
                    <span className="text-[10px] font-bold tracking-[0.25em] text-[#c9a87c] uppercase">TOP 100 Aerospace & Aviation</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-[#1e3a5a] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {survey.title}
                  </h1>
                  {survey.description && (
                    <p className="text-[#1e3a5a]/60 text-lg leading-relaxed">{survey.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-[#1e3a5a]/40">
                    <span>{questions.length} questions</span>
                    <span>·</span>
                    <span>~{Math.max(1, Math.ceil(questions.length * 0.3))} min</span>
                  </div>
                  <Button
                    onClick={goNext}
                    className="gap-2 bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white rounded-full px-8 py-6 text-base cursor-pointer"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Slide>
            )}

            {/* Step 1: Name & Email */}
            {step === 1 && (
              <Slide key="contact" direction={direction}>
                <div className="space-y-6">
                  <p className="text-[11px] font-bold tracking-[0.2em] text-[#c9a87c] uppercase">Let's get to know you</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5a]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    What's your name and email?
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-[#1e3a5a]/60 uppercase tracking-wider mb-1 block">Full Name</label>
                      <Input
                        value={respondentName}
                        onChange={e => setRespondentName(e.target.value)}
                        placeholder="Jane Doe"
                        className="text-lg border-0 border-b-2 border-[#1e3a5a]/15 rounded-none bg-transparent focus:border-[#c9a87c] focus-visible:ring-0 px-0 h-12"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#1e3a5a]/60 uppercase tracking-wider mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={respondentEmail}
                        onChange={e => setRespondentEmail(e.target.value)}
                        placeholder="jane@aerospace.com"
                        className="text-lg border-0 border-b-2 border-[#1e3a5a]/15 rounded-none bg-transparent focus:border-[#c9a87c] focus-visible:ring-0 px-0 h-12"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[#1e3a5a]/30">We use this to keep your profile up to date. Never shared.</p>
                </div>
              </Slide>
            )}

            {/* Step 2+: Questions */}
            {step >= 2 && currentQuestion && (
              <Slide key={currentQuestion.id} direction={direction}>
                <div className="space-y-6">
                  <p className="text-[11px] font-bold tracking-[0.2em] text-[#c9a87c] uppercase">
                    Question {step - 1} of {questions.length}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-[#1e3a5a] leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {currentQuestion.label}
                    {currentQuestion.required && <span className="text-[#c9a87c] ml-1">*</span>}
                  </h2>

                  {(currentQuestion.type === 'single_choice' || currentQuestion.type === 'multiple_choice') && (
                    <ChoiceQuestion
                      question={currentQuestion}
                      value={answers[currentQuestion.id]}
                      onChange={val => setAnswer(currentQuestion.id, val)}
                      onNext={goNext}
                    />
                  )}
                  {(currentQuestion.type === 'rating' || currentQuestion.type === 'nps') && (
                    <RatingQuestion
                      question={currentQuestion}
                      value={answers[currentQuestion.id]}
                      onChange={val => setAnswer(currentQuestion.id, val)}
                      onNext={goNext}
                    />
                  )}
                  {(currentQuestion.type === 'text' || currentQuestion.type === 'textarea') && (
                    <TextQuestion
                      question={currentQuestion}
                      value={answers[currentQuestion.id]}
                      onChange={val => setAnswer(currentQuestion.id, val)}
                    />
                  )}

                  {currentQuestion.type === 'multiple_choice' && (
                    <p className="text-xs text-[#1e3a5a]/40">Select all that apply</p>
                  )}
                </div>
              </Slide>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      {!submitted && step > 0 && (
        <div className="shrink-0 border-t border-[#1e3a5a]/8 bg-white/60 backdrop-blur-sm px-6 py-4">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={goBack}
              className="gap-2 text-[#1e3a5a]/60 hover:text-[#1e3a5a] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#1e3a5a]/30">{step} / {totalSteps}</span>
              <Button
                onClick={goNext}
                disabled={submitting}
                className="gap-2 bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white rounded-full px-6 cursor-pointer"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : step === totalSteps - 1 ? (
                  <>Submit <CheckCircle2 className="w-4 h-4" /></>
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}