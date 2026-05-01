import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight, Plus, Trash2, Rocket, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };
const SURVEY_ID = '69f45633daacf496cacd8666';

const CONNECTION_OPTIONS = [
  'I work in aerospace / aviation / space',
  "I'm a TOP 100 Fellow or Alumni",
  "I'm a community member / Booster",
  'I support the aerospace community (local business, service provider, etc.)',
  'Other',
];

const NOMINATION_TYPES = [
  { id: 'top100_women', label: 'A woman in aerospace, aviation, or space (TOP 100 Women)' },
  { id: 'top100_angels', label: 'An investor in aerospace, aviation, or space (TOP 100 Angels)' },
  { id: 'top100_men', label: 'A man in aerospace, aviation, or space (TOP 100 Men)' },
  { id: 'local_legends', label: 'A local business that supports the aerospace community (Local Legends)' },
];

const EMPTY_NOMINATION = {
  types: [],
  name: '',
  location: '',
  link: '',
  reason: '',
  share_name: '',
};

export default function NominationForm() {
  const [yourName, setYourName] = useState('');
  const [yourEmail, setYourEmail] = useState('');
  const [yourConnection, setYourConnection] = useState('');
  const [nominations, setNominations] = useState([{ ...EMPTY_NOMINATION }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => firstInputRef.current?.focus(), 200);
  }, []);

  // Submit on Cmd/Ctrl+Enter from anywhere on the page
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yourName, yourEmail, yourConnection, nominations]);

  const updateNomination = (index, field, value) => {
    setNominations(prev => prev.map((n, i) => i === index ? { ...n, [field]: value } : n));
  };

  const toggleType = (index, typeId) => {
    setNominations(prev => prev.map((n, i) => {
      if (i !== index) return n;
      const types = n.types.includes(typeId) ? n.types.filter(t => t !== typeId) : [...n.types, typeId];
      return { ...n, types };
    }));
  };

  const addNomination = () => setNominations(prev => [...prev, { ...EMPTY_NOMINATION }]);
  const removeNomination = (index) => setNominations(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!yourName.trim() || !yourEmail.trim()) {
      toast({ title: 'Please enter your name and email', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(yourEmail)) {
      toast({ title: 'Please enter a valid email', variant: 'destructive' });
      return;
    }
    if (!yourConnection) {
      toast({ title: 'Please select your connection to aerospace', variant: 'destructive' });
      return;
    }

    for (let i = 0; i < nominations.length; i++) {
      const n = nominations[i];
      if (n.types.length === 0) {
        toast({ title: `Please select a nomination type for nomination #${i + 1}`, variant: 'destructive' });
        return;
      }
      if (!n.name.trim()) {
        toast({ title: `Please enter a name for nomination #${i + 1}`, variant: 'destructive' });
        return;
      }
      if (!n.reason.trim()) {
        toast({ title: `Please tell us why for nomination #${i + 1}`, variant: 'destructive' });
        return;
      }
      if (!n.share_name) {
        toast({ title: `Please choose a visibility preference for nomination #${i + 1}`, variant: 'destructive' });
        return;
      }
    }

    setSubmitting(true);
    const answers = {
      your_name: yourName,
      your_email: yourEmail,
      your_connection: yourConnection,
      nominations: nominations.map(n => ({
        types: n.types,
        name: n.name,
        location: n.location,
        link: n.link,
        reason: n.reason,
        share_name: n.share_name,
      })),
    };

    await base44.entities.SurveyResponse.create({
      survey_id: SURVEY_ID,
      respondent_email: yourEmail,
      respondent_name: yourName,
      answers,
      completed: true,
    });

    // Increment response count
    const surveys = await base44.entities.Survey.filter({ id: SURVEY_ID });
    if (surveys[0]) {
      await base44.entities.Survey.update(SURVEY_ID, {
        response_count: (surveys[0].response_count || 0) + 1,
      });
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ background: `${brand.gold}20` }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: brand.gold }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nominations Received!
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-4">
            We review every nomination personally. If the person or business is a fit, we'll reach out within <strong className="text-white/80">5 business days</strong>.
          </p>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            For TOP 100 nominations, acceptance follows our standard Season 4 selection process.<br />
            For Local Legends nominations, it's simple: if they accept, they're in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="rounded-full px-8 text-white gap-2" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}>
                Return Home <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-white/15 text-[10px] tracking-widest uppercase mt-12">
            TOP 100 Aerospace & Aviation
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sf-pro" style={{ background: `linear-gradient(180deg, ${brand.cream}, #f0ebe4)` }}>
      {/* Hero */}
      <div className="pt-16 pb-10 px-6 text-center" style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30` }}>
            <Star className="w-3 h-3" />
            Nominations Open
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Nominate Someone Who Deserves{' '}
            <span style={{ color: brand.gold }}>to Be Recognized</span>
          </h1>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            The aerospace and aviation community runs on remarkable people and remarkable places. Tell us who yours are.
          </p>
        </div>
      </div>

      {/* Form */}
      <div ref={formRef} className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* About You */}
        <SectionHeader title="About You" />
        <div className="space-y-4 mb-10">
          <FormField label="Your Name" required>
            <Input ref={firstInputRef} value={yourName} onChange={e => setYourName(e.target.value)} placeholder="Jane Doe" className="bg-white" />
          </FormField>
          <FormField label="Your Email" required>
            <Input type="email" value={yourEmail} onChange={e => setYourEmail(e.target.value)} placeholder="jane@aerospace.com" className="bg-white" />
          </FormField>
          <FormField label="Your Connection to Aerospace & Aviation" required>
            <div className="space-y-2">
              {CONNECTION_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setYourConnection(opt)}
                  className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all cursor-pointer ${
                    yourConnection === opt
                      ? 'border-[#c9a87c] bg-[#c9a87c]/8'
                      : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25 bg-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Nominations */}
        <SectionHeader title="Who Are You Nominating?" />

        <AnimatePresence initial={false}>
          {nominations.map((nom, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <NominationCard
                nomination={nom}
                index={idx}
                total={nominations.length}
                onUpdate={(field, val) => updateNomination(idx, field, val)}
                onToggleType={(typeId) => toggleType(idx, typeId)}
                onRemove={() => removeNomination(idx)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={addNomination}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed text-sm font-semibold transition-all cursor-pointer mb-10"
          style={{ borderColor: `${brand.gold}60`, color: brand.gold }}
        >
          <Plus className="w-4 h-4" /> Add another nomination
        </button>

        {/* Submit */}
        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="rounded-full px-10 py-6 text-base font-bold text-white gap-2 cursor-pointer shadow-xl"
            style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
          >
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <>Submit My Nominations <ArrowRight className="w-5 h-5" /></>}
          </Button>

          <p className="text-sm mt-6 leading-relaxed max-w-lg mx-auto" style={{ color: `${brand.navy}60` }}>
            We review every nomination personally. If the person or business is a fit, we'll reach out within 5 business days.
          </p>
          <p className="text-sm mt-2 leading-relaxed max-w-lg mx-auto" style={{ color: `${brand.navy}50` }}>
            For TOP 100 nominations, acceptance follows our standard Season 4 selection process.<br />
            For Local Legends nominations, it's simple: if they accept, they're in.
          </p>

          <p className="text-[11px] mt-8 leading-relaxed max-w-lg mx-auto" style={{ color: `${brand.navy}30` }}>
            By submitting this form you confirm you have a genuine connection to or knowledge of the person or business you're nominating. TOP 100 Aerospace & Aviation reserves the right to review all nominations before outreach. Nomination does not guarantee selection for TOP 100 indexed programs.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-lg font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      <div className="flex-1 h-px" style={{ background: `${brand.navy}15` }} />
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: `${brand.navy}70` }}>
        {label}{required && <span style={{ color: brand.gold }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function NominationCard({ nomination, index, total, onUpdate, onToggleType, onRemove }) {
  return (
    <div className="rounded-2xl border bg-white p-5 sm:p-6 space-y-4" style={{ borderColor: `${brand.navy}10` }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: brand.gold }}>
          Nomination {index + 1}
        </h3>
        {total > 1 && (
          <button onClick={onRemove} className="text-red-400 hover:text-red-600 p-1 cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nomination Type */}
      <FormField label="Nomination Type" required>
        <p className="text-xs mb-2" style={{ color: `${brand.navy}40` }}>Select all that apply</p>
        <div className="space-y-2">
          {NOMINATION_TYPES.map(t => {
            const selected = nomination.types.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => onToggleType(t.id)}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all cursor-pointer flex items-center gap-3 ${
                  selected
                    ? 'border-[#c9a87c] bg-[#c9a87c]/8'
                    : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25 bg-white'
                }`}
              >
                <span className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                  selected ? 'bg-[#c9a87c] text-white' : 'bg-[#1e3a5a]/5 text-[#1e3a5a]/40'
                }`}>✓</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </FormField>

      {/* Name */}
      <FormField label="Name of person or business" required>
        <Input value={nomination.name} onChange={e => onUpdate('name', e.target.value)} placeholder="e.g. Maria Torres or Skyline Coffee" className="bg-white" />
      </FormField>

      {/* Location */}
      <FormField label="City / Location">
        <Input value={nomination.location} onChange={e => onUpdate('location', e.target.value)} placeholder="e.g. Houston, TX" className="bg-white" />
      </FormField>

      {/* Link */}
      <FormField label="LinkedIn profile, website, or Instagram">
        <Input value={nomination.link} onChange={e => onUpdate('link', e.target.value)} placeholder="Optional but helpful" className="bg-white" />
        <p className="text-xs mt-1" style={{ color: `${brand.navy}35` }}>Helps us find them.</p>
      </FormField>

      {/* Reason */}
      <FormField label="Why do they deserve to be recognized?" required>
        <Textarea value={nomination.reason} onChange={e => onUpdate('reason', e.target.value)} placeholder="A sentence or two is enough. What do they do? Why does the community need to know about them?" rows={3} className="bg-white" />
      </FormField>

      {/* Share name */}
      <FormField label="May we tell them you nominated them?" required>
        <div className="space-y-2">
          {[
            { val: 'yes', label: 'Yes, share my name with them' },
            { val: 'no', label: 'No, keep my nomination anonymous' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => onUpdate('share_name', opt.val)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all cursor-pointer ${
                nomination.share_name === opt.val
                  ? 'border-[#c9a87c] bg-[#c9a87c]/8'
                  : 'border-[#1e3a5a]/10 hover:border-[#1e3a5a]/25 bg-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}