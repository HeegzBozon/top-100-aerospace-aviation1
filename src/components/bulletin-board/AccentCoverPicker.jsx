import { ACCENTS, COVERS, DEFAULT_ACCENT, B } from '@/components/fellow-home/fellowHomeConfig';

// Accent + cover picker. Variants only — no blank fields, no uploads.
// Rendered inline within the Customize edit mode (unified with grid drag/hide).
export default function AccentCoverPicker({ settings, accent, saving, error, onChange }) {
  return (
    <div className="rounded-2xl p-4 mb-3" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>
        Personalize {saving && <span style={{ color: B.muted }}>· saving</span>}
      </p>

      {error && (
        <p className="text-xs mb-3 rounded-lg px-3 py-2" style={{ color: '#8a3b2a', background: '#fbeee9' }}>
          {error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: B.navy }}>Domain accent</p>
          <p className="text-[11px] mb-2" style={{ color: B.muted }}>One accent per domain. Approved set only.</p>
          <div className="flex gap-2 flex-wrap">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => onChange({ domain_accent: a.key })}
                title={a.label}
                className="w-8 h-8 rounded-full transition-transform hover:scale-105"
                style={{
                  background: a.value,
                  outline: (settings?.domain_accent || DEFAULT_ACCENT) === a.key ? `2px solid ${B.navy}` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: B.navy }}>Cover</p>
          <p className="text-[11px] mb-2" style={{ color: B.muted }}>Verified asset library. No uploads.</p>
          <div className="flex gap-2 flex-wrap">
            {COVERS.map((c) => (
              <button
                key={c.key}
                onClick={() => onChange({ cover_asset_id: c.key })}
                className="w-16 h-11 rounded-lg overflow-hidden text-[9px] font-semibold flex items-center justify-center"
                style={{
                  background: c.url ? `url(${c.url}) center/cover` : B.sand,
                  color: B.navy,
                  outline: (settings?.cover_asset_id || 'none') === c.key ? `2px solid ${B.navy}` : `1px solid ${B.border}`,
                  outlineOffset: '1px',
                }}
              >
                {!c.url && 'None'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}