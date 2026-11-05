import { useEffect } from 'react';
import { Compass, Sparkles, Telescope } from 'lucide-react';
import DispatchInvite from '@/components/newsletter/DispatchInvite';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import GroundControlBand from '@/components/subscribe/GroundControlBand';
import { trackDispatch } from '@/components/newsletter/newsletterEvents';
import { DISPATCH_ENTRY_POINTS } from '@/components/newsletter/dispatchConfig';

const NAVY = '#1e3a5a';
const CREAM = '#faf8f5';

const WHAT_ARRIVES = [
  {
    icon: Compass,
    title: 'The signal brief',
    body: 'Who moved, what launched, where the money went — the week measured across the graph, in a single read.',
  },
  {
    icon: Telescope,
    title: 'First look',
    body: 'Each Volume, the Moon Joy sessions, and Local Legends drops, in the week before they go public.',
  },
  {
    icon: Sparkles,
    title: 'The record, explained',
    body: 'What a verification means, how a cohort is measured, and what the numbers behind a profile actually say.',
  },
];

// The Dispatch's own address. Everything a reader needs to decide sits above the field:
// what the brief is, how often it lands, and how they leave. It is a reading, not a
// dashboard — the invitation is the only thing to do here.
export default function Subscribe() {
  // The page itself is an entry point: a reader arriving with ?from= is measured
  // against the invitation that sent them, so a link in an issue or a post can be
  // told apart from the page being found on its own.
  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    if (from && DISPATCH_ENTRY_POINTS[from]) {
      trackDispatch('inviteClicked', { entry_point: from, landed_on: 'subscribe_page' });
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      <AnnouncementBanner />
      <div className="relative z-[99]">
        <AdvocacyStrip />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
        <header className="mb-10 text-center">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(143,92,44,1)' }}>
            The Dispatch · Free, forever
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-tight md:text-5xl" style={{ color: NAVY }}>
            Not a ranking. A record.
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-sm leading-7 md:text-base" style={{ color: 'rgba(30,58,90,0.74)' }}>
            A weekly brief from the verified reputation graph for aerospace and aviation — the people, the work,
            and what it changed. One email a week. No noise.
          </p>
          <span aria-hidden="true" className="mx-auto mt-8 block h-[2px] w-16" style={{ background: '#b87333' }} />
        </header>

        <DispatchInvite entryPoint="subscribe_page" tone="cream" />

        <section className="mt-16" aria-labelledby="what-arrives">
          <h2
            id="what-arrives"
            className="font-body text-[10px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: 'rgba(143,92,44,1)' }}
          >
            What lands in your inbox
          </h2>
          <div className="mt-5 grid gap-px overflow-hidden rounded-lg border md:grid-cols-3" style={{ borderColor: 'rgba(30,58,90,0.14)', background: 'rgba(30,58,90,0.10)' }}>
            {WHAT_ARRIVES.map((item) => (
              <article key={item.title} className="px-5 py-6" style={{ background: CREAM }}>
                <item.icon className="mb-3 h-5 w-5" style={{ color: '#b87333' }} aria-hidden="true" />
                <h3 className="mb-1.5 font-body text-sm font-bold" style={{ color: NAVY }}>
                  {item.title}
                </h3>
                <p className="font-body text-[13px] leading-6" style={{ color: 'rgba(30,58,90,0.70)' }}>
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <GroundControlBand />
      </div>

      <div className="h-16" />
    </div>
  );
}