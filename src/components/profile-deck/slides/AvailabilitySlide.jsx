import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// What the Fellow makes themselves available for. Read from the availability
// layer, which is an introduction-only expert network: no rates, no ratings, no
// booking language. Availability never influences discovery or position.
export default function AvailabilitySlide({ user, nominee, accent }) {
  const email = user?.email || nominee?.nominee_email;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    if (!email) { setLoading(false); return undefined; }
    base44.entities.Service.filter({ provider_user_email: email, is_active: true })
      .then((rows) => {
        if (!live) return;
        setServices((rows || []).filter((s) => s.is_draft !== true));
      })
      .catch(() => { if (live) setServices([]); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [email]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.cream }}>
      <div className="w-full max-w-2xl px-6 py-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: B.muted }}>
          Availability
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Open to introductions
        </h2>
        <div className="h-px w-16 mb-8" style={{ background: accent }} />

        {loading ? (
          <div className="space-y-3" aria-label="Loading availability">
            {[0, 1].map((n) => (
              <div key={n} className="h-20 rounded-2xl animate-pulse" style={{ background: `${B.navy}0d` }} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl px-5 py-8 text-center" style={{ border: `1px dashed ${B.border}`, background: '#fff' }}>
            <p className="text-sm" style={{ color: B.muted }}>
              Not currently taking introductions.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {services.map((service) => (
              <li
                key={service.id}
                className="rounded-2xl px-5 py-4"
                style={{ background: '#fff', border: `1px solid ${B.border}` }}
              >
                <p className="text-sm font-semibold" style={{ color: B.navy }}>{service.title}</p>
                {service.description && (
                  <p className="text-[12px] leading-relaxed mt-1" style={{ color: B.muted }}>
                    {service.description}
                  </p>
                )}
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-3" style={{ color: accent }}>
                  Available for introductions
                </p>
              </li>
            ))}
          </ul>
        )}

        <p className="text-[10px] leading-relaxed mt-8" style={{ color: B.muted }}>
          Availability is introduction only. It carries no weight in measurement or directory position.
        </p>
      </div>
    </section>
  );
}