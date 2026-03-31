import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Send, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const brand = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  gold: '#c9a87c',
};

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Name & category' },
  { id: 2, title: 'Contact',   description: 'LinkedIn & email' },
  { id: 3, title: 'Why Them?', description: 'Make the case' },
];

const CATEGORIES = [
  { value: 'engineering',      label: '⚙️ Engineering' },
  { value: 'leadership',       label: '🌟 Leadership' },
  { value: 'innovation',       label: '💡 Innovation' },
  { value: 'operations',       label: '🔧 Operations' },
  { value: 'manufacturing',    label: '🏭 Manufacturing' },
  { value: 'policy',           label: '🏛️ Policy' },
  { value: 'entrepreneurship', label: '🚀 Entrepreneurship' },
];

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs text-red-600 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function InlineNominationForm({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', category: '', nominee_email: '', linkedin_url: '', reason: '', season_id: '',
  });
  const [errors, setErrors] = useState({});
  const [seasons, setSeasons] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.entities.Season.list('-created_date', 50).then(all => {
      const open = all.filter(s => s.status === 'nominations_open');
      setSeasons(open);
      if (open.length > 0) setFormData(prev => ({ ...prev, season_id: open[0].id }));
    });
  }, []);

  const set = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!formData.name.trim())   e.name = 'Nominee name is required.';
      if (!formData.category)      e.category = 'Please select a category.';
      if (!formData.season_id)     e.season_id = 'No active nomination season found.';
    }
    if (s === 2) {
      if (!formData.linkedin_url.trim())              e.linkedin_url = 'LinkedIn URL is required.';
      else if (!formData.linkedin_url.includes('linkedin.com/')) e.linkedin_url = 'Enter a valid linkedin.com URL.';
    }
    if (s === 3) {
      if (!formData.reason.trim())  e.reason = 'Please describe why they deserve recognition.';
      else if (formData.reason.trim().length < 30) e.reason = 'Please write at least 30 characters.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep(step)) setStep(s => s + 1); };
  const handleBack = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Nominee.create({
        name: formData.name.trim(),
        description: formData.reason.trim(),
        nominee_email: formData.nominee_email || '',
        linkedin_profile_url: formData.linkedin_url,
        category: formData.category,
        nomination_reason: formData.reason.trim(),
        nominated_by: user.email,
        season_id: formData.season_id,
        status: 'pending',
      });
      toast({ title: '🎉 Nomination Submitted!', description: 'Thank you! It will be reviewed shortly.' });
      setFormData({ name: '', category: '', nominee_email: '', linkedin_url: '', reason: '', season_id: seasons[0]?.id || '' });
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ['my-nominations'] });
      queryClient.invalidateQueries({ queryKey: ['nominations-submitted'] });
      onSuccess?.();
    } catch {
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step Progress Header */}
      <div className="shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${brand.navyDeep}12` }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-base" style={{ color: brand.navyDeep }}>
              {STEPS[step - 1].title}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: `${brand.navyDeep}60` }}>
              {STEPS[step - 1].description}
            </p>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${brand.gold}20`, color: brand.gold }}
            aria-label={`Step ${step} of ${STEPS.length}`}
          >
            {step} / {STEPS.length}
          </span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map(s => (
            <div
              key={s.id}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: s.id <= step ? brand.gold : `${brand.navyDeep}15` }}
            />
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <div>
              <label htmlFor="nom-name" className="block text-sm font-semibold mb-1.5" style={{ color: brand.navyDeep }}>
                Nominee's Full Name <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <Input
                id="nom-name"
                placeholder="e.g. Dr. Evelyn Reed"
                value={formData.name}
                onChange={e => set('name', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'nom-name-err' : undefined}
                className="text-base"
              />
              <FieldError id="nom-name-err" message={errors.name} />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: brand.navyDeep }} id="category-label">
                Category <span className="text-red-500" aria-hidden="true">*</span>
              </p>
              <div
                className="grid grid-cols-2 gap-2"
                role="group"
                aria-labelledby="category-label"
                aria-describedby={errors.category ? 'nom-cat-err' : undefined}
              >
                {CATEGORIES.map(cat => {
                  const selected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => set('category', cat.value)}
                      aria-pressed={selected}
                      className="px-3 py-3 rounded-xl text-left text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        background: selected ? `${brand.navyDeep}` : `${brand.navyDeep}08`,
                        color: selected ? 'white' : brand.navyDeep,
                        border: selected ? `1.5px solid ${brand.navyDeep}` : `1.5px solid ${brand.navyDeep}15`,
                        focusVisibleOutlineColor: brand.gold,
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <FieldError id="nom-cat-err" message={errors.category} />
              {seasons.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">No active nomination seasons are currently open.</p>
              )}
            </div>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
            <div>
              <label htmlFor="nom-linkedin" className="block text-sm font-semibold mb-1.5" style={{ color: brand.navyDeep }}>
                LinkedIn Profile URL <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <Input
                id="nom-linkedin"
                type="url"
                inputMode="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_url}
                onChange={e => set('linkedin_url', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.linkedin_url}
                aria-describedby="nom-linkedin-hint nom-linkedin-err"
                className="text-base"
              />
              <p id="nom-linkedin-hint" className="text-xs mt-1" style={{ color: `${brand.navyDeep}50` }}>
                Required so we can verify the nomination
              </p>
              <FieldError id="nom-linkedin-err" message={errors.linkedin_url} />
            </div>

            <div>
              <label htmlFor="nom-email" className="block text-sm font-semibold mb-1.5" style={{ color: brand.navyDeep }}>
                Nominee's Email
                <span className="font-normal ml-1 text-xs" style={{ color: `${brand.navyDeep}45` }}>(optional)</span>
              </label>
              <Input
                id="nom-email"
                type="email"
                inputMode="email"
                placeholder="nominee@example.com"
                value={formData.nominee_email}
                onChange={e => set('nominee_email', e.target.value)}
                aria-describedby="nom-email-hint"
                className="text-base"
              />
              <p id="nom-email-hint" className="text-xs mt-1" style={{ color: `${brand.navyDeep}50` }}>
                If provided, we'll notify them about their nomination
              </p>
            </div>
          </>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div>
            <label htmlFor="nom-reason" className="block text-sm font-semibold mb-1.5" style={{ color: brand.navyDeep }}>
              Why do they deserve recognition? <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <Textarea
              id="nom-reason"
              placeholder="Describe their achievements, impact, and contributions to aerospace & aviation..."
              value={formData.reason}
              onChange={e => set('reason', e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.reason}
              aria-describedby="nom-reason-hint nom-reason-err"
              className="text-base min-h-[180px] resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p id="nom-reason-hint" className="text-xs" style={{ color: `${brand.navyDeep}50` }}>
                Be specific — strong nominations stand out
              </p>
              <span
                className="text-xs tabular-nums"
                style={{ color: formData.reason.length >= 30 ? `${brand.navyDeep}50` : brand.gold }}
              >
                {formData.reason.length} / 30 min
              </span>
            </div>
            <FieldError id="nom-reason-err" message={errors.reason} />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div
        className="shrink-0 px-5 py-4 flex items-center justify-between"
        style={{ borderTop: `1px solid ${brand.navyDeep}12` }}
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          aria-label="Go to previous step"
          className="gap-1.5 min-h-[44px] px-4"
          style={{ color: step === 1 ? `${brand.navyDeep}30` : brand.navyDeep }}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={handleNext}
            aria-label="Go to next step"
            className="gap-1.5 min-h-[44px] px-6 font-semibold"
            style={{ background: brand.navyDeep, color: 'white' }}
          >
            Next
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || seasons.length === 0}
            className="gap-2 min-h-[44px] px-6 font-semibold"
            style={{ background: `linear-gradient(135deg, ${brand.gold}, ${brand.skyBlue})`, color: 'white' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Submitting…</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                Submit Nomination
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}