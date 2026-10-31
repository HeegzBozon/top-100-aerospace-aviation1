import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { practiceBySlug } from '@/components/chamber/chamberPractices';

const NAVY = '#1e3a5a';
const CREAM = '#faf8f5';
const COPPER = '#b87333';
const GOLD = '#c9a87c';

// One practice of the house, read as a page of the record: what it is, what it takes on,
// how it is engaged, and the form that starts the conversation. The enquiry is written
// down as a partnership inquiry with the practice named as its tier, so the desk answers
// it in the same place it answers every other approach to the house.
export default function ChamberPractice() {
  const { practice: slug } = useParams();
  const practice = practiceBySlug(slug);
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!practice) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center" style={{ background: CREAM }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: COPPER }}>
          Chamber of Commerce
        </p>
        <h1 className="mt-3 font-heading text-3xl" style={{ color: NAVY }}>
          That office is not open
        </h1>
        <Link
          to="/chamber"
          className="mt-6 inline-flex items-center gap-2 border px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em]"
          style={{ borderColor: NAVY, color: NAVY }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to the Chamber
        </Link>
      </div>
    );
  }

  const Icon = practice.icon;

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (status === 'error') {
      setStatus('idle');
      setError('');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.name.trim() || !form.company.trim()) {
      setStatus('error');
      setError('Please give your name and your organisation.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      await base44.entities.PartnershipInquiry.create({
        name: form.name.trim(),
        email,
        company: form.company.trim(),
        tier: practice.label,
        goals: [practice.key],
        message: form.message.trim(),
      });
      setStatus('success');
    } catch {
      setStatus('error');
      setError('We could not record that. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* The masthead of the office */}
      <header className="px-5 pb-10 pt-8 md:px-16 md:pb-14 md:pt-12" style={{ background: NAVY }}>
        <div className="mx-auto max-w-3xl">
          <Link
            to="/chamber"
            className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.26em]"
            style={{ color: GOLD }}
          >
            <ArrowLeft className="h-3 w-3" /> Chamber of Commerce
          </Link>
          <div className="mt-6 h-[2px] w-16" style={{ background: COPPER }} />
          <div className="mt-5 flex items-start gap-3">
            <span
              className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-[7px]"
              style={{ background: 'rgba(201,168,124,0.14)', color: GOLD }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: 'rgba(250,248,245,0.55)' }}>
                {practice.kicker}
              </p>
              <h1 className="mt-1.5 font-heading text-[2.1rem] leading-[1.02] md:text-5xl" style={{ color: CREAM }}>
                {practice.label}
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-xl font-heading text-[15px] leading-snug md:text-xl" style={{ color: GOLD }}>
            {practice.headline}
          </p>
        </div>
      </header>

      <main className="px-5 md:px-16">
        <div className="mx-auto max-w-3xl">
          <section className="pb-8 pt-8 md:pb-12 md:pt-12" style={{ borderBottom: `2px solid ${COPPER}` }}>
            <p className="text-[13px] leading-relaxed md:text-[15px]" style={{ color: NAVY }}>
              {practice.summary}
            </p>
          </section>

          <section className="pb-8 pt-7 md:pb-12 md:pt-10" style={{ borderBottom: `1px solid ${COPPER}44` }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: COPPER }}>
              What it takes on
            </p>
            <div className="mt-4 space-y-4">
              {practice.offer.map((item) => (
                <div key={item.title} className="border-l-2 pl-3.5" style={{ borderColor: GOLD }}>
                  <h2 className="font-heading text-[16px] leading-tight md:text-[19px]" style={{ color: NAVY }}>
                    {item.title}
                  </h2>
                  <p className="mt-1 text-[12px] leading-relaxed md:text-[13.5px]" style={{ color: `${NAVY}cc` }}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="pb-8 pt-7" style={{ borderBottom: `1px solid ${COPPER}44` }}>
            <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: COPPER }}>
              How it is engaged
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {practice.engagements.map((item) => (
                <span
                  key={item}
                  className="rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ borderColor: COPPER, color: NAVY }}
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* The form that starts the conversation, in the same navy as the masthead */}
          <section className="my-9 md:my-12" style={{ background: NAVY }}>
            <div className="px-5 py-7 md:px-8 md:py-9">
              <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                Start the conversation
              </p>
              <h2 className="mt-2 font-heading text-[20px] leading-tight md:text-[26px]" style={{ color: CREAM }}>
                Tell the desk what the work is.
              </h2>

              {status === 'success' ? (
                <div className="mt-5 flex items-start gap-2.5" role="status">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                  <p className="text-[12.5px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.85)' }}>
                    Noted. The desk reads every enquiry and answers in writing.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Your name" value={form.name} onChange={set('name')} autoComplete="name" />
                    <Field label="Organisation" value={form.company} onChange={set('company')} autoComplete="organization" />
                  </div>
                  <Field label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
                  <div>
                    <label
                      htmlFor="practice-brief"
                      className="block text-[8.5px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: 'rgba(250,248,245,0.6)' }}
                    >
                      The brief
                    </label>
                    <textarea
                      id="practice-brief"
                      rows={3}
                      value={form.message}
                      onChange={set('message')}
                      placeholder={practice.briefPrompt}
                      className="mt-1.5 w-full resize-none rounded-[4px] border px-3 py-2.5 text-[13px] outline-none focus:ring-1"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        borderColor: 'rgba(201,168,124,0.35)',
                        color: CREAM,
                        '--tw-ring-color': GOLD,
                      }}
                    />
                  </div>

                  {status === 'error' ? (
                    <p role="alert" className="text-[11.5px]" style={{ color: '#F0B7A6' }}>
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-opacity disabled:opacity-60 sm:w-auto"
                    style={{ background: COPPER, color: CREAM }}
                  >
                    {status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Send to the desk
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', autoComplete }) {
  const id = `practice-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="block text-[8.5px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(250,248,245,0.6)' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="mt-1.5 w-full rounded-[4px] border px-3 py-2.5 text-[13px] outline-none focus:ring-1"
        style={{
          background: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(201,168,124,0.35)',
          color: CREAM,
          '--tw-ring-color': GOLD,
        }}
      />
    </div>
  );
}