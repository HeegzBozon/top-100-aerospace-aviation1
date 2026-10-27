import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// One name in the register: the number the issue gives her, the name as an index sets it
// (surname first), where she stands, the folio her portrait prints, and the pip that says
// the page has been opened in this sitting.
export default function GlassNameIndexRow({ entry, active = false, read = false, onClick }) {
  const ink = active ? P.cream : P.navy;
  const soft = active ? 'rgba(250,248,245,0.62)' : 'rgba(30,58,90,0.5)';
  const stands = [entry.region, entry.stand].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      data-active={active ? 'true' : undefined}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors"
      style={{ background: active ? P.navy : '#fff', border: `1px solid ${active ? P.navy : 'rgba(30,58,90,0.1)'}` }}
    >
      <span
        className="w-7 flex-none font-mono text-[9.5px] tabular-nums"
        style={{ color: active ? P.gold : 'rgba(30,58,90,0.38)' }}
      >
        {String(entry.number).padStart(3, '0')}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-medium leading-tight" style={{ color: ink }}>
          {entry.indexForm}
        </span>
        {stands && (
          <span className="mt-0.5 block truncate text-[9px]" style={{ color: soft }}>
            {stands}
          </span>
        )}
      </span>

      <span className="flex flex-none items-center gap-1.5">
        <span className="font-mono text-[9px] tabular-nums" style={{ color: soft }}>
          p {entry.pageNumber}
        </span>
        <span
          className="h-[5px] w-[5px] rounded-full"
          style={{
            background: read ? P.copper : 'transparent',
            border: `1px solid ${read ? P.copper : active ? 'rgba(250,248,245,0.42)' : 'rgba(30,58,90,0.22)'}`,
          }}
        />
      </span>
    </button>
  );
}