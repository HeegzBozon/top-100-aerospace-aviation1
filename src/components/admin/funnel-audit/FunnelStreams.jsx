import { Scale } from 'lucide-react';
import StreamCard from './StreamCard';
import { CROSS_CUTTING, OFF_STREAM, STREAMS } from './valueStreams';
import { SEVERITY_TONE } from './auditTones';

// THE FIVE STREAMS — the journeys read by who answers for them.
//
// Everything on the other two sheets is a row; this sheet is the only one that says who
// owns a row. Two items are deliberately outside it: one is a decision the house has to
// take, the other is a rule every stream passes wherever availability is rendered.
export default function FunnelStreams({ evidence, evidenceState, onOpenFunnel }) {
  return (
    <div className="space-y-5">
      <div className="desk-plate p-5 md:p-6">
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
          Who answers for the journey
        </p>
        <h3 className="mt-1 font-heading text-xl text-editorial-cream">The five streams</h3>
        <p className="mt-2 max-w-3xl font-body text-xs leading-6 text-[#a3b8c9]">
          Every finding on this desk sits at a handoff between two houses: a form built here,
          a mail owed there, a review owned by nobody. A stream answers for its journey end to
          end, which is what closes a handoff. The objective below is the stream's standing
          aim; the count beside each door is read from the record, never set as a target.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {STREAMS.map((stream) => (
          <StreamCard
            key={stream.id}
            stream={stream}
            evidence={evidence}
            evidenceState={evidenceState}
            onOpenFunnel={onOpenFunnel}
          />
        ))}
      </div>

      <div className="desk-plate p-5">
        <div className="flex items-center gap-1.5">
          <Scale className="h-3.5 w-3.5 text-[#e0a96b]" aria-hidden="true" />
          <h4 className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-cream">
            Held apart from every stream
          </h4>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {OFF_STREAM.map((item) => (
            <div key={item.id} className="rounded-sm border border-white/8 bg-white/[0.02] p-3">
              <p className="font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#e0a96b]">
                {item.label}
              </p>
              <p className="mt-1 font-body text-[11px] font-semibold text-editorial-cream">{item.title}</p>
              <p className="mt-1 font-body text-[10px] leading-4 text-[#8ea7bd]">{item.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#7d97ad]">
          The house's instrument, not a stream's work
        </p>
        <ul className="mt-2 space-y-1.5">
          {CROSS_CUTTING.map((finding) => (
            <li key={finding.id} className="flex items-start gap-2">
              <span className={`${SEVERITY_TONE[finding.severity].chip} flex-none`}>
                {SEVERITY_TONE[finding.severity].label}
              </span>
              <span className="font-body text-[10px] leading-4 text-[#c4d2de]">{finding.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}