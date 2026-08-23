import { useState } from 'react';
import { Clock, Send } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import IntroRequestModal from '@/components/talent/IntroRequestModal';

// One availability card. Reframed as introduction-only: no price, no stars,
// no "book". The single action is requesting an introduction, which routes
// through the existing IntroRequest flow. The chamber introduces; it never
// brokers.
export default function AvailabilityCard({ service, accent = B.navy }) {
  const [introOpen, setIntroOpen] = useState(false);
  const cats = Array.isArray(service.category) ? service.category : [];

  return (
    <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: B.border }}>
      <div className="h-1" style={{ background: accent }} />
      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-sm font-bold leading-tight" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>{service.title}</h4>
        {service.provider_name && (
          <p className="text-[11px]" style={{ color: B.muted }}>Introduced by {service.provider_name}</p>
        )}
        {service.description && (
          <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: B.muted }}>{service.description}</p>
        )}
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cats.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ background: `${accent}12`, color: accent }}>{c}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mt-1">
          {service.duration_minutes ? (
            <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: B.muted }}><Clock className="w-3 h-3" /> {service.duration_minutes} min</span>
          ) : <span />}
          <button
            type="button"
            onClick={() => setIntroOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ background: accent, color: '#fff' }}
          >
            <Send className="w-3.5 h-3.5" /> Request Introduction
          </button>
        </div>
      </div>
      {introOpen && (
        <IntroRequestModal
          isOpen
          onClose={() => setIntroOpen(false)}
          targetType="service"
          targetId={service.id}
          targetTitle={service.title}
          recipientEmail={service.provider_user_email}
          companyName={service.provider_name || ''}
        />
      )}
    </div>
  );
}