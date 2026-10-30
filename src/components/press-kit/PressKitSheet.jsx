import { B } from '@/components/fellow-home/fellowHomeConfig';
import { disciplineLabel } from './kitSeed';

const INK = 'rgba(30,58,90,0.74)';

// The artifact itself: one page, set like a press dossier rather than a profile. It is
// drawn identically in the composer's preview, on the public web kit, and as the model
// for the PDF, so what a Fellow approves is what a journalist receives.
export default function PressKitSheet({ kit, shareUrl = '', className = '' }) {
  const evidence = (kit.evidence || []).filter((row) => row.label || row.detail);
  const links = (kit.links || []).filter((row) => row.url);
  const standing = [disciplineLabel(kit.discipline), kit.location].filter(Boolean).join(' · ');

  return (
    <article
      className={`overflow-hidden rounded-xl ${className}`}
      style={{ background: '#fffdf9', border: `1px solid ${B.border}` }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: B.navyDeep }}
      >
        <span className="text-[7px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
          TOP 100 Aerospace &amp; Aviation
        </span>
        <span
          className="text-[7px] font-bold uppercase tracking-[0.3em]"
          style={{ color: 'rgba(250,248,245,0.58)' }}
        >
          Press Kit
        </span>
      </div>

      <div className="px-5 py-6">
        <div className="flex items-start gap-4">
          {kit.photo_url ? (
            <img
              src={kit.photo_url}
              alt={kit.full_name || 'Portrait'}
              className="h-16 w-16 shrink-0 rounded-full object-cover"
              style={{ border: `1px solid ${B.border}` }}
            />
          ) : null}
          <div className="min-w-0">
            <h2 className="font-heading text-[1.35rem] leading-tight" style={{ color: B.navy }}>
              {kit.full_name || 'Name not yet written'}
            </h2>
            {kit.headline ? (
              <p
                className="mt-1 text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em]"
                style={{ color: B.copper }}
              >
                {kit.headline}
              </p>
            ) : null}
            {standing ? (
              <p className="mt-1 text-[10px]" style={{ color: B.muted }}>
                {standing}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="my-5 h-px"
          style={{ background: `linear-gradient(90deg, ${B.copper}, ${B.gold} 62%, transparent)` }}
        />

        {kit.summary ? (
          <p className="text-[12px] leading-relaxed" style={{ color: B.navy }}>
            {kit.summary}
          </p>
        ) : (
          <p className="text-[11px] italic leading-relaxed" style={{ color: B.muted }}>
            The summary has not been written yet.
          </p>
        )}

        {evidence.length ? (
          <section className="mt-6">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
              The record
            </p>
            <ul className="mt-3 space-y-3">
              {evidence.map((item, i) => (
                <li key={i}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: B.navy }}>
                    {item.label}
                  </p>
                  {item.detail ? (
                    <p className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: INK }}>
                      {item.detail}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {links.length ? (
          <section className="mt-6">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
              Elsewhere
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {links.map((link, i) => (
                <li key={i} className="flex items-baseline gap-2 text-[11px]">
                  <span className="shrink-0 font-bold uppercase tracking-[0.1em]" style={{ color: B.navy }}>
                    {link.label || 'Link'}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate underline decoration-1 underline-offset-2"
                    style={{ color: B.copper }}
                  >
                    {link.url.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {kit.contact_email ? (
          <section className="mt-6">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
              Press enquiries
            </p>
            <a
              href={`mailto:${kit.contact_email}`}
              className="mt-1.5 block text-[11.5px] underline decoration-1 underline-offset-2"
              style={{ color: B.navy }}
            >
              {kit.contact_email}
            </a>
          </section>
        ) : null}
      </div>

      <div className="px-5 py-4" style={{ background: B.sand }}>
        <p
          className="text-[7.5px] font-bold uppercase tracking-[0.22em]"
          style={{ color: 'rgba(30,58,90,0.62)' }}
        >
          Composed from this Fellow&rsquo;s own record
        </p>
        {shareUrl ? (
          <p className="mt-1 truncate text-[9px]" style={{ color: B.navy }}>
            {shareUrl}
          </p>
        ) : null}
      </div>
    </article>
  );
}