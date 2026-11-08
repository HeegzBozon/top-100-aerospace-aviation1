import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { BUNDLE, day, money } from '@/components/patronage/patronConfig';
import { POSITIONS, explain, positionOf, recommend } from './sponsorScript';

const LABEL = 'text-[9px] font-bold uppercase tracking-[0.22em]';

// The verdict. Where the reader stands is stated plainly, the rung is named and priced
// from the card, and the next move is one button: pay, or ask for the proposal that makes
// the payment possible further up their own chain.
export default function SponsorVerdict({ answers, transcript, copy, onIntent, onPay, onGo }) {
  const rec = recommend(answers);
  const position = positionOf(answers, rec);
  const here = POSITIONS.find((entry) => entry.key === position) || POSITIONS[0];
  const when = rec.slot?.issue_date ? day(rec.slot.issue_date) : 'a date to be set';

  const proposalIntent = {
    interest: `${rec.label} slot`,
    label: 'Ask for the written proposal',
    headline: `A proposal for the ${rec.label.toLowerCase()}`,
    blurb: `One page, written to be forwarded: the rate, the surfaces, the dates and the firewall. It answers the question your committee will ask, which is what the money buys and what it does not.`,
    next: 'The desk replies within one business day with the proposal and a hold on the date while it is considered.',
  };

  const payIntent = {
    interest: `${rec.label} slot`,
    label: `Pay ${money(rec.rate)} — hold ${rec.slot?.issue_date ? day(rec.slot.issue_date) : 'the date'}`,
    headline: `Secure the ${rec.label.toLowerCase()}`,
    blurb: `Checkout on Stripe for ${money(rec.rate)}, the rate on the published card. The agreement follows by email the same day, and nothing is printed until it is countersigned.`,
    next: 'The receipt and the agreement arrive together. The desk is named on both.',
  };

  return (
    <div className="mt-5 border-t border-editorial-copper/40 pt-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {POSITIONS.map((stop, index) => {
          const lit = stop.key === position;
          return (
            <span key={stop.key} className="flex items-center gap-1.5">
              {index > 0 && <span className="h-px w-4 bg-editorial-navy/25" />}
              <span
                className={
                  lit
                    ? 'inline-flex items-center gap-1.5 bg-editorial-navy px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-cream'
                    : 'inline-flex items-center gap-1.5 px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy/40'
                }
              >
                {stop.label}
                {lit && <span className="normal-case tracking-normal text-editorial-gold">← you are here</span>}
              </span>
            </span>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <div>
          <p className="pd-label">{here.label}</p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-editorial-navy/50">{here.line}</p>
          <p className="mt-2.5 max-w-[52ch] text-[12px] leading-relaxed text-editorial-navy/80">{explain(answers, rec)}</p>

          {position === 'ready' && (
            <div className="mt-3 space-y-1.5">
              {BUNDLE.map((item) => (
                <p key={item.key} className="flex gap-2 text-[11px] leading-relaxed text-editorial-navy/70">
                  <Check className="mt-[3px] h-3 w-3 shrink-0 text-editorial-copper" />
                  <span>
                    <span className="font-semibold text-editorial-navy">{item.label}.</span> {item.detail}
                  </span>
                </p>
              ))}
            </div>
          )}

          {position !== 'ready' && (
            <ul className="mt-3 space-y-1 border-l-2 border-editorial-copper/50 pl-3">
              {(transcript || []).map((entry) => (
                <li key={entry.key} className="text-[10.5px] leading-relaxed text-editorial-navy/55">
                  <span className="text-editorial-navy/40">{entry.ask}</span> {entry.answer}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-editorial-copper/50">
          <div className="border-b border-editorial-copper/35 px-3.5 py-3">
            <p className={LABEL}>{rec.label}{rec.slot?.issue_number ? ` · #${rec.slot.issue_number}` : ''}</p>
            <p className="mt-1 font-heading text-2xl leading-none text-editorial-navy">
              {rec.rate ? money(rec.rate) : 'On request'}
            </p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-editorial-navy/55">
              {rec.slot?.issue_date ? `Runs ${when}` : rec.slot?.rate_note}
              {rec.slot?.ad_close_date ? ` · closes ${day(rec.slot.ad_close_date)}` : ''}
            </p>
          </div>

          <div className="space-y-2 px-3.5 py-3">
            {position === 'ready' ? (
              <button
                type="button"
                onClick={() => onPay(payIntent, rec.tier, transcript)}
                className="desk-key desk-key-primary w-full justify-center"
              >
                {payIntent.label} <ArrowRight className="h-3 w-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onIntent(proposalIntent, transcript)}
                className="desk-key desk-key-primary w-full justify-center"
              >
                {proposalIntent.label} <ArrowRight className="h-3 w-3" />
              </button>
            )}

            {position === 'approval' && (
              <button
                type="button"
                onClick={() => onPay(payIntent, rec.tier, transcript)}
                className="pd-acct-link w-full justify-center text-[9.5px]"
              >
                Or pay {money(rec.rate)} now and hold it
              </button>
            )}

            {position === 'early' && (
              <button
                type="button"
                onClick={() => onGo(copy.patronage_url || '/mediakit')}
                className="pd-acct-link w-full justify-center text-[9.5px]"
              >
                Read the card first
              </button>
            )}

            <button
              type="button"
              onClick={() => onGo(copy.patronage_url || '/mediakit')}
              className="inline-flex w-full items-center justify-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.18em] text-editorial-navy/50 hover:text-editorial-navy"
            >
              The published media kit <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <p className="border-t border-editorial-copper/25 px-3.5 py-2.5 text-[9px] leading-relaxed text-editorial-navy/40">
            {position === 'ready'
              ? 'Paid now, labelled always. The slot buys attribution — never a position in the index.'
              : 'Nothing is reserved by asking, and nothing is quoted off the card.'}
          </p>
        </div>
      </div>
    </div>
  );
}