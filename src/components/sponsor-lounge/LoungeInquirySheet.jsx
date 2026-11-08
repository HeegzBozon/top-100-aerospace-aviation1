import { useState } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { FIT_CATEGORIES, isEmailShaped } from '@/components/patronage/patronConfig';

// The hand raised inside a lounge. Both rooms use the same door: the intake function that
// already owns the Patron lifecycle and the CRM, told which room it was opened from so the
// desk reads the source instead of guessing it.
const EMPTY = {
  organization_name: '',
  contact_name: '',
  contact_role: '',
  contact_email: '',
  phone: '',
  fit_category: 'other',
  message: '',
};

const field =
  'mt-1.5 w-full border border-editorial-navy/20 bg-editorial-cream px-3 py-2 text-[12px] text-editorial-navy outline-none focus:border-editorial-copper';
const label = 'text-[8.5px] font-bold uppercase tracking-[0.2em] text-editorial-navy/55';

export default function LoungeInquirySheet({ intent, copy, onBack }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.organization_name.trim() || !form.contact_name.trim()) {
      setError('An organization and a name, so we know who we are writing to.');
      return;
    }
    if (!isEmailShaped(form.contact_email)) {
      setError('That address does not look like an email.');
      return;
    }
    setStatus('sending');
    try {
      const response = await base44.functions.invoke('patronIntake', {
        ...form,
        interest: intent.interest,
        source_detail: `${copy.label} — ${intent.label}`.slice(0, 160),
      });
      if (response?.data?.error) throw new Error(response.data.error);
      setStatus('sent');
    } catch (failure) {
      setStatus('idle');
      setError(failure?.response?.data?.error || failure?.message || 'That did not send. Try again in a moment.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto bg-editorial-cream px-5 py-8 md:px-8">
        <Check className="h-5 w-5 text-editorial-copper" />
        <h3 className="mt-4 font-heading text-2xl leading-tight text-editorial-navy">Your hand is raised</h3>
        <p className="mt-3 max-w-[46ch] text-[12.5px] leading-relaxed text-editorial-navy/75">{intent.next}</p>
        <p className="mt-3 max-w-[46ch] text-[11px] leading-relaxed text-editorial-navy/50">
          The room is noted with the request, so the reply knows which table you were sitting at.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-copper hover:underline"
        >
          Back to the room
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-editorial-cream px-5 py-6 md:px-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-editorial-copper hover:underline"
      >
        <ArrowLeft className="h-3 w-3" /> The room
      </button>
      <p className="mt-4 text-[8.5px] font-bold uppercase tracking-[0.28em] text-editorial-copper">{copy.label}</p>
      <h3 className="mt-2 font-heading text-2xl leading-tight text-editorial-navy">{intent.headline}</h3>
      <p className="mt-2 max-w-[48ch] text-[11.5px] leading-relaxed text-editorial-navy/65">{intent.blurb}</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Organization</span>
            <input className={field} value={form.organization_name} onChange={set('organization_name')} autoComplete="organization" />
          </label>
          <label className="block">
            <span className={label}>Your name</span>
            <input className={field} value={form.contact_name} onChange={set('contact_name')} autoComplete="name" />
          </label>
          <label className="block">
            <span className={label}>Your role</span>
            <input className={field} value={form.contact_role} onChange={set('contact_role')} autoComplete="organization-title" />
          </label>
          <label className="block">
            <span className={label}>Email</span>
            <input className={field} value={form.contact_email} onChange={set('contact_email')} autoComplete="email" inputMode="email" />
          </label>
          <label className="block">
            <span className={label}>Phone (optional)</span>
            <input className={field} value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" />
          </label>
          <label className="block">
            <span className={label}>What you do</span>
            <select className={field} value={form.fit_category} onChange={set('fit_category')}>
              {FIT_CATEGORIES.map((fit) => (
                <option key={fit.key} value={fit.key}>{fit.label}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className={label}>Anything we should know before we reply</span>
          <textarea rows={3} className={field} value={form.message} onChange={set('message')} />
        </label>

        {error && <p className="text-[11px] leading-relaxed text-editorial-copper">{error}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" disabled={status === 'sending'} className="desk-key desk-key-primary disabled:opacity-60">
            {status === 'sending' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {intent.label}
          </button>
          <p className="text-[10px] leading-relaxed text-editorial-navy/45">
            Nobody is subscribed by asking. One reply, from a named person.
          </p>
        </div>
      </form>
    </div>
  );
}