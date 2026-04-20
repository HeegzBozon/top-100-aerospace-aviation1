import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, AlertCircle, Rocket } from 'lucide-react';

function QuestionRenderer({ question, value, onChange }) {
  const { type, label, options, required, min_label, max_label } = question;

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-[#1e3a5a] block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {type === 'text' && (
        <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Your answer..." className="border-[#1e3a5a]/20 focus:border-[#c9a87c]" />
      )}

      {type === 'textarea' && (
        <Textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Your answer..." rows={3} className="border-[#1e3a5a]/20 focus:border-[#c9a87c]" />
      )}

      {type === 'single_choice' && (
        <div className="space-y-2">
          {(options || []).map((opt, i) => (
            <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${value === opt ? 'border-[#c9a87c] bg-[#c9a87c]/5' : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25'}`}>
              <input type="radio" name={question.id} checked={value === opt} onChange={() => onChange(opt)} className="mt-0.5 accent-[#c9a87c]" />
              <span className="text-sm text-[#1e3a5a]">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'multiple_choice' && (
        <div className="space-y-2">
          {(options || []).map((opt, i) => {
            const selected = Array.isArray(value) ? value.includes(opt) : false;
            return (
              <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selected ? 'border-[#c9a87c] bg-[#c9a87c]/5' : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25'}`}>
                <input type="checkbox" checked={selected} onChange={() => {
                  const arr = Array.isArray(value) ? [...value] : [];
                  onChange(selected ? arr.filter(v => v !== opt) : [...arr, opt]);
                }} className="mt-0.5 accent-[#c9a87c]" />
                <span className="text-sm text-[#1e3a5a]">{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {type === 'rating' && (
        <div className="space-y-1">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => onChange(n)} className={`w-10 h-10 rounded-lg font-bold text-sm transition-all cursor-pointer ${value === n ? 'bg-[#c9a87c] text-white shadow-md' : 'bg-[#1e3a5a]/5 text-[#1e3a5a] hover:bg-[#1e3a5a]/10'}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#1e3a5a]/50 px-1">
            <span>{min_label || 'Poor'}</span>
            <span>{max_label || 'Excellent'}</span>
          </div>
        </div>
      )}

      {type === 'nps' && (
        <div className="space-y-1">
          <div className="flex gap-1.5 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button key={n} onClick={() => onChange(n)} className={`w-9 h-9 rounded-lg font-bold text-xs transition-all cursor-pointer ${value === n ? 'bg-[#c9a87c] text-white shadow-md' : 'bg-[#1e3a5a]/5 text-[#1e3a5a] hover:bg-[#1e3a5a]/10'}`}>
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#1e3a5a]/50 px-1">
            <span>{min_label || 'Not at all likely'}</span>
            <span>{max_label || 'Extremely likely'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SurveyPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get('id');
  const isPreview = urlParams.get('preview') === 'true';

  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const { toast } = useToast();

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

    // Check if user already responded
    if (!isPreview) {
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        const me = await base44.auth.me();
        const existing = await base44.entities.SurveyResponse.filter({ survey_id: surveyId, respondent_email: me.email });
        if (existing.length > 0) setAlreadyResponded(true);
      }
    }
    setLoading(false);
  };

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const handleSubmit = async () => {
    // Validate required
    const missing = survey.questions.filter(q => q.required && (answers[q.id] === undefined || answers[q.id] === '' || (Array.isArray(answers[q.id]) && answers[q.id].length === 0)));
    if (missing.length > 0) {
      toast({ title: 'Please answer all required questions', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const me = await base44.auth.me();
    await base44.entities.SurveyResponse.create({
      survey_id: surveyId,
      respondent_email: me.email,
      answers,
      completed: true,
    });
    // Increment response count
    await base44.entities.Survey.update(surveyId, { response_count: (survey.response_count || 0) + 1 });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a87c]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#1e3a5a]/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1e3a5a] mb-2">Survey Unavailable</h2>
          <p className="text-sm text-[#1e3a5a]/60">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#c9a87c]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#c9a87c]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1e3a5a] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Thank You</h2>
          <p className="text-sm text-[#1e3a5a]/60">Your response has been recorded. We appreciate your input.</p>
        </div>
      </div>
    );
  }

  if (alreadyResponded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] p-6">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-12 h-12 text-[#c9a87c] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1e3a5a] mb-2">Already Responded</h2>
          <p className="text-sm text-[#1e3a5a]/60">You have already submitted a response to this survey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Preview banner */}
      {isPreview && (
        <div className="bg-[#1e3a5a] text-white text-center py-2 text-sm font-bold tracking-wider">
          PREVIEW MODE — Responses will not be saved
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-4 h-4 text-[#c9a87c]" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c] uppercase">TOP 100 Aerospace & Aviation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e3a5a] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-[#1e3a5a]/60 text-base leading-relaxed">{survey.description}</p>
          )}
          <div className="w-16 h-1 bg-[#c9a87c] rounded-full mt-6" />
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {(survey.questions || []).map((q, i) => (
            <div key={q.id} className="p-5 rounded-xl bg-white border border-[#1e3a5a]/8 shadow-sm">
              <QuestionRenderer
                question={q}
                value={answers[q.id]}
                onChange={val => setAnswer(q.id, val)}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        {!isPreview && (
          <div className="mt-10 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white px-8 py-6 rounded-xl font-bold cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </div>
        )}

        {isPreview && (
          <div className="mt-10 p-4 rounded-xl bg-[#1e3a5a]/5 border border-[#1e3a5a]/10 text-center">
            <p className="text-sm text-[#1e3a5a]/60">This is a preview. Publish the survey and share the link to collect responses.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-[10px] text-[#1e3a5a]/30 tracking-widest uppercase">top100aero.space</p>
        </div>
      </div>
    </div>
  );
}