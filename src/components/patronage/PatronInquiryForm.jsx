import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { FIT_CATEGORIES, INTERESTS, P, isEmailShaped } from './patronConfig';

// The door. A founder or a marketing lead decides here whether to take a call, so the form
// asks only what qualification needs: who, where, why now, and how to reach them.
//
// It goes to the intake function, which writes the lifecycle record and the CRM contact.
// Success says what happens next and when, because "we will be in touch" is not an answer.

const EMPTY = {
  organization_name: '',
  contact_name: '',
  contact_role: '',
  contact_email: '',
  fit_category: 'other',
  interest: INTERESTS[0],
  message: '',
};

const field = 'w-full border bg-white px-3 py-2.5 text-[12px] outline-none';

export default function PatronInquiryForm() {
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
        source_detail: 'Media kit',
      });
      if (response?.data?.error) throw new Error(response.data.error);
      setStatus('sent');
      setForm(EMPTY);
    } catch (failure) {
      setStatus('idle');
      setError(failure?.response?.data?.error || failure?.message || 'That did not send. Try again in a moment.');
    }
  };

  if (status === 'sent') {
    return (
      <section id="enquire" className="border-t" style={{ borderColor: P.hair }}>
        <div className="mx-auto w-full max-w-3xl px-5 py-12 md:px-10 md:py-16">
          <div className="border p-6 md:p-9" style={{ borderColor: P.copper, background: 'white' }}>
            <Check className="h-5 w-5" style={{ color: P.copper }} />
            <h2 className="mt-4 font-heading text-2xl leading-tight" style={{ color: P.navy }}>
              Your hand is raised
            </h2>
            <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: P.ink }}>
              A named person will reply within one business day. If a slot is a fit, the reply carries the
              calendar, the rate and the agreement — and nothing is booked until the agreement is signed.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: P.copper }}
            >
              Send another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="enquire" className="border-t" style={{ borderColor: P.hair }}>
      <div className="mx-auto w-full max-w-3xl px-5 py-10 md:px-10 md:py-14">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.32em] md:text-[9.5px]" style={{ color: P.copper }}>
          The next step
        </p>
        <h2 className="mt-3 font-heading text-2xl leading-tight md:text-[2.1rem]" style={{ color: P.navy }}>
          Raise a hand
        </h2>
        <p className="mt-2 max-w-[46ch] text-[11.5px] leading-relaxed" style={{ color: P.muted }}>
          One form, one reply from a named person inside one business day. No sequence, no drip.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-3 md:mt-9">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
                Organization
              </span>
              <input
                className={`${field} mt-1.5`}
                style={{ borderColor: P.hair, color: P.navy }}
                value={form.organization_name}
                onChange={set('organization_name')}
                placeholder="Who you are writing from"
                autoComplete="organization"
              />
            </label>
            <label className="block">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
                Your name
              </span>
              <input
                className={`${field} mt-1.5`}
                style={{ borderColor: P.hair, color: P.navy }}
                value={form.contact_name}
                onChange={set('contact_name')}
                placeholder="As it should read in a reply"
                autoComplete="name"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
                Email
              </span>
              <input
                className={`${field} mt-1.5`}
                style={{ borderColor: P.hair, color: P.navy }}
                value={form.contact_email}
                onChange={set('contact_email')}
                placeholder="name@organization.com"
                type="email"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
                Role
              </span>
              <input
                className={`${field} mt-1.5`}
                style={{ borderColor: P.hair, color: P.navy }}
                value={form.contact_role}
                onChange={set('contact_role')}
                placeholder="Founder, Head of Marketing"
                autoComplete="organization-title"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
                What you do
              </span>
              <select
                className={`${field} mt-1.5`}
                style={{ borderColor: P.hair, color: P.navy }}
                value={form.fit_category}
                onChange={set('fit_category')}
              >
                {FIT_CATEGORIES.map((fit) => (
                  <option key={fit.key} value={fit.key}>
                    {fit.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
                What interests you
              </span>
              <select
                className={`${field} mt-1.5`}
                style={{ borderColor: P.hair, color: P.navy }}
                value={form.interest}
                onChange={set('interest')}
              >
                {INTERESTS.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.faint }}>
              Anything we should know
            </span>
            <textarea
              className={`${field} mt-1.5 min-h-[84px] resize-y`}
              style={{ borderColor: P.hair, color: P.navy }}
              value={form.message}
              onChange={set('message')}
              placeholder="The dates you have in mind, or what you want the slot to do"
            />
          </label>

          {error ? (
            <p className="text-[11px]" style={{ color: '#8e3a24' }}>
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[9.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-60"
              style={{ background: P.copper, color: P.cream }}
            >
              {status === 'sending' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              {status === 'sending' ? 'Sending' : 'Send'}
            </button>
            <p className="max-w-[36ch] text-[9.5px] leading-relaxed" style={{ color: P.faint }}>
              We use these details to answer you, and nothing else. No reader data is shared with any sponsor.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}