import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Send, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

const brand = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8', gold: '#c9a87c' };

const GENDER_LISTS = [
  { value: 'women', label: 'Top 100 Women in Aerospace & Aviation' },
  { value: 'men',   label: 'Top 100 Men in Aerospace & Aviation' },
];

const STEPS = [
  { id: 1, title: 'Who are you nominating?' },
  { id: 2, title: 'How do we find them?' },
  { id: 3, title: 'Why do they deserve it?' },
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
    <p id={id} role="alert" className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
      <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function InlineNominationForm({ onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', category: '', nominee_email: '', linkedin_url: '', reason: '', season_id: '', list_type: '', include_angels: false,
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!formData.list_type) e.list_type = 'Please select Top 100 Women or Top 100 Men.';
      if (!formData.name.trim())  e.name = 'Nominee name is required.';
      if (!formData.category)     e.category = 'Please select a category.';
    }
    if (s === 2) {
      if (!formData.linkedin_url.trim())                          e.linkedin_url = 'LinkedIn URL is required.';
      else if (!formData.linkedin_url.includes('linkedin.com/'))  e.linkedin_url = 'Enter a valid linkedin.com URL.';
    }
    if (s === 3) {
      if (!formData.reason.trim())               e.reason = 'Please describe why they deserve recognition.';
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
        league_id: formData.include_angels ? `${formData.list_type},angels` : formData.list_type,
        status: 'pending',
      });
      toast({ title: '🎉 Nomination Submitted!', description: 'Thank you! It will be reviewed shortly.' });
      setFormData({ name: '', category: '', nominee_email: '', linkedin_url: '', reason: '', season_id: seasons[0]?.id || '', list_type: '', include_angels: false });
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ['nominations-submitted'] });
      onSuccess?.();
    } catch {
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">

      {/* ── Progress Header ── */}
      <div className="shrink-0 px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${brand.navyDeep}12` }}>
        {/* Step dots */}
        <div
          className="flex gap-1.5 mb-3"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label={`Step ${step} of ${STEPS.length}`}
        >
          {STEPS.map(s => (
            <div
              key={s.id}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: s.id <= step ? brand.gold : `${brand.navyDeep}15` }}
            />
          ))}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: `${brand.navyDeep}50` }}>
          Step {step} of {STEPS.length}
        </p>
        <h3 className="text-base font-bold mt-0.5" style={{ color: brand.navyDeep }}>
          {STEPS[step - 1].title}
        </h3>
      </div>

      {/* ── Form Body — flex-1, NO overflow-y-auto so nothing scrolls ── */}
      <div className="flex-1 px-5 py-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-4 h-full"
            >
              <div>
                <label htmlFor="nom-name" className="block text-sm font-semibold mb-1.5" style={{ color: brand.navyDeep }}>
                  Full Name <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <Input
                  id="nom-name"
                  placeholder="e.g. Dr. Evelyn Reed"
                  value={formData.name}
                  onChange={e => set('name', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'nom-name-err' : undefined}
                  className="text-base h-12"
                  autoComplete="off"
                />
                <FieldError id="nom-name-err" message={errors.name} />
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: brand.navyDeep }} id="list-type-label">
                  Nominating for <span className="text-red-500" aria-hidden="true">*</span>
                </p>
                {/* Women / Men — mutually exclusive */}
                <div className="flex flex-col gap-2 mb-3" role="radiogroup" aria-labelledby="list-type-label">
                  {GENDER_LISTS.map(lt => {
                    const selected = formData.list_type === lt.value;
                    return (
                      <button
                        key={lt.value}
                        type="button"
                        onClick={() => set('list_type', lt.value)}
                        aria-pressed={selected}
                        className="px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center gap-2"
                        style={{
                          background: selected ? brand.navyDeep : `${brand.navyDeep}08`,
                          color: selected ? 'white' : brand.navyDeep,
                          border: `1.5px solid ${selected ? brand.navyDeep : `${brand.navyDeep}15`}`,
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                          style={{ borderColor: selected ? 'white' : `${brand.navyDeep}40` }}
                        >
                          {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        {lt.label}
                      </button>
                    );
                  })}
                </div>
                {/* Angels — optional add-on toggle */}
                <button
                  type="button"
                  onClick={() => set('include_angels', !formData.include_angels)}
                  aria-pressed={formData.include_angels}
                  className="w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center gap-2"
                  style={{
                    background: formData.include_angels ? `${brand.gold}18` : `${brand.navyDeep}08`,
                    color: formData.include_angels ? brand.gold : `${brand.navyDeep}70`,
                    border: `1.5px solid ${formData.include_angels ? brand.gold : `${brand.navyDeep}15`}`,
                  }}
                >
                  <span
                    className="w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center"
                    style={{ borderColor: formData.include_angels ? brand.gold : `${brand.navyDeep}40`, background: formData.include_angels ? brand.gold : 'transparent' }}
                  >
                    {formData.include_angels && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                  </span>
                  Also nominate for Top 100 Angels in Aerospace & Aviation
                  <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide opacity-60">Optional</span>
                </button>
                <FieldError id="nom-list-err" message={errors.list_type} />
              </div>

              <div>
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: brand.navyDeep }}
                  id="category-label"
                >
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
                        className="px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          background: selected ? brand.navyDeep : `${brand.navyDeep}08`,
                          color: selected ? 'white' : brand.navyDeep,
                          border: `1.5px solid ${selected ? brand.navyDeep : `${brand.navyDeep}15`}`,
                        }}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                <FieldError id="nom-cat-err" message={errors.category} />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-4"
            >
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
                  className="text-base h-12"
                />
                <p id="nom-linkedin-hint" className="text-xs mt-1" style={{ color: `${brand.navyDeep}50` }}>
                  Required for verification
                </p>
                <FieldError id="nom-linkedin-err" message={errors.linkedin_url} />
              </div>

              <div>
                <label htmlFor="nom-email" className="block text-sm font-semibold mb-1.5" style={{ color: brand.navyDeep }}>
                  Their Email
                  <span className="font-normal text-xs ml-1" style={{ color: `${brand.navyDeep}45` }}>(optional)</span>
                </label>
                <Input
                  id="nom-email"
                  type="email"
                  inputMode="email"
                  placeholder="nominee@example.com"
                  value={formData.nominee_email}
                  onChange={e => set('nominee_email', e.target.value)}
                  aria-describedby="nom-email-hint"
                  className="text-base h-12"
                />
                <p id="nom-email-hint" className="text-xs mt-1" style={{ color: `${brand.navyDeep}50` }}>
                  We'll notify them about their nomination
                </p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col"
            >
              <label htmlFor="nom-reason" className="block text-sm font-semibold mb-1.5" style={{ color: brand.navyDeep }}>
                Make the case <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <Textarea
                id="nom-reason"
                placeholder="Describe their achievements, impact, and contributions to aerospace & aviation…"
                value={formData.reason}
                onChange={e => set('reason', e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.reason}
                aria-describedby="nom-reason-hint nom-reason-err"
                // Grow to fill available space — no fixed min-h so it doesn't overflow
                className="text-base flex-1 resize-none"
                style={{ minHeight: 120 }}
              />
              <div className="flex items-center justify-between mt-1.5">
                <p id="nom-reason-hint" className="text-xs" style={{ color: `${brand.navyDeep}50` }}>
                  Strong nominations stand out
                </p>
                <span
                  className="text-xs tabular-nums font-medium"
                  style={{ color: formData.reason.length >= 30 ? `${brand.navyDeep}40` : brand.gold }}
                >
                  {formData.reason.length} / 30 min
                </span>
              </div>
              <FieldError id="nom-reason-err" message={errors.reason} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer Nav ── */}
      <div
        className="shrink-0 px-5 pt-3 pb-4 flex items-center justify-between"
        style={{ borderTop: `1px solid ${brand.navyDeep}12` }}
      >
        <button
          onClick={handleBack}
          disabled={step === 1}
          aria-label="Previous step"
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[80px]"
          style={{
            color: step === 1 ? `${brand.navyDeep}25` : brand.navyDeep,
            background: step === 1 ? 'transparent' : `${brand.navyDeep}08`,
            cursor: step === 1 ? 'default' : 'pointer',
          }}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            aria-label="Next step"
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: brand.navyDeep, minHeight: 48 }}
          >
            Next
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || seasons.length === 0}
            aria-label="Submit nomination"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${brand.gold}, ${brand.skyBlue})`,
              minHeight: 48,
            }}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Submitting…</>
            ) : (
              <><Send className="w-4 h-4" aria-hidden="true" />Submit</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}