import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { captureGroundControlLead } from '@/functions/captureGroundControlLead';

const COPY = {
  audit: {
    title: 'Request a Free Audit',
    description: 'We will record a 5-minute Loom showing exactly where inquiries enter your business and where they stall. You keep the map whether or not you work with us.',
    cta: 'Send me the Loom',
    successTitle: 'Your Loom is on the way.',
    successBody: 'Check your inbox — your personalized audit arrives shortly.',
  },
  trial: {
    title: 'Request a Free Trial',
    description: 'Spin up the $97/mo Ground Control Starter Kit and run it yourself. We will send your trial activation details and a quick-start Loom.',
    cta: 'Start my trial',
    successTitle: 'Trial request received.',
    successBody: 'We will reach out with your Starter Kit activation and onboarding Loom.',
  },
};

const inputClass = "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9a87c]/50 transition-colors";

export default function GroundControlLeadModal({ open, interestType = 'audit', onClose }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', link: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const config = COPY[interestType] || COPY.audit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      await captureGroundControlLead({ ...form, interest_type: interestType });
      setStatus('success');
    } catch {
      setStatus('error');
      setError('Something went wrong. Try again.');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setError('');
    setForm({ name: '', email: '', company: '', link: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md border-[#c9a87c]/30 bg-[#0a1626] text-white">
        {status === 'success' ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a87c]/15">
              <Check className="h-6 w-6 text-[#c9a87c]" />
            </div>
            <h3 className="font-serif text-2xl text-white" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{config.successTitle}</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/55">{config.successBody}</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-white" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{config.title}</DialogTitle>
              <DialogDescription className="text-white/55">{config.description}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <input
                name="gc-name"
                autoComplete="off"
                data-lpignore="true"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className={inputClass}
              />
              <input
                name="gc-email"
                type="email"
                autoComplete="off"
                data-lpignore="true"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Work email"
                className={inputClass}
              />
              <input
                name="gc-company"
                autoComplete="off"
                data-lpignore="true"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company"
                className={inputClass}
              />
              <input
                name="gc-link"
                autoComplete="off"
                data-lpignore="true"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="LinkedIn or website"
                className={inputClass}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#07111f] transition-transform hover:scale-[1.02] disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}
              >
                {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{config.cta} <ArrowRight className="h-4 w-4" /></>}
              </button>
              {error && <p className="text-center text-xs text-red-400">{error}</p>}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}